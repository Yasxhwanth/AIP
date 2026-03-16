import { PrismaClient } from './generated/prisma';
export declare class ReleaseService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Snapshots the current project state into a Release.
     */
    createRelease(projectId: string, version: string, createdBy: string): Promise<any>;
    /**
     * Promotes a release to a higher environment.
     */
    promoteRelease(releaseId: string, targetEnvironment: string, promotedBy: string): Promise<any>;
}
//# sourceMappingURL=release-service.d.ts.map