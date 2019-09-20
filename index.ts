export default class BatchedArray<T> {
    private readonly source: Array<T>;

    constructor(source?: Array<T>, detach = false) {
        const resolved = source || [];
        this.source = detach ? Array.from(resolved) : resolved;
    }

    public get length() {
        return this.source.length;
    }

    fixedBatch(batcher: FixedBatcher): T[][] {
        const batches: T[][] = [];
        let i = 0;
        if ("batchSize" in batcher) {
            const { batchSize } = batcher;
            while (i < this.length) {
                const cap = Math.min(i + batchSize, this.length);
                batches.push(this.source.slice(i, i = cap));
            }
        } else if ("batchCount" in batcher) {
            let { batchCount, mode } = batcher;
            const resolved = mode || Mode.Balanced;
            if (batchCount < 1) {
                throw new Error("Batch count must be a positive integer!");
            }
            if (batchCount === 1) {
                return [this.source];
            }
            if (batchCount >= this.length) {
                return this.source.map(element => [element]);
            }
    
            let size: number;
    
            if (length % batchCount === 0) {
                size = Math.floor(length / batchCount);
                while (i < length) {
                    batches.push(this.source.slice(i, i += size));
                }
            } else if (resolved === Mode.Balanced) {
                while (i < length) {
                    size = Math.ceil((length - i) / batchCount--);
                    batches.push(this.source.slice(i, i += size));
                }
            } else {
                batchCount--;
                size = Math.floor(length / batchCount);
                if (length % size === 0) {
                    size--;
                }
                while (i < size * batchCount) {
                    batches.push(this.source.slice(i, i += size));
                }
                batches.push(this.source.slice(size * batchCount));
            }
        }
        return batches;
    };

    predicateBatch<A = undefined>(batcher: PredicateBatcherSync<T, A>): T[][] {
        const batches: T[][] = [];
        let batch: T[] = [];
        const { executor, initial } = batcher;
        let accumulator = initial;
        for (let element of this.source) {
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

    async predicateBatchAsync<A = undefined>(batcher: BatcherAsync<T, A>): Promise<T[][]> {
        const batches: T[][] = [];
        let batch: T[] = [];
        const { executorAsync, initial } = batcher;
        let accumulator: A = initial;
        for (let element of this.source) {
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

    batch<A = undefined>(batcher: BatcherSync<T, A>): T[][] {
        if ("executor" in batcher) {
            return this.predicateBatch(batcher);
        } else {
            return this.fixedBatch(batcher);
        }
    };

    batchAsync<A = undefined>(batcher: Batcher<T, A>): T[][] | Promise<T[][]> {
        if ("executorAsync" in batcher) {
            return this.predicateBatchAsync(batcher);
        } else {
            return this.batch(batcher);
        }
    };

    batchedForEach<A = undefined>(batcher: BatcherSync<T, A>, handler: BatchHandlerSync<T>): void {
        if (this.length) {
            let completed = 0;
            const batches = this.batch(batcher);
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

    batchedMap<O, A = undefined>(batcher: BatcherSync<T, A>, handler: BatchConverterSync<T, O>): O[] {
        if (!this.length) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        const batches = this.batch(batcher);
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

    async batchedForEachAsync<A = undefined>(batcher: Batcher<T, A>, handler: BatchHandler<T>): Promise<void> {
        if (this.length) {
            let completed = 0;
            const batches = await this.batchAsync(batcher);
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

    async batchedMapAsync<O, A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchConverter<T, O>): Promise<O[]> {
        if (!target.length) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        const batches = await this.batchAsync(batcher);
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

    private convert = (interval: Interval) => {
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

    async batchedForEachInterval<A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchHandler<T>, interval: Interval): Promise<void> {
        if (!target.length) {
            return;
        }
        const batches = await this.batchAsync(batcher);
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
                    }, this.convert(interval));
                });
                if (++completed === quota) {
                    break;
                }
            }
            resolve();
        });
    };

    async batchedMapInterval<O, A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchConverter<T, O>, interval: Interval): Promise<O[]> {
        if (!target.length) {
            return [];
        }
        let collector: O[] = [];
        const batches = await this.batchAsync(batcher);
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
                    }, this.convert(interval));
                });
                if (++completed === quota) {
                    resolve(collector);
                    break;
                }
            }
        });
    };

}

export interface BatchContext {
    completedBatches: number;
    remainingBatches: number;
}

export interface ExecutorResult<A> {
    updated: A;
    createNewBatch: boolean;
}

export interface PredicateBatcherCommon<A> {
    initial: A;
}

export interface Interval {
    magnitude: number;
    unit: TimeUnit;
}

export type BatchConverterSync<I, O> = (batch: I[], context: BatchContext) => O[];
export type BatchConverterAsync<I, O> = (batch: I[], context: BatchContext) => Promise<O[]>;
export type BatchConverter<I, O> = BatchConverterSync<I, O> | BatchConverterAsync<I, O>; 

export type BatchHandlerSync<I> = (batch: I[], context: BatchContext) => void;
export type BatchHandlerAsync<I> = (batch: I[], context: BatchContext) => Promise<void>;
export type BatchHandler<I> = BatchHandlerSync<I> | BatchHandlerAsync<I>;

export type BatcherSync<I, A> = FixedBatcher | PredicateBatcherSync<I, A>;
export type BatcherAsync<I, A> = PredicateBatcherAsync<I, A>;
export type Batcher<I, A> = BatcherSync<I, A> | BatcherAsync<I, A>; 

export type FixedBatcher = { batchSize: number } | { batchCount: number, mode?: Mode };
export type PredicateBatcherSync<I, A> = PredicateBatcherCommon<A> & { executor: (element: I, accumulator: A) => ExecutorResult<A> };
export type PredicateBatcherAsync<I, A> = PredicateBatcherCommon<A> & { executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>> };


export enum Mode {
    Balanced,
    Even
};

export enum TimeUnit {
    Milliseconds,
    Seconds,
    Minutes
};