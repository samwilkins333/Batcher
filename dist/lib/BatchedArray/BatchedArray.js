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
Object.defineProperty(exports, "__esModule", { value: true });
var BatcherAgent_1 = require("../BatcherAgent/BatcherAgent");
var Interval_1 = require("./Interval");
var BatchedArray = /** @class */ (function () {
    function BatchedArray(batches) {
        this.source = [];
        this.batches = batches;
    }
    BatchedArray.from = function (source, batcher) {
        var copy = Array.from(source);
        var batched = new BatchedArray(new BatcherAgent_1.default(copy).batch(batcher));
        batched.source = copy;
        return batched;
    };
    BatchedArray.fromAsync = function (source, batcher) {
        return __awaiter(this, void 0, void 0, function () {
            var copy, batched, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        copy = Array.from(source);
                        _a = BatchedArray.bind;
                        return [4 /*yield*/, new BatcherAgent_1.default(copy).predicateBatchAsync(batcher)];
                    case 1:
                        batched = new (_a.apply(BatchedArray, [void 0, _b.sent()]))();
                        batched.source = copy;
                        return [2 /*return*/, batched];
                }
            });
        });
    };
    Object.defineProperty(BatchedArray.prototype, "batchCount", {
        get: function () {
            return this.batches.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BatchedArray.prototype, "elementCount", {
        get: function () {
            return this.source.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BatchedArray.prototype, "batchIterator", {
        get: function () {
            return this.batches[Symbol.iterator]();
        },
        enumerable: true,
        configurable: true
    });
    BatchedArray.prototype.batchedForEach = function (handler) {
        if (this.batchCount) {
            var completed = 0;
            for (var _i = 0, _a = this.batches; _i < _a.length; _i++) {
                var batch = _a[_i];
                handler(batch, this.context(completed++));
            }
        }
    };
    BatchedArray.prototype.batchedMap = function (converter) {
        if (!this.batchCount) {
            return [];
        }
        var collector = [];
        var completed = 0;
        for (var _i = 0, _a = this.batches; _i < _a.length; _i++) {
            var batch = _a[_i];
            converter(batch, this.context(completed++)).forEach(function (convert) { return collector.push(convert); });
        }
        return collector;
    };
    BatchedArray.prototype.batchedForEachAsync = function (handler) {
        return __awaiter(this, void 0, void 0, function () {
            var completed, _i, _a, batch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.batchCount) return [3 /*break*/, 4];
                        completed = 0;
                        _i = 0, _a = this.batches;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        batch = _a[_i];
                        return [4 /*yield*/, handler(batch, this.context(completed++))];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BatchedArray.prototype.batchedMapAsync = function (converter) {
        return __awaiter(this, void 0, void 0, function () {
            var collector, completed, _i, _a, batch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.batchCount) {
                            return [2 /*return*/, []];
                        }
                        collector = [];
                        completed = 0;
                        _i = 0, _a = this.batches;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        batch = _a[_i];
                        return [4 /*yield*/, converter(batch, this.context(completed++))];
                    case 2:
                        (_b.sent()).forEach(function (convert) { return collector.push(convert); });
                        completed++;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, collector];
                }
            });
        });
    };
    BatchedArray.prototype.context = function (completed, patient) {
        if (patient === void 0) { patient = true; }
        return {
            completedBatches: completed,
            remainingBatches: this.batchCount - completed,
            patient: patient
        };
    };
    BatchedArray.prototype.batchedForEachNaiveInterval = function (interval, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.batchCount) {
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, dispatched, next;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = this.batchIterator;
                                        dispatched = 0;
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                var handle = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        next = iterator.next();
                                                        if (!next.done) {
                                                            handler(next.value, this.context(++dispatched, false));
                                                        }
                                                        else {
                                                            clearInterval(handle);
                                                            resolve();
                                                        }
                                                        return [2 /*return*/];
                                                    });
                                                }); }, Interval_1.Interval.convert(interval));
                                            })];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                }
                return [2 /*return*/];
            });
        });
    };
    BatchedArray.prototype.batchedForEachPatientInterval = function (interval, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.batchCount) {
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, completed, next;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = this.batchIterator;
                                        completed = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!!(next = iterator.next()).done) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, handler(next.value, this.context(completed++))];
                                                            case 1:
                                                                _a.sent();
                                                                resolve();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, Interval_1.Interval.convert(interval));
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 1];
                                    case 3:
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                }
                return [2 /*return*/];
            });
        });
    };
    BatchedArray.prototype.batchedMapNaiveInterval = function (interval, converter) {
        return __awaiter(this, void 0, void 0, function () {
            var collector_1;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.batchCount) {
                    collector_1 = [];
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, dispatched, next;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = this.batchIterator;
                                        dispatched = 0;
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                var handle = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var _a, _b, _c;
                                                    return __generator(this, function (_d) {
                                                        switch (_d.label) {
                                                            case 0:
                                                                next = iterator.next();
                                                                if (!!next.done) return [3 /*break*/, 2];
                                                                _b = (_a = collector_1.push).apply;
                                                                _c = [collector_1];
                                                                return [4 /*yield*/, converter(next.value, this.context(++dispatched, false))];
                                                            case 1:
                                                                _b.apply(_a, _c.concat([(_d.sent())]));
                                                                return [3 /*break*/, 3];
                                                            case 2:
                                                                clearInterval(handle);
                                                                resolve();
                                                                _d.label = 3;
                                                            case 3: return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, Interval_1.Interval.convert(interval));
                                            })];
                                    case 1:
                                        _a.sent();
                                        resolve(collector_1);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                }
                return [2 /*return*/, []];
            });
        });
    };
    BatchedArray.prototype.batchedMapPatientInterval = function (interval, converter) {
        return __awaiter(this, void 0, void 0, function () {
            var collector_2;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.batchCount) {
                    collector_2 = [];
                    return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var iterator, completed, next;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        iterator = this.batchIterator;
                                        completed = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!!(next = iterator.next()).done) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var _a, _b, _c;
                                                    return __generator(this, function (_d) {
                                                        switch (_d.label) {
                                                            case 0:
                                                                _b = (_a = collector_2.push).apply;
                                                                _c = [collector_2];
                                                                return [4 /*yield*/, converter(next.value, this.context(completed++))];
                                                            case 1:
                                                                _b.apply(_a, _c.concat([(_d.sent())]));
                                                                resolve();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, Interval_1.Interval.convert(interval));
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 1];
                                    case 3:
                                        resolve(collector_2);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                }
                return [2 /*return*/, []];
            });
        });
    };
    return BatchedArray;
}());
exports.default = BatchedArray;
