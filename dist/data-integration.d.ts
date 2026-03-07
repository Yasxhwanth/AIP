import { PrismaClient } from './generated/prisma';
/**
 * Upserts a single entity instance using the same bi-temporal logic
 * as the POST /entity-types/:id/instances endpoint.
 *
 * Returns { success: true } on success, { success: false, error } on failure.
 */
export declare function upsertEntityInstance(entityType: {
    id: string;
    version: number;
    name: string;
}, logicalId: string, attrData: Record<string, unknown>, prisma: PrismaClient, options?: {
    sourceSystem: string;
    sourceRecordId: string;
    confidence?: number;
}): Promise<{
    success: boolean;
    instanceId?: string;
    error?: string;
}>;
/**
 * Executes a single integration job:
 * 1. Creates a JobExecution record (PENDING → RUNNING)
 * 2. Calls the appropriate connector to fetch records
 * 3. Transforms each record using fieldMapping
 * 4. Upserts each record as an entity instance
 * 5. Updates the JobExecution with results
 */
export declare function executeJob(jobId: string, prisma: PrismaClient, queueId?: string, inlineData?: unknown[]): Promise<{
    status: string;
    recordsProcessed: number;
    recordsFailed: number;
    error?: string;
}>;
/**
 * Dry-Run an integration job:
 * Fetches data from the exact connector but halts before writing any instances to the DB.
 * Returns a subset of raw vs mapped records for user preview.
 */
export declare function dryRunJob(jobId: string, prisma: PrismaClient, inlineData?: unknown[]): Promise<{
    status: string;
    records: Array<{
        raw: Record<string, unknown>;
        mapped: Record<string, unknown>;
        externalId: string | null;
    }>;
    error?: string;
}>;
export declare function startScheduler(prisma: PrismaClient): void;
//# sourceMappingURL=data-integration.d.ts.map