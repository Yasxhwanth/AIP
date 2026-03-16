import { PrismaClient } from './generated/prisma';
/** Interpolate {{varName}} template tokens from a context map */
export declare function interpolate(template: string, ctx: Record<string, any>): string;
/** Execute a workflow by its DB id — walks the ReactFlow DAG in topological order */
export declare function executeWorkflow(workflowId: string, runId: string, prisma: PrismaClient, inputs?: Record<string, any>, broadcastFn?: (topics: string[], message: any) => void): Promise<{
    status: string;
    summary: {
        finalOutput: any;
        context: Record<string, any>;
    };
    steps: any[];
    logs: string[];
}>;
//# sourceMappingURL=workflow-engine.d.ts.map