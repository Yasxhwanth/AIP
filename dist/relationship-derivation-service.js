"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipDerivationService = void 0;
exports.startConfidenceDecayScheduler = startConfidenceDecayScheduler;
/**
 * Start a background scheduler that periodically decays relationship confidence.
 * Runs once a day (or every hour, depending on requirement) to apply the decay algorithm.
 */
function startConfidenceDecayScheduler(prisma) {
    const INTERVAL = 60 * 60 * 1000; // run every hour to apply daily decay fractionally, or just check
    setInterval(() => {
        const idempotencyKey = `RELATIONSHIP_DECAY_${Math.floor(Date.now() / INTERVAL)}`;
        prisma.jobQueue.upsert({
            where: { idempotencyKey },
            create: {
                jobType: 'RELATIONSHIP_DECAY',
                payload: {},
                idempotencyKey,
                priority: 0, // low priority background task
            },
            update: {}
        }).catch((err) => {
            console.error('[ConfidenceDecayScheduler] Failed to enqueue decay job:', err);
        });
    }, INTERVAL);
    // Also run once on startup after a delay
    setTimeout(() => {
        prisma.jobQueue.create({
            data: {
                jobType: 'RELATIONSHIP_DECAY',
                payload: {},
                idempotencyKey: `RELATIONSHIP_DECAY_STARTUP_${Date.now()}`,
                priority: 0,
            }
        }).catch(() => { }); // ignore if idempotency conflict
    }, 10000);
    console.log(`[ConfidenceDecayScheduler] Started — enqueueing relation decay jobs every ${INTERVAL / 1000}s`);
}
/**
 * RelationshipDerivationService infers graph edges between entities
 * based on spatial and temporal markers.
 */
class RelationshipDerivationService {
    /**
     * Derive 'NearTo' relationships between two entity types within a distance.
     * Assumes entities have 'latitude' and 'longitude' in their data bag.
     */
    static async deriveProximityLinks(sourceEntityTypeId, targetEntityTypeId, relationshipDefId, maxDistanceKm, prisma) {
        const sources = await prisma.currentEntityState.findMany({
            where: { entityTypeId: sourceEntityTypeId }
        });
        const targets = await prisma.currentEntityState.findMany({
            where: { entityTypeId: targetEntityTypeId }
        });
        const newLinks = [];
        for (const s of sources) {
            const sData = s.data;
            if (!sData.latitude || !sData.longitude)
                continue;
            for (const t of targets) {
                if (s.logicalId === t.logicalId)
                    continue;
                const tData = t.data;
                if (!tData.latitude || !tData.longitude)
                    continue;
                const dist = this.calculateDistance(sData.latitude, sData.longitude, tData.latitude, tData.longitude);
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
                        properties: link.properties
                    },
                    update: {
                        properties: link.properties
                    }
                });
            }
        }
        return newLinks.length;
    }
    /**
     * Haversine formula for distance calculation.
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Applies time-based decay to non-permanent probabilistic relationships.
     * Should be called periodically via an ongoing orchestrator job.
     */
    static async applyConfidenceDecay(prisma) {
        // Raw SQL for efficient bulk update of decaying relationships
        // Confidence = GREATEST(0, baseConfidence - (decayRate * days_since_last_observed))
        try {
            const count = await prisma.$executeRaw `
                UPDATE "CurrentGraph"
                SET "confidence" = GREATEST(0.0, "baseConfidence" - ("decayRate" * (EXTRACT(EPOCH FROM (NOW() - "lastObservedAt")) / 86400)))
                WHERE "decayRate" > 0 AND "confidence" > 0;
            `;
            if (count > 0) {
                console.log(`[RelationshipDerivationService] Decayed confidence for ${count} probabilistic edges.`);
            }
            return count;
        }
        catch (error) {
            console.error('[RelationshipDerivationService] Failed to apply confidence decay:', error);
            return 0;
        }
    }
}
exports.RelationshipDerivationService = RelationshipDerivationService;
//# sourceMappingURL=relationship-derivation-service.js.map