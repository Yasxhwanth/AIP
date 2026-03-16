import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from './generated/prisma';

export const tenantStorage = new AsyncLocalStorage<{ projectId: string }>();

/**
 * Returns an extended Prisma Client that automatically sets the aip.tenant_id
 * session variable for every operation based on the current AsyncLocalStorage context.
 */
export function getTenantPrisma(prisma: PrismaClient) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query, operation }) {
                    const store = tenantStorage.getStore();
                    const projectId = store?.projectId;

                    if (!projectId) {
                        return query(args);
                    }

                    // Use a transaction to ensure SET LOCAL + Query run on the same connection
                    return prisma.$transaction(async (tx) => {
                        await tx.$executeRaw`SELECT set_config('aip.tenant_id', ${projectId}, true)`;
                        return query(args);
                    });
                },
            },
        },
    });
}
