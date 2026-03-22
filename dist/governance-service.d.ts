import { PrismaClient } from './generated/prisma';
export interface CreateChangeRequestArgs {
    projectId: string;
    resourceType: string;
    resourceId?: string;
    proposedChanges: any;
    createdBy: string;
    branchName?: string;
}
export declare class GovernanceService {
    private prisma;
    private auditSvc;
    constructor(prisma: PrismaClient);
    /**
     * Submits a new proposal for platform change.
     */
    createChangeRequest(args: CreateChangeRequestArgs): Promise<any>;
    /**
     * Approves and applies a change request.
     */
    approveAndApply(crId: string, reviewedBy: string): Promise<any>;
    /**
     * Rejects a change request with a reason.
     */
    rejectChangeRequest(crId: string, reviewedBy: string, reason: string): Promise<any>;
    /**
     * Lists change requests for a project.
     */
    listChangeRequests(projectId: string, status?: string): Promise<any>;
}
//# sourceMappingURL=governance-service.d.ts.map