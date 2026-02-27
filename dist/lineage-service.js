"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineageService = void 0;
class LineageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Register a new dependency link in the Lineage DAG.
     */
    async registerEdge(params) {
        return await this.prisma.lineageEdge.upsert({
            where: {
                sourceType_sourceId_targetType_targetId: {
                    sourceType: params.sourceType,
                    sourceId: params.sourceId,
                    targetType: params.targetType,
                    targetId: params.targetId,
                }
            },
            update: {
                ...(params.transformation !== undefined && { transformation: params.transformation }),
            },
            create: {
                sourceType: params.sourceType,
                sourceId: params.sourceId,
                targetType: params.targetType,
                targetId: params.targetId,
                ...(params.transformation !== undefined && { transformation: params.transformation }),
            }
        });
    }
    /**
     * Delete an edge when a configuration is removed.
     */
    async removeEdge(sourceType, sourceId, targetType, targetId) {
        try {
            await this.prisma.lineageEdge.delete({
                where: {
                    sourceType_sourceId_targetType_targetId: {
                        sourceType,
                        sourceId,
                        targetType,
                        targetId,
                    }
                }
            });
        }
        catch (e) {
            // Ignore if missing
        }
    }
    /**
     * Get all downstream consumers for an entity type or specific property
     */
    async getDownstream(sourceType, sourceId) {
        return await this.prisma.lineageEdge.findMany({
            where: { sourceType, sourceId }
        });
    }
    /**
     * Get all upstream sources for an entity type or property
     */
    async getUpstream(targetType, targetId) {
        return await this.prisma.lineageEdge.findMany({
            where: { targetType, targetId }
        });
    }
    /**
     * Full DAG traversal upwards
     */
    async getFullUpstreamTrace(targetType, targetId) {
        const trace = [];
        const queue = [{ type: targetType, id: targetId }];
        const visited = new Set();
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.type}:${current.id}`;
            if (visited.has(key))
                continue;
            visited.add(key);
            const directUpstreams = await this.getUpstream(current.type, current.id);
            for (const edge of directUpstreams) {
                trace.push(edge);
                queue.push({ type: edge.sourceType, id: edge.sourceId });
            }
        }
        return trace;
    }
    /**
     * Identify breaking changes before deleting/changing a column or entity
     */
    async simulateBreakingChange(targetType, targetId) {
        const impacts = await this.prisma.lineageEdge.findMany({
            where: { sourceType: targetType, sourceId: targetId }
        });
        return {
            allow: impacts.length === 0,
            impactedConsumers: impacts
        };
    }
}
exports.LineageService = LineageService;
//# sourceMappingURL=lineage-service.js.map