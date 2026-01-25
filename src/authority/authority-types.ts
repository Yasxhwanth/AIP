
/**
 * =============================================================================
 * AUTHORITY GRAPH TYPES
 * Phase 18: Authority Graph & Bounded Autonomy
 * =============================================================================
 * 
 * Defines the core primitives for the graph-based authority model.
 * 
 * PRINCIPLES:
 * - No implicit authority.
 * - No wildcard permissions.
 * - Authority is a graph of explicit edges.
 * - Edges are either DIRECT or DELEGATED.
 * - All authority is time-bound and revocable.
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum AuthorityNodeType {
    HUMAN = 'HUMAN',
    TEAM = 'TEAM',
    SYSTEM = 'SYSTEM',
    AI = 'AI'
}

export enum AuthorityEdgeType {
    /** Direct authority granted to a node to perform an action on a resource */
    DIRECT = 'DIRECT',
    /** Authority to delegate permissions to others */
    DELEGATED = 'DELEGATED'
}

export enum AuthorityIntent {
    /** Authority to choose a scenario for execution */
    DECIDE_SCENARIO = 'DECIDE_SCENARIO',
    /** Authority to approve a budget expenditure */
    APPROVE_BUDGET = 'APPROVE_BUDGET',
    /** Authority to override a risk limit */
    OVERRIDE_RISK = 'OVERRIDE_RISK',
    /** Authority to view sensitive data */
    VIEW_SENSITIVE = 'VIEW_SENSITIVE',
    /** Authority to request execution of a decision */
    REQUEST_EXECUTION = 'REQUEST_EXECUTION',
    /** Authority to approve execution (Real Run) */
    APPROVE_EXECUTION = 'APPROVE_EXECUTION',
    /** Authority to approve a workflow task */
    APPROVE_WORKFLOW_TASK = 'APPROVE_WORKFLOW_TASK',
    /** Authority to delegate permissions */
    DELEGATE = 'DELEGATE'
}

export enum AuthorityStatus {
    ALLOWED = 'ALLOWED',
    DENIED = 'DENIED',
    ESCALATION_REQUIRED = 'ESCALATION_REQUIRED'
}

export enum DenialReasonCode {
    NO_AUTHORITY_PATH = 'NO_AUTHORITY_PATH',
    EXPIRED_AUTHORITY = 'EXPIRED_AUTHORITY',
    SCOPE_MISMATCH = 'SCOPE_MISMATCH',
    CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
    AI_UNAUTHORIZED = 'AI_UNAUTHORIZED',
    REVOKED_AUTHORITY = 'REVOKED_AUTHORITY'
}

// =============================================================================
// CORE GRAPH ELEMENTS
// =============================================================================

export interface AuthorityNode {
    nodeId: string;
    type: AuthorityNodeType;
    metadata?: Record<string, unknown>;
}

export interface AuthorityConstraints {
    /** ISO Date string for expiration */
    expiresAt?: string;
    /** Maximum cost allowed */
    maxCost?: number;
    /** Maximum risk score allowed */
    maxRisk?: number;
    /** Specific entity IDs this applies to (if empty, applies to scope) */
    entityIds?: string[];
    /** Time window for valid execution (e.g., "09:00-17:00") */
    timeWindow?: string;
}

export interface AuthorityScope {
    /** Specific entity IDs this authority applies to */
    targetIds?: string[];
    /** Entity types this authority applies to (e.g., "LogisticsHub") */
    entityTypes?: string[];
    /** Regions this authority applies to */
    regions?: string[];
    /** Specific operations allowed (if finer grained than Intent) */
    operations?: string[];
}

export interface AuthorityEdge {
    edgeId: string;
    fromNodeId: string;
    toNodeId: string; // Can be an Actor Node ID or a Resource/Action ID
    type: AuthorityEdgeType;
    /** The specific intent this edge grants */
    intent: AuthorityIntent;
    /** Scope defining where this authority applies */
    scope?: AuthorityScope;
    constraints: AuthorityConstraints;
    grantedAt: string; // ISO Date
    grantedBy: string; // Actor ID who granted this
    revokedAt?: string; // ISO Date if revoked
}

// =============================================================================
// EVALUATION TYPES
// =============================================================================

export interface EvaluationContext {
    asOf: Date;
    cost?: number;
    riskScore?: number;
    [key: string]: any;
}

export interface EvaluationRequest {
    actorId: string;
    intentType: AuthorityIntent;
    targetEntityId?: string; // The specific resource being acted upon
    context: EvaluationContext;
}

export interface AuthorityProofSnapshot {
    evaluatedAt: string; // ISO Date
    evaluatorVersion: string;
    /** The ID of the edge that directly authorized this */
    matchedEdgeId: string;
    /** The chain of delegation edges if applicable */
    delegationChainIds?: string[];
    /** The constraints that were checked and passed */
    constraintsChecked: AuthorityConstraints;
}

export interface DenialReason {
    code: DenialReasonCode;
    message: string;
    details?: Record<string, unknown>;
}

export interface EvaluationResult {
    status: AuthorityStatus;
    proof?: AuthorityProofSnapshot;
    reason?: DenialReason;
}

export interface ResolvedPermission {
    authority_type: 'EXECUTE' | 'APPROVE' | 'DELEGATE' | 'VIEW';
    scope: {
        action_definition_id?: string;
        resource_id?: string;
        tenant_id?: string;
    };
    constraints: AuthorityConstraints;
    granted_by_edge_id: string;
}

export interface AuthoritySnapshot {
    id: string;
    actor_id: string;
    tenant_id: string;
    valid_at: string; // ISO Date
    permissions: ResolvedPermission[];
    expires_at: string; // ISO Date (min of all valid_to)
}

// =============================================================================
// LIFECYCLE TYPES (Phase 31)
// =============================================================================

export enum AuthorityEventType {
    GRANT = 'GRANT',
    REVOKE = 'REVOKE',
    EXPIRE = 'EXPIRE'
}

export interface AuthorityGrant {
    grantId: string;
    fromNodeId: string;
    toNodeId: string;
    intent: AuthorityIntent;
    scope?: AuthorityScope;
    constraints: AuthorityConstraints;
    isEmergency: boolean;
    validFrom: string; // ISO Date
    validUntil?: string; // ISO Date (for emergency or temporary)
    createdBy: string;
    createdAt: string; // ISO Date
}

export interface AuthorityRevocation {
    revocationId: string;
    grantId: string;
    revokedBy: string;
    revokedAt: string; // ISO Date
    reason: string;
}

export interface AuthorityChangeEvent {
    eventId: string;
    eventType: AuthorityEventType;
    referenceId: string; // grantId or revocationId
    occurredAt: string; // ISO Date
    actorId: string;
    metadata?: Record<string, unknown>;
}
