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
exports.upsertEntityInstance = upsertEntityInstance;
exports.executeJob = executeJob;
exports.dryRunJob = dryRunJob;
exports.startScheduler = startScheduler;
var policy_engine_1 = require("./policy-engine");
var identity_service_1 = require("./identity-service");
var provenance_service_1 = require("./provenance-service");
var ontology_reasoner_1 = require("./ontology-reasoner");
var connectors = {
    /**
     * REST_API — Fetch records from an HTTP endpoint.
     * connectionConfig: { url, headers?, method?, responsePath? }
     */
    REST_API: function (config) { return __awaiter(void 0, void 0, void 0, function () {
        var resp, data, _i, _a, key;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!config.url)
                        throw new Error('REST_API connector requires a url in connectionConfig');
                    return [4 /*yield*/, fetch(config.url, {
                            method: (_b = config.method) !== null && _b !== void 0 ? _b : 'GET',
                            headers: __assign({ 'Content-Type': 'application/json' }, ((_c = config.headers) !== null && _c !== void 0 ? _c : {})),
                            body: config.method === 'POST' && config.body ? JSON.stringify(config.body) : null,
                        })];
                case 1:
                    resp = _d.sent();
                    if (!resp.ok) {
                        throw new Error("REST_API fetch failed: ".concat(resp.status, " ").concat(resp.statusText));
                    }
                    return [4 /*yield*/, resp.json()];
                case 2:
                    data = _d.sent();
                    // Drill into the response if a responsePath is specified
                    if (config.responsePath) {
                        for (_i = 0, _a = config.responsePath.split('.'); _i < _a.length; _i++) {
                            key = _a[_i];
                            data = data === null || data === void 0 ? void 0 : data[key];
                        }
                    }
                    if (!Array.isArray(data)) {
                        throw new Error('REST_API connector: response is not an array (use responsePath to drill in)');
                    }
                    return [2 /*return*/, data];
            }
        });
    }); },
    /**
     * JSON_UPLOAD — Accept raw records passed inline in the request body.
     */
    JSON_UPLOAD: function (_config, inlineData) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!inlineData || !Array.isArray(inlineData)) {
                throw new Error('JSON_UPLOAD connector: inline data[] is required');
            }
            return [2 /*return*/, inlineData];
        });
    }); },
    /**
     * CSV_UPLOAD — Accept CSV text passed inline, parse into records.
     */
    CSV_UPLOAD: function (_config, inlineData) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!inlineData || !Array.isArray(inlineData)) {
                throw new Error('CSV_UPLOAD connector: inline data[] is required (pre-parsed rows)');
            }
            return [2 /*return*/, inlineData];
        });
    }); },
};
// ── Transform Engine ─────────────────────────────────────────────
/**
 * Maps raw external records to ontology-shaped payloads using fieldMapping.
 *
 * fieldMapping = { "temp": "temperature", "loc": "location" }
 *   → input  { temp: 72.5, loc: "Building A", sensorId: "s1" }
 *   → output { temperature: 72.5, location: "Building A" }
 *
 * Fields not in the mapping are dropped (except logicalIdField which is extracted separately).
 */
function transformRecord(record, fieldMapping) {
    var mapped = {};
    for (var _i = 0, _a = Object.entries(fieldMapping); _i < _a.length; _i++) {
        var _b = _a[_i], externalField = _b[0], ontologyAttribute = _b[1];
        if (externalField in record) {
            mapped[ontologyAttribute] = record[externalField];
        }
    }
    return mapped;
}
// ── Entity Upsert (reusable ingest path) ─────────────────────────
/**
 * Upserts a single entity instance using the same bi-temporal logic
 * as the POST /entity-types/:id/instances endpoint.
 *
 * Returns { success: true } on success, { success: false, error } on failure.
 */
function upsertEntityInstance(entityType, logicalId, attrData, prisma, options) {
    return __awaiter(this, void 0, void 0, function () {
        var now, _a, eventId, previousState, instanceId, error_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = new Date();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var current, newInstance, idempotencyKey, domainEvent;
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0: return [4 /*yield*/, tx.entityInstance.findFirst({
                                            where: {
                                                entityTypeId: entityType.id,
                                                logicalId: logicalId,
                                                validTo: null,
                                            },
                                        })];
                                    case 1:
                                        current = _e.sent();
                                        if (!current) return [3 /*break*/, 3];
                                        return [4 /*yield*/, tx.entityInstance.update({
                                                where: { id: current.id },
                                                data: { validTo: now },
                                            })];
                                    case 2:
                                        _e.sent();
                                        _e.label = 3;
                                    case 3: return [4 /*yield*/, tx.entityInstance.create({
                                            data: {
                                                logicalId: logicalId,
                                                entityTypeId: entityType.id,
                                                entityVersion: entityType.version,
                                                data: attrData,
                                                validFrom: now,
                                                validTo: null,
                                                confidenceScore: (_a = options === null || options === void 0 ? void 0 : options.confidence) !== null && _a !== void 0 ? _a : 1.0,
                                                reviewStatus: ((_b = options === null || options === void 0 ? void 0 : options.confidence) !== null && _b !== void 0 ? _b : 1.0) < 0.7 ? 'PENDING' : 'APPROVED' // Low confidence requires review
                                            },
                                        })];
                                    case 4:
                                        newInstance = _e.sent();
                                        if (!((options === null || options === void 0 ? void 0 : options.sourceSystem) && (options === null || options === void 0 ? void 0 : options.sourceRecordId))) return [3 /*break*/, 6];
                                        return [4 /*yield*/, provenance_service_1.ProvenanceService.recordLineage(newInstance.id, options.sourceSystem, options.sourceRecordId, now, // source timestamp (approximated here as now)
                                            null, // Entire record provenance for now
                                            tx)];
                                    case 5:
                                        _e.sent();
                                        _e.label = 6;
                                    case 6:
                                        idempotencyKey = "EntityStateChanged:".concat(logicalId, ":").concat(now.toISOString());
                                        return [4 /*yield*/, tx.domainEvent.create({
                                                data: {
                                                    idempotencyKey: idempotencyKey,
                                                    eventType: 'EntityStateChanged',
                                                    entityTypeId: entityType.id,
                                                    logicalId: logicalId,
                                                    entityVersion: entityType.version,
                                                    payload: {
                                                        previousState: (_c = current === null || current === void 0 ? void 0 : current.data) !== null && _c !== void 0 ? _c : null,
                                                        newState: attrData,
                                                        validFrom: now.toISOString(),
                                                    },
                                                },
                                            })];
                                    case 7:
                                        domainEvent = _e.sent();
                                        // CQRS: Upsert read model projection
                                        return [4 /*yield*/, tx.currentEntityState.upsert({
                                                where: { logicalId: logicalId },
                                                create: {
                                                    logicalId: logicalId,
                                                    entityTypeId: entityType.id,
                                                    data: attrData,
                                                    updatedAt: now,
                                                },
                                                update: {
                                                    data: attrData,
                                                    updatedAt: now,
                                                },
                                            })];
                                    case 8:
                                        // CQRS: Upsert read model projection
                                        _e.sent();
                                        return [2 /*return*/, {
                                                eventId: domainEvent.id,
                                                previousState: (_d = current === null || current === void 0 ? void 0 : current.data) !== null && _d !== void 0 ? _d : null,
                                                instanceId: newInstance.id
                                            }];
                                }
                            });
                        }); })];
                case 2:
                    _a = _b.sent(), eventId = _a.eventId, previousState = _a.previousState, instanceId = _a.instanceId;
                    // Fire-and-forget: evaluate policies
                    (0, policy_engine_1.evaluatePolicies)({
                        eventId: eventId,
                        eventType: 'EntityStateChanged',
                        entityTypeId: entityType.id,
                        logicalId: logicalId,
                        entityVersion: entityType.version,
                        payload: {
                            previousState: previousState,
                            newState: attrData,
                            validFrom: now.toISOString(),
                        },
                    }, prisma);
                    // Fire-and-forget: trigger semantic reasoner to derive ontology properties natively 
                    (0, ontology_reasoner_1.runReasonerForEntity)(logicalId, entityType.projectId, prisma).catch(function (err) {
                        console.error("[Semantic Reasoner Error] Failed to reason for entity ".concat(logicalId, ":"), err);
                    });
                    return [2 /*return*/, { success: true, instanceId: instanceId }];
                case 3:
                    error_1 = _b.sent();
                    return [2 /*return*/, { success: false, error: String(error_1) }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ── Job Execution Engine ─────────────────────────────────────────
/**
 * Executes a single integration job:
 * 1. Creates a JobExecution record (PENDING → RUNNING)
 * 2. Calls the appropriate connector to fetch records
 * 3. Transforms each record using fieldMapping
 * 4. Upserts each record as an entity instance
 * 5. Updates the JobExecution with results
 */
function executeJob(jobId, prisma, queueId, inlineData) {
    return __awaiter(this, void 0, void 0, function () {
        var job, recordsProcessed, recordsFailed, connectorFn, connectionConfig, rawRecords, fieldMapping, entityType, _i, rawRecords_1, raw, externalId, logicalId, confidence, resolved, mapped, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.integrationJob.findUnique({
                        where: { id: jobId },
                        include: {
                            dataSource: true,
                            targetEntityType: { include: { attributes: true } },
                        },
                    })];
                case 1:
                    job = _a.sent();
                    if (!job)
                        throw new Error("Integration job '".concat(jobId, "' not found"));
                    if (!job.enabled)
                        throw new Error("Integration job '".concat(job.name, "' is disabled"));
                    if (!job.dataSource.enabled)
                        throw new Error("Data source '".concat(job.dataSource.name, "' is disabled"));
                    recordsProcessed = 0;
                    recordsFailed = 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 12, , 13]);
                    connectorFn = connectors[job.dataSource.type];
                    if (!connectorFn) {
                        throw new Error("Unsupported data source type: '".concat(job.dataSource.type, "'"));
                    }
                    connectionConfig = job.dataSource.connectionConfig;
                    return [4 /*yield*/, connectorFn(connectionConfig, inlineData)];
                case 3:
                    rawRecords = _a.sent();
                    fieldMapping = job.fieldMapping;
                    entityType = {
                        id: job.targetEntityType.id,
                        version: job.targetEntityType.version,
                        name: job.targetEntityType.name,
                        projectId: job.targetEntityType.projectId,
                    };
                    _i = 0, rawRecords_1 = rawRecords;
                    _a.label = 4;
                case 4:
                    if (!(_i < rawRecords_1.length)) return [3 /*break*/, 11];
                    raw = rawRecords_1[_i];
                    externalId = raw[job.logicalIdField];
                    if (!externalId || typeof externalId !== 'string') {
                        recordsFailed++;
                        // eslint-disable-next-line no-console
                        console.warn("[DataIntegration] Skipping record: missing or invalid logicalIdField '".concat(job.logicalIdField, "'"), raw);
                        return [3 /*break*/, 10];
                    }
                    logicalId = externalId;
                    confidence = 1.0;
                    return [4 /*yield*/, identity_service_1.IdentityService.resolveLogicalId(job.dataSource.name, externalId, prisma)];
                case 5:
                    resolved = _a.sent();
                    if (!resolved) return [3 /*break*/, 6];
                    logicalId = resolved.logicalId;
                    confidence = resolved.confidence;
                    return [3 /*break*/, 8];
                case 6: 
                // If not resolved, use the externalId as the logicalId for now and register an alias
                return [4 /*yield*/, identity_service_1.IdentityService.registerAlias(job.dataSource.name, externalId, externalId, 1.0, prisma)];
                case 7:
                    // If not resolved, use the externalId as the logicalId for now and register an alias
                    _a.sent();
                    _a.label = 8;
                case 8:
                    mapped = transformRecord(raw, fieldMapping);
                    return [4 /*yield*/, upsertEntityInstance(entityType, logicalId, mapped, prisma, {
                            sourceSystem: job.dataSource.name,
                            sourceRecordId: externalId, // Using externalId as sourceRecordId for simplicity
                            confidence: confidence
                        })];
                case 9:
                    result = _a.sent();
                    if (result.success) {
                        recordsProcessed++;
                    }
                    else {
                        recordsFailed++;
                        // eslint-disable-next-line no-console
                        console.warn("[DataIntegration] Failed to ingest record ".concat(logicalId, ":"), result.error);
                    }
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11: 
                // Orchestrator handles marking completion on the JobQueue object.
                return [2 /*return*/, {
                        status: 'COMPLETED',
                        recordsProcessed: recordsProcessed,
                        recordsFailed: recordsFailed,
                    }];
                case 12:
                    error_2 = _a.sent();
                    // Orchestrator will handle the failure update to JobQueue
                    return [2 /*return*/, {
                            status: 'FAILED',
                            recordsProcessed: recordsProcessed,
                            recordsFailed: recordsFailed,
                            error: String(error_2),
                        }];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Dry-Run an integration job:
 * Fetches data from the exact connector but halts before writing any instances to the DB.
 * Returns a subset of raw vs mapped records for user preview.
 */
function dryRunJob(jobId, prisma, inlineData) {
    return __awaiter(this, void 0, void 0, function () {
        var job, connectorFn, connectionConfig, rawRecords, fieldMapping_1, previewLimit, previewRecords, output, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.integrationJob.findUnique({
                        where: { id: jobId },
                        include: {
                            dataSource: true,
                            targetEntityType: { include: { attributes: true } },
                        },
                    })];
                case 1:
                    job = _a.sent();
                    if (!job)
                        throw new Error("Integration job '".concat(jobId, "' not found"));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    connectorFn = connectors[job.dataSource.type];
                    if (!connectorFn) {
                        throw new Error("Unsupported data source type: '".concat(job.dataSource.type, "'"));
                    }
                    connectionConfig = job.dataSource.connectionConfig;
                    return [4 /*yield*/, connectorFn(connectionConfig, inlineData)];
                case 3:
                    rawRecords = _a.sent();
                    fieldMapping_1 = job.fieldMapping;
                    previewLimit = 5;
                    previewRecords = rawRecords.slice(0, previewLimit);
                    output = previewRecords.map(function (raw) {
                        var externalId = raw[job.logicalIdField];
                        var mapped = transformRecord(raw, fieldMapping_1);
                        return {
                            raw: raw,
                            mapped: mapped,
                            externalId: externalId !== null && externalId !== void 0 ? externalId : null
                        };
                    });
                    return [2 /*return*/, {
                            status: 'SUCCESS',
                            records: output
                        }];
                case 4:
                    error_3 = _a.sent();
                    return [2 /*return*/, {
                            status: 'FAILED',
                            records: [],
                            error: String(error_3),
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ── Simple Scheduler (Upgraded to enqueue jobs instead of run) ────
/**
 * A lightweight interval-based scheduler.
 * Checks every 60 seconds for jobs with a `schedule` field.
 * Supports simple interval patterns: "every:Xs", "every:Xm", "every:Xh"
 * (e.g., "every:30s", "every:5m", "every:1h")
 */
var lastRunMap = new Map(); // jobId → last run timestamp (ms)
function parseScheduleMs(schedule) {
    var match = schedule.match(/^every:(\d+)(s|m|h)$/);
    if (!match)
        return null;
    var value = parseInt(match[1], 10);
    var unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return null;
    }
}
function startScheduler(prisma) {
    var _this = this;
    var TICK_INTERVAL = 60000; // check every 60 seconds
    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        var jobs, now, _i, jobs_1, job, intervalMs, lastRun, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prisma.integrationJob.findMany({
                            where: {
                                enabled: true,
                                schedule: { not: null },
                                dataSource: { enabled: true },
                            },
                            include: { dataSource: true },
                        })];
                case 1:
                    jobs = _b.sent();
                    now = Date.now();
                    for (_i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
                        job = jobs_1[_i];
                        if (!job.schedule)
                            continue;
                        intervalMs = parseScheduleMs(job.schedule);
                        if (!intervalMs) {
                            // eslint-disable-next-line no-console
                            console.warn("[Scheduler] Invalid schedule format for job '".concat(job.name, "': ").concat(job.schedule));
                            continue;
                        }
                        lastRun = (_a = lastRunMap.get(job.id)) !== null && _a !== void 0 ? _a : 0;
                        if (now - lastRun >= intervalMs) {
                            lastRunMap.set(job.id, now);
                            // eslint-disable-next-line no-console
                            console.log("[Scheduler] Running scheduled job '".concat(job.name, "'"));
                            // Push a new job onto the Orchestrator Queue
                            prisma.jobQueue.create({
                                data: {
                                    jobType: 'INTEGRATION_SYNC',
                                    integrationJobId: job.id,
                                    payload: { autoScheduled: true },
                                    priority: 5, // normal priority for scheduled runs
                                }
                            }).catch(function (err) {
                                console.error("[Scheduler] Job enqueue failed:", err);
                            });
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    // eslint-disable-next-line no-console
                    console.error('[Scheduler] Tick error:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, TICK_INTERVAL);
    // eslint-disable-next-line no-console
    console.log("[Scheduler] Started \u2014 checking every ".concat(TICK_INTERVAL / 1000, "s for scheduled jobs"));
}
