import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from './generated/prisma';
export declare const tenantStorage: AsyncLocalStorage<{
    projectId: string;
    _skipRLS?: boolean;
}>;
/**
 * Returns a Prisma Client extended with a query middleware that sets the
 * `aip.tenant_id` session-level GUC before every query when a tenant
 * context is active in AsyncLocalStorage.
 *
 * We use a $transaction to ensure that the SET LOCAL call and the actual query
 * share the same database connection. We use a 'bypass' flag in the store
 * to prevent the extension from recursing indefinitely when $transaction is called.
 */
export declare function getTenantPrisma(prisma: PrismaClient): import("./generated/prisma/runtime/client").DynamicClientExtensionThis<import("./generated/prisma").Prisma.TypeMap<import("./generated/prisma/runtime/client").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {};
}, {}>, import("./generated/prisma").Prisma.TypeMapCb<import("./generated/prisma").Prisma.PrismaClientOptions>, {
    result: {};
    model: {};
    query: {};
    client: {};
}>;
//# sourceMappingURL=tenant-context.d.ts.map