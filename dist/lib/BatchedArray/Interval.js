"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Milliseconds"] = 0] = "Milliseconds";
    TimeUnit[TimeUnit["Seconds"] = 1] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 2] = "Minutes";
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
var Interval;
(function (Interval) {
    Interval.convert = function (interval) {
        var magnitude = interval.magnitude, unit = interval.unit;
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
})(Interval = exports.Interval || (exports.Interval = {}));
