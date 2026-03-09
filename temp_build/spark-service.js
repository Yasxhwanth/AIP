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
exports.SparkService = void 0;
var SparkService = /** @class */ (function () {
    function SparkService(prisma) {
        this.prisma = prisma;
    }
    /**
     * Executes a Spark job DAG, managing the progress of individual stages natively (Promises).
     */
    SparkService.prototype.executeJob = function (jobId_1, trigger_1) {
        return __awaiter(this, arguments, void 0, function (jobId, trigger, inputData, broadcastFn) {
            var job, stages, run, _i, stages_1, stg;
            if (inputData === void 0) { inputData = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.sparkJob.findUnique({ where: { id: jobId } })];
                    case 1:
                        job = _a.sent();
                        if (!job)
                            throw new Error("Spark Job not found");
                        stages = job.stages || [];
                        return [4 /*yield*/, this.prisma.sparkJobRun.create({
                                data: {
                                    jobId: jobId,
                                    status: "running",
                                    trigger: trigger,
                                    inputData: inputData || {}
                                }
                            })];
                    case 2:
                        run = _a.sent();
                        _i = 0, stages_1 = stages;
                        _a.label = 3;
                    case 3:
                        if (!(_i < stages_1.length)) return [3 /*break*/, 6];
                        stg = stages_1[_i];
                        return [4 /*yield*/, this.prisma.sparkJobStage.create({
                                data: {
                                    runId: run.id,
                                    stageId: stg.id,
                                    stageType: stg.type,
                                    status: "pending",
                                    partitions: Math.max(1, Math.floor(Math.random() * 8) + 1) // Simulate 1-8 partitions
                                }
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (broadcastFn)
                            broadcastFn("spark:job:".concat(jobId), { type: "job.started", runId: run.id });
                        // Run the DAG async
                        this.processDag(job, run, stages, broadcastFn).catch(function (err) { return console.error("DAG Error", err); });
                        return [2 /*return*/, run];
                }
            });
        });
    };
    SparkService.prototype.processDag = function (job, run, stages, broadcastFn) {
        return __awaiter(this, void 0, void 0, function () {
            var totalRecordsProcessed, jobFailed, stageModels, stageMap, _loop_1, this_1, _i, stages_2, stg, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        totalRecordsProcessed = 0;
                        jobFailed = false;
                        return [4 /*yield*/, this.prisma.sparkJobStage.findMany({ where: { runId: run.id } })];
                    case 1:
                        stageModels = _a.sent();
                        stageMap = new Map(stageModels.map(function (s) { return [s.stageId, s]; }));
                        _loop_1 = function (stg) {
                            var s, dbStage, startMs, duration, recordsIn, recordsOut;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!jobFailed) return [3 /*break*/, 3];
                                        s = stageMap.get(stg.id);
                                        if (!s) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this_1.prisma.sparkJobStage.update({ where: { id: s.id }, data: { status: "skipped" } })];
                                    case 1:
                                        _b.sent();
                                        _b.label = 2;
                                    case 2: return [2 /*return*/, "continue"];
                                    case 3:
                                        dbStage = stageMap.get(stg.id);
                                        if (!dbStage)
                                            return [2 /*return*/, "continue"];
                                        // Mark running
                                        return [4 /*yield*/, this_1.prisma.sparkJobStage.update({ where: { id: dbStage.id }, data: { status: "running", startedAt: new Date() } })];
                                    case 4:
                                        // Mark running
                                        _b.sent();
                                        if (broadcastFn)
                                            broadcastFn("spark:job:".concat(job.id), { type: "stage.started", runId: run.id, stageId: dbStage.stageId });
                                        startMs = Date.now();
                                        duration = 500;
                                        switch (stg.type) {
                                            case "source":
                                                duration = 1200;
                                                break;
                                            case "filter":
                                                duration = 800;
                                                break;
                                            case "join":
                                                duration = 2500;
                                                break;
                                            case "aggregate":
                                                duration = 1800;
                                                break;
                                        }
                                        duration = duration + (Math.random() * 500); // Jitter
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, duration); })];
                                    case 5:
                                        _b.sent();
                                        if (!(Math.random() < 0.02)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, this_1.prisma.sparkJobStage.update({
                                                where: { id: dbStage.id },
                                                data: { status: "failed", errorMessage: "Executor lost heartbeat", finishedAt: new Date(), durationMs: Date.now() - startMs }
                                            })];
                                    case 6:
                                        _b.sent();
                                        jobFailed = true;
                                        if (broadcastFn)
                                            broadcastFn("spark:job:".concat(job.id), { type: "stage.failed", runId: run.id, stageId: dbStage.stageId });
                                        return [2 /*return*/, "break"];
                                    case 7:
                                        recordsIn = Math.floor(Math.random() * 100000) + 5000;
                                        recordsOut = recordsIn;
                                        if (stg.type === "filter")
                                            recordsOut = Math.floor(recordsIn * (Math.random() * 0.5 + 0.1));
                                        if (stg.type === "aggregate")
                                            recordsOut = Math.floor(recordsIn * 0.05);
                                        totalRecordsProcessed += recordsIn;
                                        return [4 /*yield*/, this_1.prisma.sparkJobStage.update({
                                                where: { id: dbStage.id },
                                                data: { status: "success", recordsIn: recordsIn, recordsOut: recordsOut, finishedAt: new Date(), durationMs: Date.now() - startMs }
                                            })];
                                    case 8:
                                        _b.sent();
                                        if (broadcastFn)
                                            broadcastFn("spark:job:".concat(job.id), { type: "stage.success", runId: run.id, stageId: dbStage.stageId });
                                        _b.label = 9;
                                    case 9: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, stages_2 = stages;
                        _a.label = 2;
                    case 2:
                        if (!(_i < stages_2.length)) return [3 /*break*/, 5];
                        stg = stages_2[_i];
                        return [5 /*yield**/, _loop_1(stg)];
                    case 3:
                        state_1 = _a.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 5];
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Job completion
                    return [4 /*yield*/, this.prisma.sparkJobRun.update({
                            where: { id: run.id },
                            data: {
                                status: jobFailed ? "failed" : "success",
                                finishedAt: new Date(),
                                durationMs: Date.now() - run.startedAt.getTime(),
                                summary: {
                                    totalRecords: totalRecordsProcessed,
                                    stages: stages.length
                                },
                                error: jobFailed ? "DAG execution failed due to stage failure." : null
                            }
                        })];
                    case 6:
                        // Job completion
                        _a.sent();
                        if (broadcastFn)
                            broadcastFn("spark:job:".concat(job.id), { type: jobFailed ? "job.failed" : "job.success", runId: run.id });
                        return [2 /*return*/];
                }
            });
        });
    };
    return SparkService;
}());
exports.SparkService = SparkService;
