import { PrismaClient } from './generated/prisma/client';
/**
 * Run inference for a specific model version against an entity.
 * Stores the result as an InferenceResult row.
 */
export declare function runInference(modelVersionId: string, logicalId: string, prisma: PrismaClient): Promise<{
    inferenceResultId: string;
    prediction: unknown;
    confidence: number | null;
}>;
/**
 * Find the PRODUCTION version of a model and run inference.
 */
export declare function runInferenceByModel(modelDefinitionId: string, logicalId: string, prisma: PrismaClient): Promise<{
    inferenceResultId: string;
    prediction: unknown;
    confidence: number | null;
    modelVersionId: string;
}>;
/**
 * Run all PRODUCTION models that match an entity's type.
 */
export declare function runAllModelsForEntity(logicalId: string, prisma: PrismaClient): Promise<{
    model: string;
    version: number;
    prediction: unknown;
    confidence: number | null;
}[]>;
//# sourceMappingURL=inference-engine.d.ts.map