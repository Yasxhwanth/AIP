import { PrismaClient } from './generated/prisma';
import { z } from 'zod';
import logger from './logger';
import { GovernanceService } from './governance-service';

/**
 * Interface for an AIP Tool.
 * Designed to be consumed by LLM function calling.
 */
export interface AIPTool<P = any, R = any> {
    name: string;
    description: string;
    parameters: z.ZodType<P>;
    handler: (params: P, context: { prisma: PrismaClient; projectId: string }) => Promise<R>;
}

export class AIPToolRegistry {
    private tools: Map<string, AIPTool> = new Map();

    register(tool: AIPTool) {
        this.tools.set(tool.name, tool);
        logger.info({ toolName: tool.name }, 'AIP Tool registered');
    }

    getTools(): AIPTool[] {
        return Array.from(this.tools.values());
    }

    getTool(name: string): AIPTool | undefined {
        return this.tools.get(name);
    }
}

// ── Core Read-Only Tools ───────────────────────────────────────────

/**
 * get_entity: Fetch detailed state and history for a specific entity
 */
export const GetEntityTool: AIPTool = {
    name: 'get_entity',
    description: 'Fetch the current state and recent history of a specific entity by its logicalId.',
    parameters: z.object({
        logicalId: z.string()
    }),
    handler: async (params, { prisma }) => {
        const state = await (prisma as any).currentEntityState.findUnique({
            where: { logicalId: params.logicalId }
        });

        if (!state) return { error: `Entity '${params.logicalId}' not found.` };

        const history = await (prisma as any).domainEvent.findMany({
            where: { logicalId: params.logicalId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        return {
            state,
            history: history.map((h: any) => ({
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
export const SearchEntitiesTool: AIPTool = {
    name: 'search_entities',
    description: 'Search for entities of a specific type or matching certain criteria.',
    parameters: z.object({
        entityTypeName: z.string().optional(),
        query: z.any().optional()
    }),
    handler: async (params, { prisma }) => {
        const where: any = {};

        if (params.entityTypeName) {
            const et = await (prisma as any).entityType.findFirst({
                where: { name: params.entityTypeName }
            });
            if (et) where.entityTypeId = et.id;
        }

        // Simple search logic: match keys in the JSON data
        if (params.query) {
            where.data = {
                equals: params.query
            };
        }

        const results = await (prisma as any).currentEntityState.findMany({
            where,
            take: 20
        });

        return {
            count: results.length,
            results: results.map((r: any) => ({
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
export const GetLineageTool: AIPTool = {
    name: 'get_lineage',
    description: 'Trace the source systems and transformations that led to this entity state.',
    parameters: z.object({
        logicalId: z.string()
    }),
    handler: async (params, { prisma }) => {
        // Find current instance
        const current = await (prisma as any).currentEntityState.findUnique({
            where: { logicalId: params.logicalId }
        });

        if (!current) throw new Error(`Entity '${params.logicalId}' not found`);

        // Get audit logs covering changes
        const auditLogs = await (prisma as any).auditLog.findMany({
            where: { logicalId: params.logicalId },
            orderBy: { sourceTimestamp: 'desc' },
            take: 10
        });

        return {
            logicalId: params.logicalId,
            provenance: auditLogs.map((log: any) => ({
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
export const ListJobsTool: AIPTool = {
    name: 'list_jobs',
    description: 'List recent background jobs, their status, and performance metrics.',
    parameters: z.object({
        status: z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER']).optional(),
        limit: z.number().default(10)
    }),
    handler: async (params, { prisma, projectId }) => {
        const jobs = await (prisma as any).jobQueue.findMany({
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
            jobs: jobs.map((j: any) => ({
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
export const GetOutboxStatsTool: AIPTool = {
    name: 'get_outbox_stats',
    description: 'Get real-time health metrics and recent events from the transactional outbox.',
    parameters: z.object({}),
    handler: async (_, { prisma, projectId }) => {
        const stats = await (prisma as any).outboxEvent.groupBy({
            by: ['status'],
            where: { projectId },
            _count: true
        });

        const recent = await (prisma as any).outboxEvent.findMany({
            where: { projectId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        return {
            summary: stats.reduce((acc: any, curr: any) => ({ ...acc, [curr.status]: curr._count }), {}),
            recentEvents: recent.map((ev: any) => ({
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
export const ExplainFailureTool: AIPTool = {
    name: 'explain_failure',
    description: 'Get a detailed diagnostic report for a specific failed job or outbox event.',
    parameters: z.object({
        type: z.enum(['job', 'outbox']),
        id: z.string()
    }),
    handler: async (params, { prisma, projectId }) => {
        if (params.type === 'job') {
            const job = await (prisma as any).jobQueue.findUnique({
                where: { id: params.id, projectId }
            });
            if (!job) return { error: 'Job not found' };
            return {
                context: 'JOB_FAILURE',
                id: job.id,
                error: job.lastError,
                attempts: job.attempts,
                metrics: { processed: job.recordsProcessed, failed: job.recordsFailed }
            };
        } else {
            const event = await (prisma as any).outboxEvent.findUnique({
                where: { id: params.id, projectId }
            });
            if (!event) return { error: 'Outbox event not found' };
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
export function zodToGeminiSchema(schema: z.ZodType<any>): any {
    const def = (schema as any)._def;

    if (def.typeName === 'ZodObject') {
        const shape = def.shape();
        const properties: any = {};
        const required: string[] = [];

        for (const [key, prop] of Object.entries(shape)) {
            properties[key] = zodToGeminiSchema(prop as any);
            if (!(prop as any).isOptional()) {
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

/**
 * propose_change: Submit a proposal for ontology or configuration change
 */
export const ProposeChangeTool: AIPTool = {
    name: 'propose_change',
    description: 'Propose a change to the ontology or platform configuration. This creates a Change Request that must be approved by an administrator.',
    parameters: z.object({
        resourceType: z.enum(['EntityType', 'Pipeline', 'DecisionRule', 'Project']),
        resourceId: z.string().optional(),
        proposedChanges: z.any(),
        branchName: z.string().default('main')
    }),
    handler: async (params, { prisma, projectId }) => {
        const govSvc = new GovernanceService(prisma);
        const cr = await govSvc.createChangeRequest({
            projectId,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            proposedChanges: params.proposedChanges,
            createdBy: 'aip-agent', // Standard actor for agent-initiated proposals
            branchName: params.branchName
        });
        return {
            success: true,
            changeRequestId: cr.id,
            status: cr.status,
            message: 'Change request submitted for administrative review.'
        };
    }
};

// ── History & Metrics Tools ────────────────────────────────────────

/**
 * get_history: Fetch DomainEvent history for an entity with optional date bounds
 */
export const GetHistoryTool: AIPTool = {
    name: 'get_history',
    description: 'Retrieve the full event-sourced change history for an entity, optionally filtered to a date range.',
    parameters: z.object({
        logicalId: z.string(),
        from: z.string().optional().describe('ISO 8601 start date'),
        to: z.string().optional().describe('ISO 8601 end date'),
        limit: z.number().default(20)
    }),
    handler: async (params, { prisma }) => {
        const where: any = { logicalId: params.logicalId };
        if (params.from || params.to) {
            where.createdAt = {};
            if (params.from) where.createdAt.gte = new Date(params.from);
            if (params.to) where.createdAt.lte = new Date(params.to);
        }

        const events = await (prisma as any).domainEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: params.limit
        });

        return {
            logicalId: params.logicalId,
            count: events.length,
            events: events.map((e: any) => ({
                id: e.id,
                eventType: e.eventType,
                actor: e.actor,
                occurredAt: e.createdAt,
                payload: e.payload
            }))
        };
    }
};

/**
 * get_metrics: Read ComputedMetric rows for an entityId or project
 */
export const GetMetricsTool: AIPTool = {
    name: 'get_metrics',
    description: 'Retrieve computed metrics for a specific entity or all entities in a project.',
    parameters: z.object({
        entityId: z.string().optional().describe('Filter by specific entity instance ID'),
        metricName: z.string().optional().describe('Filter by metric name')
    }),
    handler: async (params, { prisma, projectId }) => {
        const where: any = { projectId };
        if (params.entityId) where.entityInstanceId = params.entityId;
        if (params.metricName) where.metricName = params.metricName;

        const metrics = await (prisma as any).computedMetric.findMany({
            where,
            orderBy: { computedAt: 'desc' },
            take: 50
        });

        return {
            count: metrics.length,
            metrics: metrics.map((m: any) => ({
                id: m.id,
                entityInstanceId: m.entityInstanceId,
                metricName: m.metricName,
                value: m.value,
                computedAt: m.computedAt
            }))
        };
    }
};

/**
 * list_rejected_records: Surface quarantined bad rows
 */
export const ListRejectedRecordsTool: AIPTool = {
    name: 'list_rejected_records',
    description: 'List records rejected by data quality gates, optionally filtered by data source.',
    parameters: z.object({
        dataSourceId: z.string().optional(),
        limit: z.number().default(20)
    }),
    handler: async (params, { prisma, projectId }) => {
        const where: any = { projectId };
        if (params.dataSourceId) where.dataSourceId = params.dataSourceId;

        const records = await (prisma as any).rejectedRecord.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: params.limit
        });

        return {
            count: records.length,
            records: records.map((r: any) => ({
                id: r.id,
                dataSourceId: r.dataSourceId,
                rejectionReason: r.rejectionReason,
                rawData: r.rawData,
                rejectedAt: r.createdAt
            }))
        };
    }
};

/**
 * retry_job: Re-queue a FAILED or DEAD_LETTER job
 */
export const RetryJobTool: AIPTool = {
    name: 'retry_job',
    description: 'Re-queue a failed or dead-letter background job so a worker will retry it. Requires admin or operator role.',
    parameters: z.object({
        jobId: z.string()
    }),
    handler: async (params, { prisma, projectId }) => {
        const job = await (prisma as any).jobQueue.findUnique({
            where: { id: params.jobId }
        });

        if (!job) return { success: false, error: `Job '${params.jobId}' not found.` };
        if (!['FAILED', 'DEAD_LETTER'].includes(job.status)) {
            return { success: false, error: `Job is in status '${job.status}'; only FAILED or DEAD_LETTER jobs can be retried.` };
        }

        const updated = await (prisma as any).jobQueue.update({
            where: { id: params.jobId },
            data: {
                status: 'QUEUED',
                attempts: 0,
                lastError: null
            }
        });

        return {
            success: true,
            jobId: updated.id,
            newStatus: updated.status,
            message: `Job '${params.jobId}' has been re-queued for retry.`
        };
    }
};

// ── Registry Initialization ────────────────────────────────────────

export const defaultToolRegistry = new AIPToolRegistry();
defaultToolRegistry.register(GetEntityTool);
defaultToolRegistry.register(SearchEntitiesTool);
defaultToolRegistry.register(GetLineageTool);
defaultToolRegistry.register(GetHistoryTool);
defaultToolRegistry.register(GetMetricsTool);
defaultToolRegistry.register(ListRejectedRecordsTool);
defaultToolRegistry.register(RetryJobTool);
defaultToolRegistry.register(ListJobsTool);
defaultToolRegistry.register(GetOutboxStatsTool);
defaultToolRegistry.register(ExplainFailureTool);
defaultToolRegistry.register(ProposeChangeTool);
