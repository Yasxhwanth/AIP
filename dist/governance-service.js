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
        console.log(`[GovernanceService] approveAndApply starting for CR: ${crId}`);
        return await this.prisma.$transaction(async (tx) => {
            console.log(`[GovernanceService] Transaction started`);
            const cr = await tx.changeRequest.findUnique({
                where: { id: crId }
            });
            console.log(`[GovernanceService] CR fetched: ${cr ? 'found' : 'not found'}`);
            if (!cr)
                throw new Error(`ChangeRequest '${crId}' not found`);
            if (cr.status !== 'DRAFT')
                throw new Error(`ChangeRequest is in status '${cr.status}' and cannot be approved.`);
            // 1. Update status
            console.log(`[GovernanceService] Updating CR status to APPROVED...`);
            const updatedCr = await tx.changeRequest.update({
                where: { id: crId },
                data: {
                    status: 'APPROVED',
                    reviewedBy,
                    reviewedAt: new Date()
                }
            });
            console.log(`[GovernanceService] CR updated.`);
            // 2. Write audit log via tx to avoid connection pool deadlock
            console.log(`[GovernanceService] Writing audit log...`);
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
                    metadata: { context: 'governance' }
                }
            });
            console.log(`[GovernanceService] Audit log written.`);
            logger_1.default.info({ crId, resourceType: cr.resourceType }, 'Change request approved and applied');
            return updatedCr;
        }, { timeout: 10000 }); // 10s timeout to avoid forever hang
    }
}
exports.GovernanceService = GovernanceService;
//# sourceMappingURL=governance-service.js.map