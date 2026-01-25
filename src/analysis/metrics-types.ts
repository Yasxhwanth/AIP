export interface BaseMetric {
  tenantId: string;
  asOf: Date;
  computed_at: Date;
}

export interface EntityCountMetrics extends BaseMetric {
  totalEntities: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface RiskDistributionMetrics extends BaseMetric {
  // Neutral buckets derived from existing entity attributes (e.g. status)
  buckets: Record<string, number>;
}

export interface AdmissionFlowMetrics extends BaseMetric {
  totalCases: number;
  byStatus: Record<string, number>;
}

export interface ExecutionOutcomeMetrics extends BaseMetric {
  totalIntents: number;
  byStatus: Record<string, number>;
  attemptsByMode: Record<string, number>;
  attemptsSuccess: number;
  attemptsFailure: number;
}

export interface DecisionVelocityPoint {
  bucketStart: Date;
  count: number;
}

export interface DecisionVelocityMetrics extends BaseMetric {
  windowHours: number;
  points: DecisionVelocityPoint[];
  totalDecisions: number;
}

export interface SemanticMetricResult extends BaseMetric {
  metric_id: string;
  name: string;
  display_name: string;
  value: number;
  unit?: string;
  trend?: number; // percentage change
  group_values?: Record<string, number>;
}

export interface OperationalMetricsSnapshot {
  tenantId: string;
  asOf: Date;
  computed_at: Date;
  entities: EntityCountMetrics;
  risk: RiskDistributionMetrics;
  admission: AdmissionFlowMetrics;
  execution: ExecutionOutcomeMetrics;
  decisions: DecisionVelocityMetrics;
  semantic_metrics?: SemanticMetricResult[];
}


