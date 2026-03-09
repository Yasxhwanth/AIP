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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReasonerForEntity = runReasonerForEntity;
exports.runFullReasoner = runFullReasoner;
// ── Core Traversal ────────────────────────────────────────────────────────────
/**
 * Traverses the CurrentGraph following a single antecedent hop.
 * Returns the logicalIds reachable from a given start node.
 */
function traverseHop(startLogicalIds, hop, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var results, edges, _i, edges_1, edge, reachedId, existing;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    results = new Map();
                    if (startLogicalIds.length === 0)
                        return [2 /*return*/, results];
                    return [4 /*yield*/, prisma.currentGraph.findMany({
                            where: __assign({ relationshipDefinitionId: hop.relDefId }, (hop.direction === 'outgoing'
                                ? { sourceLogicalId: { in: startLogicalIds } }
                                : { targetLogicalId: { in: startLogicalIds } })),
                        })];
                case 1:
                    edges = _b.sent();
                    for (_i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
                        edge = edges_1[_i];
                        reachedId = hop.direction === 'outgoing'
                            ? edge.targetLogicalId
                            : edge.sourceLogicalId;
                        existing = (_a = results.get(reachedId)) !== null && _a !== void 0 ? _a : 1.0;
                        results.set(reachedId, Math.min(existing, edge.confidence));
                    }
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * For a single source entity, follows all antecedent hops of a rule
 * and collects (target, pathConfidence) pairs.
 */
function traverseRule(sourceLogicalId, rule, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var currentLayer, _i, _a, hop, starts, reachable, nextLayer, _b, _c, _d, reached, hopConf, bestPathConf, _e, _f, _g, start, pathConf, check;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    currentLayer = new Map([[sourceLogicalId, 1.0]]);
                    _i = 0, _a = rule.antecedent;
                    _j.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    hop = _a[_i];
                    starts = __spreadArray([], currentLayer.keys(), true);
                    return [4 /*yield*/, traverseHop(starts, hop, prisma)];
                case 2:
                    reachable = _j.sent();
                    if (reachable.size === 0)
                        return [2 /*return*/, []];
                    nextLayer = new Map();
                    _b = 0, _c = reachable.entries();
                    _j.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 9];
                    _d = _c[_b], reached = _d[0], hopConf = _d[1];
                    bestPathConf = 0;
                    _e = 0, _f = currentLayer.entries();
                    _j.label = 4;
                case 4:
                    if (!(_e < _f.length)) return [3 /*break*/, 7];
                    _g = _f[_e], start = _g[0], pathConf = _g[1];
                    return [4 /*yield*/, prisma.currentGraph.findFirst({
                            where: __assign({ relationshipDefinitionId: hop.relDefId }, (hop.direction === 'outgoing'
                                ? { sourceLogicalId: start, targetLogicalId: reached }
                                : { sourceLogicalId: reached, targetLogicalId: start })),
                        })];
                case 5:
                    check = _j.sent();
                    if (check) {
                        bestPathConf = Math.max(bestPathConf, Math.min(pathConf, hopConf));
                    }
                    _j.label = 6;
                case 6:
                    _e++;
                    return [3 /*break*/, 4];
                case 7:
                    if (bestPathConf > 0) {
                        nextLayer.set(reached, Math.max(((_h = nextLayer.get(reached)) !== null && _h !== void 0 ? _h : 0), bestPathConf));
                    }
                    _j.label = 8;
                case 8:
                    _b++;
                    return [3 /*break*/, 3];
                case 9:
                    currentLayer = nextLayer;
                    if (currentLayer.size === 0)
                        return [2 /*return*/, []];
                    _j.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11:
                    // Remove self-loops (don't derive sourceLogicalId → sourceLogicalId)
                    currentLayer.delete(sourceLogicalId);
                    return [2 /*return*/, __spreadArray([], currentLayer.entries(), true).map(function (_a) {
                            var targetLogicalId = _a[0], pathConfidence = _a[1];
                            return ({
                                targetLogicalId: targetLogicalId,
                                pathConfidence: pathConfidence,
                            });
                        })];
            }
        });
    });
}
// ── Upsert Derived Relationship ───────────────────────────────────────────────
function upsertDerivedRelationship(rule, sourceLogicalId, targetLogicalId, pathConfidence, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var derivedConfidence, existing;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    derivedConfidence = Math.min(((_a = rule.consequent.confidence) !== null && _a !== void 0 ? _a : 1.0) * pathConfidence, 1.0);
                    return [4 /*yield*/, prisma.currentGraph.findUnique({
                            where: {
                                relationshipDefinitionId_sourceLogicalId_targetLogicalId: {
                                    relationshipDefinitionId: rule.consequent.relDefId,
                                    sourceLogicalId: sourceLogicalId,
                                    targetLogicalId: targetLogicalId,
                                },
                            },
                        })];
                case 1:
                    existing = _c.sent();
                    if (!existing) return [3 /*break*/, 4];
                    if (!(derivedConfidence > existing.confidence)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.currentGraph.update({
                            where: { id: existing.id },
                            data: {
                                confidence: derivedConfidence,
                                baseConfidence: derivedConfidence,
                                lastObservedAt: new Date(),
                            },
                        })];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/, { isNew: false }];
                case 4: return [4 /*yield*/, prisma.currentGraph.create({
                        data: {
                            relationshipDefinitionId: rule.consequent.relDefId,
                            relationshipName: "[derived:".concat(rule.name, "]"),
                            sourceLogicalId: sourceLogicalId,
                            targetLogicalId: targetLogicalId,
                            confidence: derivedConfidence,
                            baseConfidence: derivedConfidence,
                            decayRate: (_b = rule.consequent.decayRate) !== null && _b !== void 0 ? _b : 0.0,
                            lastObservedAt: new Date(),
                        },
                    })];
                case 5:
                    _c.sent();
                    return [2 /*return*/, { isNew: true }];
            }
        });
    });
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Run all enabled OntologyRules for a specific entity.
 * Called after any entity state change.
 */
function runReasonerForEntity(logicalId, projectId, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var rules, derived, _i, rules_1, rule, antecedent, consequent, ruleData, targets, _a, targets_1, _b, targetLogicalId, pathConfidence, isNew;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, prisma.ontologyRule.findMany({
                        where: { projectId: projectId, enabled: true },
                    })];
                case 1:
                    rules = _d.sent();
                    derived = [];
                    _i = 0, rules_1 = rules;
                    _d.label = 2;
                case 2:
                    if (!(_i < rules_1.length)) return [3 /*break*/, 8];
                    rule = rules_1[_i];
                    antecedent = rule.antecedent;
                    consequent = rule.consequent;
                    ruleData = {
                        id: rule.id,
                        name: rule.name,
                        antecedent: antecedent,
                        consequent: consequent,
                        enabled: rule.enabled,
                    };
                    return [4 /*yield*/, traverseRule(logicalId, ruleData, prisma)];
                case 3:
                    targets = _d.sent();
                    _a = 0, targets_1 = targets;
                    _d.label = 4;
                case 4:
                    if (!(_a < targets_1.length)) return [3 /*break*/, 7];
                    _b = targets_1[_a], targetLogicalId = _b.targetLogicalId, pathConfidence = _b.pathConfidence;
                    return [4 /*yield*/, upsertDerivedRelationship(ruleData, logicalId, targetLogicalId, pathConfidence, prisma)];
                case 5:
                    isNew = (_d.sent()).isNew;
                    derived.push({
                        ruleId: rule.id,
                        ruleName: rule.name,
                        relDefId: consequent.relDefId,
                        sourceLogicalId: logicalId,
                        targetLogicalId: targetLogicalId,
                        confidence: Math.min(((_c = consequent.confidence) !== null && _c !== void 0 ? _c : 1.0) * pathConfidence, 1.0),
                        isNew: isNew,
                    });
                    _d.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/, derived];
            }
        });
    });
}
/**
 * Run all enabled OntologyRules across all entities in a project.
 * This is the "full re-materialization" — expensive, run as a background job.
 */
function runFullReasoner(projectId, prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var rules, entityTypes, entityTypeIds, currentStates, derivedTotal, derivedNew, _i, currentStates_1, logicalId, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.ontologyRule.findMany({
                        where: { projectId: projectId, enabled: true },
                    })];
                case 1:
                    rules = _a.sent();
                    if (rules.length === 0) {
                        return [2 /*return*/, { rulesRun: 0, derivedTotal: 0, derivedNew: 0 }];
                    }
                    return [4 /*yield*/, prisma.entityType.findMany({
                            where: { projectId: projectId },
                            select: { id: true },
                        })];
                case 2:
                    entityTypes = _a.sent();
                    entityTypeIds = entityTypes.map(function (e) { return e.id; });
                    return [4 /*yield*/, prisma.currentEntityState.findMany({
                            where: { entityTypeId: { in: entityTypeIds } },
                            select: { logicalId: true },
                        })];
                case 3:
                    currentStates = _a.sent();
                    derivedTotal = 0;
                    derivedNew = 0;
                    _i = 0, currentStates_1 = currentStates;
                    _a.label = 4;
                case 4:
                    if (!(_i < currentStates_1.length)) return [3 /*break*/, 7];
                    logicalId = currentStates_1[_i].logicalId;
                    return [4 /*yield*/, runReasonerForEntity(logicalId, projectId, prisma)];
                case 5:
                    results = _a.sent();
                    derivedTotal += results.length;
                    derivedNew += results.filter(function (r) { return r.isNew; }).length;
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, { rulesRun: rules.length, derivedTotal: derivedTotal, derivedNew: derivedNew }];
            }
        });
    });
}
