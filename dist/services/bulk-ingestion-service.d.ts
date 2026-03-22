import { PrismaClient } from '../generated/prisma';
export interface BulkIngestionRecord {
    logicalId: string;
    [key: string]: unknown;
}
export interface BulkIngestionPayload {
    entityTypeId: string;
    projectId: string;
    actor: string;
    items: BulkIngestionRecord[];
}
export interface BulkIngestionResult {
    processed: number;
    failed: number;
    errors: {
        logicalId: string;
        error: string;
    }[];
}
/**
 * BulkIngestionService — encapsulates all logic for high-volume entity ingestion.
 * Designed to be called from the Orchestrator (background), keeping the API thread free.
 * Every record goes through OntologyService to ensure event-sourcing discipline.
 */
export declare class BulkIngestionService {
    private prisma;
    private ontologySvc;
    constructor(prisma: PrismaClient);
    execute(payload: BulkIngestionPayload): Promise<BulkIngestionResult>;
}
//# sourceMappingURL=bulk-ingestion-service.d.ts.map