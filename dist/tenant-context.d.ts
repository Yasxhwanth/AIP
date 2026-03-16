import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from './generated/prisma';
export declare const tenantStorage: AsyncLocalStorage<{
    projectId: string;
}>;
/**
 * Returns an extended Prisma Client that automatically sets the aip.tenant_id
 * session variable for every operation based on the current AsyncLocalStorage context.
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