"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.RelationshipDerivationService = void 0;
exports.startConfidenceDecayScheduler = startConfidenceDecayScheduler;
/**
 * Start a background scheduler that periodically decays relationship confidence.
 * Runs once a day (or every hour, depending on requirement) to apply the decay algorithm.
 */
function startConfidenceDecayScheduler(prisma) {
    var INTERVAL = 60 * 60 * 1000; // run every hour to apply daily decay fractionally, or just check
    setInterval(function () {
        var idempotencyKey = "RELATIONSHIP_DECAY_".concat(Math.floor(Date.now() / INTERVAL));
        prisma.jobQueue.upsert({
            where: { idempotencyKey: idempotencyKey },
            create: {
                jobType: 'RELATIONSHIP_DECAY',
                payload: {},
                idempotencyKey: idempotencyKey,
                priority: 0, // low priority background task
            },
            update: {}
        }).catch(function (err) {
            console.error('[ConfidenceDecayScheduler] Failed to enqueue decay job:', err);
        });
    }, INTERVAL);
    // Also run once on startup after a delay
    setTimeout(function () {
        prisma.jobQueue.create({
            data: {
                jobType: 'RELATIONSHIP_DECAY',
                payload: {},
                idempotencyKey: "RELATIONSHIP_DECAY_STARTUP_".concat(Date.now()),
                priority: 0,
            }
        }).catch(function () { }); // ignore if idempotency conflict
    }, 10000);
    console.log("[ConfidenceDecayScheduler] Started \u2014 enqueueing relation decay jobs every ".concat(INTERVAL / 1000, "s"));
}
/**
 * RelationshipDerivationService infers graph edges between entities
 * based on spatial and temporal markers.
 */
var RelationshipDerivationService = /** @class */ (function () {
    function RelationshipDerivationService() {
    }
    /**
     * Derive 'NearTo' relationships between two entity types within a distance.
     * Assumes entities have 'latitude' and 'longitude' in their data bag.
     */
    RelationshipDerivationService.deriveProximityLinks = function (sourceEntityTypeId, targetEntityTypeId, relationshipDefId, maxDistanceKm, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var sources, targets, newLinks, _i, sources_1, s, sData, _a, targets_1, t, tData, dist, _b, newLinks_1, link;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, prisma.currentEntityState.findMany({
                            where: { entityTypeId: sourceEntityTypeId }
                        })];
                    case 1:
                        sources = _c.sent();
                        return [4 /*yield*/, prisma.currentEntityState.findMany({
                                where: { entityTypeId: targetEntityTypeId }
                            })];
                    case 2:
                        targets = _c.sent();
                        newLinks = [];
                        for (_i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
                            s = sources_1[_i];
                            sData = s.data;
                            if (!sData.latitude || !sData.longitude)
                                continue;
                            for (_a = 0, targets_1 = targets; _a < targets_1.length; _a++) {
                                t = targets_1[_a];
                                if (s.logicalId === t.logicalId)
                                    continue;
                                tData = t.data;
                                if (!tData.latitude || !tData.longitude)
                                    continue;
                                dist = this.calculateDistance(sData.latitude, sData.longitude, tData.latitude, tData.longitude);
                                if (dist <= maxDistanceKm) {
                                    newLinks.push({
                                        relationshipDefinitionId: relationshipDefId,
                                        sourceLogicalId: s.logicalId,
                                        targetLogicalId: t.logicalId,
                                        properties: { distanceKm: dist, derived: true },
                                        validFrom: new Date()
                                    });
                                }
                            }
                        }
                        if (!(newLinks.length > 0)) return [3 /*break*/, 7];
                        _b = 0, newLinks_1 = newLinks;
                        _c.label = 3;
                    case 3:
                        if (!(_b < newLinks_1.length)) return [3 /*break*/, 7];
                        link = newLinks_1[_b];
                        return [4 /*yield*/, prisma.relationshipInstance.create({ data: link })];
                    case 4:
                        _c.sent();
                        // Update CQRS Projection
                        return [4 /*yield*/, prisma.currentGraph.upsert({
                                where: {
                                    relationshipDefinitionId_sourceLogicalId_targetLogicalId: {
                                        relationshipDefinitionId: link.relationshipDefinitionId,
                                        sourceLogicalId: link.sourceLogicalId,
                                        targetLogicalId: link.targetLogicalId
                                    }
                                },
                                create: {
                                    relationshipDefinitionId: link.relationshipDefinitionId,
                                    relationshipName: 'derived_proximity',
                                    sourceLogicalId: link.sourceLogicalId,
                                    targetLogicalId: link.targetLogicalId,
                                    properties: link.properties
                                },
                                update: {
                                    properties: link.properties
                                }
                            })];
                    case 5:
                        // Update CQRS Projection
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, newLinks.length];
                }
            });
        });
    };
    /**
     * Haversine formula for distance calculation.
     */
    RelationshipDerivationService.calculateDistance = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    /**
     * Applies time-based decay to non-permanent probabilistic relationships.
     * Should be called periodically via an ongoing orchestrator job.
     */
    RelationshipDerivationService.applyConfidenceDecay = function (prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var count, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.$executeRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n                UPDATE \"CurrentGraph\"\n                SET \"confidence\" = GREATEST(0.0, \"baseConfidence\" - (\"decayRate\" * (EXTRACT(EPOCH FROM (NOW() - \"lastObservedAt\")) / 86400)))\n                WHERE \"decayRate\" > 0 AND \"confidence\" > 0;\n            "], ["\n                UPDATE \"CurrentGraph\"\n                SET \"confidence\" = GREATEST(0.0, \"baseConfidence\" - (\"decayRate\" * (EXTRACT(EPOCH FROM (NOW() - \"lastObservedAt\")) / 86400)))\n                WHERE \"decayRate\" > 0 AND \"confidence\" > 0;\n            "])))];
                    case 1:
                        count = _a.sent();
                        if (count > 0) {
                            console.log("[RelationshipDerivationService] Decayed confidence for ".concat(count, " probabilistic edges."));
                        }
                        return [2 /*return*/, count];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[RelationshipDerivationService] Failed to apply confidence decay:', error_1);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RelationshipDerivationService;
}());
exports.RelationshipDerivationService = RelationshipDerivationService;
var templateObject_1;
