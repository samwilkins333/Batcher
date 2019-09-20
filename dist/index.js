"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Mode;
(function (Mode) {
    Mode[Mode["Balanced"] = 0] = "Balanced";
    Mode[Mode["Even"] = 1] = "Even";
})(Mode || (Mode = {}));
;
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Milliseconds"] = 0] = "Milliseconds";
    TimeUnit[TimeUnit["Seconds"] = 1] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 2] = "Minutes";
})(TimeUnit || (TimeUnit = {}));
;
function fixedBatch(target, batcher) {
    var batches = [];
    var length = target.length;
    var i = 0;
    if ("batchSize" in batcher) {
        var batchSize = batcher.batchSize;
        while (i < target.length) {
            var cap = Math.min(i + batchSize, length);
            batches.push(target.slice(i, i = cap));
        }
    }
    else if ("batchCount" in batcher) {
        var batchCount = batcher.batchCount, mode = batcher.mode;
        var resolved = mode || Mode.Balanced;
        if (batchCount < 1) {
            throw new Error("Batch count must be a positive integer!");
        }
        if (batchCount === 1) {
            return [target];
        }
        if (batchCount >= target.length) {
            return target.map(function (element) { return [element]; });
        }
        var length_1 = target.length;
        var size = void 0;
        if (length_1 % batchCount === 0) {
            size = Math.floor(length_1 / batchCount);
            while (i < length_1) {
                batches.push(target.slice(i, i += size));
            }
        }
        else if (resolved === Mode.Balanced) {
            while (i < length_1) {
                size = Math.ceil((length_1 - i) / batchCount--);
                batches.push(target.slice(i, i += size));
            }
        }
        else {
            batchCount--;
            size = Math.floor(length_1 / batchCount);
            if (length_1 % size === 0) {
                size--;
            }
            while (i < size * batchCount) {
                batches.push(target.slice(i, i += size));
            }
            batches.push(target.slice(size * batchCount));
        }
    }
    return batches;
}
;
function predicateBatch(target, batcher) {
    var batches = [];
    var batch = [];
    var executor = batcher.executor, initial = batcher.initial;
    var accumulator = initial;
    for (var _i = 0, target_1 = target; _i < target_1.length; _i++) {
        var element = target_1[_i];
        var _a = executor(element, accumulator), updated = _a.updated, createNewBatch = _a.createNewBatch;
        accumulator = updated;
        if (!createNewBatch) {
            batch.push(element);
        }
        else {
            batches.push(batch);
            batch = [element];
        }
    }
    batches.push(batch);
    return batches;
}
;
function predicateBatchAsync(target, batcher) {
    return __awaiter(this, void 0, void 0, function () {
        var batches, batch, executorAsync, initial, accumulator, _i, target_2, element, _a, updated, createNewBatch;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    batches = [];
                    batch = [];
                    executorAsync = batcher.executorAsync, initial = batcher.initial;
                    accumulator = initial;
                    _i = 0, target_2 = target;
                    _b.label = 1;
                case 1:
                    if (!(_i < target_2.length)) return [3 /*break*/, 4];
                    element = target_2[_i];
                    return [4 /*yield*/, executorAsync(element, accumulator)];
                case 2:
                    _a = _b.sent(), updated = _a.updated, createNewBatch = _a.createNewBatch;
                    accumulator = updated;
                    if (!createNewBatch) {
                        batch.push(element);
                    }
                    else {
                        batches.push(batch);
                        batch = [element];
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    batches.push(batch);
                    return [2 /*return*/, batches];
            }
        });
    });
}
;
function batch(target, batcher) {
    if ("executor" in batcher) {
        return predicateBatch(target, batcher);
    }
    else {
        return fixedBatch(target, batcher);
    }
}
;
function batchAsync(target, batcher) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ("executorAsync" in batcher) {
                return [2 /*return*/, predicateBatchAsync(target, batcher)];
            }
            else {
                return [2 /*return*/, batch(target, batcher)];
            }
            return [2 /*return*/];
        });
    });
}
;
function batchedForEach(target, batcher, handler) {
    if (target.length) {
        var completed = 0;
        var batches = batch(target, batcher);
        var quota = batches.length;
        for (var _i = 0, batches_1 = batches; _i < batches_1.length; _i++) {
            var batch_1 = batches_1[_i];
            var context = {
                completedBatches: completed,
                remainingBatches: quota - completed,
            };
            handler(batch_1, context);
            completed++;
        }
    }
}
;
function batchedMap(target, batcher, handler) {
    if (!target.length) {
        return [];
    }
    var collector = [];
    var completed = 0;
    var batches = batch(target, batcher);
    var quota = batches.length;
    for (var _i = 0, batches_2 = batches; _i < batches_2.length; _i++) {
        var batch_2 = batches_2[_i];
        var context = {
            completedBatches: completed,
            remainingBatches: quota - completed,
        };
        handler(batch_2, context).forEach(function (convert) { return collector.push(convert); });
        completed++;
    }
    return collector;
}
;
function batchedForEachAsync(target, batcher, handler) {
    return __awaiter(this, void 0, void 0, function () {
        var completed, batches, quota, _i, batches_3, batch_3, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!target.length) return [3 /*break*/, 5];
                    completed = 0;
                    return [4 /*yield*/, batchAsync(target, batcher)];
                case 1:
                    batches = _a.sent();
                    quota = batches.length;
                    _i = 0, batches_3 = batches;
                    _a.label = 2;
                case 2:
                    if (!(_i < batches_3.length)) return [3 /*break*/, 5];
                    batch_3 = batches_3[_i];
                    context = {
                        completedBatches: completed,
                        remainingBatches: quota - completed,
                    };
                    return [4 /*yield*/, handler(batch_3, context)];
                case 3:
                    _a.sent();
                    completed++;
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
;
function batchedMapAsync(target, batcher, handler) {
    return __awaiter(this, void 0, void 0, function () {
        var collector, completed, batches, quota, _i, batches_4, batch_4, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!target.length) {
                        return [2 /*return*/, []];
                    }
                    collector = [];
                    completed = 0;
                    return [4 /*yield*/, batchAsync(target, batcher)];
                case 1:
                    batches = _a.sent();
                    quota = batches.length;
                    _i = 0, batches_4 = batches;
                    _a.label = 2;
                case 2:
                    if (!(_i < batches_4.length)) return [3 /*break*/, 5];
                    batch_4 = batches_4[_i];
                    context = {
                        completedBatches: completed,
                        remainingBatches: quota - completed,
                    };
                    return [4 /*yield*/, handler(batch_4, context)];
                case 3:
                    (_a.sent()).forEach(function (convert) { return collector.push(convert); });
                    completed++;
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, collector];
            }
        });
    });
}
;
var convert = function (interval) {
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
function batchedForEachInterval(target, batcher, handler, interval) {
    return __awaiter(this, void 0, void 0, function () {
        var batches, quota;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!target.length) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, batchAsync(target, batcher)];
                case 1:
                    batches = _a.sent();
                    quota = batches.length;
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, completed, _loop_1, state_1;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = batches[Symbol.iterator]();
                                        completed = 0;
                                        _loop_1 = function () {
                                            var next;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        next = iterator.next();
                                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                                    var batch, context;
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0:
                                                                                batch = next.value;
                                                                                context = {
                                                                                    completedBatches: completed,
                                                                                    remainingBatches: quota - completed,
                                                                                };
                                                                                return [4 /*yield*/, handler(batch, context)];
                                                                            case 1:
                                                                                _a.sent();
                                                                                resolve();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); }, convert(interval));
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        if (++completed === quota) {
                                                            return [2 /*return*/, "break"];
                                                        }
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _a.label = 1;
                                    case 1:
                                        if (!true) return [3 /*break*/, 3];
                                        return [5 /*yield**/, _loop_1()];
                                    case 2:
                                        state_1 = _a.sent();
                                        if (state_1 === "break")
                                            return [3 /*break*/, 3];
                                        return [3 /*break*/, 1];
                                    case 3:
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
            }
        });
    });
}
;
function batchedMapInterval(target, batcher, handler, interval) {
    return __awaiter(this, void 0, void 0, function () {
        var collector, batches, quota;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!target.length) {
                        return [2 /*return*/, []];
                    }
                    collector = [];
                    return [4 /*yield*/, batchAsync(target, batcher)];
                case 1:
                    batches = _a.sent();
                    quota = batches.length;
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, completed, _loop_2, state_2;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = batches[Symbol.iterator]();
                                        completed = 0;
                                        _loop_2 = function () {
                                            var next;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        next = iterator.next();
                                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                                    var batch, context;
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0:
                                                                                batch = next.value;
                                                                                context = {
                                                                                    completedBatches: completed,
                                                                                    remainingBatches: quota - completed,
                                                                                };
                                                                                return [4 /*yield*/, handler(batch, context)];
                                                                            case 1:
                                                                                (_a.sent()).forEach(function (convert) { return collector.push(convert); });
                                                                                resolve();
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); }, convert(interval));
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        if (++completed === quota) {
                                                            resolve(collector);
                                                            return [2 /*return*/, "break"];
                                                        }
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _a.label = 1;
                                    case 1:
                                        if (!true) return [3 /*break*/, 3];
                                        return [5 /*yield**/, _loop_2()];
                                    case 2:
                                        state_2 = _a.sent();
                                        if (state_2 === "break")
                                            return [3 /*break*/, 3];
                                        return [3 /*break*/, 1];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
            }
        });
    });
}
;
module.exports = {
    fixedBatch: fixedBatch,
    predicateBatch: predicateBatch,
    predicateBatchAsync: predicateBatchAsync,
    batch: batch,
    batchAsync: batchAsync,
    batchedForEach: batchedForEach,
    batchedMap: batchedMap,
    batchedForEachAsync: batchedForEachAsync,
    batchedMapAsync: batchedMapAsync,
    batchedForEachInterval: batchedForEachInterval,
    batchedMapInterval: batchedMapInterval,
    Mode: Mode,
    TimeUnit: TimeUnit
};
