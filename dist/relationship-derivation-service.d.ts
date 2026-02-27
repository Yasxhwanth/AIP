import { PrismaClient } from './generated/prisma';
/**
 * Start a background scheduler that periodically decays relationship confidence.
 * Runs once a day (or every hour, depending on requirement) to apply the decay algorithm.
 */
export declare function startConfidenceDecayScheduler(prisma: PrismaClient): void;
/**
 * RelationshipDerivationService infers graph edges between entities
 * based on spatial and temporal markers.
 */
export declare class RelationshipDerivationService {
    /**
     * Derive 'NearTo' relationships between two entity types within a distance.
     * Assumes entities have 'latitude' and 'longitude' in their data bag.
     */
    static deriveProximityLinks(sourceEntityTypeId: string, targetEntityTypeId: string, relationshipDefId: string, maxDistanceKm: number, prisma: PrismaClient): Promise<number>;
    /**
     * Haversine formula for distance calculation.
     */
    private static calculateDistance;
    /**
     * Applies time-based decay to non-permanent probabilistic relationships.
     * Should be called periodically via an ongoing orchestrator job.
     */
    static applyConfidenceDecay(prisma: PrismaClient): Promise<number>;
}
//# sourceMappingURL=relationship-derivation-service.d.ts.map