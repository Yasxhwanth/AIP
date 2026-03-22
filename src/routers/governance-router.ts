import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { LineageService } from '../lineage-service';
import { SecurityContext } from '../security-context';
import { ModelService, ModelStatus } from '../model-service';

export function createGovernanceRouter(prisma: PrismaClient) {
    const router = Router();
    const lineageSvc = new LineageService(prisma);
    const securityCtx = new SecurityContext(prisma);
    const modelSvc = new ModelService(prisma);

    /**
     * Lineage: Get graph for a specific inference result
     */
    router.get('/lineage/inference/:id', async (req, res) => {
        try {
            const decision = await securityCtx.enforceFromRequest(req, res, 'READ', {
                type: 'InferenceResult',
                id: req.params.id
            });
            if (!decision) return;

            const graph = await lineageSvc.getInferenceLineage(req.params.id);
            res.json(graph);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Lineage: Get graph for an entity's state
     */
    router.get('/lineage/entity/:logicalId', async (req, res) => {
        try {
            const decision = await securityCtx.enforceFromRequest(req, res, 'READ', {
                type: 'CurrentEntityState',
                id: req.params.logicalId
            });
            if (!decision) return;

            const graph = await lineageSvc.getEntityLineage(req.params.logicalId);
            res.json(graph);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Explain: Get human-readable reasons for a decision
     */
    router.get('/explain/decision/:id', async (req, res) => {
        try {
            const decisionLog = await prisma.decisionLog.findUnique({
                where: { id: req.params.id },
                include: { decisionRule: true }
            });

            if (!decisionLog) return res.status(404).json({ error: 'Decision log not found' });

            res.json({
                rule: decisionLog.decisionRule.name,
                decision: decisionLog.decision,
                explanation: decisionLog.explanation,
                conditionResults: decisionLog.conditionResults
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Promote: Change model version status with explanation
     */
    router.post('/model/promote', async (req, res) => {
        const { versionId, status, reason } = req.body;
        if (!versionId || !status || !reason) {
            return res.status(400).json({ error: 'versionId, status, and reason are required' });
        }

        try {
            const decision = await securityCtx.enforceFromRequest(req, res, 'ADMIN', {
                type: 'ModelVersion',
                id: versionId
            });
            if (!decision) return;

            const updated = await modelSvc.updateVersionStatus(
                versionId,
                status as ModelStatus,
                (req as any).auth?.apiKeyName || 'system',
                reason
            );

            res.json(updated);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Air-Gap Synchronizer: Export current mission state for off-line deployment
     */
    router.get('/sync/snapshot', async (req, res) => {
        const projectId = req.query.projectId as string || 'proj-demo';
        try {
            const [project, ontology, policies] = await Promise.all([
                prisma.project.findUnique({ where: { id: projectId } }),
                prisma.entityType.findMany({ where: { branchName: 'main' } }),
                prisma.policyDefinition.findMany({ where: { projectId } }),
            ]);

            const snapshot = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                projectId,
                projectName: project?.name,
                ontology,
                policies,
                checksum: 'sha256:' + Math.random().toString(16).substring(2), // Mock checksum
            };

            res.setHeader('Content-Disposition', `attachment; filename="mission-sync-${projectId}.aip"`);
            res.json(snapshot);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
