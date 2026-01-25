import { IdentityStore } from './IdentityStore';
import { IdentityContext } from './IdentityContext';
import { ActorType } from './identity-types';
import { TenantContextManager } from '../tenant/TenantContext';

async function testIdentityCore() {
    console.log('Starting Identity Core Tests...');
    const store = new IdentityStore();
    const tenantId = 'tenant-1';
    const otherTenantId = 'tenant-2';

    // 1. Actor Creation
    console.log('Test 1: Actor Creation');
    const actor = store.createActor(tenantId, 'HUMAN_USER', 'Test User', 'test@example.com');
    if (actor.tenant_id !== tenantId) throw new Error('Actor tenant mismatch');
    if (actor.type !== 'HUMAN_USER') throw new Error('Actor type mismatch');
    console.log('  PASS');

    // 2. Session Creation
    console.log('Test 2: Session Creation');
    const session = store.createSession(actor.id);
    if (session.actor_id !== actor.id) throw new Error('Session actor mismatch');
    if (session.tenant_id !== tenantId) throw new Error('Session tenant mismatch');
    console.log('  PASS');

    // 3. Context Resolution
    console.log('Test 3: Context Resolution');
    const context = store.resolveSession(session.id);
    if (context.actor_id !== actor.id) throw new Error('Context actor mismatch');
    console.log('  PASS');

    // 4. Tenant Isolation
    console.log('Test 4: Tenant Isolation');
    try {
        store.resolveSession(session.id, otherTenantId);
        throw new Error('Should have thrown on tenant mismatch');
    } catch (e: any) {
        if (!e.message.includes('Tenant mismatch')) throw e;
    }
    console.log('  PASS');

    // 5. Session Revocation
    console.log('Test 5: Session Revocation');
    store.revokeSession(session.id);
    try {
        store.resolveSession(session.id);
        throw new Error('Should have thrown on revoked session');
    } catch (e: any) {
        if (!e.message.includes('revoked')) throw e;
    }
    console.log('  PASS');

    // 6. Identity Context Singleton
    console.log('Test 6: Identity Context Singleton');
    const newSession = store.createSession(actor.id);
    const newContext = store.resolveSession(newSession.id);

    IdentityContext.getInstance().setCurrentContext(newContext);
    const current = IdentityContext.getInstance().getCurrentContext();
    if (current.session_id !== newSession.id) throw new Error('Context singleton mismatch');

    IdentityContext.getInstance().clear();
    try {
        IdentityContext.getInstance().getCurrentContext();
        throw new Error('Should have thrown on missing context');
    } catch (e: any) {
        if (!e.message.includes('No active IdentityContext')) throw e;
    }
    console.log('  PASS');

    console.log('All Identity Core Tests Passed!');
}

testIdentityCore().catch(e => {
    console.error('Test Failed:', e);
    process.exit(1);
});
