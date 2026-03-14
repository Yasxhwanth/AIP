import { PrismaClient } from './generated/prisma';
import { AIPToolRegistry, defaultToolRegistry } from './aip-tools';
import { tenantStorage } from './tenant-context';
import logger from './logger';

export interface ExecuteToolArgs {
    toolName: string;
    parameters: any;
    projectId: string;
}

export class AIPExecutor {
    constructor(
        private prisma: PrismaClient,
        private registry: AIPToolRegistry = defaultToolRegistry
    ) { }

    /**
     * Executes a tool within the specified project context.
     * This ensures RLS is enforced during the tool's execution.
     */
    async execute(args: ExecuteToolArgs) {
        const { toolName, parameters, projectId } = args;

        const tool = this.registry.getTool(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found in registry.`);
        }

        // Validate parameters
        const validatedParams = tool.parameters.parse(parameters);

        logger.info({ toolName, projectId }, 'Executing AIP Tool');

        // Run within tenant storage context
        return tenantStorage.run({ projectId }, async () => {
            try {
                const result = await tool.handler(validatedParams, {
                    prisma: this.prisma,
                    projectId
                });
                return {
                    success: true,
                    tool: toolName,
                    result
                };
            } catch (err: any) {
                logger.error({ toolName, err: err.message }, 'AIP Tool execution failed');
                return {
                    success: false,
                    tool: toolName,
                    error: err.message || 'Internal tool error'
                };
            }
        });
    }

    /**
     * Lists available tools for discovery by agents.
     */
    async listTools() {
        return this.registry.getTools().map(t => ({
            name: t.name,
            description: t.description,
            parameters: (t.parameters as any)._def // Simplified schema export
        }));
    }
}
