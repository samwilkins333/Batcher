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
export type FixedBatcher = {
    batchSize: number;
} | {
    batchCount: number;
    mode?: Mode;
};
export type PredicateBatcherSync<I, A> = PredicateBatcherCommon<A> & {
    executor: (element: I, accumulator: A) => ExecutorResult<A>;
};
export type PredicateBatcherAsync<I, A> = PredicateBatcherCommon<A> & {
    executorAsync: (element: I, accumulator: A) => Promise<ExecutorResult<A>>;
};
export enum Mode {
    Balanced = 0,
    Even = 1
}
export enum TimeUnit {
    Milliseconds = 0,
    Seconds = 1,
    Minutes = 2
}
export function fixedBatch<I>(target: Array<I>, batcher: FixedBatcher): I[][];
export function predicateBatch<I, A = undefined>(target: Array<I>, batcher: PredicateBatcherSync<I, A>): I[][];
export function predicateBatchAsync<I, A = undefined>(target: Array<I>, batcher: BatcherAsync<I, A>): Promise<I[][]>;
export function batch<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>): I[][];
export function batchAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>): Promise<I[][]>;
export function batchedForEach<I, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchHandlerSync<I>): void;
export function batchedMap<I, O, A = undefined>(target: Array<I>, batcher: BatcherSync<I, A>, handler: BatchConverterSync<I, O>): O[];
export function batchedForEachAsync<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>): Promise<void>;
export function batchedMapAsync<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>): Promise<O[]>;
declare const convert: (interval: Interval) => number;
export function batchedForEachInterval<I, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchHandler<I>, interval: Interval): Promise<void>;
export function batchedMapInterval<I, O, A = undefined>(target: Array<I>, batcher: Batcher<I, A>, handler: BatchConverter<I, O>, interval: Interval): Promise<O[]>;
