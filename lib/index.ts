interface BatchContext {
    completedBatches: number;
    remainingBatches: number;
}

interface ExecutorResult<A> {
    updated: A;
    createNewBatch: boolean;
}

interface PredicateBatcherCommon<A> {
    initial: A;
}

interface Interval {
    magnitude: number;
    unit: TimeUnit;
}

type BatchConverterSync<I, O> = (batch: I[], context: BatchContext) => O[];
type BatchConverterAsync<I, O> = (batch: I[], context: BatchContext) => Promise<O[]>;
type BatchConverter<I, O> = BatchConverterSync<I, O> | BatchConverterAsync<I, O>;

type BatchHandlerSync<I> = (batch: I[], context: BatchContext) => void;
type BatchHandlerAsync<I> = (batch: I[], context: BatchContext) => Promise<void>;
type BatchHandler<I> = BatchHandlerSync<I> | BatchHandlerAsync<I>;

type BatcherSync<I, A> = FixedBatcher | PredicateBatcherSync<I, A>;
type BatcherAsync<I, A> = PredicateBatcherAsync<I, A>;
type Batcher<I, A> = BatcherSync<I, A> | BatcherAsync<I, A>;

type FixedBatcher = { batchSize: number } | { batchCount: number, mode?: Mode };
type PredicateBatcherSync<I, A> = PredicateBatcherCommon<A> & { executor: (element: I, accumulator: A) => ExecutorResult<A> };
type PredicateBatcherAsync<I, A> = PredicateBatcherCommon<A> & { executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>> };


enum Mode {
    Balanced,
    Even
};

enum TimeUnit {
    Milliseconds,
    Seconds,
    Minutes
};

function fixedBatch<I>(target: Array<I>, batcher: FixedBatcher): I[][] {
    const batches: I[][] = [];
    const length = target.length;
    let i = 0;
    if ("batchSize" in batcher) {
        const { batchSize } = batcher;
        while (i < target.length) {
            const cap = Math.min(i + batchSize, length);
            batches.push(target.slice(i, i = cap));
        }
    } else if ("batchCount" in batcher) {
        let { batchCount, mode } = batcher;
        const resolved = mode || Mode.Balanced;
        if (batchCount < 1) {
            throw new Error("Batch count must be a positive integer!");
        }
        if (batchCount === 1) {
            return [target];
        }
        if (batchCount >= target.length) {
            return target.map((element: I) => [element]);
        }

        let length = target.length;
        let size: number;

        if (length % batchCount === 0) {
            size = Math.floor(length / batchCount);
            while (i < length) {
                batches.push(target.slice(i, i += size));
            }
        } else if (resolved === Mode.Balanced) {
            while (i < length) {
                size = Math.ceil((length - i) / batchCount--);
                batches.push(target.slice(i, i += size));
            }
        } else {
            batchCount--;
            size = Math.floor(length / batchCount);
            if (length % size === 0) {
                size--;
            }
            while (i < size * batchCount) {
                batches.push(target.slice(i, i += size));
            }
            batches.push(target.slice(size * batchCount));
        }
    }
    return batches;
};

function predicateBatch<I, A = undefined>(target: Array<I>, batcher: PredicateBatcherSync<I, A>): I[][] {
    const batches: I[][] = [];
    let batch: I[] = [];
    const { executor, initial } = batcher;
    let accumulator = initial;
    for (let element of target) {
        const { updated, createNewBatch } = executor(element, accumulator);
        accumulator = updated;
        if (!createNewBatch) {
            batch.push(element);
        } else {
            batches.push(batch);
            batch = [element];
        }
    }
    batches.push(batch);
    return batches;
};

async function predicateBatchAsync<I, A = undefined>(target: Array<I>, batcher: BatcherAsync<I, A>): Promise<I[][]> {
    const batches: I[][] = [];
    let batch: I[] = [];
    const { executorAsync, initial } = batcher;
    let accumulator: A = initial;
    for (let element of target) {
        const { updated, createNewBatch } = await executorAsync(element, accumulator);
        accumulator = updated;
        if (!createNewBatch) {
            batch.push(element);
        } else {
            batches.push(batch);
            batch = [element];
        }
    }
    batches.push(batch);
    return batches;
};

function batch<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>): I[][] {
    if ("executor" in batcher) {
        return predicateBatch(target, batcher);
    } else {
        return fixedBatch(target, batcher);
    }
};

async function batchAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>): Promise<I[][]> {
    if ("executorAsync" in batcher) {
        return predicateBatchAsync(target, batcher);
    } else {
        return batch(target, batcher);
    }
};

function batchedForEach<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchHandlerSync<I>): void {
    if (target.length) {
        let completed = 0;
        const batches = batch(target, batcher);
        const quota = batches.length;
        for (let batch of batches) {
            const context: BatchContext = {
                completedBatches: completed,
                remainingBatches: quota - completed,
            };
            handler(batch, context);
            completed++;
        }
    }
};

function batchedMap<I, O, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchConverterSync<I, O>): O[] {
    if (!target.length) {
        return [];
    }
    let collector: O[] = [];
    let completed = 0;
    const batches = batch(target, batcher);
    const quota = batches.length;
    for (let batch of batches) {
        const context: BatchContext = {
            completedBatches: completed,
            remainingBatches: quota - completed,
        };
        handler(batch, context).forEach(convert => collector.push(convert));
        completed++;
    }
    return collector;
};

async function batchedForEachAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>): Promise<void> {
    if (target.length) {
        let completed = 0;
        const batches = await batchAsync(target, batcher);
        const quota = batches.length;
        for (let batch of batches) {
            const context: BatchContext = {
                completedBatches: completed,
                remainingBatches: quota - completed,
            };
            await handler(batch, context);
            completed++;
        }
    }
};

 async function batchedMapAsync<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>): Promise<O[]> {
    if (!target.length) {
        return [];
    }
    let collector: O[] = [];
    let completed = 0;
    const batches = await batchAsync(target, batcher);
    const quota = batches.length;
    for (let batch of batches) {
        const context: BatchContext = {
            completedBatches: completed,
            remainingBatches: quota - completed,
        };
        (await handler(batch, context)).forEach(convert => collector.push(convert));
        completed++;
    }
    return collector;
};

const convert = (interval: Interval) => {
    const { magnitude, unit } = interval;
    switch (unit) {
        default:
        case TimeUnit.Milliseconds:
            return magnitude;
        case TimeUnit.Seconds:
            return magnitude * 1000;
        case TimeUnit.Minutes:
            return magnitude * 1000 * 60;
    }
};

async function batchedForEachInterval<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>, interval: Interval): Promise<void> {
    if (!target.length) {
        return;
    }
    const batches = await batchAsync(target, batcher);
    const quota = batches.length;
    return new Promise<void>(async resolve => {
        const iterator = batches[Symbol.iterator]();
        let completed = 0;
        while (true) {
            const next = iterator.next();
            await new Promise<void>(resolve => {
                setTimeout(async () => {
                    const batch = next.value;
                    const context: BatchContext = {
                        completedBatches: completed,
                        remainingBatches: quota - completed,
                    };
                    await handler(batch, context);
                    resolve();
                }, convert(interval));
            });
            if (++completed === quota) {
                break;
            }
        }
        resolve();
    });
};

async function batchedMapInterval<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>, interval: Interval): Promise<O[]> {
    if (!target.length) {
        return [];
    }
    let collector: O[] = [];
    const batches = await batchAsync(target, batcher);
    const quota = batches.length;
    return new Promise<O[]>(async resolve => {
        const iterator = batches[Symbol.iterator]();
        let completed = 0;
        while (true) {
            const next = iterator.next();
            await new Promise<void>(resolve => {
                setTimeout(async () => {
                    const batch = next.value;
                    const context: BatchContext = {
                        completedBatches: completed,
                        remainingBatches: quota - completed,
                    };
                    (await handler(batch, context)).forEach(convert => collector.push(convert));
                    resolve();
                }, convert(interval));
            });
            if (++completed === quota) {
                resolve(collector);
                break;
            }
        }
    });
};

module.exports = {
    fixedBatch,
    predicateBatch,
    predicateBatchAsync,
    batch,
    batchAsync,
    batchedForEach,
    batchedMap,
    batchedForEachAsync,
    batchedMapAsync,
    batchedForEachInterval,
    batchedMapInterval,
    Mode,
    TimeUnit
}