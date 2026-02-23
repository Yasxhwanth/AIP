import { PrismaClient } from './generated/prisma/client';
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
}, logicalId: string, attrData: Record<string, unknown>, prisma: PrismaClient): Promise<{
    success: boolean;
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
export declare function executeJob(jobId: string, prisma: PrismaClient, inlineData?: unknown[]): Promise<{
    executionId: string;
    status: string;
    recordsProcessed: number;
    recordsFailed: number;
    error?: string;
}>;
export declare function startScheduler(prisma: PrismaClient): void;
//# sourceMappingURL=data-integration.d.ts.map