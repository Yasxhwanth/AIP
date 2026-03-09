"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Orchestrator = void 0;
var data_integration_1 = require("./data-integration");
var rollup_engine_1 = require("./rollup-engine");
var relationship_derivation_service_1 = require("./relationship-derivation-service");
var os_1 = require("os");
/**
 * Enterprise Job Queue & Orchestrator
 * Uses PostgreSQL as a reliable, DLQ-supported, distributed queue via Prisma.
 */
var HOSTNAME = os_1.default.hostname();
var PID = process.pid;
var Orchestrator = /** @class */ (function () {
    function Orchestrator(prisma) {
        this.workerId = null;
        this.isRunning = false;
        // Timeouts
        this.HEARTBEAT_INTERVAL = 30000; // 30s
        this.POLL_INTERVAL = 5000; // 5s
        this.prisma = prisma;
    }
    /**
     * Start the worker node, register it in the DB, and begin polling for jobs
     */
    Orchestrator.prototype.startWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            var worker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isRunning)
                            return [2 /*return*/];
                        this.isRunning = true;
                        return [4 /*yield*/, this.prisma.jobWorker.create({
                                data: {
                                    hostname: HOSTNAME,
                                    pid: PID,
                                    status: 'ACTIVE',
                                }
                            })];
                    case 1:
                        worker = _a.sent();
                        this.workerId = worker.id;
                        console.log("[Orchestrator] Worker started: ".concat(this.workerId, " (").concat(HOSTNAME, ":").concat(PID, ")"));
                        this.startHeartbeat();
                        this.pollForJobs();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the worker gracefully (drain)
     */
    Orchestrator.prototype.stopWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isRunning = false;
                        if (!this.workerId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.jobWorker.update({
                                where: { id: this.workerId },
                                data: { status: 'OFFLINE' }
                            })];
                    case 1:
                        _a.sent();
                        console.log("[Orchestrator] Worker ".concat(this.workerId, " stopped gracefully."));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Orchestrator.prototype.startHeartbeat = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning || !this.workerId)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.prisma.jobWorker.update({
                                where: { id: this.workerId },
                                data: { lastHeartbeat: new Date() }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error('[Orchestrator] Heartbeat failed:', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, this.HEARTBEAT_INTERVAL);
    };
    /**
     * Enqueue a new job
     */
    Orchestrator.prototype.enqueue = function (jobType, payload, options) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, job;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(options === null || options === void 0 ? void 0 : options.idempotencyKey)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.jobQueue.findUnique({
                                where: { idempotencyKey: options.idempotencyKey }
                            })];
                    case 1:
                        existing = _b.sent();
                        if (existing) {
                            console.log("[Orchestrator] Job ignored: idempotency key '".concat(options.idempotencyKey, "' already exists."));
                            return [2 /*return*/, existing];
                        }
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.prisma.jobQueue.create({
                            data: __assign(__assign(__assign({ jobType: jobType, payload: payload, priority: (_a = options === null || options === void 0 ? void 0 : options.priority) !== null && _a !== void 0 ? _a : 0 }, ((options === null || options === void 0 ? void 0 : options.idempotencyKey) ? { idempotencyKey: options.idempotencyKey } : {})), ((options === null || options === void 0 ? void 0 : options.integrationJobId) ? { integrationJobId: options.integrationJobId } : {})), ((options === null || options === void 0 ? void 0 : options.parentJobId) ? { parentJobId: options.parentJobId } : {}))
                        })];
                    case 3:
                        job = _b.sent();
                        console.log("[Orchestrator] Enqueued ".concat(jobType, " job: ").concat(job.id));
                        return [2 /*return*/, job];
                }
            });
        });
    };
    /**
     * The core polling loop.
     */
    Orchestrator.prototype.pollForJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, candidate, lockedJob, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning) return [3 /*break*/, 9];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        now = new Date();
                        return [4 /*yield*/, this.prisma.jobQueue.findFirst({
                                where: {
                                    status: 'QUEUED',
                                    OR: [
                                        { nextAttemptAt: null },
                                        { nextAttemptAt: { lte: now } }
                                    ],
                                    AND: [
                                        {
                                            OR: [
                                                { parentJobId: null },
                                                { parentJob: { status: 'COMPLETED' } }
                                            ]
                                        }
                                    ]
                                },
                                orderBy: [
                                    { priority: 'desc' },
                                    { createdAt: 'asc' }
                                ]
                            })];
                    case 2:
                        candidate = _a.sent();
                        if (!(candidate && this.workerId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.jobQueue.updateMany({
                                where: {
                                    id: candidate.id,
                                    status: 'QUEUED', // Ensure nobody else took it
                                },
                                data: {
                                    status: 'RUNNING',
                                    lockedAt: new Date(),
                                    startedAt: new Date(),
                                    lockedByWorkerId: this.workerId,
                                    attempts: { increment: 1 }
                                }
                            })];
                    case 3:
                        lockedJob = _a.sent();
                        if (!(lockedJob.count > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.processJob(candidate)];
                    case 4:
                        _a.sent();
                        // Loop immediately to grab more jobs without waiting for interval
                        return [3 /*break*/, 0];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('[Orchestrator] Polling error:', error_1);
                        return [3 /*break*/, 7];
                    case 7: 
                    // Sleep if no jobs
                    return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, _this.POLL_INTERVAL); })];
                    case 8:
                        // Sleep if no jobs
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Route and process the selected job
     */
    Orchestrator.prototype.processJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, success, errorMessage, result, payload, result, count, error_2, duration, nextAttempt, isDead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Orchestrator] Processing job ".concat(job.id, " (").concat(job.jobType, ") attempt ").concat(job.attempts + 1, "/").concat(job.maxAttempts));
                        startTime = Date.now();
                        success = false;
                        errorMessage = '';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        if (!(job.jobType === 'INTEGRATION_SYNC')) return [3 /*break*/, 4];
                        if (!job.integrationJobId)
                            throw new Error("Missing integrationJobId payload");
                        return [4 /*yield*/, (0, data_integration_1.executeJob)(job.integrationJobId, this.prisma, job.id)];
                    case 2:
                        result = _a.sent();
                        if (result.status === 'FAILED') {
                            throw new Error(result.error || "Integration sync failed");
                        }
                        // Update specific metrics
                        return [4 /*yield*/, this.prisma.jobQueue.update({
                                where: { id: job.id },
                                data: {
                                    recordsProcessed: result.recordsProcessed,
                                    recordsFailed: result.recordsFailed,
                                }
                            })];
                    case 3:
                        // Update specific metrics
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 4:
                        if (!(job.jobType === 'TELEMETRY_ROLLUP_TRIGGER')) return [3 /*break*/, 6];
                        payload = job.payload;
                        if (!payload || !payload.windowSize || !payload.lookbackMs) {
                            throw new Error("Missing windowSize or lookbackMs in TELEMETRY_ROLLUP_TRIGGER payload");
                        }
                        return [4 /*yield*/, (0, rollup_engine_1.computeAllRecentRollups)(payload.windowSize, payload.lookbackMs, this.prisma)];
                    case 5:
                        result = _a.sent();
                        console.log("[Orchestrator] TELEMETRY_ROLLUP_TRIGGER completed. Yielded ".concat(result.totalBuckets, " buckets across ").concat(result.combinationsProcessed, " metric combos."));
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(job.jobType === 'RELATIONSHIP_DECAY')) return [3 /*break*/, 8];
                        return [4 /*yield*/, relationship_derivation_service_1.RelationshipDerivationService.applyConfidenceDecay(this.prisma)];
                    case 7:
                        count = _a.sent();
                        console.log("[Orchestrator] RELATIONSHIP_DECAY completed. Decayed ".concat(count, " probabilistic edges."));
                        return [3 /*break*/, 9];
                    case 8:
                        if (job.jobType === 'SYSTEM_PING') {
                            console.log("[Orchestrator] Processed system ping.");
                        }
                        else {
                            throw new Error("Unknown jobType: ".concat(job.jobType));
                        }
                        _a.label = 9;
                    case 9:
                        success = true;
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _a.sent();
                        success = false;
                        errorMessage = error_2.message || String(error_2);
                        console.error("[Orchestrator] Job ".concat(job.id, " failed:"), errorMessage);
                        return [3 /*break*/, 11];
                    case 11:
                        duration = Date.now() - startTime;
                        if (!success) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.prisma.jobQueue.update({
                                where: { id: job.id },
                                data: {
                                    status: 'COMPLETED',
                                    completedAt: new Date(),
                                    lockedAt: null,
                                    lockedByWorkerId: null,
                                }
                            })];
                    case 12:
                        _a.sent();
                        console.log("[Orchestrator] Job ".concat(job.id, " completed in ").concat(duration, "ms"));
                        return [3 /*break*/, 15];
                    case 13:
                        nextAttempt = job.attempts + 1;
                        isDead = nextAttempt >= job.maxAttempts;
                        return [4 /*yield*/, this.prisma.jobQueue.update({
                                where: { id: job.id },
                                data: {
                                    status: isDead ? 'DEAD_LETTER' : 'QUEUED',
                                    lastError: errorMessage,
                                    lockedAt: null,
                                    lockedByWorkerId: null,
                                    // Exponential backoff
                                    nextAttemptAt: isDead ? null : new Date(Date.now() + (Math.pow(2, nextAttempt) * 1000)),
                                }
                            })];
                    case 14:
                        _a.sent();
                        if (isDead) {
                            console.log("[Orchestrator] Job ".concat(job.id, " moved to DEAD_LETTER queue."));
                        }
                        _a.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    return Orchestrator;
}());
exports.Orchestrator = Orchestrator;
