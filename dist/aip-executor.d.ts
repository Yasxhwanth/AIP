import { PrismaClient } from './generated/prisma';
import { AIPToolRegistry } from './aip-tools';
export interface ExecuteToolArgs {
    toolName: string;
    parameters: any;
    projectId: string;
}
export declare class AIPExecutor {
    private prisma;
    private registry;
    constructor(prisma: PrismaClient, registry?: AIPToolRegistry);
    /**
     * Executes a tool within the specified project context.
     * This ensures RLS is enforced during the tool's execution.
     */
    execute(args: ExecuteToolArgs): Promise<{
        success: boolean;
        tool: string;
        parameters: any;
        result: any;
        metadata: {
            durationMs: number;
            timestamp: string;
            projectId: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        tool: string;
        parameters: any;
        error: any;
        metadata: {
            durationMs: number;
            timestamp: string;
            projectId: string;
        };
        result?: undefined;
    }>;
    /**
     * Lists available tools for discovery by agents.
     */
    listTools(): Promise<{
        name: string;
        description: string;
        parameters: any;
    }[]>;
}
//# sourceMappingURL=aip-executor.d.ts.map