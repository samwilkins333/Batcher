import { FixedBatcher, PredicateBatcherSync, BatcherSync, PredicateBatcherAsync } from "./Types";
export default class BatcherAgent<T> {
    private readonly input;
    constructor(input: T[]);
    private readonly length;
    fixedBatch(batcher: FixedBatcher): T[][];
    predicateBatch<A = undefined>(batcher: PredicateBatcherSync<T, A>): T[][];
    predicateBatchAsync<A = undefined>(batcher: PredicateBatcherAsync<T, A>): Promise<T[][]>;
    batch<A = undefined>(batcher: BatcherSync<T, A>): T[][];
}
