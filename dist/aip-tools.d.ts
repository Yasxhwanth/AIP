import { PrismaClient } from './generated/prisma';
import { z } from 'zod';
/**
 * Interface for an AIP Tool.
 * Designed to be consumed by LLM function calling.
 */
export interface AIPTool<P = any, R = any> {
    name: string;
    description: string;
    parameters: z.ZodType<P>;
    handler: (params: P, context: {
        prisma: PrismaClient;
        projectId: string;
    }) => Promise<R>;
}
export declare class AIPToolRegistry {
    private tools;
    register(tool: AIPTool): void;
    getTools(): AIPTool[];
    getTool(name: string): AIPTool | undefined;
}
/**
 * get_entity: Fetch detailed state and history for a specific entity
 */
export declare const GetEntityTool: AIPTool;
/**
 * search_entities: Query ontology by type or attribute values
 */
export declare const SearchEntitiesTool: AIPTool;
/**
 * get_lineage: Trace record provenance
 */
export declare const GetLineageTool: AIPTool;
/**
 * list_jobs: Retrieves recent job execution data
 */
export declare const ListJobsTool: AIPTool;
/**
 * get_outbox_stats: Monitoring for external synchronization
 */
export declare const GetOutboxStatsTool: AIPTool;
/**
 * explain_failure: Diagnostic tool for jobs or outbox events
 */
export declare const ExplainFailureTool: AIPTool;
/**
 * Helper to convert Zod schema to Gemini-compatible JSON schema
 */
export declare function zodToGeminiSchema(schema: z.ZodType<any>): any;
/**
 * propose_change: Submit a proposal for ontology or configuration change
 */
export declare const ProposeChangeTool: AIPTool;
export declare const defaultToolRegistry: AIPToolRegistry;
//# sourceMappingURL=aip-tools.d.ts.map