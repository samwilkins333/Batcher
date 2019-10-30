export interface BatchContext {
    patient: boolean;
    completedBatches: number;
    remainingBatches: number;
}
declare type BatchForEachFunction<I, R> = (batch: I[], context: BatchContext) => R;
declare type BatchMapFunction<I, O, R> = (batch: I[], collector: O[], context: BatchContext) => R;
export declare type BatchConverterSync<I, O> = BatchMapFunction<I, O, void>;
export declare type BatchConverterAsync<I, O> = BatchMapFunction<I, O, Promise<void>>;
export declare type BatchConverterEither<I, O> = BatchMapFunction<I, O, void | Promise<void>>;
export declare type BatchHandlerSync<I> = BatchForEachFunction<I, void>;
export declare type BatchHandlerAsync<I> = BatchForEachFunction<I, Promise<void>>;
export declare type BatchHandlerEither<I> = BatchForEachFunction<I, void | Promise<void>>;
export {};
