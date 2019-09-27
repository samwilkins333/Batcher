export declare enum TimeUnit {
    Milliseconds = 0,
    Seconds = 1,
    Minutes = 2
}
export declare namespace Interval {
    interface Instance {
        magnitude: number;
        unit: TimeUnit;
    }
    const convert: (interval: Instance) => number;
}
