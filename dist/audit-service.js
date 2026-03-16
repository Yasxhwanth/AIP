"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const logger_1 = __importDefault(require("./logger"));
class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Logs a platform action with high-fidelity state tracking.
     */
    async logAction(options) {
        const { actor, action, resourceType, resourceId, projectId, before, after, metadata } = options;
        try {
            const entry = await this.prisma.auditLog.create({
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
            logger_1.default.debug({ auditId: entry.id, action }, 'Audit log entry created');
            return entry;
        }
        catch (err) {
            logger_1.default.error({ err: err.message, action }, 'Failed to write audit log');
            // We don't throw here to avoid blocking mutations if audit logging fails, 
            // but in a strict compliance mode, we might want to fail the transaction.
        }
    }
    /**
     * Helper to compute a simple diff between two objects for visualization.
     */
    static computeDiff(before, after) {
        if (!before || !after)
            return null;
        const diff = {};
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
exports.AuditService = AuditService;
//# sourceMappingURL=audit-service.js.map