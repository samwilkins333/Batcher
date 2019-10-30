import BatcherAgent from "../BatcherAgent/BatcherAgent";
import { BatchHandlerSync, BatchConverterSync, BatchContext, BatchHandlerAsync, BatchConverterAsync, BatchConverterEither, BatchHandlerEither } from "./Types";
import { BatcherSync, PredicateBatcherAsync } from "../BatcherAgent/Types";
import { Interval } from "./Interval";

export default class BatchedArray<T> {
    private source: Array<T> = [];
    private readonly batches: Array<Array<T>>;

    public static from<T, A = undefined>(source: Array<T>, batcher: BatcherSync<T, A>) {
        const copy = Array.from(source);
        const batched = new BatchedArray<T>(new BatcherAgent<T>(copy).batch(batcher));
        batched.source = copy;
        return batched;
    }

    public static async fromAsync<T, A = undefined>(source: Array<T>, batcher: PredicateBatcherAsync<T, A>) {
        const copy = Array.from(source);
        const batched = new BatchedArray<T>(await new BatcherAgent<T>(copy).predicateBatchAsync(batcher));
        batched.source = copy;
        return batched;
    }

    private constructor(batches: Array<Array<T>>) {
        this.batches = batches;
    }

    public get batchCount() {
        return this.batches.length;
    }

    public get elementCount() {
        return this.source.length;
    }

    private get batchIterator() {
        return this.batches[Symbol.iterator]();
    }

    batchedForEach(handler: BatchHandlerSync<T>): void {
        if (this.batchCount) {
            let completed = 0;
            for (let batch of this.batches) {
                handler(batch, this.context(completed++));
            }
        }
    }

    batchedMap<O>(converter: BatchConverterSync<T, O>): O[] {
        if (!this.batchCount) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        for (let batch of this.batches) {
            const results: O[] = [];
            converter(batch, results, this.context(completed++));
            collector.push(...results);
        }
        return collector;
    }

    async batchedForEachAsync(handler: BatchHandlerAsync<T>): Promise<void> {
        if (this.batchCount) {
            let completed = 0;
            for (let batch of this.batches) {
                await handler(batch, this.context(completed++));
            }
        }
    }

    async batchedMapAsync<O>(converter: BatchConverterAsync<T, O>): Promise<O[]> {
        if (!this.batchCount) {
            return [];
        }
        let collector: O[] = [];
        let completed = 0;
        for (let batch of this.batches) {
            const results: O[] = [];
            await converter(batch, [] as O[], this.context(completed++));
            collector.push(...results);
        }
        return collector;
    }

    private context(completed: number, patient = true): BatchContext {
        return {
            completedBatches: completed,
            remainingBatches: this.batchCount - completed,
            patient
        };
    }

    async batchedForEachStrictInterval(interval: Interval.Instance, handler: BatchHandlerEither<T>): Promise<void> {
        if (this.batchCount) {
            return new Promise<void>(async resolve => {
                const iterator = this.batchIterator;
                let dispatched = 0;
                let next = iterator.next();
                handler(next.value, this.context(++dispatched, false));
                await new Promise<void>(resolve => {
                    const handle = setInterval(
                        async () => {
                            next = iterator.next();
                            if (!next.done) {
                                handler(next.value, this.context(++dispatched, false));
                            } else {
                                clearInterval(handle);
                                resolve();
                            }
                        },
                        Interval.convert(interval)
                    );
                });
                resolve();
            });
        }
    }

    async batchedForEachPatientInterval(interval: Interval.Instance, handler: BatchHandlerEither<T>): Promise<void> {
        if (this.batchCount) {
            return new Promise<void>(async resolve => {
                const iterator = this.batchIterator;
                let completed = 0;
                let next = iterator.next();
                await handler(next.value, this.context(completed++));
                while (!(next = iterator.next()).done) {
                    await new Promise<void>(resolve => {
                        setTimeout(
                            async () => {
                                await handler(next.value, this.context(completed++));
                                resolve();
                            },
                            Interval.convert(interval)
                        );
                    });
                }
                resolve();
            });
        }
    }

    async batchedMapStrictInterval<O>(interval: Interval.Instance, converter: BatchConverterEither<T, O>): Promise<O[]> {
        if (this.batchCount) {
            const collector: O[] = [];
            return new Promise<O[]>(async resolve => {
                const iterator = this.batchIterator;
                let dispatched = 0;
                let next = iterator.next();
                setTimeout(async () => {
                    const results: O[] = [];
                    await converter(next.value, results, this.context(++dispatched, false))
                    collector.push(...results);
                }, 0);
                await new Promise<void>(resolve => {
                    const handle = setInterval(
                        async () => {
                            next = iterator.next();
                            if (!next.done) {
                                const results: O[] = [];
                                await converter(next.value, results, this.context(++dispatched, false));
                                collector.push(...results);
                            } else {
                                clearInterval(handle);
                                resolve();
                            }
                        },
                        Interval.convert(interval)
                    );
                });
                resolve(collector);
            });
        }
        return [];
    }

    async batchedMapPatientInterval<O>(interval: Interval.Instance, converter: BatchConverterEither<T, O>): Promise<O[]> {
        if (this.batchCount) {
            const collector: O[] = [];
            return new Promise<O[]>(async resolve => {
                const iterator = this.batchIterator;
                let completed = 0;
                let next = iterator.next();
                const results: O[] = [];
                await converter(next.value, results, this.context(completed++));
                collector.push(...results);
                while (!(next = iterator.next()).done) {
                    await new Promise<void>(resolve => {
                        setTimeout(
                            async () => {
                                const results: O[] = [];
                                await converter(next.value, results, this.context(completed++));
                                collector.push(...results);
                                resolve();
                            },
                            Interval.convert(interval)
                        );
                    });
                }
                resolve(collector);
            });
        }
        return [];
    }

}