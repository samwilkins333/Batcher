export interface BatchContext {
    patient: boolean;
    completedBatches: number;
    remainingBatches: number;
}

type BatchForEachFunction<I, R> = (batch: I[], context: BatchContext) => R;
type BatchMapFunction<I, O, R> = (batch: I[], collector: O[], context: BatchContext) => R;

export type BatchConverterSync<I, O> = BatchMapFunction<I, O, void>;
export type BatchConverterAsync<I, O> = BatchMapFunction<I, O, Promise<void>>;
export type BatchConverterEither<I, O> = BatchMapFunction<I, O, void | Promise<void>>;

export type BatchHandlerSync<I> = BatchForEachFunction<I, void>;
export type BatchHandlerAsync<I> = BatchForEachFunction<I, Promise<void>>;
export type BatchHandlerEither<I> = BatchForEachFunction<I, void | Promise<void>>;