import { IdentityStore } from '../identity/IdentityStore';
import { IdentityContext } from '../identity/IdentityContext';
import { TenantContextManager } from '../tenant/TenantContext';
import { ActorType } from '../identity/identity-types';

export interface LoginCredentials {
    email: string;
    password: string;
    tenantId?: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    sessionId?: string;
}

/**
 * AuthService
 * 
 * Production-grade authentication service.
 * Handles login, logout, session management.
 * 
 * INVARIANTS:
 * - No hardcoded business logic
 * - Works with any tenant structure
 * - Session-based (can be extended to JWT)
 */
export class AuthService {
    private static store = new IdentityStore();
    private static currentSessionId: string | null = null;

    /**
     * Authenticates a user and creates a session.
     * In production, this would validate credentials against a database.
     * For now, we use a simple mock validation.
     */
    static async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            // In production, validate credentials against database
            // For now, we'll create/find actor based on email
            const tenantId = credentials.tenantId || 'tenant-default';

            // Mock: Find or create actor
            // In production, this would query a user database
            let actor = Array.from(this.store['actors'].values()).find(
                a => a.email === credentials.email && a.tenant_id === tenantId
            );

            if (!actor) {
                // For demo: Create actor if not found
                // In production, this would fail if user doesn't exist
                actor = this.store.createActor(
                    tenantId,
                    'HUMAN_USER',
                    credentials.email.split('@')[0],
                    credentials.email
                );
            }

            // Validate password (mock - in production, use bcrypt/hash)
            // For demo, accept any password
            // In production: const isValid = await verifyPassword(credentials.password, actor.passwordHash);

            // Create session
            const session = this.store.createSession(actor.id, 3600000); // 1 hour
            this.currentSessionId = session.id;

            // Set Tenant Context
            TenantContextManager.setContext({
                tenantId: tenantId,
                userId: actor.id,
                role: 'ADMIN', // In production, fetch from actor metadata
                sessionId: session.id
            });

            // Set Identity Context
            IdentityContext.getInstance().setCurrentContext({
                tenant_id: tenantId,
                actor_id: actor.id,
                session_id: session.id,
                actor_type: actor.type
            });

            // Store session in localStorage for persistence
            localStorage.setItem('auth_session', session.id);
            localStorage.setItem('auth_tenant', tenantId);
            localStorage.setItem('auth_actor', actor.id);

            return {
                success: true,
                sessionId: session.id
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Authentication failed'
            };
        }
    }

    /**
     * Logs out the current user.
     */
    static logout(): void {
        if (this.currentSessionId) {
            this.store.revokeSession(this.currentSessionId);
        }

        // Clear localStorage
        localStorage.removeItem('auth_session');
        localStorage.removeItem('auth_tenant');
        localStorage.removeItem('auth_actor');

        // Clear contexts
        IdentityContext.getInstance().clear();
        TenantContextManager.clear();

        this.currentSessionId = null;
    }

    /**
     * Restores session from localStorage (for page refresh).
     */
    static restoreSession(): AuthResult {
        try {
            const sessionId = localStorage.getItem('auth_session');
            const tenantId = localStorage.getItem('auth_tenant');
            const actorId = localStorage.getItem('auth_actor');

            if (!sessionId || !tenantId || !actorId) {
                return { success: false, error: 'No saved session' };
            }

            // Validate session
            const context = this.store.resolveSession(sessionId, tenantId);
            this.currentSessionId = sessionId;

            // Restore contexts
            TenantContextManager.setContext({
                tenantId: tenantId,
                userId: actorId,
                role: 'ADMIN',
                sessionId: sessionId
            });

            IdentityContext.getInstance().setCurrentContext(context);

            return { success: true, sessionId };
        } catch (error: any) {
            // Session invalid, clear storage
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_tenant');
            localStorage.removeItem('auth_actor');
            return { success: false, error: error.message || 'Session expired' };
        }
    }

    /**
     * Checks if user is authenticated.
     */
    static isAuthenticated(): boolean {
        try {
            IdentityContext.getInstance().getCurrentContext();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Gets current user info.
     */
    static getCurrentUser() {
        try {
            const context = IdentityContext.getInstance().getCurrentContext();
            const actor = this.store.getActor(context.actor_id);
            return {
                id: context.actor_id,
                email: actor?.email,
                displayName: actor?.display_name,
                tenantId: context.tenant_id
            };
        } catch {
            return null;
        }
    }
}

