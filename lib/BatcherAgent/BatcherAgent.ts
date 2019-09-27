import { FixedBatcher, Mode, PredicateBatcherSync, BatcherSync, PredicateBatcherAsync } from "./Types";

export default class BatcherAgent<T> {
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
    }

    predicateBatch<A = undefined>(batcher: PredicateBatcherSync<T, A>): T[][] {
        const batches: T[][] = [];
        let batch: T[] = [];
        const { executor, initial } = batcher;
        let accumulator = initial;
        for (let element of this.input) {
            const { updatedAccumulator, createNewBatch } = executor(element, accumulator);
            accumulator = updatedAccumulator;
            if (!createNewBatch) {
                batch.push(element);
            } else {
                batches.push(batch);
                batch = [element];
            }
        }
        batches.push(batch);
        return batches;
    }

    async predicateBatchAsync<A = undefined>(batcher: PredicateBatcherAsync<T, A>): Promise<T[][]> {
        const batches: T[][] = [];
        let batch: T[] = [];
        const { executorAsync, initial } = batcher;
        let accumulator: A = initial;
        for (let element of this.input) {
            const { updatedAccumulator, createNewBatch } = await executorAsync(element, accumulator);
            accumulator = updatedAccumulator;
            if (!createNewBatch) {
                batch.push(element);
            } else {
                batch.length && batches.push(batch);
                batch = [element];
            }
        }
        batches.push(batch);
        return batches;
    }

    batch<A = undefined>(batcher: BatcherSync<T, A>): T[][] {
        if ("executor" in batcher) {
            return this.predicateBatch(batcher);
        } else {
            return this.fixedBatch(batcher);
        }
    }

}