import { PrismaClient } from './generated/prisma/client';

/**
 * RelationshipDerivationService infers graph edges between entities
 * based on spatial and temporal markers.
 */
export class RelationshipDerivationService {
    /**
     * Derive 'NearTo' relationships between two entity types within a distance.
     * Assumes entities have 'latitude' and 'longitude' in their data bag.
     */
    static async deriveProximityLinks(
        sourceEntityTypeId: string,
        targetEntityTypeId: string,
        relationshipDefId: string,
        maxDistanceKm: number,
        prisma: PrismaClient
    ) {
        const sources = await prisma.currentEntityState.findMany({
            where: { entityTypeId: sourceEntityTypeId }
        });

        const targets = await prisma.currentEntityState.findMany({
            where: { entityTypeId: targetEntityTypeId }
        });

        const newLinks = [];

        for (const s of sources) {
            const sData = s.data as any;
            if (!sData.latitude || !sData.longitude) continue;

            for (const t of targets) {
                if (s.logicalId === t.logicalId) continue;
                const tData = t.data as any;
                if (!tData.latitude || !tData.longitude) continue;

                const dist = this.calculateDistance(
                    sData.latitude, sData.longitude,
                    tData.latitude, tData.longitude
                );

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

        if (newLinks.length > 0) {
            // In a real system, we'd use a more efficient upsert or check for existing
            for (const link of newLinks) {
                await prisma.relationshipInstance.create({ data: link });

                // Update CQRS Projection
                await prisma.currentGraph.upsert({
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
                        properties: link.properties as any
                    },
                    update: {
                        properties: link.properties as any
                    }
                });
            }
        }

        return newLinks.length;
    }

    /**
     * Haversine formula for distance calculation.
     */
    private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
