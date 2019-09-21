export class BatcherAgent<T> {
    private readonly input: T[];

    constructor(input: T[]) {
        this.input = input;
    }

    private get length() {
        return this.input.length;
    }

    fixedBatch(batcher: FixedBatcher): T[][] {
        const batches: T[][] = [];
        const length = this.length;
        let i = 0;
        if ("batchSize" in batcher) {
            const { batchSize } = batcher;
            while (i < length) {
                const cap = Math.min(i + batchSize, length);
                batches.push(this.input.slice(i, i = cap));
            }
        } else if ("batchCount" in batcher) {
            let { batchCount, mode } = batcher;
            const resolved = mode || Mode.Balanced;
            if (batchCount < 1) {
                throw new Error("Batch count must be a positive integer!");
            }
            if (batchCount === 1) {
                return [this.input];
            }
            if (batchCount >= length) {
                return this.input.map(element => [element]);
            }
    
            let size: number;
    
            if (length % batchCount === 0) {
                size = Math.floor(length / batchCount);
                while (i < length) {
                    batches.push(this.input.slice(i, i += size));
                }
            } else if (resolved === Mode.Balanced) {
                while (i < length) {
                    size = Math.ceil((length - i) / batchCount--);
                    batches.push(this.input.slice(i, i += size));
                }
            } else {
                batchCount--;
                size = Math.floor(length / batchCount);
                if (length % size === 0) {
                    size--;
                }
                while (i < size * batchCount) {
                    batches.push(this.input.slice(i, i += size));
                }
                batches.push(this.input.slice(size * batchCount));
            }
        }
        return batches;
    };

    predicateBatch<A = undefined>(batcher: PredicateBatcherSync<T, A>): T[][] {
        const batches: T[][] = [];
        let batch: T[] = [];
        const { executor, initial } = batcher;
        let accumulator = initial;
        for (let element of this.input) {
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
        for (let element of this.input) {
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

}

export default class BatchedArray<T> {
    private source: Array<T> = [];
    private readonly batches: Array<Array<T>>;

    public static from<T, A = undefined>(source: Array<T>, batcher: BatcherSync<T, A>) {
        const copy = Array.from(source);
        const batched = new BatchedArray<T>(new BatcherAgent<T>(copy).batch(batcher));
        batched.source = copy;
        return batched;
    }

    public static async fromAsync<T, A = undefined>(source: Array<T>, batcher: Batcher<T, A>) {
        const copy = Array.from(source);
        const batched = new BatchedArray<T>(await new BatcherAgent<T>(copy).batchAsync(batcher));
        batched.source = copy;
        return batched;
    }

    private constructor(batches: Array<Array<T>>) {
        this.batches = batches;
    }

    public get batchCount() {
        return this.batches.length;
    }

    public get elementCount() {
        return this.source.length;
    }

    batchedForEach(handler: BatchHandlerSync<T> ): void {
        if (this.batchCount) {
            let completed = 0;
            for (let batch of this.batches) {
                const context: BatchContext = {
                    completedBatches: completed,
                    remainingBatches: this.batchCount - completed,
                };
                handler(batch, context);
                completed++;
            }
        }
    };

    batchedMap<O>(converter: BatchConverterSync<T, O>): O[] {
        if (!this.batchCount) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        for (let batch of this.batches) {
            const context: BatchContext = {
                completedBatches: completed,
                remainingBatches: this.batchCount - completed,
            };
            converter(batch, context).forEach(convert => collector.push(convert));
            completed++;
        }
        return collector;
    };

    async batchedForEachAsync(handler: BatchHandler<T>): Promise<void> {
        if (this.batchCount) {
            let completed = 0;
            for (let batch of this.batches) {
                const context: BatchContext = {
                    completedBatches: completed,
                    remainingBatches: this.batchCount - completed,
                };
                await handler(batch, context);
                completed++;
            }
        }
    };

    async batchedMapAsync<O>(converter: BatchConverter<T, O>): Promise<O[]> {
        if (!this.batchCount) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        for (let batch of this.batches) {
            const context: BatchContext = {
                completedBatches: completed,
                remainingBatches: this.batchCount - completed,
            };
            (await converter(batch, context)).forEach(convert => collector.push(convert));
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

    async batchedForEachInterval(interval: Interval, handler: BatchHandler<T>): Promise<void> {
        if (!this.batchCount) {
            return;
        }
        return new Promise<void>(async resolve => {
            const iterator = this.batches[Symbol.iterator]();
            let completed = 0;
            while (true) {
                const next = iterator.next();
                await new Promise<void>(resolve => {
                    setTimeout(async () => {
                        const batch = next.value;
                        const context: BatchContext = {
                            completedBatches: completed,
                            remainingBatches: this.batchCount - completed,
                        };
                        await handler(batch, context);
                        resolve();
                    }, this.convert(interval));
                });
                if (++completed === this.batchCount) {
                    break;
                }
            }
            resolve();
        });
    };

    async batchedMapInterval<O>(converter: BatchConverter<T, O>, interval: Interval): Promise<O[]> {
        if (!this.batchCount) {
            return [];
        }
        let collector: O[] = [];
        return new Promise<O[]>(async resolve => {
            const iterator = this.batches[Symbol.iterator]();
            let completed = 0;
            while (true) {
                const next = iterator.next();
                await new Promise<void>(resolve => {
                    setTimeout(async () => {
                        const batch = next.value;
                        const context: BatchContext = {
                            completedBatches: completed,
                            remainingBatches: this.batchCount - completed,
                        };
                        (await converter(batch, context)).forEach(convert => collector.push(convert));
                        resolve();
                    }, this.convert(interval));
                });
                if (++completed === this.batchCount) {
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