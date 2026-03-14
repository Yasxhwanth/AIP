import { PrismaClient } from './generated/prisma';
import { z } from 'zod';
import logger from './logger';

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

// ── Registry Initialization ────────────────────────────────────────

export const defaultToolRegistry = new AIPToolRegistry();
defaultToolRegistry.register(GetEntityTool);
defaultToolRegistry.register(SearchEntitiesTool);
defaultToolRegistry.register(GetLineageTool);
