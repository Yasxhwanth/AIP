export type ActorType = 'HUMAN_USER' | 'SERVICE_ACCOUNT' | 'SYSTEM';

export interface Actor {
    id: string;
    tenant_id: string;
    type: ActorType;
    display_name: string;
    email?: string;
    is_active: boolean;
    created_at: number;
}

export interface Session {
    id: string;
    tenant_id: string;
    actor_id: string;
    issued_at: number;
    expires_at: number;
    revoked_at?: number;
}

export interface ActorContext {
    tenant_id: string;
    actor_id: string;
    session_id: string;
    actor_type: ActorType;
}
