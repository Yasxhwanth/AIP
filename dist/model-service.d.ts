import { PrismaClient } from './generated/prisma';
export type ModelStatus = 'DRAFT' | 'SHADOW' | 'PRODUCTION' | 'DEPRECATED';
/**
 * ModelService — AI Governance & Lifecycle
 *
 * Manages model promotion and versioning with deep auditing.
 */
export declare class ModelService {
    private prisma;
    private audit;
    constructor(prisma: PrismaClient);
    /**
     * Promotes a model version to a new status.
     * Always creates a governance audit log entry.
     */
    updateVersionStatus(versionId: string, newStatus: ModelStatus, actor: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        version: number;
        modelDefinitionId: string;
        strategy: string;
        hyperparameters: import("./generated/prisma/runtime/client").JsonValue;
    }>;
}
//# sourceMappingURL=model-service.d.ts.map