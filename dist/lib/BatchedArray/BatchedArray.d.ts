import { BatchHandlerSync, BatchConverterSync, BatchHandlerAsync, BatchConverterAsync, BatchConverterEither, BatchHandlerEither } from "./Types";
import { BatcherSync, PredicateBatcherAsync } from "../BatcherAgent/Types";
import { Interval } from "./Interval";
export default class BatchedArray<T> {
    private source;
    private readonly batches;
    static from<T, A = undefined>(source: Array<T>, batcher: BatcherSync<T, A>): BatchedArray<T>;
    static fromAsync<T, A = undefined>(source: Array<T>, batcher: PredicateBatcherAsync<T, A>): Promise<BatchedArray<T>>;
    private constructor();
    readonly batchCount: number;
    readonly elementCount: number;
    private readonly batchIterator;
    batchedForEach(handler: BatchHandlerSync<T>): void;
    batchedMap<O>(converter: BatchConverterSync<T, O>): O[];
    batchedForEachAsync(handler: BatchHandlerAsync<T>): Promise<void>;
    batchedMapAsync<O>(converter: BatchConverterAsync<T, O>): Promise<O[]>;
    private context;
    batchedForEachNaiveInterval(interval: Interval.Instance, handler: BatchHandlerEither<T>): Promise<void>;
    batchedForEachPatientInterval(interval: Interval.Instance, handler: BatchHandlerEither<T>): Promise<void>;
    batchedMapNaiveInterval<O>(interval: Interval.Instance, converter: BatchConverterEither<T, O>): Promise<O[]>;
    batchedMapPatientInterval<O>(interval: Interval.Instance, converter: BatchConverterEither<T, O>): Promise<O[]>;
}
