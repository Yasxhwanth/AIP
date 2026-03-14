import { PrismaClient } from './generated/prisma';
import { AuditService } from './audit-service';
import logger from './logger';

export interface CreateChangeRequestArgs {
    projectId: string;
    resourceType: string;
    resourceId?: string;
    proposedChanges: any;
    createdBy: string;
    branchName?: string;
}

export class GovernanceService {
    private auditSvc: AuditService;

    constructor(private prisma: PrismaClient) {
        this.auditSvc = new AuditService(prisma);
    }

    /**
     * Submits a new proposal for platform change.
     */
    async createChangeRequest(args: CreateChangeRequestArgs) {
        const { projectId, resourceType, resourceId, proposedChanges, createdBy, branchName = 'main' } = args;

        // Fetch current state for diffing if available
        let currentState = null;
        if (resourceId) {
            // This logic varies by resourceType, simplified here
            currentState = await (this.prisma as any)[resourceType.toLowerCase()]?.findUnique({
                where: { id: resourceId }
            });
        }

        const cr = await (this.prisma as any).changeRequest.create({
            data: {
                projectId,
                resourceType,
                resourceId,
                proposedChanges,
                diff: AuditService.computeDiff(currentState, proposedChanges),
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
    async approveAndApply(crId: string, reviewedBy: string) {
        console.log(`[GovernanceService] approveAndApply starting for CR: ${crId}`);
        return await (this.prisma as any).$transaction(async (tx: any) => {
            console.log(`[GovernanceService] Transaction started`);
            const cr = await tx.changeRequest.findUnique({
                where: { id: crId }
            });
            console.log(`[GovernanceService] CR fetched: ${cr ? 'found' : 'not found'}`);

            if (!cr) throw new Error(`ChangeRequest '${crId}' not found`);
            if (cr.status !== 'DRAFT') throw new Error(`ChangeRequest is in status '${cr.status}' and cannot be approved.`);

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

            logger.info({ crId, resourceType: cr.resourceType }, 'Change request approved and applied');
            return updatedCr;
        }, { timeout: 10000 }); // 10s timeout to avoid forever hang
    }
}
