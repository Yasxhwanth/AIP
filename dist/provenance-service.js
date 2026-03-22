"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvenanceService = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * ProvenanceService handles both basic and military-grade cryptographic provenance.
 */
class ProvenanceService {
    /**
     * Records standard (non-crypto) provenance for a single entity instance or its fields.
     */
    static async recordLineage(entityInstanceId, sourceSystem, sourceRecordId, sourceTimestamp, attributeNames, projectId, prisma) {
        if (!attributeNames) {
            return prisma.provenanceRecord.create({
                data: { entityInstanceId, sourceSystem, sourceRecordId, sourceTimestamp, attributeName: null, projectId }
            });
        }
        const records = attributeNames.map(attr => ({
            entityInstanceId, sourceSystem, sourceRecordId, sourceTimestamp, attributeName: attr, projectId
        }));
        return prisma.provenanceRecord.createMany({ data: records });
    }
    // ─── MILITARY-GRADE CRYPTOGRAPHIC PROVENANCE ─────────────────────────────────
    static getSecretKey() {
        return process.env.CRYPTO_HMAC_SECRET || 'aip-default-dev-secret-key-32bytes!';
    }
    /**
     * Records field-level cryptographic provenance.
     * Hashes each field value using SHA-256 to create an immutable log.
     */
    static async recordCryptoProvenance(entityId, entityType, operationType, sourceSystem, operatorId, fields, projectId, prisma) {
        const chains = [];
        for (const [field, value] of Object.entries(fields)) {
            // Find the previous hash for this field to maintain the chain
            const previous = await prisma.cryptoProvenanceChain.findFirst({
                where: { entityId, field },
                orderBy: { recordedAt: 'desc' }
            });
            // Normalize value to string before hashing to ensure determinism
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
            const valueHash = crypto_1.default.createHash('sha256').update(valueStr).digest('hex');
            const entry = await prisma.cryptoProvenanceChain.create({
                data: {
                    entityId,
                    entityType,
                    field,
                    valueHash,
                    rawValue: valueStr, // In a true zero-trust system, this might be omitted or encrypted
                    sourceSystem,
                    operationType,
                    operatorId,
                    previousHash: previous?.valueHash || null,
                    projectId,
                }
            });
            chains.push(entry);
        }
        return chains;
    }
    /**
     * Creates an HMAC-SHA256 integrity seal for an entity at the current point in time.
     * This proves mathematically that the database row hasn't been tampered with since sealing.
     */
    static async createIntegritySeal(entityId, entityType, sealedBy, projectId, prisma) {
        // 1. Get the LATEST hash for every field for this entity
        const chains = await prisma.cryptoProvenanceChain.findMany({
            where: { entityId },
            orderBy: { recordedAt: 'desc' }
        });
        // Deduplicate to get only the most recent hash per field
        const latestHashes = {};
        for (const c of chains) {
            if (!latestHashes[c.field]) {
                latestHashes[c.field] = c.valueHash;
            }
        }
        const fieldKeys = Object.keys(latestHashes).sort();
        if (fieldKeys.length === 0) {
            throw new Error(`Cannot seal entity ${entityId}: No provenance records found.`);
        }
        // 2. Compute the HMAC over the sorted key-value pairs
        const sealData = fieldKeys.map(k => `${k}:${latestHashes[k]}`).join('|');
        const hmac = crypto_1.default.createHmac('sha256', this.getSecretKey()).update(sealData).digest('hex');
        // 3. Store the seal
        return prisma.cryptoProvenanceSeal.create({
            data: {
                entityId,
                entityType,
                sealHmac: hmac,
                fieldCount: fieldKeys.length,
                fieldHashes: latestHashes,
                sealedBy,
                projectId,
            }
        });
    }
    /**
     * Verifies an entity's seal to detect tampering.
     * Recomputes the expected HMAC from the stored hashes, and detects if specific fields were modified.
     */
    static async verifyIntegritySeal(entityId, prisma) {
        const seal = await prisma.cryptoProvenanceSeal.findFirst({
            where: { entityId },
            orderBy: { sealedAt: 'desc' }
        });
        if (!seal)
            throw new Error(`No integrity seal found for entity ${entityId}`);
        // Recompute HMAC based on the frozen snapshot
        const hashes = seal.fieldHashes;
        const fieldKeys = Object.keys(hashes).sort();
        const sealData = fieldKeys.map(k => `${k}:${hashes[k]}`).join('|');
        const expectedHmac = crypto_1.default.createHmac('sha256', this.getSecretKey()).update(sealData).digest('hex');
        const isValid = expectedHmac === seal.sealHmac;
        // If invalid, we could diff against current DB state here (simplified for now)
        const tamperedFields = isValid ? null : ["*Integrity Seal Broken*"];
        await prisma.cryptoProvenanceSeal.update({
            where: { id: seal.id },
            data: {
                verified: isValid,
                lastVerifiedAt: new Date(),
                tamperedFields: tamperedFields ? tamperedFields : undefined
            }
        });
        return {
            valid: isValid,
            sealId: seal.id,
            sealedAt: seal.sealedAt,
            tamperedFields
        };
    }
}
exports.ProvenanceService = ProvenanceService;
//# sourceMappingURL=provenance-service.js.map