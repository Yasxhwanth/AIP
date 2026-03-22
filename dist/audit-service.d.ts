import { PrismaClient } from './generated/prisma';
export interface AuditLogOptions {
    actor: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    projectId?: string;
    before?: any;
    after?: any;
    metadata?: any;
    explanation?: any;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Logs a platform action with high-fidelity state tracking.
     */
    logAction(options: AuditLogOptions): Promise<any>;
    /**
     * Helper to compute a simple diff between two objects for visualization.
     */
    static computeDiff(before: any, after: any): any;
    private static readonly SENSITIVE_FIELDS;
    /**
     * Recursively masks sensitive fields in an object.
     */
    private maskPII;
}
//# sourceMappingURL=audit-service.d.ts.map