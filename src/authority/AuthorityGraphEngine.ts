import {
    AuthoritySnapshot,
    ResolvedPermission,
    AuthorityEdge,
    AuthorityEdgeType,
    AuthorityIntent,
    AuthorityConstraints
} from './authority-types';
import { authorityLifecycleManager } from './AuthorityLifecycleManager';

/**
 * Pure, read-only engine for resolving authority.
 * Traverses the authority graph to determine permissions at a specific point in time.
 */
export class AuthorityGraphEngine {
    /**
     * Resolves the authority snapshot for an actor at a specific time.
     */
    public resolveAuthoritySnapshot(
        actorId: string,
        tenantId: string,
        asOf: Date
    ): AuthoritySnapshot {
        const permissions: ResolvedPermission[] = [];
        let minExpiration = new Date(8640000000000000); // Max date

        // Recursive traversal
        const visitedNodes = new Set<string>();
        const queue = [actorId];

        while (queue.length > 0) {
            const currentNodeId = queue.shift()!;
            if (visitedNodes.has(currentNodeId)) continue;
            visitedNodes.add(currentNodeId);

            // Lazy load edges for the current node only
            const validEdges = authorityLifecycleManager.getIncomingEdges(currentNodeId, asOf);

            for (const edge of validEdges) {
                // If this is a DELEGATED edge (e.g. Membership), add the "from" node (Group) to queue
                // Note: Edge direction for delegation: Group -> User.
                // So if we are at User (toNodeId), we look for edges where toNodeId = User.
                // If type is DELEGATED, then fromNodeId is the Group. We should traverse to Group.
                if (edge.type === AuthorityEdgeType.DELEGATED) {
                    queue.push(edge.fromNodeId);
                }

                // Map edge intent to permission type
                let authType: ResolvedPermission['authority_type'] | undefined;

                switch (edge.intent) {
                    case AuthorityIntent.APPROVE_EXECUTION:
                    case AuthorityIntent.APPROVE_BUDGET:
                        authType = 'APPROVE';
                        break;
                    case AuthorityIntent.REQUEST_EXECUTION:
                    case AuthorityIntent.DECIDE_SCENARIO:
                        authType = 'EXECUTE'; // Mapping request/decide to execute for now
                        break;
                    case AuthorityIntent.VIEW_SENSITIVE:
                        authType = 'VIEW';
                        break;
                }

                if (authType) {
                    permissions.push({
                        authority_type: authType,
                        scope: {
                            action_definition_id: edge.scope?.operations?.[0], // Simplified mapping
                            resource_id: edge.scope?.targetIds?.[0],
                            tenant_id: tenantId // Implicitly scoped to tenant
                        },
                        constraints: edge.constraints,
                        granted_by_edge_id: edge.edgeId
                    });
                }

                if (edge.constraints.expiresAt) {
                    const exp = new Date(edge.constraints.expiresAt);
                    if (exp < minExpiration) {
                        minExpiration = exp;
                    }
                }
            }
        }

        // Bootstrap removed for Phase 31 enforcement.

        return {
            id: crypto.randomUUID(),
            actor_id: actorId,
            tenant_id: tenantId,
            valid_at: asOf.toISOString(),
            permissions: permissions,
            expires_at: minExpiration.toISOString()
        };
    }
}

export const authorityGraphEngine = new AuthorityGraphEngine();
