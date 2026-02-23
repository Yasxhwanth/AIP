export interface EntityType {
    id: string;
    name: string;
    description?: string;
    version: number;
    attributes: AttributeDefinition[];
}

export interface AttributeDefinition {
    name: string;
    dataType: string;
    required: boolean;
    temporal: boolean;
}

export interface EntityInstance {
    id: string;
    logicalId: string;
    entityTypeId: string;
    created: string;
    attributes: Record<string, any>;
}

export interface RelationshipDefinition {
    id: string;
    name: string;
    sourceEntityTypeId: string;
    targetEntityTypeId: string;
    targetEntityName?: string;
}

export interface ModelDefinition {
    id: string;
    name: string;
    framework: string;
    description?: string;
    createdAt: string;
    versions?: ModelVersion[];
}

export interface ModelVersion {
    id: string;
    modelId: string;
    version: string;
    status: string;
    artifactUri: string;
    strategy?: string;
    hyperparameters?: Record<string, any>;
    createdAt: string;
}

export interface DataSource {
    id: string;
    name: string;
    type: string;
    status: string;
    lastSync?: string;
}

export interface IntegrationJob {
    id: string;
    name: string;
    sourceId: string;
    targetEntityTypeId: string;
    schedule: string;
    status: string;
}

export interface TelemetryRollup {
    id: string;
    logicalId: string;
    metric: string;
    windowStart: string;
    windowEnd: string;
    min: number;
    max: number;
    avg: number;
    count: number;
}

export interface TimeseriesMetric {
    id: string;
    logicalId: string;
    metric: string;
    value: number;
    timestamp: string;
}

export interface DecisionLog {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    logicalId?: string;
    decisionRule?: { name: string };
}

export interface InferenceResult {
    id: string;
    modelId: string;
    versionId: string;
    logicalId: string;
    predictions: Record<string, any>;
    confidence: number;
    createdAt: string;
}
