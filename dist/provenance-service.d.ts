import { PrismaClient } from './generated/prisma';
/**
 * ProvenanceService handles both basic and military-grade cryptographic provenance.
 */
export declare class ProvenanceService {
    /**
     * Records standard (non-crypto) provenance for a single entity instance or its fields.
     */
    static recordLineage(entityInstanceId: string, sourceSystem: string, sourceRecordId: string, sourceTimestamp: Date, attributeNames: string[] | null, projectId: string, prisma: any): Promise<any>;
    private static getSecretKey;
    /**
     * Records field-level cryptographic provenance.
     * Hashes each field value using SHA-256 to create an immutable log.
     */
    static recordCryptoProvenance(entityId: string, entityType: string, operationType: string, sourceSystem: string, operatorId: string, fields: Record<string, any>, projectId: string, prisma: PrismaClient): Promise<any[]>;
    /**
     * Creates an HMAC-SHA256 integrity seal for an entity at the current point in time.
     * This proves mathematically that the database row hasn't been tampered with since sealing.
     */
    static createIntegritySeal(entityId: string, entityType: string, sealedBy: string, projectId: string, prisma: PrismaClient): Promise<{
        projectId: string;
        id: string;
        entityType: string;
        entityId: string;
        sealHmac: string;
        fieldCount: number;
        fieldHashes: import("./generated/prisma/runtime/client").JsonValue;
        sealedAt: Date;
        sealedBy: string | null;
        verified: boolean;
        lastVerifiedAt: Date | null;
        tamperedFields: import("./generated/prisma/runtime/client").JsonValue | null;
    }>;
    /**
     * Verifies an entity's seal to detect tampering.
     * Recomputes the expected HMAC from the stored hashes, and detects if specific fields were modified.
     */
    static verifyIntegritySeal(entityId: string, prisma: PrismaClient): Promise<{
        valid: boolean;
        sealId: string;
        sealedAt: Date;
        tamperedFields: string[];
    }>;
}
//# sourceMappingURL=provenance-service.d.ts.map