import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from './generated/prisma';

export const tenantStorage = new AsyncLocalStorage<{ projectId: string, bypassRLS?: boolean, _skipRLS?: boolean }>();

/**
 * Returns a Prisma Client extended with a query middleware that sets the
 * `aip.tenant_id` session-level GUC before every query when a tenant
 * context is active in AsyncLocalStorage.
 *
 * We use a $transaction to ensure that the SET LOCAL call and the actual query
 * share the same database connection. We use a 'bypass' flag in the store
 * to prevent the extension from recursing indefinitely when $transaction is called.
 */
export function getTenantPrisma(prisma: PrismaClient) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query }) {
                    const store = tenantStorage.getStore();
                    const projectId = store?.projectId;

                    if (store?._skipRLS) {
                        return query(args);
                    }

                    if (store?.bypassRLS) {
                        return tenantStorage.run({ ...store, _skipRLS: true }, () => {
                            return (prisma as any).$transaction(async (tx: any) => {
                                await tx.$executeRaw`SELECT set_config('aip.tenant_bypass', '1', true)`;
                                return query(args);
                            });
                        });
                    }

                    if (projectId) {
                        return tenantStorage.run({ ...store, _skipRLS: true }, () => {
                            return (prisma as any).$transaction(async (tx: any) => {
                                await tx.$executeRaw`SELECT set_config('aip.tenant_id', ${projectId}, true)`;
                                return query(args);
                            });
                        });
                    }

                    return query(args);
                },
            },
        },
    });
}


