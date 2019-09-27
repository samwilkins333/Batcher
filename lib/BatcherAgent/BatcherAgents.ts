import { PredicateBatcherSync, PredicateBatcherAsync } from "./Types";

export function ThresholdBatcherSync<T>(threshold: number, sizer: (element: T) => number, initial = 0): PredicateBatcherSync<T, number> {
    return {
        executor: (element: T, accumulator: number) => {
            const size = sizer(element);
            accumulator += size;
            const createNewBatch = accumulator > threshold;
            if (createNewBatch) {
                accumulator = size;
            }
            return { createNewBatch, updatedAccumulator: accumulator };
        },
        initial
    };
}

export function ThresholdBatcherAsync<T>(threshold: number, sizer: (element: T) => Promise<number>, initial = 0): PredicateBatcherAsync<T, number> {
    return {
        executorAsync: async (element: T, accumulator: number) => {
            const size = await sizer(element);
            accumulator += size;
            const createNewBatch = accumulator > threshold;
            if (createNewBatch) {
                accumulator = size;
            }
            return { createNewBatch, updatedAccumulator: accumulator };
        },
        initial
    };
}