export interface BatchContext {
    patient: boolean;
    completedBatches: number;
    remainingBatches: number;
}
declare type BatchFunction<I, R> = (batch: I[], context: BatchContext) => R;
export declare type BatchConverterSync<I, O> = BatchFunction<I, O[]>;
export declare type BatchConverterAsync<I, O> = BatchFunction<I, Promise<O[]>>;
export declare type BatchConverterEither<I, O> = BatchFunction<I, O[] | Promise<O[]>>;
export declare type BatchHandlerSync<I> = BatchFunction<I, void>;
export declare type BatchHandlerAsync<I> = BatchFunction<I, Promise<void>>;
export declare type BatchHandlerEither<I> = BatchFunction<I, void | Promise<void>>;
export {};
