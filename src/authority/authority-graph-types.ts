
/**
 * =============================================================================
 * AUTHORITY GRAPH TYPES (Phase 30)
 * =============================================================================
 * 
 * Defines the graph-based authority model.
 * Authority is explicit, provable, and snapshot-based.
 */

export type AuthorityType = 'EXECUTE' | 'APPROVE' | 'DELEGATE';
export type AuthorityEdgeMode = 'DIRECT' | 'DELEGATED';

export interface AuthorityScope {
    action_definition_id?: string;
    workflow_id?: string;
    entity_type_id?: string;
}

export interface AuthorityNode {
    id: string;
    tenant_id: string;
    actor_id: string;
    authority_type: AuthorityType;
}

export interface AuthorityEdge {
    from_node_id: string;
    to_node_id: string;
    scope: AuthorityScope;
    mode: AuthorityEdgeMode;
    valid_from: Date;
    valid_to?: Date;
}

export interface ResolvedPermission {
    authority_type: 'EXECUTE' | 'APPROVE';
    scope: AuthorityScope;
    source: 'DIRECT' | 'DELEGATED';
}

export interface AuthoritySnapshot {
    id: string;
    tenant_id: string;
    actor_id: string;
    as_of: Date;
    permissions: ResolvedPermission[];
}
