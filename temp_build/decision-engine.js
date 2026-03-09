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
exports.executeDecision = executeDecision;
exports.evaluateAllRules = evaluateAllRules;
exports.simulateDecision = simulateDecision;
var inference_engine_1 = require("./inference-engine");
var data_integration_1 = require("./data-integration");
/**
 * Evaluate a single condition against entity/trigger data.
 */
function evaluateCondition(data, condition) {
    var actual = data[condition.field];
    var passed = false;
    switch (condition.operator) {
        case '>':
            passed = Number(actual) > Number(condition.value);
            break;
        case '<':
            passed = Number(actual) < Number(condition.value);
            break;
        case '>=':
            passed = Number(actual) >= Number(condition.value);
            break;
        case '<=':
            passed = Number(actual) <= Number(condition.value);
            break;
        case '==':
            passed = actual == condition.value;
            break;
        case '!=':
            passed = actual != condition.value;
            break;
        case 'contains':
            passed = typeof actual === 'string' && actual.includes(String(condition.value));
            break;
        case 'exists':
            passed = actual !== undefined && actual !== null;
            break;
    }
    return {
        field: condition.field,
        operator: condition.operator,
        expected: condition.value,
        actual: actual,
        passed: passed,
    };
}
/**
 * Evaluate all conditions for a rule using AND/OR logic.
 */
function evaluateConditions(data, conditions, logicOperator) {
    var results = conditions.map(function (c) { return evaluateCondition(data, c); });
    var allPassed = logicOperator === 'OR'
        ? results.some(function (r) { return r.passed; })
        : results.every(function (r) { return r.passed; });
    return { allPassed: allPassed, results: results };
}
var actionExecutors = {
    /**
     * WEBHOOK — POST to external URL.
     */
    WEBHOOK: function (config, context) { return __awaiter(void 0, void 0, void 0, function () {
        var url, resp, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = config.url;
                    if (!url)
                        return [2 /*return*/, { success: false, error: 'WEBHOOK config missing "url"' }];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: __assign({ 'Content-Type': 'application/json' }, ((_a = config.headers) !== null && _a !== void 0 ? _a : {})),
                            body: JSON.stringify({
                                logicalId: context.logicalId,
                                triggerData: context.triggerData,
                                timestamp: new Date().toISOString(),
                            }),
                        })];
                case 2:
                    resp = _b.sent();
                    return [2 /*return*/, {
                            success: resp.ok,
                            result: { status: resp.status, statusText: resp.statusText },
                            error: resp.ok ? undefined : "HTTP ".concat(resp.status),
                        }];
                case 3:
                    err_1 = _b.sent();
                    return [2 /*return*/, { success: false, error: String(err_1) }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    /**
     * UPDATE_ENTITY — Modify entity attributes.
     */
    UPDATE_ENTITY: function (config, context) { return __awaiter(void 0, void 0, void 0, function () {
        var fields, current, entityType, currentData, updatedData, result, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fields = config.fields;
                    if (!fields)
                        return [2 /*return*/, { success: false, error: 'UPDATE_ENTITY config missing "fields"' }];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, context.prisma.currentEntityState.findUnique({
                            where: { logicalId: context.logicalId },
                        })];
                case 2:
                    current = _b.sent();
                    if (!current) {
                        return [2 /*return*/, { success: false, error: "Entity \"".concat(context.logicalId, "\" not found") }];
                    }
                    return [4 /*yield*/, context.prisma.entityType.findUnique({
                            where: { id: current.entityTypeId },
                        })];
                case 3:
                    entityType = _b.sent();
                    if (!entityType)
                        return [2 /*return*/, { success: false, error: 'Entity type not found' }];
                    currentData = current.data;
                    updatedData = __assign(__assign({}, currentData), fields);
                    return [4 /*yield*/, (0, data_integration_1.upsertEntityInstance)({ id: entityType.id, projectId: entityType.projectId, version: entityType.version, name: entityType.name }, context.logicalId, updatedData, context.prisma)];
                case 4:
                    result = _b.sent();
                    return [2 /*return*/, { success: result.success, result: { updatedFields: fields }, error: (_a = result.error) !== null && _a !== void 0 ? _a : undefined }];
                case 5:
                    err_2 = _b.sent();
                    return [2 /*return*/, { success: false, error: String(err_2) }];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    /**
     * CREATE_ALERT — Create a platform alert.
     */
    CREATE_ALERT: function (config, context) { return __awaiter(void 0, void 0, void 0, function () {
        var alert_1, err_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, context.prisma.alert.create({
                            data: {
                                alertType: (_a = config.alertType) !== null && _a !== void 0 ? _a : 'DECISION_ACTION',
                                severity: (_b = config.severity) !== null && _b !== void 0 ? _b : 'MEDIUM',
                                policyId: (_c = config.policyId) !== null && _c !== void 0 ? _c : 'decision-engine',
                                entityTypeId: (_d = config.entityTypeId) !== null && _d !== void 0 ? _d : 'unknown',
                                logicalId: context.logicalId,
                                payload: { source: 'decision-engine', triggerData: context.triggerData },
                                evaluationTrace: context.triggerData,
                                acknowledged: false,
                            },
                        })];
                case 1:
                    alert_1 = _e.sent();
                    return [2 /*return*/, { success: true, result: { alertId: alert_1.id, severity: alert_1.severity } }];
                case 2:
                    err_3 = _e.sent();
                    return [2 /*return*/, { success: false, error: String(err_3) }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    /**
     * RUN_INFERENCE — Trigger another model's inference.
     */
    RUN_INFERENCE: function (config, context) { return __awaiter(void 0, void 0, void 0, function () {
        var modelId, result, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modelId = config.modelDefinitionId;
                    if (!modelId)
                        return [2 /*return*/, { success: false, error: 'RUN_INFERENCE config missing "modelDefinitionId"' }];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, inference_engine_1.runInferenceByModel)(modelId, context.logicalId, context.prisma)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, { success: true, result: result }];
                case 3:
                    err_4 = _a.sent();
                    return [2 /*return*/, { success: false, error: String(err_4) }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    /**
     * LOG_ONLY — Just record, no side effects.
     */
    LOG_ONLY: function (config, context) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            return [2 /*return*/, {
                    success: true,
                    result: {
                        message: (_a = config.message) !== null && _a !== void 0 ? _a : 'Action logged',
                        logicalId: context.logicalId,
                        timestamp: new Date().toISOString(),
                    },
                }];
        });
    }); },
};
// ── Decision Engine Core ─────────────────────────────────────────
/**
 * Execute a decision for a specific rule against an entity.
 * Full pipeline: evaluate conditions → decide → execute actions → log.
 */
function executeDecision(ruleId_1, logicalId_1, triggerType_1, triggerData_1, prisma_1) {
    return __awaiter(this, arguments, void 0, function (ruleId, logicalId, triggerType, triggerData, prisma, simulate) {
        var rule, conditions, _a, allPassed, conditionResults, triggeredConfidence, decision, status, log, executionTraceId, trace, hasFailures, _i, _b, plan, step, executor, actionConfig, actionResult, dataToUpdate, resultToReturn;
        if (simulate === void 0) { simulate = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, prisma.decisionRule.findUnique({
                        where: { id: ruleId },
                        include: {
                            executionPlans: {
                                orderBy: { stepOrder: 'asc' },
                                include: { actionDefinition: true },
                            },
                        },
                    })];
                case 1:
                    rule = _c.sent();
                    if (!rule)
                        throw new Error("Decision rule \"".concat(ruleId, "\" not found"));
                    if (!rule.enabled)
                        throw new Error("Decision rule \"".concat(rule.name, "\" is disabled"));
                    conditions = rule.conditions;
                    _a = evaluateConditions(triggerData, conditions, rule.logicOperator), allPassed = _a.allPassed, conditionResults = _a.results;
                    triggeredConfidence = null;
                    if (typeof triggerData.confidence === 'number') {
                        triggeredConfidence = triggerData.confidence;
                    }
                    if (!allPassed) {
                        decision = 'SKIPPED';
                    }
                    else if (simulate) {
                        decision = 'SIMULATED';
                    }
                    else if (rule.confidenceThreshold !== null && triggeredConfidence !== null && triggeredConfidence < rule.confidenceThreshold) {
                        decision = 'PENDING_ESCALATION'; // Falls below confidence, human review needed
                    }
                    else if (!rule.autoExecute) {
                        decision = 'PENDING_APPROVAL'; // Requires human review
                    }
                    else {
                        decision = 'EXECUTE';
                    }
                    status = decision === 'SKIPPED' ? 'COMPLETED' : simulate ? 'SIMULATED' : (decision === 'PENDING_APPROVAL' || decision === 'PENDING_ESCALATION') ? 'PENDING' : 'RUNNING';
                    return [4 /*yield*/, prisma.decisionLog.create({
                            data: {
                                decisionRuleId: ruleId,
                                logicalId: logicalId,
                                triggerType: simulate ? 'SIMULATION' : triggerType,
                                triggerData: triggerData,
                                conditionResults: conditionResults,
                                decision: decision,
                                status: status,
                            },
                        })];
                case 2:
                    log = _c.sent();
                    if (!(decision === 'EXECUTE' || decision === 'SIMULATED')) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma.executionTrace.create({
                            data: { decisionLogId: log.id, status: 'RUNNING' }
                        })];
                case 3:
                    trace = _c.sent();
                    executionTraceId = trace.id;
                    hasFailures = false;
                    _i = 0, _b = rule.executionPlans;
                    _c.label = 4;
                case 4:
                    if (!(_i < _b.length)) return [3 /*break*/, 13];
                    plan = _b[_i];
                    return [4 /*yield*/, prisma.executionStep.create({
                            data: {
                                executionTraceId: trace.id,
                                actionDefinitionId: plan.actionDefinition.id,
                                stepOrder: plan.stepOrder,
                                status: 'RUNNING',
                                startedAt: new Date(),
                                inputPayload: { logicalId: logicalId, triggerData: triggerData, simulated: simulate }
                            }
                        })];
                case 5:
                    step = _c.sent();
                    if (!simulate) return [3 /*break*/, 7];
                    // Dry-run: list actions that would have been executed without side-effects
                    return [4 /*yield*/, prisma.executionStep.update({
                            where: { id: step.id },
                            data: { status: 'SUCCESS', completedAt: new Date(), outputPayload: { simulated: true, wouldExecute: plan.actionDefinition.type } }
                        })];
                case 6:
                    // Dry-run: list actions that would have been executed without side-effects
                    _c.sent();
                    return [3 /*break*/, 12];
                case 7:
                    executor = actionExecutors[plan.actionDefinition.type];
                    if (!!executor) return [3 /*break*/, 9];
                    hasFailures = true;
                    return [4 /*yield*/, prisma.executionStep.update({
                            where: { id: step.id },
                            data: { status: 'FAILED', completedAt: new Date(), errorMessage: "Unknown action type: ".concat(plan.actionDefinition.type) }
                        })];
                case 8:
                    _c.sent();
                    if (!plan.continueOnFailure)
                        return [3 /*break*/, 13];
                    return [3 /*break*/, 12];
                case 9:
                    actionConfig = plan.actionDefinition.config;
                    return [4 /*yield*/, executor(actionConfig, { logicalId: logicalId, triggerData: triggerData, prisma: prisma })];
                case 10:
                    actionResult = _c.sent();
                    dataToUpdate = {
                        status: actionResult.success ? 'SUCCESS' : 'FAILED',
                        completedAt: new Date(),
                    };
                    if (actionResult.result !== undefined) {
                        dataToUpdate.outputPayload = actionResult.result;
                    }
                    if (actionResult.error !== undefined) {
                        dataToUpdate.errorMessage = actionResult.error;
                    }
                    return [4 /*yield*/, prisma.executionStep.update({
                            where: { id: step.id },
                            data: dataToUpdate
                        })];
                case 11:
                    _c.sent();
                    if (!actionResult.success) {
                        hasFailures = true;
                        if (!plan.continueOnFailure)
                            return [3 /*break*/, 13];
                    }
                    _c.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13:
                    // Conclude Trace
                    status = simulate ? 'SIMULATED' : hasFailures ? 'PARTIAL_FAILURE' : 'COMPLETED';
                    return [4 /*yield*/, prisma.executionTrace.update({
                            where: { id: trace.id },
                            data: { status: status, completedAt: new Date() }
                        })];
                case 14:
                    _c.sent();
                    // Update Final Log
                    return [4 /*yield*/, prisma.decisionLog.update({
                            where: { id: log.id },
                            data: { status: status === 'PARTIAL_FAILURE' ? 'FAILED' : 'COMPLETED' }
                        })];
                case 15:
                    // Update Final Log
                    _c.sent();
                    _c.label = 16;
                case 16:
                    resultToReturn = {
                        decisionLogId: log.id,
                        decision: decision,
                        status: status,
                        conditionResults: conditionResults,
                    };
                    if (executionTraceId)
                        resultToReturn.executionTraceId = executionTraceId;
                    return [2 /*return*/, resultToReturn];
            }
        });
    });
}
/**
 * Evaluate ALL enabled rules for an entity. Runs rules in priority order.
 */
function evaluateAllRules(logicalId_1, triggerType_1, triggerData_1, prisma_1) {
    return __awaiter(this, arguments, void 0, function (logicalId, triggerType, triggerData, prisma, simulate) {
        var entityState, rules, results, rulesFired, _i, rules_1, rule, result;
        if (simulate === void 0) { simulate = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.currentEntityState.findUnique({
                        where: { logicalId: logicalId },
                    })];
                case 1:
                    entityState = _a.sent();
                    if (!entityState)
                        throw new Error("No current state for \"".concat(logicalId, "\""));
                    return [4 /*yield*/, prisma.decisionRule.findMany({
                            where: { entityTypeId: entityState.entityTypeId, enabled: true },
                            orderBy: { priority: 'asc' },
                        })];
                case 2:
                    rules = _a.sent();
                    results = [];
                    rulesFired = 0;
                    _i = 0, rules_1 = rules;
                    _a.label = 3;
                case 3:
                    if (!(_i < rules_1.length)) return [3 /*break*/, 6];
                    rule = rules_1[_i];
                    return [4 /*yield*/, executeDecision(rule.id, logicalId, triggerType, triggerData, prisma, simulate)];
                case 4:
                    result = _a.sent();
                    results.push({
                        ruleName: rule.name,
                        decision: result.decision,
                        status: result.status,
                        decisionLogId: result.decisionLogId,
                    });
                    if (result.decision === 'EXECUTE' || result.decision === 'SIMULATED') {
                        rulesFired++;
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, { rulesEvaluated: rules.length, rulesFired: rulesFired, results: results }];
            }
        });
    });
}
function simulateDecision(ruleId, ruleData, entityData) {
    return __awaiter(this, void 0, void 0, function () {
        var mockProject, mockRule;
        return __generator(this, function (_a) {
            mockProject = { id: 'proj-1', name: 'Mock Project', description: '' };
            mockRule = { id: 'rule-1', projectId: 'proj-1', version: 1, name: 'Reorder Rule', description: null, antecedent: { type: 'condition', field: 'stockLevel', operator: 'lt', value: 50 }, consequent: { type: 'action', actionName: 'create_order', payload: { itemId: '{{logicalId}}', quantity: 100 } }, createdAt: new Date(), updatedAt: new Date() };
            return [2 /*return*/, mockRule];
        });
    });
}
