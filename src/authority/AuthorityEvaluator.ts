import {
    AuthorityEdge,
    AuthorityEdgeType,
    AuthorityIntent,
    AuthorityNode,
    AuthorityNodeType,
    AuthorityStatus,
    DenialReasonCode,
    EvaluationRequest,
    EvaluationResult,
    AuthorityProofSnapshot,
    AuthorityConstraints,
    AuthorityScope
} from './authority-types';

export class AuthorityEvaluator {
    private nodes: Map<string, AuthorityNode> = new Map();
    private edges: AuthorityEdge[] = [];
    private readonly MAX_DELEGATION_DEPTH = 5;

    constructor() {
        // Initialize with some default data or leave empty
    }

    public addNode(node: AuthorityNode) {
        this.nodes.set(node.nodeId, node);
    }

    public addEdge(edge: AuthorityEdge) {
        this.edges.push(edge);
    }

    public getEdges(): AuthorityEdge[] {
        return [...this.edges];
    }

    public evaluate(request: EvaluationRequest): EvaluationResult {
        const { actorId, intentType, targetEntityId, context } = request;
        const evaluatedAt = new Date().toISOString();

        // 1. Check if actor exists
        const actor = this.nodes.get(actorId);
        if (!actor) {
            return this.deny(DenialReasonCode.NO_AUTHORITY_PATH, `Actor ${actorId} not found in authority graph`);
        }

        // 2. AI Safety Check: AI must have explicit delegation
        if (actor.type === AuthorityNodeType.AI) {
            // This is implicitly handled by the fact that we require edges.
        }

        // 3. Find path
        const proof = this.findAuthorityPath(actorId, request, 0);

        if (proof) {
            return {
                status: AuthorityStatus.ALLOWED,
                proof: {
                    evaluatedAt,
                    evaluatorVersion: '1.0.0',
                    ...proof
                }
            };
        }

        return this.deny(DenialReasonCode.NO_AUTHORITY_PATH, `No valid authority path found for ${intentType} on ${targetEntityId}`);
    }

    private findAuthorityPath(
        currentActorId: string,
        request: EvaluationRequest,
        depth: number
    ): Omit<AuthorityProofSnapshot, 'evaluatedAt' | 'evaluatorVersion'> | null {
        if (depth > this.MAX_DELEGATION_DEPTH) return null;

        // Get all active edges from this actor
        const activeEdges = this.edges.filter(e =>
            e.fromNodeId === currentActorId &&
            !e.revokedAt &&
            (!e.constraints.expiresAt || new Date(e.constraints.expiresAt) > new Date(request.context.asOf))
        );

        // 1. Check DIRECT edges
        for (const edge of activeEdges) {
            if (edge.type === AuthorityEdgeType.DIRECT && edge.intent === request.intentType) {
                if (this.matchesScope(edge, request) && this.passesConstraints(edge, request)) {
                    return {
                        matchedEdgeId: edge.edgeId,
                        constraintsChecked: edge.constraints
                    };
                }
            }
        }

        // 2. Check DELEGATED edges
        for (const edge of activeEdges) {
            if (edge.type === AuthorityEdgeType.DELEGATED && edge.intent === request.intentType) {
                // For delegation, we also need to check if the delegation ITSELF allows this scope/constraint
                if (this.matchesScope(edge, request) && this.passesConstraints(edge, request)) {
                    // Recurse to the delegatee
                    const delegateeProof = this.findAuthorityPath(edge.toNodeId, request, depth + 1);
                    if (delegateeProof) {
                        return {
                            matchedEdgeId: delegateeProof.matchedEdgeId, // The ultimate direct edge
                            delegationChainIds: [edge.edgeId, ...(delegateeProof.delegationChainIds || [])],
                            constraintsChecked: {
                                ...delegateeProof.constraintsChecked,
                                // We could merge constraints here if needed
                            }
                        };
                    }
                }
            }
        }

        return null;
    }

    private matchesScope(edge: AuthorityEdge, request: EvaluationRequest): boolean {
        const { targetEntityId, context } = request;
        const { scope } = edge;

        // 1. Direct Entity Match
        // If the edge explicitly points to the target entity, it is authorized.
        if (targetEntityId && edge.toNodeId === targetEntityId) return true;

        // 2. Scope Match
        // If no scope is defined, and it wasn't a direct match, then it does NOT apply.
        if (!scope) return false;

        // Check Scope Constraints
        if (scope.targetIds && targetEntityId) {
            if (!scope.targetIds.includes(targetEntityId)) return false;
        }

        if (scope.entityTypes && context.entityType) {
            if (!scope.entityTypes.includes(context.entityType)) return false;
        }

        if (scope.regions && context.region) {
            if (!scope.regions.includes(context.region)) return false;
        }

        // If all scope constraints passed, it's a match.
        return true;
    }

    private passesConstraints(edge: AuthorityEdge, request: EvaluationRequest): boolean {
        const { constraints } = edge;
        const { context } = request;

        if (constraints.maxCost !== undefined && context.cost !== undefined) {
            if (context.cost > constraints.maxCost) return false;
        }

        if (constraints.maxRisk !== undefined && context.riskScore !== undefined) {
            if (context.riskScore > constraints.maxRisk) return false;
        }

        if (constraints.timeWindow) {
            // TODO: Implement time window parsing/checking
            // For now, assume passed if format is complex
        }

        return true;
    }

    private deny(code: DenialReasonCode, message: string): EvaluationResult {
        return {
            status: AuthorityStatus.DENIED,
            reason: { code, message }
        };
    }
    public resolveCoverage(asOf: Date): {
        coveredEntityIds: string[];
        expiringEntityIds: string[]; // Expiring within 24 hours
        gapEntityIds: string[];
    } {
        const covered = new Set<string>();
        const expiring = new Set<string>();
        const gaps = new Set<string>();

        // 1. Identify all entities that are targets of valid authority edges
        // We iterate through all edges to find coverage
        const now = asOf.getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        for (const edge of this.edges) {
            // Check if edge is active
            if (edge.revokedAt && new Date(edge.revokedAt).getTime() <= now) continue;

            let expiresAtTime = Infinity;
            if (edge.constraints.expiresAt) {
                expiresAtTime = new Date(edge.constraints.expiresAt).getTime();
                if (expiresAtTime <= now) continue;
            }

            // Check scope for targets
            if (edge.scope?.targetIds) {
                for (const targetId of edge.scope.targetIds) {
                    covered.add(targetId);

                    // Check for expiration
                    if (expiresAtTime !== Infinity && (expiresAtTime - now) < oneDay) {
                        expiring.add(targetId);
                    }
                }
            }

            // Direct edge to node (if toNodeId is an entity, not an actor)
            // In this model, toNodeId is usually an actor (User/AI). 
            // But if we had edges directly to resources, we'd check that.
            // For now, we rely on Scope.targetIds.
        }

        // 2. Identify gaps (entities with NO coverage)
        // This requires knowing ALL entities. 
        // Since AuthorityEvaluator doesn't know about the Entity Store, 
        // we can only return what we know is covered. 
        // The OverlayResolver will have to intersect this with the full entity list to find gaps.

        return {
            coveredEntityIds: Array.from(covered),
            expiringEntityIds: Array.from(expiring),
            gapEntityIds: [] // To be filled by caller who knows all entities
        };
    }
}

export const authorityEvaluator = new AuthorityEvaluator();
