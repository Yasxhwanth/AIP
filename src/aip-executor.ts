import { PrismaClient } from './generated/prisma';
import { AIPToolRegistry, defaultToolRegistry } from './aip-tools';
import { tenantStorage } from './tenant-context';
import { AuditService } from './audit-service';
import logger from './logger';

export interface ExecuteToolArgs {
    toolName: string;
    parameters: any;
    projectId: string;
    actor?: string;
    actorMetadata?: any;
}

export class AIPExecutor {
    private audit: AuditService;

    constructor(
        private prisma: PrismaClient,
        private registry: AIPToolRegistry = defaultToolRegistry
    ) {
        this.audit = new AuditService(prisma);
    }

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

        const startTime = Date.now();
        const actor = args.actor || 'aip-agent';
        logger.info({ toolName, projectId, actor }, 'Executing AIP Tool');

        // Run within tenant storage context
        return tenantStorage.run({ projectId }, async () => {
            try {
                const result = await tool.handler(validatedParams, {
                    prisma: this.prisma,
                    projectId
                });

                const durationMs = Date.now() - startTime;

                // ── AUDIT LOG: Success ─────────────────────────────────────────
                await this.audit.logAction({
                    actor,
                    action: `AGENT_TOOL_${toolName.toUpperCase()}`,
                    resourceType: 'AGENT_TOOL',
                    resourceId: toolName,
                    projectId,
                    after: result,
                    metadata: {
                        ...args.actorMetadata,
                        parameters: validatedParams,
                        durationMs,
                        status: 'SUCCESS'
                    }
                });

                return {
                    success: true,
                    tool: toolName,
                    parameters: validatedParams,
                    result,
                    metadata: {
                        durationMs,
                        timestamp: new Date().toISOString(),
                        projectId
                    }
                };
            } catch (err: any) {
                const durationMs = Date.now() - startTime;
                logger.error({ toolName, err: err.message }, 'AIP Tool execution failed');

                // ── AUDIT LOG: Failure ─────────────────────────────────────────
                await this.audit.logAction({
                    actor,
                    action: `AGENT_TOOL_${toolName.toUpperCase()}`,
                    resourceType: 'AGENT_TOOL',
                    resourceId: toolName,
                    projectId,
                    metadata: {
                        ...args.actorMetadata,
                        parameters: validatedParams,
                        durationMs,
                        status: 'FAILED',
                        error: err.message
                    }
                });

                return {
                    success: false,
                    tool: toolName,
                    parameters: validatedParams,
                    error: err.message || 'Internal tool error',
                    metadata: {
                        durationMs,
                        timestamp: new Date().toISOString(),
                        projectId
                    }
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
