export enum TimeUnit {
    Milliseconds,
    Seconds,
    Minutes
}

export namespace Interval {

    export interface Instance {
        magnitude: number;
        unit: TimeUnit;
    }

    export const convert = (interval: Instance) => {
        const { magnitude, unit } = interval;
        switch (unit) {
            default:
            case TimeUnit.Milliseconds:
                return magnitude;
            case TimeUnit.Seconds:
                return magnitude * 1000;
            case TimeUnit.Minutes:
                return magnitude * 1000 * 60;
        }
    };

}