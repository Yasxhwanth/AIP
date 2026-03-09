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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.computeRollups = computeRollups;
exports.computeAllRecentRollups = computeAllRecentRollups;
exports.startRollupScheduler = startRollupScheduler;
var WINDOW_SIZES = {
    '5m': { label: '5 minutes', ms: 5 * 60 * 1000 },
    '15m': { label: '15 minutes', ms: 15 * 60 * 1000 },
    '1h': { label: '1 hour', ms: 60 * 60 * 1000 },
    '1d': { label: '1 day', ms: 24 * 60 * 60 * 1000 },
};
/**
 * Floor a timestamp to the start of its window bucket.
 * e.g., 10:07 with windowSize "5m" → 10:05
 */
function floorToWindow(timestamp, windowMs) {
    var ms = timestamp.getTime();
    return new Date(ms - (ms % windowMs));
}
// ── Rollup Engine ────────────────────────────────────────────────
/**
 * Computes rollups for a specific logicalId + metric over a time range.
 * Buckets raw TimeseriesMetric rows into windows and upserts TelemetryRollup.
 */
function computeRollups(logicalId, metric, windowSize, from, to, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var windowConfig, rawPoints, buckets, _i, rawPoints_1, point, windowStart, key, existing, bucketsProcessed, _a, buckets_1, _b, windowStartMs, values, windowStart, count, sum, avg, min, max;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    windowConfig = WINDOW_SIZES[windowSize];
                    if (!windowConfig) {
                        throw new Error("Unsupported windowSize '".concat(windowSize, "'. Use: ").concat(Object.keys(WINDOW_SIZES).join(', ')));
                    }
                    return [4 /*yield*/, prisma.timeseriesMetric.findMany({
                            where: {
                                logicalId: logicalId,
                                metric: metric,
                                timestamp: { gte: from, lte: to },
                            },
                            orderBy: { timestamp: 'asc' },
                        })];
                case 1:
                    rawPoints = _c.sent();
                    if (rawPoints.length === 0) {
                        return [2 /*return*/, { bucketsProcessed: 0 }];
                    }
                    buckets = new Map();
                    for (_i = 0, rawPoints_1 = rawPoints; _i < rawPoints_1.length; _i++) {
                        point = rawPoints_1[_i];
                        windowStart = floorToWindow(point.timestamp, windowConfig.ms);
                        key = windowStart.getTime();
                        existing = buckets.get(key);
                        if (existing) {
                            existing.push(point.value);
                        }
                        else {
                            buckets.set(key, [point.value]);
                        }
                    }
                    bucketsProcessed = 0;
                    _a = 0, buckets_1 = buckets;
                    _c.label = 2;
                case 2:
                    if (!(_a < buckets_1.length)) return [3 /*break*/, 5];
                    _b = buckets_1[_a], windowStartMs = _b[0], values = _b[1];
                    windowStart = new Date(windowStartMs);
                    count = values.length;
                    sum = values.reduce(function (a, b) { return a + b; }, 0);
                    avg = sum / count;
                    min = Math.min.apply(Math, values);
                    max = Math.max.apply(Math, values);
                    return [4 /*yield*/, prisma.telemetryRollup.upsert({
                            where: {
                                logicalId_metric_windowSize_windowStart: {
                                    logicalId: logicalId,
                                    metric: metric,
                                    windowSize: windowSize,
                                    windowStart: windowStart,
                                },
                            },
                            create: {
                                logicalId: logicalId,
                                metric: metric,
                                windowSize: windowSize,
                                windowStart: windowStart,
                                avg: avg,
                                min: min,
                                max: max,
                                sum: sum,
                                count: count,
                            },
                            update: { avg: avg, min: min, max: max, sum: sum, count: count },
                        })];
                case 3:
                    _c.sent();
                    bucketsProcessed++;
                    _c.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, { bucketsProcessed: bucketsProcessed }];
            }
        });
    });
}
/**
 * Compute rollups for ALL active metric + logicalId combinations
 * over a recent time window. Intended for periodic background use.
 */
function computeAllRecentRollups(windowSize, lookbackMs, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var now, from, combos, totalBuckets, _i, combos_1, _a, logicalId, metric, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = new Date();
                    from = new Date(now.getTime() - lookbackMs);
                    return [4 /*yield*/, prisma.timeseriesMetric.findMany({
                            where: { timestamp: { gte: from } },
                            distinct: ['logicalId', 'metric'],
                            select: { logicalId: true, metric: true },
                        })];
                case 1:
                    combos = _b.sent();
                    totalBuckets = 0;
                    _i = 0, combos_1 = combos;
                    _b.label = 2;
                case 2:
                    if (!(_i < combos_1.length)) return [3 /*break*/, 5];
                    _a = combos_1[_i], logicalId = _a.logicalId, metric = _a.metric;
                    return [4 /*yield*/, computeRollups(logicalId, metric, windowSize, from, now, prisma)];
                case 3:
                    result = _b.sent();
                    totalBuckets += result.bucketsProcessed;
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, { totalBuckets: totalBuckets, combinationsProcessed: combos.length }];
            }
        });
    });
}
/**
 * Start a background scheduler that periodically computes rollups.
 * Runs every 5 minutes and rolls up the last 10 minutes of data into 5m buckets.
 */
function startRollupScheduler(prisma) {
    var INTERVAL = 5 * 60 * 1000; // every 5 minutes
    var LOOKBACK = 10 * 60 * 1000; // look back 10 minutes
    setInterval(function () {
        var idempotencyKey = "TELEMETRY_ROLLUP_".concat(Math.floor(Date.now() / INTERVAL));
        prisma.jobQueue.upsert({
            where: { idempotencyKey: idempotencyKey },
            create: {
                jobType: 'TELEMETRY_ROLLUP_TRIGGER',
                payload: { windowSize: '5m', lookbackMs: LOOKBACK },
                idempotencyKey: idempotencyKey,
                priority: 1, // lower priority than data ingest
            },
            update: {} // do nothing if it already exists
        }).catch(function (err) {
            console.error('[RollupScheduler] Failed to enqueue rollup job:', err);
        });
    }, INTERVAL);
    console.log("[RollupScheduler] Started \u2014 enqueueing 5m rollup jobs every ".concat(INTERVAL / 1000, "s"));
}
