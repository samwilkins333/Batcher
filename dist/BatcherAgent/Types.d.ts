export declare type BatcherSync<I, A> = FixedBatcher | PredicateBatcherSync<I, A>;
export declare type FixedBatcher = {
    batchSize: number;
} | {
    batchCount: number;
    mode?: Mode;
};
export interface PredicateBatcherSync<I, A> {
    initial: A;
    executor: (element: I, accumulator: A) => ExecutorResult<A>;
}
export interface PredicateBatcherAsync<I, A> {
    initial: A;
    executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>>;
}
export interface ExecutorResult<A> {
    updatedAccumulator: A;
    createNewBatch: boolean;
}
export declare enum Mode {
    Balanced = 0,
    Even = 1
}
