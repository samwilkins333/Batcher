import { PredicateBatcherSync, PredicateBatcherAsync } from "./Types";
export declare function ThresholdBatcherSync<T>(threshold: number, sizer: (element: T) => number, initial?: number): PredicateBatcherSync<T, number>;
export declare function ThresholdBatcherAsync<T>(threshold: number, sizer: (element: T) => Promise<number>, initial?: number): PredicateBatcherAsync<T, number>;
