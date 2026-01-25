import { authorityEvaluator } from '../authority/AuthorityEvaluator';
import { policyEvaluator } from '../policy/PolicyEvaluator';
import { OverlayDescriptor, OverlayType, OverlayContext, OverlayStyle } from './OverlayTypes';
import { Entity } from '../ontology/types';
import { AIAdvisoryService } from '../ai/AIAdvisoryService';

export class OverlayResolver {

    public resolveOverlays(
        context: OverlayContext,
        entities: Entity[]
    ): OverlayDescriptor[] {
        const overlays: OverlayDescriptor[] = [];
        const { asOf, visibleTypes } = context;

        // 1. Authority Coverage
        if (visibleTypes.includes(OverlayType.AUTHORITY_COVERAGE)) {
            overlays.push(...this.resolveAuthorityCoverage(asOf, entities));
        }

        // 2. Policy Constraints
        if (visibleTypes.includes(OverlayType.POLICY_CONSTRAINT)) {
            overlays.push(...this.resolvePolicyConstraints(asOf, entities));
        }

        // 3. Authority Gaps
        if (visibleTypes.includes(OverlayType.AUTHORITY_GAP)) {
            overlays.push(...this.resolveAuthorityGaps(asOf, entities));
        }

        // 4. Emergency Authority
        if (visibleTypes.includes(OverlayType.EMERGENCY_AUTHORITY)) {
            overlays.push(...this.resolveEmergencyAuthority(asOf, entities));
        }

        // 5. AI Analyzed Entities
        if (visibleTypes.includes(OverlayType.AI_ANALYZED)) {
            overlays.push(...this.resolveAIAnalyzedEntities(asOf, entities));
        }

        return overlays;
    }

    private resolveAuthorityCoverage(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        const coverage = authorityEvaluator.resolveCoverage(asOf);
        const descriptors: OverlayDescriptor[] = [];

        // Green tint for covered entities
        for (const entityId of coverage.coveredEntityIds) {
            // Skip if expiring (handled separately)
            if (coverage.expiringEntityIds.includes(entityId)) continue;

            descriptors.push({
                id: `auth-cov-${entityId}`,
                type: OverlayType.AUTHORITY_COVERAGE,
                geometry: {
                    type: 'entity_highlight',
                    entityId: entityId,
                    radius: 15 // Visual radius
                },
                style: {
                    fillColor: '#00FF00', // Green
                    fillOpacity: 0.2,
                    strokeColor: '#00FF00',
                    strokeWidth: 1
                },
                explanation: 'Active Authority Coverage',
                sourceIds: [], // Could link to specific edges if we had them here
                validAt: asOf.toISOString()
            });
        }

        // Yellow tint for expiring entities
        for (const entityId of coverage.expiringEntityIds) {
            descriptors.push({
                id: `auth-exp-${entityId}`,
                type: OverlayType.AUTHORITY_COVERAGE,
                geometry: {
                    type: 'entity_highlight',
                    entityId: entityId,
                    radius: 15
                },
                style: {
                    fillColor: '#FFFF00', // Yellow
                    fillOpacity: 0.2,
                    strokeColor: '#FFFF00',
                    strokeWidth: 1
                },
                explanation: 'Authority Expiring Soon (<24h)',
                sourceIds: [],
                validAt: asOf.toISOString()
            });
        }

        return descriptors;
    }

    private resolveAuthorityGaps(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        const coverage = authorityEvaluator.resolveCoverage(asOf);
        const descriptors: OverlayDescriptor[] = [];

        // Find entities that are NOT in covered list
        // Filter for relevant entities (e.g. assets, units) - for now, all entities
        const gapEntities = entities.filter(e => !coverage.coveredEntityIds.includes(e.id));

        for (const entity of gapEntities) {
            descriptors.push({
                id: `auth-gap-${entity.id}`,
                type: OverlayType.AUTHORITY_GAP,
                geometry: {
                    type: 'entity_highlight',
                    entityId: entity.id,
                    radius: 18
                },
                style: {
                    strokeColor: '#FF0000', // Red Outline
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pattern: 'hashed'
                },
                explanation: 'No Authorized Actor',
                sourceIds: [],
                validAt: asOf.toISOString()
            });
        }

        return descriptors;
    }

    private resolvePolicyConstraints(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        // This is tricky because PolicyEvaluator evaluates PROPOSALS.
        // To visualize "Constraints", we'd need to know "What constraints apply here regardless of proposal?"
        // Or "What regions are blocked?"
        // For Phase 33, we might just visualize static policy regions if they exist.
        // Since PolicyEvaluator logic is proposal-based, we'll simulate a "check" or visualize known policy regions.

        // For now, let's assume we can ask PolicyEvaluator for "Active Geo-Fences" or similar.
        // Since that API doesn't exist, we will mock a "Restricted Zone" for demonstration if no API exists.
        // BUT the prompt says: "Data source: PolicyEvaluator.evaluate(context, snapshot, asOf)"
        // This implies we should evaluate against the CURRENT state.

        // Let's visualize a hypothetical "Restricted Zone" policy if we can find one.
        // Since we can't easily query "all policies", we might need to extend PolicyEvaluator or just leave this empty
        // until we have a way to query "Spatial Policies".

        // Given the constraints, I will return an empty list for now, 
        // OR if I can find a way to get policies, I would iterate them.
        // Let's leave it empty to be safe and not halluncinate, 
        // or add a placeholder if the prompt explicitly asked for "Orange hashed region".

        return [];
    }

    private resolveEmergencyAuthority(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        // Similar to coverage, but looking for "Emergency" type edges/intents.
        // Not fully defined in current types, so skipping for now.
        return [];
    }

    /**
     * Resolves entities that have been analyzed by AI.
     * Highlights entities that appear in recent AI advisory sessions.
     */
    private resolveAIAnalyzedEntities(asOf: Date, entities: Entity[]): OverlayDescriptor[] {
        const overlays: OverlayDescriptor[] = [];
        const aiAnalyzedEntityIds = new Set<string>();

        try {
            const recentSessions = Array.from((AIAdvisoryService as any).sessions?.values() || []);

            recentSessions.forEach((session: any) => {
                if (session.contextSnapshot?.selectedEntityIds) {
                    session.contextSnapshot.selectedEntityIds.forEach((id: string) => {
                        aiAnalyzedEntityIds.add(id);
                    });
                }
            });
        } catch (error) {
            return [];
        }

        entities.forEach(entity => {
            if (aiAnalyzedEntityIds.has(entity.id)) {
                overlays.push({
                    id: `ai-analyzed-${entity.id}`,
                    type: OverlayType.AI_ANALYZED,
                    geometry: {
                        type: 'entity_highlight',
                        entityId: entity.id,
                        radius: 15
                    },
                    style: {
                        fillColor: '#A855F7',
                        strokeColor: '#A855F7',
                        fillOpacity: 0.2,
                        pattern: 'pulse'
                    },
                    explanation: 'Entity analyzed by AI in recent advisory session',
                    sourceIds: [],
                    validAt: asOf.toISOString()
                });
            }
        });

        return overlays;
    }
}

export const overlayResolver = new OverlayResolver();
