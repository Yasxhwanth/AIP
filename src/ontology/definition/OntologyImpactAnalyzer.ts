/**
 * =============================================================================
 * ONTOLOGY IMPACT ANALYZER
 * =============================================================================
 * 
 * Analyzes the impact of ontology changes on existing data and workflows.
 * 
 * INVARIANTS:
 * - Impact analysis is read-only
 * - No data migration logic
 * - No business assumptions
 * - Results are structured data only
 */

import { OntologyDiff } from './OntologyDiffEngine';
import { OntologyVersionId } from './ontology-definition-types';
import { ontologyStore } from '../OntologyStore';

export interface OntologyImpactAnalysis {
    diff: OntologyDiff;
    computed_at: Date;
    tenant_id: string;

    affected_entities: {
        object_type_id: string;
        object_type_name: string;
        entity_count: number;
        impact_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING';
        impact_reasons: string[];
    }[];

    affected_workflows: {
        workflow_id: string;
        workflow_name: string;
        impact_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING';
        impact_reasons: string[];
    }[];

    affected_metrics: {
        metric_id: string;
        metric_name: string;
        impact_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING';
        impact_reasons: string[];
    }[];

    replay_compatibility: {
        is_compatible: boolean;
        incompatibility_reasons: string[];
    };

    migration_required: boolean;
    breaking_changes_count: number;
}

export class OntologyImpactAnalyzer {
    /**
     * Analyze impact of ontology diff on existing data and workflows.
     */
    public analyzeImpact(
        diff: OntologyDiff,
        tenantId: string
    ): OntologyImpactAnalysis {
        const affectedEntities = this.analyzeEntityImpact(diff, tenantId);
        const affectedWorkflows = this.analyzeWorkflowImpact(diff);
        const affectedMetrics = this.analyzeMetricImpact(diff);
        const replayCompatibility = this.analyzeReplayCompatibility(diff);

        const breakingChangesCount = [
            ...affectedEntities,
            ...affectedWorkflows,
            ...affectedMetrics
        ].filter(item => item.impact_level === 'BREAKING').length;

        const migrationRequired = breakingChangesCount > 0 ||
            diff.object_types.removed.length > 0 ||
            diff.attributes.removed.length > 0;

        return {
            diff,
            computed_at: new Date(),
            tenant_id: tenantId,
            affected_entities: affectedEntities,
            affected_workflows: affectedWorkflows,
            affected_metrics: affectedMetrics,
            replay_compatibility: replayCompatibility,
            migration_required: migrationRequired,
            breaking_changes_count: breakingChangesCount
        };
    }

    /**
     * Analyze entity impact.
     */
    private analyzeEntityImpact(diff: OntologyDiff, tenantId: string) {
        const impacts: OntologyImpactAnalysis['affected_entities'] = [];

        // Analyze removed object types
        for (const removedType of diff.object_types.removed) {
            const asOf = new Date();
            const entities = ontologyStore.getEntities(asOf, tenantId)
                .filter(e => e.entity_type_id === (removedType.id as any));
            if (entities.length > 0) {
                impacts.push({
                    object_type_id: removedType.id,
                    object_type_name: removedType.name,
                    entity_count: entities.length,
                    impact_level: 'BREAKING',
                    impact_reasons: [`Object type removed with ${entities.length} existing entities`]
                });
            }
        }

        // Analyze modified attributes
        for (const attrMod of diff.attributes.modified) {
            const impactReasons: string[] = [];
            let impactLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING' = 'NONE';

            for (const change of attrMod.changes) {
                if (change.field_name === 'data_type') {
                    impactLevel = 'BREAKING';
                    impactReasons.push(`Attribute data type changed from ${change.old_value} to ${change.new_value}`);
                }
                if (change.field_name === 'is_required' && change.new_value === true) {
                    impactLevel = 'HIGH';
                    impactReasons.push(`Attribute became required`);
                }
                if (change.field_name === 'is_unique' && change.new_value === true) {
                    impactLevel = 'HIGH';
                    impactReasons.push(`Attribute became unique`);
                }
            }

            if (impactLevel !== 'NONE') {
                const asOf = new Date();
                const entities = ontologyStore.getEntities(asOf, tenantId)
                    .filter(e => e.entity_type_id === (attrMod.object_type_id as any));
                impacts.push({
                    object_type_id: attrMod.object_type_id,
                    object_type_name: attrMod.name,
                    entity_count: entities.length,
                    impact_level: impactLevel,
                    impact_reasons: impactReasons
                });
            }
        }

        return impacts;
    }

    /**
     * Analyze workflow impact.
     */
    private analyzeWorkflowImpact(diff: OntologyDiff) {
        const impacts: OntologyImpactAnalysis['affected_workflows'] = [];

        // Workflow impact analysis would require WorkflowDefinitionStore
        // For now, return empty (no workflows analyzed)
        // Future: Check if workflows reference modified object types/attributes

        return impacts;
    }

    /**
     * Analyze metric impact.
     */
    private analyzeMetricImpact(diff: OntologyDiff) {
        const impacts: OntologyImpactAnalysis['affected_metrics'] = [];

        for (const removedMetric of diff.metrics.removed) {
            impacts.push({
                metric_id: removedMetric.id,
                metric_name: removedMetric.name,
                impact_level: 'HIGH',
                impact_reasons: ['Metric removed']
            });
        }

        for (const modifiedMetric of diff.metrics.modified) {
            const impactReasons: string[] = [];
            let impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BREAKING' = 'LOW';

            for (const change of modifiedMetric.changes) {
                if (change.field_name === 'aggregation_type') {
                    impactLevel = 'HIGH';
                    impactReasons.push(`Aggregation type changed from ${change.old_value} to ${change.new_value}`);
                }
                if (change.field_name === 'target_object_type_id') {
                    impactLevel = 'BREAKING';
                    impactReasons.push(`Target object type changed`);
                }
            }

            impacts.push({
                metric_id: modifiedMetric.metric_id,
                metric_name: modifiedMetric.name,
                impact_level: impactLevel,
                impact_reasons: impactReasons
            });
        }

        return impacts;
    }

    /**
     * Analyze replay compatibility.
     */
    private analyzeReplayCompatibility(diff: OntologyDiff) {
        const incompatibilityReasons: string[] = [];

        // Replay incompatible if object types removed
        if (diff.object_types.removed.length > 0) {
            incompatibilityReasons.push(
                `${diff.object_types.removed.length} object type(s) removed`
            );
        }

        // Replay incompatible if attributes removed
        if (diff.attributes.removed.length > 0) {
            incompatibilityReasons.push(
                `${diff.attributes.removed.length} attribute(s) removed`
            );
        }

        // Replay incompatible if attribute data types changed
        const dataTypeChanges = diff.attributes.modified.filter(mod =>
            mod.changes.some(c => c.field_name === 'data_type')
        );
        if (dataTypeChanges.length > 0) {
            incompatibilityReasons.push(
                `${dataTypeChanges.length} attribute(s) changed data type`
            );
        }

        return {
            is_compatible: incompatibilityReasons.length === 0,
            incompatibility_reasons: incompatibilityReasons
        };
    }
}

export const ontologyImpactAnalyzer = new OntologyImpactAnalyzer();
