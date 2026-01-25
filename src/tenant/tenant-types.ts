export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface Tenant {
    tenantId: string;
    name: string;
    status: TenantStatus;
    createdAt: Date;
    settings: {
        maxUsers: number;
        features: string[];
    };
}

export type TenantRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface TenantUser {
    userId: string;
    tenantId: string;
    email: string;
    role: TenantRole;
    status: 'ACTIVE' | 'INACTIVE';
    lastLogin?: Date;
}

export interface TenantContext {
    tenantId: string;
    userId: string;
    role: TenantRole;
    sessionId: string;
}
