import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { OntologyService } from '../ontology-service';

/**
 * createOntologyRouter
 * Handles core Ontology access, replication, and delta-syncing for edge nodes.
 * Aligned with Platform Roadmap Stage 9 (Mission Command & Edge).
 */
export function createOntologyRouter(prisma: PrismaClient) {
    const router = Router();
    const ontologySvc = new OntologyService(prisma);

    /**
     * GET /delta
     * Edge Sync Endpoint: Returns DomainEvents since a given timestamp.
     * This allows edge computation nodes to maintain a local projection of the ontology
     * while only consuming minimal bandwidth (delta updates).
     */
    router.get('/delta', async (req, res) => {
        const projectId = (req as any).projectId || req.query.projectId;
        const since = req.query.since as string; // ISO timestamp
        const entityTypeId = req.query.entityTypeId as string;
        const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

        if (!projectId) {
            return res.status(401).json({ error: 'Project context (projectId) missing' });
        }

        try {
            const events = await prisma.domainEvent.findMany({
                where: {
                    projectId,
                    ...(entityTypeId ? { entityTypeId } : {}),
                    ...(since ? { occurredAt: { gt: new Date(since) } } : {})
                },
                orderBy: { occurredAt: 'asc' },
                take: limit
            });

            const nextSince = events.length > 0
                ? events[events.length - 1].occurredAt.toISOString()
                : since;

            res.json({
                success: true,
                events: events.map(ev => ({
                    id: ev.id,
                    type: ev.eventType,
                    entityTypeId: ev.entityTypeId,
                    logicalId: ev.logicalId,
                    version: ev.entityVersion,
                    payload: ev.payload,
                    occurredAt: ev.occurredAt
                })),
                cursor: {
                    nextSince,
                    hasMore: events.length === limit,
                    count: events.length
                }
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /summary
     * Returns a high-level summary of the ontology state for a project.
     */
    router.get('/summary', async (req, res) => {
        const projectId = (req as any).projectId || req.query.projectId;
        if (!projectId) return res.status(401).json({ error: 'Project context missing' });

        try {
            const [types, entities, events] = await Promise.all([
                prisma.entityType.count({ where: { projectId } }),
                prisma.currentEntityState.count({ where: { projectId } }),
                prisma.domainEvent.count({ where: { projectId } })
            ]);

            res.json({
                projectId,
                stats: {
                    entityTypeCount: types,
                    totalEntities: entities,
                    totalEvents: events
                },
                timestamp: new Date()
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
