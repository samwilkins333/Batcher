export interface BatchContext {
    patient: boolean;
    completedBatches: number;
    remainingBatches: number;
}

type BatchFunction<I, R> = (batch: I[], context: BatchContext) => R;

export type BatchConverterSync<I, O> = BatchFunction<I, O[]>;
export type BatchConverterAsync<I, O> = BatchFunction<I, Promise<O[]>>;
export type BatchConverterEither<I, O> = BatchFunction<I, O[] | Promise<O[]>>;

export type BatchHandlerSync<I> = BatchFunction<I, void>;
export type BatchHandlerAsync<I> = BatchFunction<I, Promise<void>>;
export type BatchHandlerEither<I> = BatchFunction<I, void | Promise<void>>;