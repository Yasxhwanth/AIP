"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const audit_service_1 = require("./audit-service");
const logger_1 = __importDefault(require("./logger"));
class GovernanceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.auditSvc = new audit_service_1.AuditService(prisma);
    }
    /**
     * Submits a new proposal for platform change.
     */
    async createChangeRequest(args) {
        const { projectId, resourceType, resourceId, proposedChanges, createdBy, branchName = 'main' } = args;
        // Fetch current state for diffing if available
        let currentState = null;
        if (resourceId) {
            // This logic varies by resourceType, simplified here
            currentState = await this.prisma[resourceType.toLowerCase()]?.findUnique({
                where: { id: resourceId }
            });
        }
        const cr = await this.prisma.changeRequest.create({
            data: {
                projectId,
                resourceType,
                resourceId,
                proposedChanges,
                diff: audit_service_1.AuditService.computeDiff(currentState, proposedChanges),
                branchName,
                status: 'DRAFT',
                createdBy
            }
        });
        await this.auditSvc.logAction({
            actor: createdBy,
            action: 'CREATE_CHANGE_REQUEST',
            resourceType: 'ChangeRequest',
            resourceId: cr.id,
            projectId,
            after: cr,
            metadata: { context: 'governance' }
        });
        return cr;
    }
    /**
     * Approves and applies a change request.
     */
    async approveAndApply(crId, reviewedBy) {
        logger_1.default.info({ crId, reviewedBy }, 'Approving and applying change request');
        return await this.prisma.$transaction(async (tx) => {
            const cr = await tx.changeRequest.findUnique({
                where: { id: crId }
            });
            if (!cr)
                throw new Error(`ChangeRequest '${crId}' not found`);
            if (cr.status !== 'DRAFT' && cr.status !== 'IN_REVIEW') {
                throw new Error(`ChangeRequest is in status '${cr.status}' and cannot be approved.`);
            }
            // 1. Apply the actual change to the resource
            const { resourceType, resourceId, proposedChanges, projectId } = cr;
            const modelName = resourceType.charAt(0).toLowerCase() + resourceType.slice(1);
            logger_1.default.info({ resourceType, resourceId, modelName }, 'Applying proposed changes to target resource');
            if (resourceId) {
                // UPDATE existing resource
                await tx[modelName].update({
                    where: { id: resourceId },
                    data: { ...proposedChanges, projectId } // Ensure projectId is preserved
                });
            }
            else {
                // CREATE new resource
                await tx[modelName].create({
                    data: { ...proposedChanges, projectId }
                });
            }
            // 2. Update CR status
            const updatedCr = await tx.changeRequest.update({
                where: { id: crId },
                data: {
                    status: 'APPROVED',
                    reviewedBy,
                    reviewedAt: new Date()
                }
            });
            // 3. Write audit log
            await tx.auditLog.create({
                data: {
                    actor: reviewedBy,
                    actorRole: 'admin',
                    action: 'APPROVE_CHANGE_REQUEST',
                    resourceType: 'ChangeRequest',
                    resourceId: crId,
                    projectId: cr.projectId,
                    before: cr,
                    after: updatedCr,
                    metadata: { context: 'governance', resourceType, resourceId }
                }
            });
            logger_1.default.info({ crId, resourceType }, 'Change request approved and applied successfully');
            return updatedCr;
        }, { timeout: 15000 });
    }
    /**
     * Rejects a change request with a reason.
     */
    async rejectChangeRequest(crId, reviewedBy, reason) {
        const updatedCr = await this.prisma.changeRequest.update({
            where: { id: crId },
            data: {
                status: 'REJECTED',
                reviewedBy,
                reviewedAt: new Date(),
                rejectionReason: reason
            }
        });
        await this.auditSvc.logAction({
            actor: reviewedBy,
            action: 'REJECT_CHANGE_REQUEST',
            resourceType: 'ChangeRequest',
            resourceId: crId,
            projectId: updatedCr.projectId,
            after: updatedCr,
            metadata: { context: 'governance', reason }
        });
        return updatedCr;
    }
    /**
     * Lists change requests for a project.
     */
    async listChangeRequests(projectId, status) {
        return await this.prisma.changeRequest.findMany({
            where: {
                projectId,
                ...(status ? { status } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.GovernanceService = GovernanceService;
//# sourceMappingURL=governance-service.js.map