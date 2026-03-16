import { PrismaClient } from './generated/prisma';
/** Execute a pipeline by its DB id — walks the ReactFlow DAG in topo order */
export declare function executePipeline(pipelineId: string, runId: string, prisma: PrismaClient, trigger?: string, broadcastFn?: (topics: string[], message: any) => void): Promise<{
    status: string;
    recordsIn: number;
    recordsOut: number;
    errorCount: number;
    steps: any[];
    logs: string[];
}>;
//# sourceMappingURL=pipeline-engine.d.ts.map