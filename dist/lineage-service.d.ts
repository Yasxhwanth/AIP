import { PrismaClient } from './generated/prisma';
export declare class LineageService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Register a new dependency link in the Lineage DAG.
     */
    registerEdge(params: {
        sourceType: string;
        sourceId: string;
        targetType: string;
        targetId: string;
        transformation?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        sourceType: string;
        sourceId: string;
        targetType: string;
        targetId: string;
        transformation: string | null;
    }>;
    /**
     * Delete an edge when a configuration is removed.
     */
    removeEdge(sourceType: string, sourceId: string, targetType: string, targetId: string): Promise<void>;
    /**
     * Get all downstream consumers for an entity type or specific property
     */
    getDownstream(sourceType: string, sourceId: string): Promise<{
        id: string;
        createdAt: Date;
        sourceType: string;
        sourceId: string;
        targetType: string;
        targetId: string;
        transformation: string | null;
    }[]>;
    /**
     * Get all upstream sources for an entity type or property
     */
    getUpstream(targetType: string, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        sourceType: string;
        sourceId: string;
        targetType: string;
        targetId: string;
        transformation: string | null;
    }[]>;
    /**
     * Full DAG traversal upwards
     */
    getFullUpstreamTrace(targetType: string, targetId: string): Promise<any[]>;
    /**
     * Identify breaking changes before deleting/changing a column or entity
     */
    simulateBreakingChange(targetType: string, targetId: string): Promise<{
        allow: boolean;
        impactedConsumers: {
            id: string;
            createdAt: Date;
            sourceType: string;
            sourceId: string;
            targetType: string;
            targetId: string;
            transformation: string | null;
        }[];
    }>;
}
//# sourceMappingURL=lineage-service.d.ts.map