import { TenantContext } from './tenant-types';

/**
 * Singleton to manage the current tenant context.
 * In a real React app, this might be backed by a Context Provider.
 * For the runtime engine, we use a global/singleton approach or pass it down.
 */
export class TenantContextManager {
    private static currentContext: TenantContext | null = null;

    public static setContext(context: TenantContext) {
        // Immutable replacement
        this.currentContext = Object.freeze({ ...context });
    }

    public static getContext(): TenantContext {
        if (!this.currentContext) {
            throw new Error("TN-3: Tenant context is mandatory but missing.");
        }
        return this.currentContext;
    }

    public static clear() {
        this.currentContext = null;
    }

    /**
     * Helper to verify if the current context matches a specific tenant.
     */
    public static verifyTenant(tenantId: string) {
        const context = this.getContext();
        if (context.tenantId !== tenantId) {
            throw new Error(`TN-2: Cross-tenant access denied. Context: ${context.tenantId}, Target: ${tenantId}`);
        }
    }
}
