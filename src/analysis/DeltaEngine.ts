import {
    DeltaGraph,
    EntityDelta,
    MetricDelta,
    DeltaSummary,
    DeltaCategory,
    DeltaConfidence,
    MetricDefinition
} from './delta-types';
import { ScenarioAwareQueryResolver } from '../ontology/ScenarioAwareQueryResolver';
import { Entity } from '../ontology/types';

/**
 * DeltaEngine
 * 
 * Pure functional engine for comparing two scenario states.
 * 
 * Invariants:
 * - Deterministic: Same inputs -> Same output.
 * - Stateless: No internal caching or side effects.
 * - Reality-Aware: Treats null scenarioId as Reality (Scenario-0).
 */
export const DeltaEngine = {
    /**
     * Compares two scenarios (or reality) at a specific point in time.
     */
    compare: (context: {
        asOf: Date,
        leftScenarioId: string | null,
        rightScenarioId: string | null,
        ontologyVersion: string, // Required for resolver
        tenantId: string, // Required for tenant isolation
        metrics?: MetricDefinition[] // Optional metrics to evaluate
    }): DeltaGraph => {
        const { asOf, leftScenarioId, rightScenarioId, ontologyVersion, tenantId, metrics = [] } = context;
        const comparisonId = crypto.randomUUID(); // Unique ID for this specific run

        // 1. Resolve States
        const leftEntities = ScenarioAwareQueryResolver.resolveEntities(asOf, leftScenarioId, ontologyVersion, tenantId);
        const rightEntities = ScenarioAwareQueryResolver.resolveEntities(asOf, rightScenarioId, ontologyVersion, tenantId);

        // 2. Compute Entity Deltas
        const entityDeltas = computeEntityDeltas(leftEntities, rightEntities);

        // 3. Compute Metric Deltas
        const metricDeltas = computeMetricDeltas(leftEntities, rightEntities, metrics);

        // 4. Generate Summary
        const summary = generateSummary(entityDeltas, metricDeltas);

        return {
            comparisonId,
            context: {
                asOf,
                leftScenarioId,
                rightScenarioId
            },
            entities: entityDeltas,
            metrics: metricDeltas,
            summary
        };
    }
};

/**
 * Computes differences between two sets of entities.
 */
function computeEntityDeltas(leftEntities: Entity[], rightEntities: Entity[]): EntityDelta[] {
    const deltas: EntityDelta[] = [];
    const leftMap = new Map(leftEntities.map(e => [e.id, e]));
    const rightMap = new Map(rightEntities.map(e => [e.id, e]));

    const allIds = new Set([...leftMap.keys(), ...rightMap.keys()]);

    for (const id of allIds) {
        const left = leftMap.get(id);
        const right = rightMap.get(id);

        if (!left && right) {
            // Added Entity (Technically a state change from null)
            deltas.push({
                entityId: id,
                entityType: right.entity_type_id,
                attribute: 'LIFECYCLE',
                category: 'STATE_CHANGE',
                leftValue: null,
                rightValue: 'EXISTING',
                deltaValue: 'CREATED',
                confidence: 'HIGH',
                source: 'DIRECT'
            });
        } else if (left && !right) {
            // Removed Entity
            deltas.push({
                entityId: id,
                entityType: left.entity_type_id,
                attribute: 'LIFECYCLE',
                category: 'STATE_CHANGE',
                leftValue: 'EXISTING',
                rightValue: null,
                deltaValue: 'DELETED',
                confidence: 'HIGH',
                source: 'DIRECT'
            });
        } else if (left && right) {
            // Compare Attributes
            // In a real system, we would iterate over schema-defined attributes.
            // Here we do a shallow comparison of properties.
            const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

            for (const key of keys) {
                if (key === 'id' || key === 'entity_type_id') continue; // Skip identity fields

                const lVal = (left as any)[key];
                const rVal = (right as any)[key];

                if (lVal !== rVal) {
                    let category: DeltaCategory = 'STATE_CHANGE';
                    let confidence: DeltaConfidence = 'HIGH';

                    // Heuristic for category/confidence based on key/value type
                    if (typeof lVal === 'number' && typeof rVal === 'number') {
                        category = 'QUANTITY_CHANGE';
                        confidence = 'HIGH'; // Direct attribute change is high confidence
                    } else if (key === 'status') {
                        category = 'STATE_CHANGE';
                        confidence = 'HIGH';
                    }

                    deltas.push({
                        entityId: id,
                        entityType: left.entity_type_id,
                        attribute: key,
                        category,
                        leftValue: lVal,
                        rightValue: rVal,
                        deltaValue: typeof rVal === 'number' && typeof lVal === 'number' ? rVal - lVal : 'CHANGED',
                        confidence,
                        source: 'DIRECT'
                    });
                }
            }
        }
    }

    return deltas;
}

/**
 * Computes differences in calculated metrics.
 */
function computeMetricDeltas(leftEntities: Entity[], rightEntities: Entity[], metrics: MetricDefinition[]): MetricDelta[] {
    return metrics.map(metric => {
        const leftVal = metric.calculate(leftEntities);
        const rightVal = metric.calculate(rightEntities);
        const delta = rightVal - leftVal;
        const percentChange = leftVal !== 0 ? (delta / leftVal) * 100 : (delta === 0 ? 0 : 100);

        return {
            metricId: metric.metricId,
            name: metric.name,
            category: 'METRIC_CHANGE',
            leftValue: leftVal,
            rightValue: rightVal,
            deltaValue: delta,
            percentChange,
            confidence: 'MEDIUM', // Metrics are derived
            unit: metric.unit
        };
    });
}

/**
 * Generates summary statistics for the delta graph.
 */
function generateSummary(entityDeltas: EntityDelta[], metricDeltas: MetricDelta[]): DeltaSummary {
    const totalEntitiesChanged = new Set(entityDeltas.map(d => d.entityId)).size;
    const totalMetricsChanged = metricDeltas.filter(m => m.deltaValue !== 0).length;

    // Determine dominant categories
    const categoryCounts = new Map<DeltaCategory, number>();
    [...entityDeltas, ...metricDeltas].forEach(d => {
        categoryCounts.set(d.category, (categoryCounts.get(d.category) || 0) + 1);
    });

    const dominantDeltaCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

    return {
        totalEntitiesChanged,
        totalMetricsChanged,
        dominantDeltaCategories
    };
}
