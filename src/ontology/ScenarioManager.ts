import { ScenarioBranch, ScenarioMutation, MutationType, ConflictReport, ScenarioPromotion } from './scenario-types';
import { mutationEngine } from './MutationEngine';
import { ontologyStore } from './OntologyStore';
import { MutationType as TruthMutationType } from './types';

/**
 * ScenarioManager
 * 
 * Manages the lifecycle of scenario branches and mutations.
 * In-memory implementation for Phase 14.
 * 
 * Invariants:
 * SC-1: Mutations are append-only.
 * SC-2: Sequence is monotonic.
 */
export class ScenarioManager {
    private static scenarios: Map<string, ScenarioBranch> = new Map();
    private static mutations: Map<string, ScenarioMutation[]> = new Map();
    private static sequenceCounters: Map<string, number> = new Map();
    private static promotions: ScenarioPromotion[] = [];

    static createScenario(
        baseAsOfTime: Date,
        baseOntologyVersion: string,
        createdBy: string,
        description: string,
        tenantId: string
    ): ScenarioBranch {
        const scenarioId = `SCN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const branch: ScenarioBranch = {
            scenarioId,
            tenantId,
            baseAsOfTime,
            baseOntologyVersion,
            createdBy,
            createdAt: new Date(),
            description,
            status: 'ACTIVE'
        };

        this.scenarios.set(scenarioId, branch);
        this.mutations.set(scenarioId, []);
        this.sequenceCounters.set(scenarioId, 0);

        return branch;
    }

    static addMutation(
        scenarioId: string,
        targetEntityId: string,
        mutationType: MutationType,
        proposedValue: any,
        effectiveValidTime: Date
    ): ScenarioMutation {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

        const currentSeq = this.sequenceCounters.get(scenarioId) || 0;
        const nextSeq = currentSeq + 1;
        this.sequenceCounters.set(scenarioId, nextSeq);

        const mutation: ScenarioMutation = {
            mutationId: `MUT-${Date.now()}-${nextSeq}`,
            scenarioId,
            sequence: nextSeq,
            targetEntityId,
            mutationType,
            proposedValue,
            effectiveValidTime,
            createdAt: new Date()
        };

        const scenarioMutations = this.mutations.get(scenarioId) || [];
        scenarioMutations.push(mutation);
        this.mutations.set(scenarioId, scenarioMutations);

        return mutation;
    }

    /**
     * Detects conflicts between scenario mutations and current truth.
     * Simple version: checks if the target entity has been modified in truth since the branch was created.
     */
    static detectConflicts(scenarioId: string): ConflictReport {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

        const mutations = this.mutations.get(scenarioId) || [];
        const report: ConflictReport = {
            scenarioId,
            generatedAt: new Date(),
            conflicts: []
        };

        // For each mutation, check if the truth has changed
        const checkedEntities = new Set<string>();

        for (const mutation of mutations) {
            if (checkedEntities.has(mutation.targetEntityId)) continue;
            checkedEntities.add(mutation.targetEntityId);

            const truthSnapshot = ontologyStore.getEntitySnapshot(mutation.targetEntityId, new Date(), scenario.tenantId);
            if (!truthSnapshot) continue;

            // If truth version is newer than base version, it's a potential conflict
            // In this in-memory mock, we'll check if truth updated_at > scenario created_at
            if (truthSnapshot.updated_at > scenario.createdAt) {
                report.conflicts.push({
                    entityId: mutation.targetEntityId,
                    scenarioValue: mutation.proposedValue,
                    truthValue: truthSnapshot, // Simplified
                    conflictType: 'VERSION_MISMATCH'
                });
            }
        }

        return report;
    }

    /**
     * Promotes scenario mutations to truth.
     * This is a "Merge" operation.
     */
    static promoteScenario(scenarioId: string, actorId: string): ScenarioPromotion {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);
        if (scenario.status === 'PROMOTED') throw new Error(`Scenario ${scenarioId} already promoted`);

        const mutations = this.mutations.get(scenarioId) || [];

        // Apply each mutation to the Truth via MutationEngine
        for (const m of mutations) {
            let truthMutationType: TruthMutationType;

            switch (m.mutationType) {
                case 'ATTRIBUTE_OVERRIDE':
                    truthMutationType = TruthMutationType.UPDATE_ATTRIBUTE;
                    // proposedValue for ATTRIBUTE_OVERRIDE in scenario is { key: value }
                    // MutationEngine expects newValue and attribute_definition_id
                    Object.entries(m.proposedValue).forEach(([attrId, val]) => {
                        mutationEngine.applyMutation({
                            type: truthMutationType,
                            tenant_id: scenario.tenantId,
                            entity_id: m.targetEntityId as any,
                            attribute_definition_id: attrId as any,
                            newValue: val,
                            metadata: { promotedFromScenario: scenarioId }
                        });
                    });
                    break;
                case 'STATUS_CHANGE':
                    truthMutationType = TruthMutationType.UPDATE_ATTRIBUTE;
                    mutationEngine.applyMutation({
                        type: truthMutationType,
                        tenant_id: scenario.tenantId,
                        entity_id: m.targetEntityId as any,
                        attribute_definition_id: 'status' as any,
                        newValue: m.proposedValue,
                        metadata: { promotedFromScenario: scenarioId }
                    });
                    break;
                case 'RELATIONSHIP_ADD':
                    truthMutationType = TruthMutationType.CREATE_RELATIONSHIP;
                    mutationEngine.applyMutation({
                        type: truthMutationType,
                        tenant_id: scenario.tenantId,
                        relationship_type_id: m.proposedValue.relationship_type_id,
                        source_entity_id: m.proposedValue.source_entity_id,
                        target_entity_id: m.proposedValue.target_entity_id,
                        newValue: m.proposedValue.properties,
                        metadata: { promotedFromScenario: scenarioId }
                    });
                    break;
                case 'RELATIONSHIP_REMOVE':
                    truthMutationType = TruthMutationType.DELETE_RELATIONSHIP;
                    mutationEngine.applyMutation({
                        type: truthMutationType,
                        tenant_id: scenario.tenantId,
                        entity_id: m.proposedValue as any, // Assuming proposedValue is relId
                        metadata: { promotedFromScenario: scenarioId }
                    });
                    break;
            }
        }

        scenario.status = 'PROMOTED';

        const promotion: ScenarioPromotion = {
            promotionId: `PROM-${Date.now()}`,
            scenarioId,
            promotedBy: actorId,
            promotedAt: new Date(),
            mutationCount: mutations.length,
            targetOntologyVersion: scenario.baseOntologyVersion // Simplified
        };

        this.promotions.push(promotion);
        return promotion;
    }

    static getScenario(scenarioId: string): ScenarioBranch | undefined {
        return this.scenarios.get(scenarioId);
    }

    static getMutations(scenarioId: string): ScenarioMutation[] {
        return this.mutations.get(scenarioId) || [];
    }

    static getAllScenarios(): ScenarioBranch[] {
        return Array.from(this.scenarios.values());
    }
}
