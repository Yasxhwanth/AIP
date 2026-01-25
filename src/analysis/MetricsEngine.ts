import { ontologyStore } from '../ontology/OntologyStore';
import { decisionManager } from '../decision/DecisionJournalManager';
import { executionManager } from '../execution/ExecutionManager';
import { truthAdmissionEngine } from '../ontology/admission/TruthAdmissionEngine';
import {
  AdmissionFlowMetrics,
  DecisionVelocityMetrics,
  EntityCountMetrics,
  ExecutionOutcomeMetrics,
  OperationalMetricsSnapshot,
  RiskDistributionMetrics,
  SemanticMetricResult,
} from './metrics-types';
import { AdmissionStatus } from '../ontology/admission/truth-admission-types';
import { ExecutionAttempt, ExecutionMode, ExecutionStatus } from '../execution/execution-types';
import { ontologySnapshotResolver } from '../ontology/definition/OntologySnapshotResolver';
import { MetricAggregationType, MetricDefinition } from '../ontology/definition/ontology-definition-types';
import { semanticQueryEngine } from '../ontology/query/SemanticQueryEngine';
import { Filter } from '../ontology/query/query-types';
import { ScenarioAwareQueryResolver } from '../ontology/ScenarioAwareQueryResolver';

export class MetricsEngine {
  /**
   * Compute a full operational metrics snapshot for a tenant at a given asOf time.
   *
   * Pure aggregation: reads from in-memory stores only, no writes or caching.
   */
  static computeOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot {
    const computed_at = new Date();

    const entitiesMetrics = this.computeEntityCounts(asOf, tenantId, computed_at);
    const riskMetrics = this.computeRiskDistribution(entitiesMetrics);
    const admissionMetrics = this.computeAdmissionFlow(asOf, tenantId, computed_at);
    const executionMetrics = this.computeExecutionOutcomes(asOf, tenantId, computed_at);
    const decisionMetrics = this.computeDecisionVelocity(asOf, tenantId, computed_at);
    const semanticMetrics = this.computeSemanticMetrics(asOf, tenantId, computed_at);

    return {
      tenantId,
      asOf,
      computed_at,
      entities: entitiesMetrics,
      risk: riskMetrics,
      admission: admissionMetrics,
      execution: executionMetrics,
      decisions: decisionMetrics,
      semantic_metrics: semanticMetrics,
    };
  }

  private static computeSemanticMetrics(asOf: Date, tenantId: string, computed_at: Date): SemanticMetricResult[] {
    // 1. Resolve active ontology snapshot
    const ontologySnapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
    if (!ontologySnapshot || !ontologySnapshot.metric_definitions) {
      return [];
    }

    // 2. Resolve all entities for the snapshot (considering scenario=null for now)
    const allEntities = ScenarioAwareQueryResolver.resolveMaterializedEntities(
      asOf,
      null,
      ontologySnapshot.ontology_version_id,
      tenantId
    );

    const metrics = Array.from(ontologySnapshot.metric_definitions.values());

    return metrics.map((metric: MetricDefinition) => {
      // 3. Filter entities for this metric's object type
      let targets = allEntities.filter(e => (e.entity_type_id as any) === (metric.target_object_type_id as any));

      // 4. Apply filter expression if present
      if (metric.filter_expression) {
        try {
          const filter: Filter = JSON.parse(metric.filter_expression);
          targets = targets.filter(e => semanticQueryEngine.evaluateFilter(e, filter));
        } catch (e) {
          console.warn(`[MetricsEngine] Failed to parse filter for metric ${metric.name}:`, e);
        }
      }

      // 5. Execute aggregation
      const value = this.executeAggregation(targets, metric, ontologySnapshot);

      return {
        tenantId,
        asOf,
        computed_at,
        metric_id: metric.id,
        name: metric.name,
        display_name: metric.display_name,
        value,
        unit: metric.unit || undefined,
        trend: 0, // Trend calculation requires historical comparison
      };
    });
  }

  private static executeAggregation(entities: any[], metric: MetricDefinition, snapshot: any): number {
    const getAttrName = (id?: any) => id ? snapshot.attributes.get(id)?.name : undefined;

    switch (metric.aggregation_type) {
      case MetricAggregationType.COUNT:
        return entities.length;

      case MetricAggregationType.SUM: {
        const attrName = getAttrName(metric.target_attribute_id);
        if (!attrName) return 0;
        return entities.reduce((sum, e) => sum + (Number(e[attrName]) || 0), 0);
      }

      case MetricAggregationType.AVG: {
        const attrName = getAttrName(metric.target_attribute_id);
        if (!attrName || entities.length === 0) return 0;
        const total = entities.reduce((sum, e) => sum + (Number(e[attrName]) || 0), 0);
        return total / entities.length;
      }

      case MetricAggregationType.MIN: {
        const attrName = getAttrName(metric.target_attribute_id);
        if (!attrName || entities.length === 0) return 0;
        return Math.min(...entities.map(e => Number(e[attrName]) || Infinity));
      }

      case MetricAggregationType.MAX: {
        const attrName = getAttrName(metric.target_attribute_id);
        if (!attrName || entities.length === 0) return 0;
        return Math.max(...entities.map(e => Number(e[attrName]) || -Infinity));
      }

      default:
        return 0;
    }
  }

  private static computeEntityCounts(asOf: Date, tenantId: string, computed_at: Date): EntityCountMetrics {
    const entities = ontologyStore.getEntities(asOf, tenantId);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    entities.forEach((e) => {
      byType[e.entity_type_id] = (byType[e.entity_type_id] || 0) + 1;
      // Status is derived from latest snapshot; if absent, treat as 'UNKNOWN'
      const status = (e as any).status || 'UNKNOWN';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      tenantId,
      asOf,
      computed_at,
      totalEntities: entities.length,
      byType,
      byStatus,
    };
  }

  private static computeRiskDistribution(entityMetrics: EntityCountMetrics): RiskDistributionMetrics {
    const { tenantId, asOf, computed_at, byStatus } = entityMetrics;

    // Neutral mapping: reuse status buckets directly for now.
    const buckets: Record<string, number> = { ...byStatus };

    return {
      tenantId,
      asOf,
      computed_at,
      buckets,
    };
  }

  private static computeAdmissionFlow(asOf: Date, tenantId: string, computed_at: Date): AdmissionFlowMetrics {
    const cases = truthAdmissionEngine.getAllCases().filter((c) => c.tenant_id === tenantId);

    const byStatus: Record<string, number> = {};
    cases.forEach((c) => {
      const statusKey = AdmissionStatus[c.status] || c.status;
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
    });

    return {
      tenantId,
      asOf,
      computed_at,
      totalCases: cases.length,
      byStatus,
    };
  }

  private static computeExecutionOutcomes(asOf: Date, tenantId: string, computed_at: Date): ExecutionOutcomeMetrics {
    const intents = executionManager.getAllIntents().filter((i) => i.tenantId === tenantId);
    const attempts = executionManager.getAllAttempts().filter(
      (a: ExecutionAttempt) => a.result.tenantId === tenantId,
    );

    const byStatus: Record<string, number> = {};
    intents.forEach((intent) => {
      const key = ExecutionStatus[intent.status] || intent.status;
      byStatus[key] = (byStatus[key] || 0) + 1;
    });

    const attemptsByMode: Record<string, number> = {};
    let attemptsSuccess = 0;
    let attemptsFailure = 0;

    attempts.forEach((attempt) => {
      const modeKey = ExecutionMode[attempt.mode] || attempt.mode;
      attemptsByMode[modeKey] = (attemptsByMode[modeKey] || 0) + 1;

      if (attempt.result.success) attemptsSuccess += 1;
      else attemptsFailure += 1;
    });

    return {
      tenantId,
      asOf,
      computed_at,
      totalIntents: intents.length,
      byStatus,
      attemptsByMode,
      attemptsSuccess,
      attemptsFailure,
    };
  }

  private static computeDecisionVelocity(asOf: Date, tenantId: string, computed_at: Date): DecisionVelocityMetrics {
    const windowHours = 24;
    const windowStart = new Date(asOf.getTime() - windowHours * 60 * 60 * 1000);

    const decisions = decisionManager
      .getAllDecisions()
      .filter((d) => d.tenantId === tenantId)
      .filter((d) => d.timestamp >= windowStart && d.timestamp <= asOf);

    const bucketMs = 60 * 60 * 1000; // 1 hour
    const buckets: Record<number, number> = {};

    decisions.forEach((d) => {
      const offset = d.timestamp.getTime() - windowStart.getTime();
      const bucketIndex = Math.floor(offset / bucketMs);
      buckets[bucketIndex] = (buckets[bucketIndex] || 0) + 1;
    });

    const points = Object.keys(buckets)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => a - b)
      .map((index) => ({
        bucketStart: new Date(windowStart.getTime() + index * bucketMs),
        count: buckets[index],
      }));

    return {
      tenantId,
      asOf,
      computed_at,
      windowHours,
      points,
      totalDecisions: decisions.length,
    };
  }
}


