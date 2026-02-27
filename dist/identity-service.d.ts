import { PrismaClient } from './generated/prisma/client';
/**
 * IdentityService handles the resolution of external IDs into the platform's
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
export declare class IdentityService {
    /**
     * Resolves an external record's identity to a platform logicalId.
     * 1. Checks for an explicit EntityAlias.
     * 2. (Future) Perform fuzzy matching on attributes.
     */
    static resolveLogicalId(sourceSystem: string, externalId: string, prisma: PrismaClient): Promise<{
        logicalId: string;
        confidence: number;
    } | null>;
    /**
     * Explicitly links an external identity to an internal logicalId.
     */
    static registerAlias(sourceSystem: string, externalId: string, targetLogicalId: string, confidence: number, prisma: PrismaClient): Promise<{
        id: string;
        createdAt: Date;
        externalId: string;
        sourceSystem: string;
        targetLogicalId: string;
        confidence: number;
        isPrimary: boolean;
    }>;
}
//# sourceMappingURL=identity-service.d.ts.map