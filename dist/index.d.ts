export default class BatchedArray<T> {
    private readonly source;
    constructor(source?: Array<T>, detach?: boolean);
    readonly length: number;
    fixedBatch(batcher: FixedBatcher): T[][];
    predicateBatch<A = undefined>(batcher: PredicateBatcherSync<T, A>): T[][];
    predicateBatchAsync<A = undefined>(batcher: BatcherAsync<T, A>): Promise<T[][]>;
    batch<A = undefined>(batcher: BatcherSync<T, A>): T[][];
    batchAsync<A = undefined>(batcher: Batcher<T, A>): T[][] | Promise<T[][]>;
    batchedForEach<A = undefined>(batcher: BatcherSync<T, A>, handler: BatchHandlerSync<T>): void;
    batchedMap<O, A = undefined>(batcher: BatcherSync<T, A>, handler: BatchConverterSync<T, O>): O[];
    batchedForEachAsync<A = undefined>(batcher: Batcher<T, A>, handler: BatchHandler<T>): Promise<void>;
    batchedMapAsync<O, A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchConverter<T, O>): Promise<O[]>;
    private convert;
    batchedForEachInterval<A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchHandler<T>, interval: Interval): Promise<void>;
    batchedMapInterval<O, A = undefined>(target: Array<T>, batcher: Batcher<T, A>, handler: BatchConverter<T, O>, interval: Interval): Promise<O[]>;
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
export declare type BatchConverterSync<I, O> = (batch: I[], context: BatchContext) => O[];
export declare type BatchConverterAsync<I, O> = (batch: I[], context: BatchContext) => Promise<O[]>;
export declare type BatchConverter<I, O> = BatchConverterSync<I, O> | BatchConverterAsync<I, O>;
export declare type BatchHandlerSync<I> = (batch: I[], context: BatchContext) => void;
export declare type BatchHandlerAsync<I> = (batch: I[], context: BatchContext) => Promise<void>;
export declare type BatchHandler<I> = BatchHandlerSync<I> | BatchHandlerAsync<I>;
export declare type BatcherSync<I, A> = FixedBatcher | PredicateBatcherSync<I, A>;
export declare type BatcherAsync<I, A> = PredicateBatcherAsync<I, A>;
export declare type Batcher<I, A> = BatcherSync<I, A> | BatcherAsync<I, A>;
export declare type FixedBatcher = {
    batchSize: number;
} | {
    batchCount: number;
    mode?: Mode;
};
export declare type PredicateBatcherSync<I, A> = PredicateBatcherCommon<A> & {
    executor: (element: I, accumulator: A) => ExecutorResult<A>;
};
export declare type PredicateBatcherAsync<I, A> = PredicateBatcherCommon<A> & {
    executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>>;
};
export declare enum Mode {
    Balanced = 0,
    Even = 1
}
export declare enum TimeUnit {
    Milliseconds = 0,
    Seconds = 1,
    Minutes = 2
}
