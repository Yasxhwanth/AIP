import { PrismaClient } from './generated/prisma';
import logger from './logger';

export interface AuditLogOptions {
    actor: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    projectId?: string;
    before?: any;
    after?: any;
    metadata?: any;
}

export class AuditService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Logs a platform action with high-fidelity state tracking.
     */
    async logAction(options: AuditLogOptions) {
        const { actor, action, resourceType, resourceId, projectId, before, after, metadata } = options;

        try {
            const entry = await (this.prisma as any).auditLog.create({
                data: {
                    actor,
                    actorRole: metadata?.role || 'system',
                    action,
                    resourceType,
                    resourceId,
                    projectId,
                    before: before ? JSON.parse(JSON.stringify(before)) : null,
                    after: after ? JSON.parse(JSON.stringify(after)) : null,
                    metadata: {
                        ...metadata,
                        ip: metadata?.ip || '0.0.0.0',
                        userAgent: metadata?.userAgent || 'internal'
                    }
                }
            });

            logger.debug({ auditId: entry.id, action }, 'Audit log entry created');
            return entry;
        } catch (err: any) {
            logger.error({ err: err.message, action }, 'Failed to write audit log');
            // We don't throw here to avoid blocking mutations if audit logging fails, 
            // but in a strict compliance mode, we might want to fail the transaction.
        }
    }

    /**
     * Helper to compute a simple diff between two objects for visualization.
     */
    static computeDiff(before: any, after: any) {
        if (!before || !after) return null;
        const diff: any = {};
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

        for (const key of keys) {
            if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
                diff[key] = {
                    old: before[key],
                    new: after[key]
                };
            }
        }
        return Object.keys(diff).length > 0 ? diff : null;
    }
}
