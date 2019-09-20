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
declare type BatchConverterSync<I, O> = (batch: I[], context: BatchContext) => O[];
declare type BatchConverterAsync<I, O> = (batch: I[], context: BatchContext) => Promise<O[]>;
declare type BatchConverter<I, O> = BatchConverterSync<I, O> | BatchConverterAsync<I, O>;
declare type BatchHandlerSync<I> = (batch: I[], context: BatchContext) => void;
declare type BatchHandlerAsync<I> = (batch: I[], context: BatchContext) => Promise<void>;
declare type BatchHandler<I> = BatchHandlerSync<I> | BatchHandlerAsync<I>;
declare type BatcherSync<I, A> = FixedBatcher | PredicateBatcherSync<I, A>;
declare type BatcherAsync<I, A> = PredicateBatcherAsync<I, A>;
declare type Batcher<I, A> = BatcherSync<I, A> | BatcherAsync<I, A>;
declare type FixedBatcher = {
    batchSize: number;
} | {
    batchCount: number;
    mode?: Mode;
};
declare type PredicateBatcherSync<I, A> = PredicateBatcherCommon<A> & {
    executor: (element: I, accumulator: A) => ExecutorResult<A>;
};
declare type PredicateBatcherAsync<I, A> = PredicateBatcherCommon<A> & {
    executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>>;
};
declare enum Mode {
    Balanced = 0,
    Even = 1
}
declare enum TimeUnit {
    Milliseconds = 0,
    Seconds = 1,
    Minutes = 2
}
declare function fixedBatch<I>(target: Array<I>, batcher: FixedBatcher): I[][];
declare function predicateBatch<I, A = undefined>(target: Array<I>, batcher: PredicateBatcherSync<I, A>): I[][];
declare function predicateBatchAsync<I, A = undefined>(target: Array<I>, batcher: BatcherAsync<I, A>): Promise<I[][]>;
declare function batch<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>): I[][];
declare function batchAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>): Promise<I[][]>;
declare function batchedForEach<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchHandlerSync<I>): void;
declare function batchedMap<I, O, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchConverterSync<I, O>): O[];
declare function batchedForEachAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>): Promise<void>;
declare function batchedMapAsync<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>): Promise<O[]>;
declare const convert: (interval: Interval) => number;
declare function batchedForEachInterval<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>, interval: Interval): Promise<void>;
declare function batchedMapInterval<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>, interval: Interval): Promise<O[]>;
