"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantStorage = void 0;
exports.getTenantPrisma = getTenantPrisma;
const async_hooks_1 = require("async_hooks");
exports.tenantStorage = new async_hooks_1.AsyncLocalStorage();
/**
 * Returns an extended Prisma Client that automatically sets the aip.tenant_id
 * session variable for every operation based on the current AsyncLocalStorage context.
 */
function getTenantPrisma(prisma) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query, operation }) {
                    const store = exports.tenantStorage.getStore();
                    const projectId = store?.projectId;
                    if (!projectId) {
                        return query(args);
                    }
                    // Use a transaction to ensure SET LOCAL + Query run on the same connection
                    return prisma.$transaction(async (tx) => {
                        await tx.$executeRawUnsafe(`SET LOCAL aip.tenant_id = '${projectId}'`);
                        return query(args);
                    });
                },
            },
        },
    });
}
//# sourceMappingURL=tenant-context.js.map