"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineageService = void 0;
/**
 * LineageService — Explains "How" and "Why"
 *
 * Reconstructs the provenance graph for any entity or inference.
 */
class LineageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get the lineage graph for a specific InferenceResult.
     * Shows inputs -> model -> result.
     */
    async getInferenceLineage(resultId) {
        const result = await this.prisma.inferenceResult.findUnique({
            where: { id: resultId },
            include: {
                modelVersion: {
                    include: { modelDefinition: true }
                }
            }
        });
        if (!result)
            throw new Error(`Inference result ${resultId} not found`);
        const nodes = [];
        const edges = [];
        // 1. Terminal Node (The Prediction)
        nodes.push({
            id: result.id,
            type: 'INFERENCE_RESULT',
            label: `Prediction: ${JSON.stringify(result.output)}`,
            metadata: { confidence: result.confidence, explanation: result.explanation }
        });
        // 2. The Model Node
        const modelNodeId = `model-${result.modelVersionId}`;
        nodes.push({
            id: modelNodeId,
            type: 'MODEL_VERSION',
            label: `${result.modelVersion.modelDefinition.name} (v${result.modelVersion.version})`,
            metadata: { strategy: result.modelVersion.strategy }
        });
        edges.push({ source: modelNodeId, target: result.id, label: 'computed by' });
        // 3. Input Nodes (from Lineage data)
        const lineage = result.lineage || {};
        for (const [field, info] of Object.entries(lineage)) {
            const infoObj = info;
            let sourceId;
            let label;
            if (infoObj.source === 'TimeseriesMetric') {
                sourceId = `metric-${infoObj.id}`;
                label = `Metric: ${field} (${infoObj.timestamp})`;
                nodes.push({ id: sourceId, type: 'TELEMETRY', label, metadata: infoObj });
            }
            else if (infoObj.source === 'CurrentEntityState') {
                sourceId = `state-${infoObj.logicalId}`;
                label = `Entity Property: ${field}`;
                nodes.push({ id: sourceId, type: 'ENTITY_STATE', label, metadata: infoObj });
            }
            else {
                continue;
            }
            edges.push({ source: sourceId, target: modelNodeId, label: 'input' });
        }
        return { nodes, edges };
    }
    /**
     * Get the lineage graph for an entity's current state.
     * Shows source systems -> jobs -> events -> current state.
     */
    async getEntityLineage(logicalId) {
        const state = await this.prisma.currentEntityState.findUnique({
            where: { logicalId }
        });
        if (!state)
            throw new Error(`Entity ${logicalId} not found`);
        const nodes = [];
        const edges = [];
        // 1. Current State Node
        nodes.push({
            id: `state-${logicalId}`,
            type: 'CURRENT_STATE',
            label: `Current State (${logicalId})`,
            metadata: { updatedAt: state.updatedAt }
        });
        // 2. Provenance Records
        const provenance = await this.prisma.provenanceRecord.findMany({
            where: { entityInstance: { logicalId } },
            take: 20
        });
        for (const record of provenance) {
            const sourceNodeId = `source-${record.sourceSystem}-${record.sourceRecordId}`;
            // Dedupe nodes
            if (!nodes.find(n => n.id === sourceNodeId)) {
                nodes.push({
                    id: sourceNodeId,
                    type: 'SOURCE_SYSTEM',
                    label: `${record.sourceSystem} (Record: ${record.sourceRecordId})`,
                    metadata: { timestamp: record.sourceTimestamp }
                });
            }
            edges.push({ source: sourceNodeId, target: `state-${logicalId}`, label: record.attributeName || 'record' });
        }
        return { nodes, edges };
    }
    // ── Generic lineage helpers used by server.ts ─────────────────────────────
    /**
     * Register a lineage edge between an upstream source and downstream target.
     * Idempotent on (sourceType, sourceId, targetType, targetId).
     */
    async registerEdge(edge) {
        const { sourceType, sourceId, targetType, targetId, transformation, projectId } = edge;
        await this.prisma.lineageEdge.upsert({
            where: { sourceType_sourceId_targetType_targetId: { sourceType, sourceId, targetType, targetId } },
            update: { transformation: transformation ?? null, projectId },
            create: { sourceType, sourceId, targetType, targetId, transformation: transformation ?? null, projectId }
        });
    }
    /**
     * Breadth-first search of all downstream consumers from a given node.
     * Used to estimate impact of schema changes.
     */
    async getFullDownstreamTrace(rootType, rootId, maxDepth = 5) {
        const visited = new Set([`${rootType}:${rootId}`]);
        const queue = [{ type: rootType, id: rootId, depth: 0 }];
        const edges = [];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.depth >= maxDepth)
                continue;
            const outgoing = await this.prisma.lineageEdge.findMany({
                where: { sourceType: current.type, sourceId: current.id }
            });
            for (const e of outgoing) {
                edges.push(e);
                const key = `${e.targetType}:${e.targetId}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ type: e.targetType, id: e.targetId, depth: current.depth + 1 });
                }
            }
        }
        return edges;
    }
    /**
     * Simulate whether a breaking change is safe by checking for downstream consumers.
     */
    async simulateBreakingChange(sourceType, sourceId) {
        const impacted = await this.getFullDownstreamTrace(sourceType, sourceId, 5);
        return {
            allow: impacted.length === 0,
            impactedConsumers: impacted
        };
    }
    /**
     * Walk upstream from a node to its sources (reverse edges).
     */
    async getFullUpstreamTrace(targetType, targetId) {
        const visited = new Set([`${targetType}:${targetId}`]);
        const queue = [{ type: targetType, id: targetId }];
        const edges = [];
        while (queue.length > 0) {
            const current = queue.shift();
            const incoming = await this.prisma.lineageEdge.findMany({
                where: { targetType: current.type, targetId: current.id }
            });
            for (const e of incoming) {
                edges.push(e);
                const key = `${e.sourceType}:${e.sourceId}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ type: e.sourceType, id: e.sourceId });
                }
            }
        }
        return edges;
    }
}
exports.LineageService = LineageService;
//# sourceMappingURL=lineage-service.js.map