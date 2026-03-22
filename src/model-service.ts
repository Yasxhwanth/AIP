import { PrismaClient } from './generated/prisma';
import { AuditService } from './audit-service';

export type ModelStatus = 'DRAFT' | 'SHADOW' | 'PRODUCTION' | 'DEPRECATED';

/**
 * ModelService — AI Governance & Lifecycle
 * 
 * Manages model promotion and versioning with deep auditing.
 */
export class ModelService {
    private audit: AuditService;

    constructor(private prisma: PrismaClient) {
        this.audit = new AuditService(prisma);
    }

    /**
     * Promotes a model version to a new status.
     * Always creates a governance audit log entry.
     */
    async updateVersionStatus(
        versionId: string,
        newStatus: ModelStatus,
        actor: string,
        reason: string
    ) {
        const version = await this.prisma.modelVersion.findUnique({
            where: { id: versionId },
            include: { modelDefinition: true }
        });

        if (!version) throw new Error(`Model version ${versionId} not found`);

        const beforeStatus = version.status;

        const updated = await this.prisma.modelVersion.update({
            where: { id: versionId },
            data: { status: newStatus }
        });

        // ── Deep Governance Audit ──
        await this.audit.logAction({
            actor,
            action: 'PROMOTE_MODEL_VERSION',
            resourceType: 'ModelVersion',
            resourceId: versionId,
            projectId: version.modelDefinition.projectId,
            before: { status: beforeStatus },
            after: { status: newStatus },
            explanation: {
                summary: `Model ${version.modelDefinition.name} v${version.version} promoted from ${beforeStatus} to ${newStatus}.`,
                justification: reason,
                timestamp: new Date()
            }
        });

        // If promoting to PRODUCTION, automatically demote current PRODUCTION models to DEPRECATED
        if (newStatus === 'PRODUCTION') {
            await this.prisma.modelVersion.updateMany({
                where: {
                    modelDefinitionId: version.modelDefinitionId,
                    status: 'PRODUCTION',
                    NOT: { id: versionId }
                },
                data: { status: 'DEPRECATED' }
            });
        }

        return updated;
    }
}
