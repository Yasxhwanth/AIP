"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPExecutor = void 0;
const aip_tools_1 = require("./aip-tools");
const tenant_context_1 = require("./tenant-context");
const audit_service_1 = require("./audit-service");
const logger_1 = __importDefault(require("./logger"));
class AIPExecutor {
    constructor(prisma, registry = aip_tools_1.defaultToolRegistry) {
        this.prisma = prisma;
        this.registry = registry;
        this.audit = new audit_service_1.AuditService(prisma);
    }
    /**
     * Executes a tool within the specified project context.
     * This ensures RLS is enforced during the tool's execution.
     */
    async execute(args) {
        const { toolName, parameters, projectId } = args;
        const tool = this.registry.getTool(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found in registry.`);
        }
        // Validate parameters
        const validatedParams = tool.parameters.parse(parameters);
        const startTime = Date.now();
        const actor = args.actor || 'aip-agent';
        logger_1.default.info({ toolName, projectId, actor }, 'Executing AIP Tool');
        // Run within tenant storage context
        return tenant_context_1.tenantStorage.run({ projectId }, async () => {
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
            }
            catch (err) {
                const durationMs = Date.now() - startTime;
                logger_1.default.error({ toolName, err: err.message }, 'AIP Tool execution failed');
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
            parameters: t.parameters._def // Simplified schema export
        }));
    }
}
exports.AIPExecutor = AIPExecutor;
//# sourceMappingURL=aip-executor.js.map