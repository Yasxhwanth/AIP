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
    explanation?: any; // New for Stage 4
}

export class AuditService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Logs a platform action with high-fidelity state tracking.
     */
    async logAction(options: AuditLogOptions) {
        const { actor, action, resourceType, resourceId, projectId, before, after, metadata, explanation } = options;

        try {
            // Apply PII masking to before/after payloads
            const maskedBefore = before ? this.maskPII(before) : null;
            const maskedAfter = after ? this.maskPII(after) : null;

            const entry = await (this.prisma as any).auditLog.create({
                data: {
                    actor,
                    actorRole: metadata?.role || 'system',
                    action,
                    resourceType,
                    resourceId,
                    projectId,
                    before: maskedBefore ? JSON.parse(JSON.stringify(maskedBefore)) : null,
                    after: maskedAfter ? JSON.parse(JSON.stringify(maskedAfter)) : null,
                    explanation: explanation ? JSON.parse(JSON.stringify(explanation)) : null,
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

    private static readonly SENSITIVE_FIELDS = new Set([
        'email', 'password', 'token', 'apiKey', 'ssn', 'phone', 'secret',
        'address', 'creditCard', 'cvv', 'birthDate'
    ]);

    /**
     * Recursively masks sensitive fields in an object.
     */
    private maskPII(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.maskPII(item));
        }

        const maskedObj: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (AuditService.SENSITIVE_FIELDS.has(key.toLowerCase())) {
                maskedObj[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                maskedObj[key] = this.maskPII(value);
            } else {
                maskedObj[key] = value;
            }
        }
        return maskedObj;
    }
}
