import { PrismaClient } from './generated/prisma/client';
export interface MatchScore {
    overall: number;
    breakdown: Record<string, number>;
    reasons: string[];
}
/**
 * Scores similarity between two entity data objects.
 * Uses a weighted combination across matched fields.
 *
 * Fields named "lat"/"lon"/"latitude"/"longitude" use numeric tolerance.
 * All others use string similarity.
 */
export declare function scoreEntitySimilarity(dataA: Record<string, unknown>, dataB: Record<string, unknown>): MatchScore;
/**
 * IdentityService handles the resolution of external IDs into the platform's
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
export declare class IdentityService {
    /**
     * Resolves an external record's identity to a platform logicalId.
     * 1. Checks for an explicit EntityAlias.
     * 2. (Future hook) Could perform fuzzy matching on attributes.
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
    /**
     * Runs fuzzy matching across all active instances of an entity type
     * and creates MatchCandidate records for pairs that exceed the threshold.
     *
     * @returns number of new candidates created
     */
    static runFuzzyMatchJob(entityTypeId: string, prisma: PrismaClient, options?: {
        threshold?: number;
        sourceJobId?: string;
        limit?: number;
    }): Promise<number>;
    /**
     * Merges entity B into entity A: updates all aliases pointing to B to point to A,
     * then marks the MatchCandidate as MERGED.
     */
    static mergeEntities(candidateId: string, reviewerName: string, prisma: PrismaClient): Promise<void>;
}
//# sourceMappingURL=identity-service.d.ts.map