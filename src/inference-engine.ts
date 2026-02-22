import { PrismaClient, Prisma } from './generated/prisma/client';
import { evaluateExpression } from './computed-metrics';

// ── Types ────────────────────────────────────────────────────────

interface ThresholdConfig {
    field: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
}

interface AnomalyZScoreConfig {
    field: string;          // telemetry metric name
    lookbackMinutes: number; // how far back to compute mean/stddev
    zThreshold: number;     // z-score threshold (e.g., 2.0)
}

interface LinearRegressionConfig {
    weights: Record<string, number>; // { field: weight }
    bias: number;
}

interface CustomConfig {
    expression: string; // reuses computed-metrics parser
}

type Hyperparameters = ThresholdConfig | AnomalyZScoreConfig | LinearRegressionConfig | CustomConfig;

type StrategyFn = (
    input: Record<string, unknown>,
    hyperparameters: Hyperparameters,
    context: { logicalId: string; prisma: PrismaClient },
) => Promise<{ prediction: unknown; confidence: number | null }>;

// ── Strategy Registry ────────────────────────────────────────────

const strategies: Record<string, StrategyFn> = {
    /**
     * THRESHOLD — Simple threshold check.
     * hyperparameters: { field, operator, threshold }
     * Output: { anomaly: true/false, value, threshold }
     */
    THRESHOLD: async (input, params) => {
        const { field, operator, threshold } = params as ThresholdConfig;
        const value = input[field] as number;

        if (value === undefined || value === null) {
            return { prediction: { anomaly: false, error: `Field '${field}' not found` }, confidence: 0 };
        }

        let anomaly = false;
        switch (operator) {
            case '>': anomaly = value > threshold; break;
            case '<': anomaly = value < threshold; break;
            case '>=': anomaly = value >= threshold; break;
            case '<=': anomaly = value <= threshold; break;
            case '==': anomaly = value === threshold; break;
            case '!=': anomaly = value !== threshold; break;
        }

        const distance = Math.abs(value - threshold);
        const confidence = anomaly ? Math.min(distance / threshold, 1.0) : 1.0 - Math.min(distance / threshold, 1.0);

        return {
            prediction: { anomaly, value, threshold, operator },
            confidence: Math.round(confidence * 100) / 100,
        };
    },

    /**
     * ANOMALY_ZSCORE — Z-score anomaly detection from recent telemetry.
     * hyperparameters: { field, lookbackMinutes, zThreshold }
     */
    ANOMALY_ZSCORE: async (input, params, context) => {
        const { field, lookbackMinutes, zThreshold } = params as AnomalyZScoreConfig;
        const currentValue = input[field] as number;

        if (currentValue === undefined || currentValue === null) {
            return { prediction: { anomaly: false, error: `Field '${field}' not in input` }, confidence: 0 };
        }

        // Fetch recent telemetry data
        const since = new Date(Date.now() - lookbackMinutes * 60 * 1000);
        const recentData = await context.prisma.timeseriesMetric.findMany({
            where: {
                logicalId: context.logicalId,
                metric: field,
                timestamp: { gte: since },
            },
            select: { value: true },
        });

        if (recentData.length < 3) {
            return {
                prediction: { anomaly: false, insufficientData: true, dataPoints: recentData.length },
                confidence: 0,
            };
        }

        // Compute mean and standard deviation
        const values = recentData.map((d) => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
        const stddev = Math.sqrt(variance);

        if (stddev === 0) {
            return {
                prediction: { anomaly: currentValue !== mean, zScore: currentValue === mean ? 0 : Infinity, mean, stddev: 0 },
                confidence: currentValue === mean ? 1.0 : 0.9,
            };
        }

        const zScore = Math.abs((currentValue - mean) / stddev);
        const anomaly = zScore > zThreshold;
        const confidence = anomaly
            ? Math.min(zScore / (zThreshold * 2), 1.0)
            : 1.0 - (zScore / zThreshold);

        return {
            prediction: { anomaly, zScore: Math.round(zScore * 100) / 100, mean: Math.round(mean * 100) / 100, stddev: Math.round(stddev * 100) / 100, value: currentValue, zThreshold },
            confidence: Math.round(Math.max(0, confidence) * 100) / 100,
        };
    },

    /**
     * LINEAR_REGRESSION — Weighted sum of input fields.
     * hyperparameters: { weights: { field: weight }, bias }
     */
    LINEAR_REGRESSION: async (input, params) => {
        const { weights, bias } = params as LinearRegressionConfig;

        let prediction = bias;
        for (const [field, weight] of Object.entries(weights)) {
            const val = input[field] as number;
            if (val === undefined || val === null) {
                return {
                    prediction: { error: `Missing input field '${field}'` },
                    confidence: 0,
                };
            }
            prediction += val * weight;
        }

        return {
            prediction: { value: Math.round(prediction * 100) / 100, weights, bias },
            confidence: 0.85, // static confidence for simple linear model
        };
    },

    /**
     * CUSTOM — Evaluates a user-provided expression against input data.
     * hyperparameters: { expression }
     */
    CUSTOM: async (input, params) => {
        const { expression } = params as CustomConfig;

        try {
            const value = evaluateExpression(expression, input);
            return {
                prediction: { value: Math.round(value * 100) / 100, expression },
                confidence: 1.0,
            };
        } catch (error) {
            return {
                prediction: { error: String(error), expression },
                confidence: 0,
            };
        }
    },
};

// ── Input Gathering ──────────────────────────────────────────────

/**
 * Gathers input data for a model from the entity's current state
 * and optionally from recent telemetry.
 */
async function getModelInputs(
    logicalId: string,
    inputFields: string[],
    prisma: PrismaClient,
): Promise<Record<string, unknown>> {
    // Get current entity state from CQRS projection
    const currentState = await prisma.currentEntityState.findUnique({
        where: { logicalId },
    });

    const entityData = (currentState?.data ?? {}) as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const field of inputFields) {
        // First check entity state
        if (field in entityData) {
            result[field] = entityData[field];
            continue;
        }

        // Fall back to latest telemetry value
        const latest = await prisma.timeseriesMetric.findFirst({
            where: { logicalId, metric: field },
            orderBy: { timestamp: 'desc' },
        });

        if (latest) {
            result[field] = latest.value;
        }
    }

    return result;
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Run inference for a specific model version against an entity.
 * Stores the result as an InferenceResult row.
 */
export async function runInference(
    modelVersionId: string,
    logicalId: string,
    prisma: PrismaClient,
): Promise<{ inferenceResultId: string; prediction: unknown; confidence: number | null }> {
    // Load version + definition
    const version = await prisma.modelVersion.findUnique({
        where: { id: modelVersionId },
        include: { modelDefinition: true },
    });

    if (!version) throw new Error(`Model version '${modelVersionId}' not found`);

    const strategyFn = strategies[version.strategy];
    if (!strategyFn) throw new Error(`Unknown strategy '${version.strategy}'`);

    const inputFields = version.modelDefinition.inputFields as string[];
    const input = await getModelInputs(logicalId, inputFields, prisma);
    const hyperparameters = version.hyperparameters as unknown as Hyperparameters;

    const { prediction, confidence } = await strategyFn(input, hyperparameters, { logicalId, prisma });

    // Store result
    const result = await prisma.inferenceResult.create({
        data: {
            modelVersionId,
            logicalId,
            input: input as Prisma.InputJsonValue,
            output: prediction as Prisma.InputJsonValue,
            confidence,
        },
    });

    return { inferenceResultId: result.id, prediction, confidence };
}

/**
 * Find the PRODUCTION version of a model and run inference.
 */
export async function runInferenceByModel(
    modelDefinitionId: string,
    logicalId: string,
    prisma: PrismaClient,
): Promise<{ inferenceResultId: string; prediction: unknown; confidence: number | null; modelVersionId: string }> {
    const productionVersion = await prisma.modelVersion.findFirst({
        where: { modelDefinitionId, status: 'PRODUCTION' },
        orderBy: { version: 'desc' },
    });

    if (!productionVersion) {
        throw new Error(`No PRODUCTION version found for model '${modelDefinitionId}'`);
    }

    const result = await runInference(productionVersion.id, logicalId, prisma);
    return { ...result, modelVersionId: productionVersion.id };
}

/**
 * Run all PRODUCTION models that match an entity's type.
 */
export async function runAllModelsForEntity(
    logicalId: string,
    prisma: PrismaClient,
): Promise<{ model: string; version: number; prediction: unknown; confidence: number | null }[]> {
    // Get entity type
    const entityState = await prisma.currentEntityState.findUnique({
        where: { logicalId },
    });

    if (!entityState) throw new Error(`No current state for '${logicalId}'`);

    // Find all models for this entity type with PRODUCTION versions
    const models = await prisma.modelDefinition.findMany({
        where: { entityTypeId: entityState.entityTypeId },
        include: {
            versions: {
                where: { status: 'PRODUCTION' },
                orderBy: { version: 'desc' },
                take: 1,
            },
        },
    });

    const results: { model: string; version: number; prediction: unknown; confidence: number | null }[] = [];

    for (const model of models) {
        const prodVersion = model.versions[0];
        if (!prodVersion) continue;

        try {
            const res = await runInference(prodVersion.id, logicalId, prisma);
            results.push({
                model: model.name,
                version: prodVersion.version,
                prediction: res.prediction,
                confidence: res.confidence,
            });
        } catch (err) {
            results.push({
                model: model.name,
                version: prodVersion.version,
                prediction: { error: String(err) },
                confidence: 0,
            });
        }
    }

    return results;
}
