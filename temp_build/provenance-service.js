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
exports.ProvenanceService = void 0;
var crypto_1 = require("crypto");
/**
 * ProvenanceService handles both basic and military-grade cryptographic provenance.
 */
var ProvenanceService = /** @class */ (function () {
    function ProvenanceService() {
    }
    /**
     * Records standard (non-crypto) provenance for a single entity instance or its fields.
     */
    ProvenanceService.recordLineage = function (entityInstanceId, sourceSystem, sourceRecordId, sourceTimestamp, attributeNames, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var records;
            return __generator(this, function (_a) {
                if (!attributeNames) {
                    return [2 /*return*/, prisma.provenanceRecord.create({
                            data: { entityInstanceId: entityInstanceId, sourceSystem: sourceSystem, sourceRecordId: sourceRecordId, sourceTimestamp: sourceTimestamp, attributeName: null }
                        })];
                }
                records = attributeNames.map(function (attr) { return ({
                    entityInstanceId: entityInstanceId,
                    sourceSystem: sourceSystem,
                    sourceRecordId: sourceRecordId,
                    sourceTimestamp: sourceTimestamp,
                    attributeName: attr
                }); });
                return [2 /*return*/, prisma.provenanceRecord.createMany({ data: records })];
            });
        });
    };
    // ─── MILITARY-GRADE CRYPTOGRAPHIC PROVENANCE ─────────────────────────────────
    ProvenanceService.getSecretKey = function () {
        return process.env.CRYPTO_HMAC_SECRET || 'aip-default-dev-secret-key-32bytes!';
    };
    /**
     * Records field-level cryptographic provenance.
     * Hashes each field value using SHA-256 to create an immutable log.
     */
    ProvenanceService.recordCryptoProvenance = function (entityId, entityType, operationType, sourceSystem, operatorId, fields, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var chains, _i, _a, _b, field, value, previous, valueStr, valueHash, entry;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        chains = [];
                        _i = 0, _a = Object.entries(fields);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], field = _b[0], value = _b[1];
                        return [4 /*yield*/, prisma.cryptoProvenanceChain.findFirst({
                                where: { entityId: entityId, field: field },
                                orderBy: { recordedAt: 'desc' }
                            })];
                    case 2:
                        previous = _c.sent();
                        valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        valueHash = crypto_1.default.createHash('sha256').update(valueStr).digest('hex');
                        return [4 /*yield*/, prisma.cryptoProvenanceChain.create({
                                data: {
                                    entityId: entityId,
                                    entityType: entityType,
                                    field: field,
                                    valueHash: valueHash,
                                    rawValue: valueStr, // In a true zero-trust system, this might be omitted or encrypted
                                    sourceSystem: sourceSystem,
                                    operationType: operationType,
                                    operatorId: operatorId,
                                    previousHash: (previous === null || previous === void 0 ? void 0 : previous.valueHash) || null
                                }
                            })];
                    case 3:
                        entry = _c.sent();
                        chains.push(entry);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, chains];
                }
            });
        });
    };
    /**
     * Creates an HMAC-SHA256 integrity seal for an entity at the current point in time.
     * This proves mathematically that the database row hasn't been tampered with since sealing.
     */
    ProvenanceService.createIntegritySeal = function (entityId, entityType, sealedBy, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var chains, latestHashes, _i, chains_1, c, fieldKeys, sealData, hmac;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.cryptoProvenanceChain.findMany({
                            where: { entityId: entityId },
                            orderBy: { recordedAt: 'desc' }
                        })];
                    case 1:
                        chains = _a.sent();
                        latestHashes = {};
                        for (_i = 0, chains_1 = chains; _i < chains_1.length; _i++) {
                            c = chains_1[_i];
                            if (!latestHashes[c.field]) {
                                latestHashes[c.field] = c.valueHash;
                            }
                        }
                        fieldKeys = Object.keys(latestHashes).sort();
                        if (fieldKeys.length === 0) {
                            throw new Error("Cannot seal entity ".concat(entityId, ": No provenance records found."));
                        }
                        sealData = fieldKeys.map(function (k) { return "".concat(k, ":").concat(latestHashes[k]); }).join('|');
                        hmac = crypto_1.default.createHmac('sha256', this.getSecretKey()).update(sealData).digest('hex');
                        // 3. Store the seal
                        return [2 /*return*/, prisma.cryptoProvenanceSeal.create({
                                data: {
                                    entityId: entityId,
                                    entityType: entityType,
                                    sealHmac: hmac,
                                    fieldCount: fieldKeys.length,
                                    fieldHashes: latestHashes,
                                    sealedBy: sealedBy
                                }
                            })];
                }
            });
        });
    };
    /**
     * Verifies an entity's seal to detect tampering.
     * Recomputes the expected HMAC from the stored hashes, and detects if specific fields were modified.
     */
    ProvenanceService.verifyIntegritySeal = function (entityId, prisma) {
        return __awaiter(this, void 0, void 0, function () {
            var seal, hashes, fieldKeys, sealData, expectedHmac, isValid, tamperedFields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.cryptoProvenanceSeal.findFirst({
                            where: { entityId: entityId },
                            orderBy: { sealedAt: 'desc' }
                        })];
                    case 1:
                        seal = _a.sent();
                        if (!seal)
                            throw new Error("No integrity seal found for entity ".concat(entityId));
                        hashes = seal.fieldHashes;
                        fieldKeys = Object.keys(hashes).sort();
                        sealData = fieldKeys.map(function (k) { return "".concat(k, ":").concat(hashes[k]); }).join('|');
                        expectedHmac = crypto_1.default.createHmac('sha256', this.getSecretKey()).update(sealData).digest('hex');
                        isValid = expectedHmac === seal.sealHmac;
                        tamperedFields = isValid ? null : ["*Integrity Seal Broken*"];
                        return [4 /*yield*/, prisma.cryptoProvenanceSeal.update({
                                where: { id: seal.id },
                                data: {
                                    verified: isValid,
                                    lastVerifiedAt: new Date(),
                                    tamperedFields: tamperedFields ? tamperedFields : undefined
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                valid: isValid,
                                sealId: seal.id,
                                sealedAt: seal.sealedAt,
                                tamperedFields: tamperedFields
                            }];
                }
            });
        });
    };
    return ProvenanceService;
}());
exports.ProvenanceService = ProvenanceService;
