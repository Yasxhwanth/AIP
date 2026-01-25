import {
    AuthorityGrant,
    AuthorityRevocation,
    AuthorityChangeEvent,
    AuthorityEventType,
    AuthorityEdge,
    AuthorityEdgeType,
    AuthorityIntent,
    AuthorityScope,
    AuthorityConstraints
} from './authority-types';

/**
 * Manages the lifecycle of authority grants and revocations.
 * Enforces append-only history and time-travel resolution.
 */
export class AuthorityLifecycleManager {
    // In-memory append-only logs
    private grants: AuthorityGrant[] = [];
    private revocations: AuthorityRevocation[] = [];
    private events: AuthorityChangeEvent[] = [];

    /**
     * Grants new authority.
     * Creates an AuthorityGrant and an AuthorityChangeEvent.
     */
    public grantAuthority(
        fromNodeId: string,
        toNodeId: string,
        intent: AuthorityIntent,
        scope: AuthorityScope,
        constraints: AuthorityConstraints,
        actorId: string,
        isEmergency: boolean = false,
        validUntil?: string
    ): AuthorityGrant {
        const grant: AuthorityGrant = {
            grantId: crypto.randomUUID(),
            fromNodeId,
            toNodeId,
            intent,
            scope,
            constraints,
            isEmergency,
            validFrom: new Date().toISOString(),
            validUntil: isEmergency && !validUntil ?
                new Date(Date.now() + 3600000).toISOString() : // Default 1 hour for emergency
                validUntil,
            createdBy: actorId,
            createdAt: new Date().toISOString()
        };

        this.grants.push(grant);

        this.recordEvent(AuthorityEventType.GRANT, grant.grantId, actorId, {
            fromNodeId,
            toNodeId,
            intent
        });

        return grant;
    }

    /**
     * Revokes an existing authority grant.
     * Creates an AuthorityRevocation and an AuthorityChangeEvent.
     * Does NOT delete the grant.
     */
    public revokeAuthority(
        grantId: string,
        reason: string,
        actorId: string
    ): AuthorityRevocation {
        const grant = this.grants.find(g => g.grantId === grantId);
        if (!grant) {
            throw new Error(`Grant ${grantId} not found`);
        }

        const revocation: AuthorityRevocation = {
            revocationId: crypto.randomUUID(),
            grantId,
            revokedBy: actorId,
            revokedAt: new Date().toISOString(),
            reason
        };

        this.revocations.push(revocation);

        this.recordEvent(AuthorityEventType.REVOKE, revocation.revocationId, actorId, {
            grantId,
            reason
        });

        return revocation;
    }

    /**
     * Retrieves effective authority edges incoming to a specific node at a specific point in time.
     * This prevents full graph reconstruction and ensures efficient traversal.
     */
    public getIncomingEdges(toNodeId: string, asOf: Date): AuthorityEdge[] {
        return this.grants
            .filter(grant => {
                // 0. Match Target Node (Index Optimization)
                if (grant.toNodeId !== toNodeId) return false;

                // 1. Check Valid From
                const validFrom = new Date(grant.validFrom);
                if (validFrom > asOf) return false;

                // 2. Check Expiration (validUntil)
                if (grant.validUntil) {
                    const validUntil = new Date(grant.validUntil);
                    if (validUntil <= asOf) return false;
                }

                // 3. Check Constraints Expiration (if separate from validUntil)
                if (grant.constraints.expiresAt) {
                    const expiresAt = new Date(grant.constraints.expiresAt);
                    if (expiresAt <= asOf) return false;
                }

                // 4. Check Revocation
                const revocation = this.revocations.find(r => r.grantId === grant.grantId);
                if (revocation) {
                    const revokedAt = new Date(revocation.revokedAt);
                    if (revokedAt <= asOf) return false;
                }

                return true;
            })
            .map(grant => this.mapGrantToEdge(grant));
    }

    private mapGrantToEdge(grant: AuthorityGrant): AuthorityEdge {
        // Find revocation info if any (for metadata, even if filtered out above)
        const revocation = this.revocations.find(r => r.grantId === grant.grantId);

        return {
            edgeId: grant.grantId,
            fromNodeId: grant.fromNodeId,
            toNodeId: grant.toNodeId,
            type: grant.intent === AuthorityIntent.DELEGATE ? AuthorityEdgeType.DELEGATED : AuthorityEdgeType.DIRECT, // Heuristic mapping
            intent: grant.intent,
            scope: grant.scope,
            constraints: grant.constraints,
            grantedAt: grant.createdAt,
            grantedBy: grant.createdBy,
            revokedAt: revocation?.revokedAt
        };
    }

    private recordEvent(
        type: AuthorityEventType,
        referenceId: string,
        actorId: string,
        metadata?: Record<string, unknown>
    ) {
        const event: AuthorityChangeEvent = {
            eventId: crypto.randomUUID(),
            eventType: type,
            referenceId,
            occurredAt: new Date().toISOString(),
            actorId,
            metadata
        };
        this.events.push(event);
    }

    // Read-only accessors for UI
    public getAllGrants(): AuthorityGrant[] {
        return [...this.grants];
    }

    public getAllRevocations(): AuthorityRevocation[] {
        return [...this.revocations];
    }
}

export const authorityLifecycleManager = new AuthorityLifecycleManager();
