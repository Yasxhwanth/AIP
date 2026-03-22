"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantStorage = void 0;
exports.getTenantPrisma = getTenantPrisma;
const async_hooks_1 = require("async_hooks");
exports.tenantStorage = new async_hooks_1.AsyncLocalStorage();
/**
 * Returns a Prisma Client extended with a query middleware that sets the
 * `aip.tenant_id` session-level GUC before every query when a tenant
 * context is active in AsyncLocalStorage.
 *
 * We use a $transaction to ensure that the SET LOCAL call and the actual query
 * share the same database connection. We use a 'bypass' flag in the store
 * to prevent the extension from recursing indefinitely when $transaction is called.
 */
function getTenantPrisma(prisma) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query }) {
                    const store = exports.tenantStorage.getStore();
                    const projectId = store?.projectId;
                    if (!projectId || store?._skipRLS) {
                        return query(args);
                    }
                    // Wrap in a transaction to bind to a single connection.
                    // We re-run the store context with _skipRLS: true to avoid recursion
                    // when the inner query(args) is executed.
                    return exports.tenantStorage.run({ ...store, _skipRLS: true }, () => {
                        return prisma.$transaction(async (tx) => {
                            await tx.$executeRaw `SELECT set_config('aip.tenant_id', ${projectId}, true)`;
                            return query(args);
                        });
                    });
                },
            },
        },
    });
}
//# sourceMappingURL=tenant-context.js.map