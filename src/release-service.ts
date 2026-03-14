import { PrismaClient } from './generated/prisma';
import logger from './logger';

export class ReleaseService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Snapshots the current project state into a Release.
     */
    async createRelease(projectId: string, version: string, createdBy: string) {
        // 1. Gather all ontology and policy components
        const entityTypes = await (this.prisma as any).entityType.findMany({ where: { projectId } });
        const policies = await (this.prisma as any).abacPolicy.findMany(); // System-wide for now
        const actions = await (this.prisma as any).aIPAction.findMany({ where: { projectId } });

        const payload = {
            entityTypes,
            policies,
            actions,
            timestamp: new Date().toISOString()
        };

        const release = await (this.prisma as any).projectRelease.create({
            data: {
                projectId,
                environment: 'STAGING',
                version,
                payload,
                createdBy
            }
        });

        logger.info({ releaseId: release.id, version }, 'Project release created in STAGING');
        return release;
    }

    /**
     * Promotes a release to a higher environment.
     */
    async promoteRelease(releaseId: string, targetEnvironment: string, promotedBy: string) {
        const sourceRelease = await (this.prisma as any).projectRelease.findUnique({
            where: { id: releaseId }
        });

        if (!sourceRelease) throw new Error('Source release not found');

        const promotedRelease = await (this.prisma as any).projectRelease.create({
            data: {
                projectId: sourceRelease.projectId,
                environment: targetEnvironment,
                version: sourceRelease.version,
                payload: sourceRelease.payload,
                createdBy: promotedBy
            }
        });

        logger.info({ releaseId: promotedRelease.id, targetEnvironment }, 'Release promoted successfully');
        return promotedRelease;
    }
}
