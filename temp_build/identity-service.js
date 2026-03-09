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
exports.IdentityService = void 0;
exports.scoreEntitySimilarity = scoreEntitySimilarity;
// ── Fuzzy Matching Utilities ──────────────────────────────────────
/**
 * Normalized Levenshtein distance (0 = identical, 1 = completely different).
 */
function levenshteinSimilarity(a, b) {
    if (a === b)
        return 1.0;
    if (!a || !b)
        return 0.0;
    var la = a.toLowerCase().trim();
    var lb = b.toLowerCase().trim();
    var n = la.length;
    var m = lb.length;
    var dp = [];
    for (var i = 0; i <= n; i++) {
        dp[i] = [];
        for (var j = 0; j <= m; j++) {
            dp[i][j] = i === 0 ? j : j === 0 ? i : 0;
        }
    }
    for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= m; j++) {
            if (la[i - 1] === lb[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
            else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    var dist = dp[n][m];
    var maxLen = Math.max(n, m);
    return maxLen === 0 ? 1.0 : 1.0 - dist / maxLen;
}
/**
 * Jaccard similarity on token sets (good for multi-word names/addresses).
 */
function jaccardSimilarity(a, b) {
    var setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
    var setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
    var intersection = __spreadArray([], setA, true).filter(function (t) { return setB.has(t); }).length;
    var union = new Set(__spreadArray(__spreadArray([], setA, true), setB, true)).size;
    return union === 0 ? 1.0 : intersection / union;
}
/**
 * Combined string similarity: max of Levenshtein and Jaccard.
 */
function stringSimilarity(a, b) {
    if (a === null || a === undefined || b === null || b === undefined)
        return 0;
    var sa = String(a);
    var sb = String(b);
    return Math.max(levenshteinSimilarity(sa, sb), jaccardSimilarity(sa, sb));
}
/**
 * Numeric similarity with a tolerance window.
 */
function numericSimilarity(a, b, tolerancePct) {
    if (tolerancePct === void 0) { tolerancePct = 0.05; }
    var na = parseFloat(String(a));
    var nb = parseFloat(String(b));
    if (isNaN(na) || isNaN(nb))
        return 0;
    if (na === 0 && nb === 0)
        return 1;
    var diff = Math.abs(na - nb) / Math.max(Math.abs(na), Math.abs(nb));
    return diff <= tolerancePct ? 1.0 - diff / tolerancePct : 0.0;
}
/**
 * Scores similarity between two entity data objects.
 * Uses a weighted combination across matched fields.
 *
 * Fields named "lat"/"lon"/"latitude"/"longitude" use numeric tolerance.
 * All others use string similarity.
 */
function scoreEntitySimilarity(dataA, dataB) {
    var geoFields = new Set(['lat', 'lon', 'latitude', 'longitude', 'x', 'y']);
    var highWeightFields = new Set(['name', 'title', 'callsign', 'icao', 'registration', 'identifier', 'id']);
    var breakdown = {};
    var reasons = [];
    var weightedSum = 0;
    var totalWeight = 0;
    var allFields = new Set(__spreadArray(__spreadArray([], Object.keys(dataA), true), Object.keys(dataB), true));
    for (var _i = 0, allFields_1 = allFields; _i < allFields_1.length; _i++) {
        var field = allFields_1[_i];
        var valA = dataA[field];
        var valB = dataB[field];
        if (valA === undefined && valB === undefined)
            continue;
        var weight = highWeightFields.has(field) ? 3.0 : geoFields.has(field) ? 1.5 : 1.0;
        var score = void 0;
        if (geoFields.has(field)) {
            score = numericSimilarity(valA, valB, 0.001); // tight geo tolerance
        }
        else {
            score = stringSimilarity(valA, valB);
        }
        breakdown[field] = Math.round(score * 100) / 100;
        weightedSum += score * weight;
        totalWeight += weight;
        if (score >= 0.95)
            reasons.push("exact_".concat(field));
        else if (score >= 0.80)
            reasons.push("fuzzy_".concat(field));
    }
    var overall = totalWeight === 0 ? 0 : Math.round((weightedSum / totalWeight) * 1000) / 1000;
    return { overall: overall, breakdown: breakdown, reasons: reasons };
}
// ── IdentityService ───────────────────────────────────────────────
/**
 * IdentityService handles the resolution of external IDs into the platform's
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
var IdentityService = /** @class */ (function () {
    function IdentityService() {
    }
    /**
     * Resolves an external record's identity to a platform logicalId.
     * 1. Checks for an explicit EntityAlias.
     * 2. (Future hook) Could perform fuzzy matching on attributes.
     */
    IdentityService.resolveLogicalId = function (sourceSystem, externalId, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var alias;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.entityAlias.findUnique({
                            where: {
                                sourceSystem_externalId: {
                                    sourceSystem: sourceSystem,
                                    externalId: externalId
                                }
                            }
                        })];
                    case 1:
                        alias = _a.sent();
                        if (alias) {
                            return [2 /*return*/, { logicalId: alias.targetLogicalId, confidence: alias.confidence }];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Explicitly links an external identity to an internal logicalId.
     */
    IdentityService.registerAlias = function (sourceSystem, externalId, targetLogicalId, confidence, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma.entityAlias.upsert({
                        where: {
                            sourceSystem_externalId: {
                                sourceSystem: sourceSystem,
                                externalId: externalId
                            }
                        },
                        update: {
                            targetLogicalId: targetLogicalId,
                            confidence: confidence
                        },
                        create: {
                            sourceSystem: sourceSystem,
                            externalId: externalId,
                            targetLogicalId: targetLogicalId,
                            confidence: confidence
                        }
                    })];
            });
        });
    };
    /**
     * Runs fuzzy matching across all active instances of an entity type
     * and creates MatchCandidate records for pairs that exceed the threshold.
     *
     * @returns number of new candidates created
     */
    IdentityService.runFuzzyMatchJob = function (entityTypeId_1, prisma_1) {
        return __awaiter(this, arguments, void 0, function (entityTypeId, prisma, options) {
            var _a, threshold, sourceJobId, _b, limit, instances, created, i, j, a, b, existing, score;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.threshold, threshold = _a === void 0 ? 0.75 : _a, sourceJobId = options.sourceJobId, _b = options.limit, limit = _b === void 0 ? 500 : _b;
                        return [4 /*yield*/, prisma.currentEntityState.findMany({
                                where: { entityTypeId: entityTypeId },
                                take: limit,
                            })];
                    case 1:
                        instances = _c.sent();
                        if (instances.length < 2)
                            return [2 /*return*/, 0];
                        created = 0;
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < instances.length)) return [3 /*break*/, 8];
                        j = i + 1;
                        _c.label = 3;
                    case 3:
                        if (!(j < instances.length)) return [3 /*break*/, 7];
                        a = instances[i];
                        b = instances[j];
                        return [4 /*yield*/, prisma.matchCandidate.findFirst({
                                where: {
                                    entityTypeId: entityTypeId,
                                    OR: [
                                        { logicalIdA: a.logicalId, logicalIdB: b.logicalId },
                                        { logicalIdA: b.logicalId, logicalIdB: a.logicalId },
                                    ],
                                    status: { in: ['PENDING', 'MERGED'] }
                                }
                            })];
                    case 4:
                        existing = _c.sent();
                        if (existing)
                            return [3 /*break*/, 6];
                        score = scoreEntitySimilarity(a.data, b.data);
                        if (!(score.overall >= threshold)) return [3 /*break*/, 6];
                        return [4 /*yield*/, prisma.matchCandidate.create({
                                data: {
                                    logicalIdA: a.logicalId,
                                    logicalIdB: b.logicalId,
                                    entityTypeId: entityTypeId,
                                    scoreOverall: score.overall,
                                    scoreBreakdown: score.breakdown,
                                    matchReasons: score.reasons,
                                    status: 'PENDING',
                                    sourceJobId: sourceJobId !== null && sourceJobId !== void 0 ? sourceJobId : null,
                                }
                            }).catch(function () { })];
                    case 5:
                        _c.sent();
                        created++;
                        _c.label = 6;
                    case 6:
                        j++;
                        return [3 /*break*/, 3];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, created];
                }
            });
        });
    };
    /**
     * Merges entity B into entity A: updates all aliases pointing to B to point to A,
     * then marks the MatchCandidate as MERGED.
     */
    IdentityService.mergeEntities = function (candidateId, reviewerName, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var p, candidate, stateA, stateB, merged;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = prisma;
                        return [4 /*yield*/, p.matchCandidate.findUnique({ where: { id: candidateId } })];
                    case 1:
                        candidate = _a.sent();
                        if (!candidate)
                            throw new Error('MatchCandidate not found');
                        if (candidate.status !== 'PENDING')
                            throw new Error('Candidate is not PENDING');
                        // Re-point all aliases from B → A
                        return [4 /*yield*/, prisma.entityAlias.updateMany({
                                where: { targetLogicalId: candidate.logicalIdB },
                                data: { targetLogicalId: candidate.logicalIdA, confidence: candidate.scoreOverall }
                            })];
                    case 2:
                        // Re-point all aliases from B → A
                        _a.sent();
                        return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: candidate.logicalIdA } })];
                    case 3:
                        stateA = _a.sent();
                        return [4 /*yield*/, prisma.currentEntityState.findUnique({ where: { logicalId: candidate.logicalIdB } })];
                    case 4:
                        stateB = _a.sent();
                        if (!(stateA && stateB)) return [3 /*break*/, 6];
                        merged = __assign(__assign({}, stateB.data), stateA.data);
                        return [4 /*yield*/, prisma.currentEntityState.update({
                                where: { logicalId: candidate.logicalIdA },
                                data: { data: merged, updatedAt: new Date() }
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, p.matchCandidate.update({
                            where: { id: candidateId },
                            data: {
                                status: 'MERGED',
                                reviewedBy: reviewerName,
                                reviewedAt: new Date(),
                                mergedIntoId: candidate.logicalIdA
                            }
                        })];
                    case 7:
                        _a.sent();
                        // Active Learning: Record human decision
                        return [4 /*yield*/, p.matchResolutionHistory.create({
                                data: {
                                    matchCandidateId: candidate.id,
                                    logicalIdA: candidate.logicalIdA,
                                    logicalIdB: candidate.logicalIdB,
                                    entityTypeId: candidate.entityTypeId,
                                    scoreOverall: candidate.scoreOverall,
                                    scoreBreakdown: candidate.scoreBreakdown,
                                    matchReasons: candidate.matchReasons,
                                    resolution: 'MERGED',
                                    resolvedBy: reviewerName,
                                }
                            })];
                    case 8:
                        // Active Learning: Record human decision
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return IdentityService;
}());
exports.IdentityService = IdentityService;
