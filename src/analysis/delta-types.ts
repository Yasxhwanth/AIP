/**
 * Delta Intelligence Types
 * 
 * Defines the structure for comparing scenarios and representing differences.
 * These types are for analysis only and do not affect the ontology truth.
 */

export type DeltaCategory =
    | 'STATE_CHANGE'       // e.g., STATUS: IN_TRANSIT -> DELAYED
    | 'QUANTITY_CHANGE'    // e.g., INVENTORY: 100 -> 80
    | 'RISK_CHANGE'        // e.g., RISK_SCORE: 0.1 -> 0.8
    | 'RELATIONSHIP_CHANGE'// e.g., LINK: HUB_A -> HUB_B (Added/Removed)
    | 'METRIC_CHANGE';     // e.g., TOTAL_COST: $1M -> $1.2M

export type DeltaConfidence =
    | 'HIGH'   // Direct attribute overrides, status changes
    | 'MEDIUM' // Relationship changes, deterministic metric calculations
    | 'LOW';   // Inferred risks, probabilistic projections

export type DeltaSource =
    | 'DIRECT'  // Explicit mutation in the scenario
    | 'DERIVED' // Calculated by the system (e.g., metrics)
    | 'INFERRED'; // AI or heuristic inference

export interface ScenarioComparison {
    comparisonId: string;
    baseAsOfTime: Date;
    leftScenarioId: string | null; // null = Reality (Scenario-0)
    rightScenarioId: string | null;
    createdBy: string;
    createdAt: Date;
}

export interface EntityDelta {
    entityId: string;
    entityType: string;
    attribute: string; // or 'RELATIONSHIP' or 'STATUS'
    category: DeltaCategory;
    leftValue: any;
    rightValue: any;
    deltaValue: any; // e.g., +10, "CHANGED", etc.
    confidence: DeltaConfidence;
    source: DeltaSource;
}

export interface MetricDelta {
    metricId: string;
    name: string;
    category: DeltaCategory;
    leftValue: number;
    rightValue: number;
    deltaValue: number; // right - left
    percentChange: number;
    confidence: DeltaConfidence;
    unit: string;
}

export interface DeltaSummary {
    totalEntitiesChanged: number;
    totalMetricsChanged: number;
    dominantDeltaCategories: DeltaCategory[];
}

export interface DeltaGraph {
    comparisonId: string;
    context: {
        asOf: Date;
        leftScenarioId: string | null;
        rightScenarioId: string | null;
    };
    entities: EntityDelta[];
    metrics: MetricDelta[];
    summary: DeltaSummary;
}

export interface MetricDefinition {
    metricId: string;
    name: string;
    description: string;
    unit: string;
    // In a real system, this would contain the calculation logic or query
    calculate: (entities: any[]) => number;
}
