"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultToolRegistry = exports.ExplainFailureTool = exports.GetOutboxStatsTool = exports.ListJobsTool = exports.GetLineageTool = exports.SearchEntitiesTool = exports.GetEntityTool = exports.AIPToolRegistry = void 0;
exports.zodToGeminiSchema = zodToGeminiSchema;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("./logger"));
class AIPToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    register(tool) {
        this.tools.set(tool.name, tool);
        logger_1.default.info({ toolName: tool.name }, 'AIP Tool registered');
    }
    getTools() {
        return Array.from(this.tools.values());
    }
    getTool(name) {
        return this.tools.get(name);
    }
}
exports.AIPToolRegistry = AIPToolRegistry;
// ── Core Read-Only Tools ───────────────────────────────────────────
/**
 * get_entity: Fetch detailed state and history for a specific entity
 */
exports.GetEntityTool = {
    name: 'get_entity',
    description: 'Fetch the current state and recent history of a specific entity by its logicalId.',
    parameters: zod_1.z.object({
        logicalId: zod_1.z.string()
    }),
    handler: async (params, { prisma }) => {
        const state = await prisma.currentEntityState.findUnique({
            where: { logicalId: params.logicalId }
        });
        if (!state)
            return { error: `Entity '${params.logicalId}' not found.` };
        const history = await prisma.domainEvent.findMany({
            where: { logicalId: params.logicalId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        return {
            state,
            history: history.map((h) => ({
                id: h.id,
                eventType: h.eventType,
                occurredAt: h.createdAt,
                payload: h.payload
            }))
        };
    }
};
/**
 * search_entities: Query ontology by type or attribute values
 */
exports.SearchEntitiesTool = {
    name: 'search_entities',
    description: 'Search for entities of a specific type or matching certain criteria.',
    parameters: zod_1.z.object({
        entityTypeName: zod_1.z.string().optional(),
        query: zod_1.z.any().optional()
    }),
    handler: async (params, { prisma }) => {
        const where = {};
        if (params.entityTypeName) {
            const et = await prisma.entityType.findFirst({
                where: { name: params.entityTypeName }
            });
            if (et)
                where.entityTypeId = et.id;
        }
        // Simple search logic: match keys in the JSON data
        if (params.query) {
            where.data = {
                equals: params.query
            };
        }
        const results = await prisma.currentEntityState.findMany({
            where,
            take: 20
        });
        return {
            count: results.length,
            results: results.map((r) => ({
                logicalId: r.logicalId,
                entityTypeId: r.entityTypeId,
                updatedAt: r.updatedAt,
                data: r.data
            }))
        };
    }
};
/**
 * get_lineage: Trace record provenance
 */
exports.GetLineageTool = {
    name: 'get_lineage',
    description: 'Trace the source systems and transformations that led to this entity state.',
    parameters: zod_1.z.object({
        logicalId: zod_1.z.string()
    }),
    handler: async (params, { prisma }) => {
        // Find current instance
        const current = await prisma.currentEntityState.findUnique({
            where: { logicalId: params.logicalId }
        });
        if (!current)
            throw new Error(`Entity '${params.logicalId}' not found`);
        // Get audit logs covering changes
        const auditLogs = await prisma.auditLog.findMany({
            where: { logicalId: params.logicalId },
            orderBy: { sourceTimestamp: 'desc' },
            take: 10
        });
        return {
            logicalId: params.logicalId,
            provenance: auditLogs.map((log) => ({
                action: log.action,
                actor: log.actor,
                timestamp: log.sourceTimestamp,
                sourceSystem: log.sourceSystem,
                externalId: log.externalId
            }))
        };
    }
};
// ── SRE & Operational Tools ───────────────────────────────────────
/**
 * list_jobs: Retrieves recent job execution data
 */
exports.ListJobsTool = {
    name: 'list_jobs',
    description: 'List recent background jobs, their status, and performance metrics.',
    parameters: zod_1.z.object({
        status: zod_1.z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER']).optional(),
        limit: zod_1.z.number().default(10)
    }),
    handler: async (params, { prisma, projectId }) => {
        const jobs = await prisma.jobQueue.findMany({
            where: {
                projectId,
                ...(params.status ? { status: params.status } : {})
            },
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: { integrationJob: { select: { name: true } } }
        });
        return {
            count: jobs.length,
            jobs: jobs.map((j) => ({
                id: j.id,
                type: j.jobType,
                name: j.integrationJob?.name,
                status: j.status,
                processed: j.recordsProcessed,
                failed: j.recordsFailed,
                createdAt: j.createdAt,
                error: j.lastError
            }))
        };
    }
};
/**
 * get_outbox_stats: Monitoring for external synchronization
 */
exports.GetOutboxStatsTool = {
    name: 'get_outbox_stats',
    description: 'Get real-time health metrics and recent events from the transactional outbox.',
    parameters: zod_1.z.object({}),
    handler: async (_, { prisma, projectId }) => {
        const stats = await prisma.outboxEvent.groupBy({
            by: ['status'],
            where: { projectId },
            _count: true
        });
        const recent = await prisma.outboxEvent.findMany({
            where: { projectId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        return {
            summary: stats.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
            recentEvents: recent.map((ev) => ({
                id: ev.id,
                type: `${ev.aggregateType}:${ev.eventType}`,
                target: ev.targetSystem,
                status: ev.status,
                occurredAt: ev.createdAt
            }))
        };
    }
};
/**
 * explain_failure: Diagnostic tool for jobs or outbox events
 */
exports.ExplainFailureTool = {
    name: 'explain_failure',
    description: 'Get a detailed diagnostic report for a specific failed job or outbox event.',
    parameters: zod_1.z.object({
        type: zod_1.z.enum(['job', 'outbox']),
        id: zod_1.z.string()
    }),
    handler: async (params, { prisma, projectId }) => {
        if (params.type === 'job') {
            const job = await prisma.jobQueue.findUnique({
                where: { id: params.id, projectId }
            });
            if (!job)
                return { error: 'Job not found' };
            return {
                context: 'JOB_FAILURE',
                id: job.id,
                error: job.lastError,
                attempts: job.attempts,
                metrics: { processed: job.recordsProcessed, failed: job.recordsFailed }
            };
        }
        else {
            const event = await prisma.outboxEvent.findUnique({
                where: { id: params.id, projectId }
            });
            if (!event)
                return { error: 'Outbox event not found' };
            return {
                context: 'OUTBOX_FAILURE',
                id: event.id,
                error: event.lastError,
                target: event.targetSystem,
                payloadSample: event.payload
            };
        }
    }
};
/**
 * Helper to convert Zod schema to Gemini-compatible JSON schema
 */
function zodToGeminiSchema(schema) {
    const def = schema._def;
    if (def.typeName === 'ZodObject') {
        const shape = def.shape();
        const properties = {};
        const required = [];
        for (const [key, prop] of Object.entries(shape)) {
            properties[key] = zodToGeminiSchema(prop);
            if (!prop.isOptional()) {
                required.push(key);
            }
        }
        return {
            type: 'OBJECT',
            properties,
            required: required.length > 0 ? required : undefined
        };
    }
    if (def.typeName === 'ZodString') {
        return { type: 'STRING' };
    }
    if (def.typeName === 'ZodNumber') {
        return { type: 'NUMBER' };
    }
    if (def.typeName === 'ZodBoolean') {
        return { type: 'BOOLEAN' };
    }
    if (def.typeName === 'ZodEnum') {
        return { type: 'STRING', enum: def.values };
    }
    if (def.typeName === 'ZodArray') {
        return {
            type: 'ARRAY',
            items: zodToGeminiSchema(def.type)
        };
    }
    if (def.typeName === 'ZodOptional') {
        return zodToGeminiSchema(def.innerType);
    }
    if (def.typeName === 'ZodDefault') {
        return zodToGeminiSchema(def.innerType);
    }
    return { type: 'STRING' }; // Fallback
}
// ── Registry Initialization ────────────────────────────────────────
exports.defaultToolRegistry = new AIPToolRegistry();
exports.defaultToolRegistry.register(exports.GetEntityTool);
exports.defaultToolRegistry.register(exports.SearchEntitiesTool);
exports.defaultToolRegistry.register(exports.GetLineageTool);
exports.defaultToolRegistry.register(exports.ListJobsTool);
exports.defaultToolRegistry.register(exports.GetOutboxStatsTool);
exports.defaultToolRegistry.register(exports.ExplainFailureTool);
//# sourceMappingURL=aip-tools.js.map