"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGovernanceRouter = createGovernanceRouter;
const express_1 = require("express");
const lineage_service_1 = require("../lineage-service");
const security_context_1 = require("../security-context");
const model_service_1 = require("../model-service");
function createGovernanceRouter(prisma) {
    const router = (0, express_1.Router)();
    const lineageSvc = new lineage_service_1.LineageService(prisma);
    const securityCtx = new security_context_1.SecurityContext(prisma);
    const modelSvc = new model_service_1.ModelService(prisma);
    /**
     * Lineage: Get graph for a specific inference result
     */
    router.get('/lineage/inference/:id', async (req, res) => {
        try {
            const decision = await securityCtx.enforceFromRequest(req, res, 'READ', {
                type: 'InferenceResult',
                id: req.params.id
            });
            if (!decision)
                return;
            const graph = await lineageSvc.getInferenceLineage(req.params.id);
            res.json(graph);
        }
        catch (err) {
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
            if (!decision)
                return;
            const graph = await lineageSvc.getEntityLineage(req.params.logicalId);
            res.json(graph);
        }
        catch (err) {
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
            if (!decisionLog)
                return res.status(404).json({ error: 'Decision log not found' });
            res.json({
                rule: decisionLog.decisionRule.name,
                decision: decisionLog.decision,
                explanation: decisionLog.explanation,
                conditionResults: decisionLog.conditionResults
            });
        }
        catch (err) {
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
            if (!decision)
                return;
            const updated = await modelSvc.updateVersionStatus(versionId, status, req.auth?.apiKeyName || 'system', reason);
            res.json(updated);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=governance-router.js.map