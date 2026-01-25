import { IdentityStore } from './IdentityStore';
import { IdentityContext } from './IdentityContext';
import { TenantContextManager } from '../tenant/TenantContext';
import { ActorType } from './identity-types';

export class MockLogin {
    private static store = new IdentityStore();

    static login(tenantId: string, userId: string, displayName: string) {
        // 1. Ensure Tenant Context
        // We need to create the session first to get the ID, or just use a placeholder if we want to follow the order strictly.
        // But let's create session first.
        let actor = this.store.getActor(userId);
        if (!actor) {
            actor = this.store.createActor(tenantId, 'HUMAN_USER', displayName, `${userId}@example.com`);
        }
        const session = this.store.createSession(actor.id);

        TenantContextManager.setContext({
            tenantId: tenantId,
            userId: userId,
            role: 'ADMIN', // Default for dev
            sessionId: session.id
        });

        // 4. Set Identity Context
        IdentityContext.getInstance().setCurrentContext({
            tenant_id: tenantId,
            actor_id: actor.id,
            session_id: session.id,
            actor_type: actor.type
        });

        console.log(`[MockLogin] Logged in as ${displayName} (${actor.id}) in tenant ${tenantId}`);
        return session;
    }

    static logout() {
        IdentityContext.getInstance().clear();
        console.log('[MockLogin] Logged out');
    }
}
