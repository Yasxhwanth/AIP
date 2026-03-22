import { PrismaClient } from './generated/prisma';
export interface LineageNode {
    id: string;
    type: string;
    label: string;
    metadata?: any;
}
export interface LineageEdgeViz {
    source: string;
    target: string;
    label?: string;
}
export interface LineageGraph {
    nodes: LineageNode[];
    edges: LineageEdgeViz[];
}
export interface RegisteredLineageEdge {
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    transformation?: string | null;
    projectId: string;
}
/**
 * LineageService — Explains "How" and "Why"
 *
 * Reconstructs the provenance graph for any entity or inference.
 */
export declare class LineageService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get the lineage graph for a specific InferenceResult.
     * Shows inputs -> model -> result.
     */
    getInferenceLineage(resultId: string): Promise<LineageGraph>;
    /**
     * Get the lineage graph for an entity's current state.
     * Shows source systems -> jobs -> events -> current state.
     */
    getEntityLineage(logicalId: string): Promise<LineageGraph>;
    /**
     * Register a lineage edge between an upstream source and downstream target.
     * Idempotent on (sourceType, sourceId, targetType, targetId).
     */
    registerEdge(edge: RegisteredLineageEdge): Promise<void>;
    /**
     * Breadth-first search of all downstream consumers from a given node.
     * Used to estimate impact of schema changes.
     */
    getFullDownstreamTrace(rootType: string, rootId: string, maxDepth?: number): Promise<any[]>;
    /**
     * Simulate whether a breaking change is safe by checking for downstream consumers.
     */
    simulateBreakingChange(sourceType: string, sourceId: string): Promise<{
        allow: boolean;
        impactedConsumers: any[];
    }>;
    /**
     * Walk upstream from a node to its sources (reverse edges).
     */
    getFullUpstreamTrace(targetType: string, targetId: string): Promise<any[]>;
}
//# sourceMappingURL=lineage-service.d.ts.map