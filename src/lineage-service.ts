import { PrismaClient } from './generated/prisma';

export class LineageService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Register a new dependency link in the Lineage DAG.
     */
    async registerEdge(params: {
        sourceType: string;
        sourceId: string;
        targetType: string;
        targetId: string;
        transformation?: string | null;
    }) {
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
    async removeEdge(sourceType: string, sourceId: string, targetType: string, targetId: string) {
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
        } catch (e: any) {
            // Ignore if missing
        }
    }

    /**
     * Get all downstream consumers for an entity type or specific property
     */
    async getDownstream(sourceType: string, sourceId: string) {
        return await this.prisma.lineageEdge.findMany({
            where: { sourceType, sourceId }
        });
    }

    /**
     * Get all upstream sources for an entity type or property
     */
    async getUpstream(targetType: string, targetId: string) {
        return await this.prisma.lineageEdge.findMany({
            where: { targetType, targetId }
        });
    }

    /**
     * Full DAG traversal upwards
     */
    async getFullUpstreamTrace(targetType: string, targetId: string): Promise<any[]> {
        const trace: any[] = [];
        const queue = [{ type: targetType, id: targetId }];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const current = queue.shift()!;
            const key = `${current.type}:${current.id}`;
            if (visited.has(key)) continue;
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
    async simulateBreakingChange(targetType: string, targetId: string) {
        const impacts = await this.prisma.lineageEdge.findMany({
            where: { sourceType: targetType, sourceId: targetId }
        });

        return {
            allow: impacts.length === 0,
            impactedConsumers: impacts
        };
    }
}
