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
var Types_1 = require("./Types");
var BatcherAgent = /** @class */ (function () {
    function BatcherAgent(input) {
        this.input = input;
    }
    Object.defineProperty(BatcherAgent.prototype, "length", {
        get: function () {
            return this.input.length;
        },
        enumerable: true,
        configurable: true
    });
    BatcherAgent.prototype.fixedBatch = function (batcher) {
        var batches = [];
        var length = this.length;
        var i = 0;
        if ("batchSize" in batcher) {
            var batchSize = batcher.batchSize;
            while (i < length) {
                var cap = Math.min(i + batchSize, length);
                batches.push(this.input.slice(i, i = cap));
            }
        }
        else if ("batchCount" in batcher) {
            var batchCount = batcher.batchCount, mode = batcher.mode;
            var resolved = mode || Types_1.Mode.Balanced;
            if (batchCount < 1) {
                throw new Error("Batch count must be a positive integer!");
            }
            if (batchCount === 1) {
                return [this.input];
            }
            if (batchCount >= length) {
                return this.input.map(function (element) { return [element]; });
            }
            var size = void 0;
            if (length % batchCount === 0) {
                size = Math.floor(length / batchCount);
                while (i < length) {
                    batches.push(this.input.slice(i, i += size));
                }
            }
            else if (resolved === Types_1.Mode.Balanced) {
                while (i < length) {
                    size = Math.ceil((length - i) / batchCount--);
                    batches.push(this.input.slice(i, i += size));
                }
            }
            else {
                batchCount--;
                size = Math.floor(length / batchCount);
                if (length % size === 0) {
                    size--;
                }
                while (i < size * batchCount) {
                    batches.push(this.input.slice(i, i += size));
                }
                batches.push(this.input.slice(size * batchCount));
            }
        }
        return batches;
    };
    BatcherAgent.prototype.predicateBatch = function (batcher) {
        var batches = [];
        var batch = [];
        var executor = batcher.executor, initial = batcher.initial;
        var accumulator = initial;
        for (var _i = 0, _a = this.input; _i < _a.length; _i++) {
            var element = _a[_i];
            var _b = executor(element, accumulator), updatedAccumulator = _b.updatedAccumulator, createNewBatch = _b.createNewBatch;
            accumulator = updatedAccumulator;
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
    };
    BatcherAgent.prototype.predicateBatchAsync = function (batcher) {
        return __awaiter(this, void 0, void 0, function () {
            var batches, batch, executorAsync, initial, accumulator, _i, _a, element, _b, updatedAccumulator, createNewBatch;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        batches = [];
                        batch = [];
                        executorAsync = batcher.executorAsync, initial = batcher.initial;
                        accumulator = initial;
                        _i = 0, _a = this.input;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        element = _a[_i];
                        return [4 /*yield*/, executorAsync(element, accumulator)];
                    case 2:
                        _b = _c.sent(), updatedAccumulator = _b.updatedAccumulator, createNewBatch = _b.createNewBatch;
                        accumulator = updatedAccumulator;
                        if (!createNewBatch) {
                            batch.push(element);
                        }
                        else {
                            batch.length && batches.push(batch);
                            batch = [element];
                        }
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        batches.push(batch);
                        return [2 /*return*/, batches];
                }
            });
        });
    };
    BatcherAgent.prototype.batch = function (batcher) {
        if ("executor" in batcher) {
            return this.predicateBatch(batcher);
        }
        else {
            return this.fixedBatch(batcher);
        }
    };
    return BatcherAgent;
}());
exports.default = BatcherAgent;
