import { PrismaClient } from './generated/prisma';
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
 * Run inference in "simulation" mode for What-If scenarios.
 * Takes explicit input data rather than fetching it, and does NOT
 * persist the result to the DB or record standard metrics.
 */
export declare function simulateInference(modelVersionId: string, simulatedInputs: Record<string, unknown>, prisma: PrismaClient): Promise<{
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
 * Run all PRODUCTION and SHADOW models that match an entity's type.
 */
export declare function runAllModelsForEntity(logicalId: string, prisma: PrismaClient): Promise<{
    model: string;
    version: number;
    prediction: unknown;
    confidence: number | null;
    status: string;
}[]>;
//# sourceMappingURL=inference-engine.d.ts.map