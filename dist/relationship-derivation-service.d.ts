import { PrismaClient } from './generated/prisma/client';
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
}
//# sourceMappingURL=relationship-derivation-service.d.ts.map