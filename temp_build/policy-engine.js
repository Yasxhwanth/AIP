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
exports.evaluatePolicies = evaluatePolicies;
// ── Condition Evaluator ──────────────────────────────────────────
function evaluateCondition(condition, data) {
    var actual = data[condition.field];
    if (actual === undefined || actual === null)
        return false;
    var operator = condition.operator, value = condition.value;
    switch (operator) {
        case '>': return actual > value;
        case '<': return actual < value;
        case '>=': return actual >= value;
        case '<=': return actual <= value;
        case '==': return actual === value;
        case '!=': return actual !== value;
        default: return false;
    }
}
function evaluatePolicies(event, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var policies, newState, _i, policies_1, policy, condition, fieldValue, matched, evaluationTrace, config, alertType, severity, existing, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, prisma.policyDefinition.findMany({
                            where: {
                                entityTypeId: event.entityTypeId,
                                eventType: event.eventType,
                                enabled: true,
                            },
                        })];
                case 1:
                    policies = _d.sent();
                    if (policies.length === 0)
                        return [2 /*return*/];
                    newState = event.payload.newState;
                    _i = 0, policies_1 = policies;
                    _d.label = 2;
                case 2:
                    if (!(_i < policies_1.length)) return [3 /*break*/, 6];
                    policy = policies_1[_i];
                    condition = policy.condition;
                    fieldValue = newState[condition.field];
                    matched = evaluateCondition(condition, newState);
                    evaluationTrace = {
                        condition: policy.condition,
                        fieldValue: fieldValue,
                        result: matched,
                        evaluatedAt: new Date().toISOString(),
                    };
                    if (!matched) return [3 /*break*/, 5];
                    config = ((_a = policy.actionConfig) !== null && _a !== void 0 ? _a : {});
                    alertType = (_b = config.alertType) !== null && _b !== void 0 ? _b : "".concat(policy.name, "Alert");
                    severity = (_c = config.severity) !== null && _c !== void 0 ? _c : 'warning';
                    return [4 /*yield*/, prisma.alert.findUnique({
                            where: {
                                eventId_policyId: {
                                    eventId: event.eventId,
                                    policyId: policy.id,
                                },
                            },
                        })];
                case 3:
                    existing = _d.sent();
                    if (existing) {
                        // eslint-disable-next-line no-console
                        console.log("[PolicyEngine] Skipping duplicate alert for event ".concat(event.eventId, " + policy \"").concat(policy.name, "\""));
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, prisma.alert.create({
                            data: {
                                alertType: alertType,
                                severity: severity,
                                policyId: policy.id,
                                policyVersion: policy.version,
                                eventId: event.eventId,
                                entityTypeId: event.entityTypeId,
                                logicalId: event.logicalId,
                                evaluationTrace: evaluationTrace,
                                payload: {
                                    policyName: policy.name,
                                    condition: policy.condition,
                                    triggeredBy: newState,
                                    previousState: event.payload.previousState,
                                    validFrom: event.payload.validFrom,
                                },
                            },
                        })];
                case 4:
                    _d.sent();
                    // eslint-disable-next-line no-console
                    console.log("[PolicyEngine] Alert fired: ".concat(alertType, " (").concat(severity, ") for ").concat(event.logicalId, " \u2014 policy \"").concat(policy.name, "\" v").concat(policy.version));
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _d.sent();
                    // Policy evaluation must never crash the main request
                    // eslint-disable-next-line no-console
                    console.error('[PolicyEngine] Error evaluating policies:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
