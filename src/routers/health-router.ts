import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';

export function createHealthRouter(prisma: PrismaClient) {
    const router = Router();

    /**
     * Deep Health Endpoint
     * Aggregates platform-level SLO metrics.
     */
    router.get('/deep', async (req, res) => {
        try {
            // 1. API Latency Rollup (Last 1 hour)
            const latency = await (prisma as any).auditLog.aggregate({
                _count: true,
                where: {
                    occurredAt: { gte: new Date(Date.now() - 3600000) }
                }
            });

            // 2. Integration Success Rates
            const jobStats = await (prisma as any).jobQueue.groupBy({
                by: ['status'],
                _count: true,
                where: {
                    createdAt: { gte: new Date(Date.now() - 86400000) } // Last 24h
                }
            });

            // 3. Outbox Health
            const outboxStats = await (prisma as any).outboxEvent.groupBy({
                by: ['status'],
                _count: true
            });

            // 4. Security Metrics (ABAC/RLS Failures from Logs)
            const securityFailures = await (prisma as any).auditLog.count({
                where: {
                    action: { contains: 'DENY' },
                    occurredAt: { gte: new Date(Date.now() - 86400000) }
                }
            });

            res.json({
                status: 'HEALTHY',
                timestamp: new Date().toISOString(),
                metrics: {
                    traffic: {
                        requestCount1h: latency._count,
                    },
                    reliability: {
                        jobs: jobStats,
                        outbox: outboxStats
                    },
                    security: {
                        blockedActions24h: securityFailures
                    }
                }
            });
        } catch (err: any) {
            res.status(500).json({ status: 'DEGRADED', error: err.message });
        }
    });

    return router;
}
