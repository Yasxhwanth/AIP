"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseService = void 0;
const logger_1 = __importDefault(require("./logger"));
class ReleaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Snapshots the current project state into a Release.
     */
    async createRelease(projectId, version, createdBy) {
        // 1. Gather all ontology and policy components
        const entityTypes = await this.prisma.entityType.findMany({ where: { projectId } });
        const policies = await this.prisma.abacPolicy.findMany(); // System-wide for now
        const actions = await this.prisma.aIPAction.findMany({ where: { projectId } });
        const payload = {
            entityTypes,
            policies,
            actions,
            timestamp: new Date().toISOString()
        };
        const release = await this.prisma.projectRelease.create({
            data: {
                projectId,
                environment: 'STAGING',
                version,
                payload,
                createdBy
            }
        });
        logger_1.default.info({ releaseId: release.id, version }, 'Project release created in STAGING');
        return release;
    }
    /**
     * Promotes a release to a higher environment.
     */
    async promoteRelease(releaseId, targetEnvironment, promotedBy) {
        const sourceRelease = await this.prisma.projectRelease.findUnique({
            where: { id: releaseId }
        });
        if (!sourceRelease)
            throw new Error('Source release not found');
        const promotedRelease = await this.prisma.projectRelease.create({
            data: {
                projectId: sourceRelease.projectId,
                environment: targetEnvironment,
                version: sourceRelease.version,
                payload: sourceRelease.payload,
                createdBy: promotedBy
            }
        });
        logger_1.default.info({ releaseId: promotedRelease.id, targetEnvironment }, 'Release promoted successfully');
        return promotedRelease;
    }
}
exports.ReleaseService = ReleaseService;
//# sourceMappingURL=release-service.js.map