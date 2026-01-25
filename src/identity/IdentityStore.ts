import { Actor, ActorContext, ActorType, Session } from './identity-types';

export class IdentityStore {
    private actors: Map<string, Actor> = new Map();
    private sessions: Map<string, Session> = new Map();

    createActor(
        tenantId: string,
        type: ActorType,
        displayName: string,
        email?: string
    ): Actor {
        const id = `actor-${crypto.randomUUID()}`;
        const actor: Actor = {
            id,
            tenant_id: tenantId,
            type,
            display_name: displayName,
            email,
            is_active: true,
            created_at: Date.now(),
        };
        this.actors.set(id, actor);
        return actor;
    }

    createSession(actorId: string, durationMs: number = 3600000): Session {
        const actor = this.actors.get(actorId);
        if (!actor) {
            throw new Error(`Actor ${actorId} not found`);
        }
        if (!actor.is_active) {
            throw new Error(`Actor ${actorId} is inactive`);
        }

        const id = `session-${crypto.randomUUID()}`;
        const now = Date.now();
        const session: Session = {
            id,
            tenant_id: actor.tenant_id,
            actor_id: actorId,
            issued_at: now,
            expires_at: now + durationMs,
        };
        this.sessions.set(id, session);
        return session;
    }

    resolveSession(sessionId: string, requiredTenantId?: string): ActorContext {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        if (session.revoked_at) {
            throw new Error(`Session ${sessionId} has been revoked`);
        }

        if (Date.now() > session.expires_at) {
            throw new Error(`Session ${sessionId} has expired`);
        }

        if (requiredTenantId && session.tenant_id !== requiredTenantId) {
            throw new Error(
                `Tenant mismatch: Session belongs to ${session.tenant_id}, but ${requiredTenantId} was required`
            );
        }

        const actor = this.actors.get(session.actor_id);
        if (!actor) {
            throw new Error(`Actor ${session.actor_id} not found for session ${sessionId}`);
        }

        return {
            tenant_id: session.tenant_id,
            actor_id: actor.id,
            session_id: session.id,
            actor_type: actor.type,
        };
    }

    revokeSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.revoked_at = Date.now();
        }
    }

    getActor(actorId: string): Actor | undefined {
        return this.actors.get(actorId);
    }
}
