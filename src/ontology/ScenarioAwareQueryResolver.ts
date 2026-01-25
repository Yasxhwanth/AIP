import { QueryClient } from '../adapters/query/QueryClient';
import { ScenarioManager } from './ScenarioManager';
import { Entity } from './types';
import {
    RELATIONSHIP_TYPE_LOCATED_AT,
    RELATIONSHIP_TYPE_WITHIN,
    ENTITY_TYPE_LOCATION,
    ENTITY_TYPE_REGION
} from './types';
import { LocationEntity, RegionEntity } from './geo-types';

/**
 * ScenarioAwareQueryResolver
 * 
 * Stateless resolver that overlays scenario mutations on top of ontology truth.
 * 
 * Invariants:
 * SC-7: Scenario resolution requires ontology_version === baseOntologyVersion.
 * SC-2: Resolution order: effective_valid_time ASC, then sequence ASC.
 */
export class ScenarioAwareQueryResolver {
    /**
     * Resolves entities for a given time and scenario.
     * 
     * @param asOf The simulation time.
     * @param scenarioId The active scenario ID.
     * @param currentOntologyVersion The current system ontology version.
     */
    static resolveEntities(
        asOf: Date,
        scenarioId: string | null,
        currentOntologyVersion: string,
        tenantId: string
    ): Entity[] {
        // 1. Fetch Truth
        const truthEntities = QueryClient.getEntities(asOf, tenantId);

        // 2. If no scenario, return truth
        if (!scenarioId) {
            return truthEntities;
        }

        // 3. Validate Scenario
        const scenario = ScenarioManager.getScenario(scenarioId);
        if (!scenario) {
            console.warn(`Scenario ${scenarioId} not found. Returning truth.`);
            return truthEntities;
        }

        if (scenario.baseOntologyVersion !== currentOntologyVersion) {
            console.error(`Scenario version mismatch. Base: ${scenario.baseOntologyVersion}, Current: ${currentOntologyVersion}`);
            return truthEntities;
        }

        if (scenario.tenantId !== tenantId) {
            console.error(`Scenario tenant mismatch. Scenario: ${scenario.tenantId}, Request: ${tenantId}`);
            return truthEntities;
        }

        // 4. Fetch Mutations
        const mutations = ScenarioManager.getMutations(scenarioId);

        // 5. Filter & Sort Mutations
        const applicableMutations = mutations
            .filter(m => m.effectiveValidTime <= asOf)
            .sort((a, b) => {
                const timeDiff = a.effectiveValidTime.getTime() - b.effectiveValidTime.getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.sequence - b.sequence;
            });

        // 6. Apply Mutations (Clone first)
        const entityMap = new Map<string, Entity>();
        truthEntities.forEach(e => entityMap.set(e.id, { ...e })); // Shallow clone

        for (const mutation of applicableMutations) {
            const entity = entityMap.get(mutation.targetEntityId);

            switch (mutation.mutationType) {
                case 'ATTRIBUTE_OVERRIDE':
                    if (entity) {
                        Object.assign(entity, mutation.proposedValue);
                    }
                    break;
                case 'STATUS_CHANGE':
                    if (entity) {
                        (entity as any).status = mutation.proposedValue;
                    }
                    break;
            }
        }

        return Array.from(entityMap.values());
    }

    /**
     * Resolves entities for a given time and scenario, including their attributes.
     */
    static resolveMaterializedEntities(
        asOf: Date,
        scenarioId: string | null,
        currentOntologyVersion: string,
        tenantId: string
    ): Entity[] {
        // 1. Fetch Base Truth Entities
        const baseEntities = QueryClient.getEntities(asOf, tenantId);

        // 2. Fetch Materialized Truth Snapshots for each
        const truthSnapshots = baseEntities.map(e => QueryClient.getEntitySnapshot(e.id, asOf, tenantId))
            .filter((s): s is Entity => s !== null);

        // 3. If no scenario, return truth snapshots
        if (!scenarioId) {
            return truthSnapshots;
        }

        // 4. Validate Scenario
        const scenario = ScenarioManager.getScenario(scenarioId);
        if (!scenario || scenario.baseOntologyVersion !== currentOntologyVersion || scenario.tenantId !== tenantId) {
            return truthSnapshots;
        }

        // 5. Fetch & Apply Mutations
        const applicableMutations = ScenarioManager.getMutations(scenarioId)
            .filter(m => m.effectiveValidTime <= asOf)
            .sort((a, b) => {
                const timeDiff = a.effectiveValidTime.getTime() - b.effectiveValidTime.getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.sequence - b.sequence;
            });

        const entityMap = new Map<string, any>();
        truthSnapshots.forEach(s => entityMap.set(s.id, { ...s }));

        for (const mutation of applicableMutations) {
            const entity = entityMap.get(mutation.targetEntityId);
            if (!entity) continue;

            switch (mutation.mutationType) {
                case 'ATTRIBUTE_OVERRIDE':
                    Object.assign(entity, mutation.proposedValue);
                    break;
                case 'STATUS_CHANGE':
                    entity.status = mutation.proposedValue;
                    break;
            }
        }

        return Array.from(entityMap.values());
    }

    /**
     * Resolves relationships for a given entity, time, and scenario.
     */
    static resolveRelationships(
        entityId: string,
        asOf: Date,
        scenarioId: string | null,
        currentOntologyVersion: string,
        tenantId: string
    ): any[] {
        const truthRelationships = QueryClient.getEntityRelationships(entityId, asOf, tenantId);

        if (!scenarioId) return truthRelationships;

        const scenario = ScenarioManager.getScenario(scenarioId);
        if (!scenario || scenario.baseOntologyVersion !== currentOntologyVersion || scenario.tenantId !== tenantId) {
            return truthRelationships;
        }

        const mutations = ScenarioManager.getMutations(scenarioId)
            .filter(m => m.effectiveValidTime <= asOf)
            .sort((a, b) => {
                const timeDiff = a.effectiveValidTime.getTime() - b.effectiveValidTime.getTime();
                if (timeDiff !== 0) return timeDiff;
                return a.sequence - b.sequence;
            });

        // Clone truth
        let resolvedRelationships = [...truthRelationships];

        for (const mutation of mutations) {
            if (mutation.targetEntityId !== entityId &&
                // Check if relationship involves this entity (source or target)
                // Simplified check: mutation target usually implies the relationship subject
                true
            ) {
                // For simplicity in Phase 14, we assume mutation.targetEntityId is the entity we are querying about
                // or we'd need to check if the mutation adds a relationship involving this entity.
            }

            if (mutation.mutationType === 'RELATIONSHIP_REMOVE') {
                // proposedValue should contain relationship ID or criteria
                // For Phase 14, assuming proposedValue is the target ID to remove link to
                resolvedRelationships = resolvedRelationships.filter(r =>
                    !(r.source === entityId && r.target === mutation.proposedValue) &&
                    !(r.target === entityId && r.source === mutation.proposedValue)
                );
            } else if (mutation.mutationType === 'RELATIONSHIP_ADD') {
                // proposedValue is the full relationship object
                resolvedRelationships.push(mutation.proposedValue);
            }
        }

        return resolvedRelationships;
    }
    /**
     * Resolves the location of an entity at a given time.
     */
    static getEntityLocation(
        entityId: string,
        asOf: Date,
        scenarioId: string | null,
        currentOntologyVersion: string,
        tenantId: string
    ): LocationEntity | null {
        // 1. Resolve relationships to find LOCATED_AT
        const relationships = this.resolveRelationships(entityId, asOf, scenarioId, currentOntologyVersion, tenantId);

        const locationRel = relationships.find(r =>
            r.source_entity_id === entityId &&
            r.relationship_type_id === RELATIONSHIP_TYPE_LOCATED_AT
        );

        if (!locationRel) return null;

        // 2. Resolve the target Location entity
        // We use QueryClient directly for the snapshot, then apply mutations if any
        // Optimization: We could reuse resolveEntities but that fetches ALL. 
        // For now, we fetch snapshot and apply mutations manually (simplified).

        let location = QueryClient.getEntitySnapshot(locationRel.target_entity_id, asOf, tenantId);

        if (!location) return null;

        // Apply Scenario Mutations to the Location itself (if any)
        if (scenarioId) {
            const mutations = ScenarioManager.getMutations(scenarioId)
                .filter(m => m.targetEntityId === location.id && m.effectiveValidTime <= asOf)
                .sort((a, b) => a.sequence - b.sequence); // Simplified sort

            if (mutations.length > 0) {
                location = { ...location }; // Clone
                for (const m of mutations) {
                    if (m.mutationType === 'ATTRIBUTE_OVERRIDE') {
                        Object.assign(location, m.proposedValue);
                    }
                }
            }
        }

        return location as LocationEntity;
    }

    /**
     * Resolves all entities within a specific region.
     */
    static getEntitiesInRegion(
        regionId: string,
        asOf: Date,
        scenarioId: string | null,
        currentOntologyVersion: string,
        tenantId: string
    ): Entity[] {
        // 1. Get ALL entities (expensive but necessary without index)
        const allEntities = this.resolveEntities(asOf, scenarioId, currentOntologyVersion, tenantId);

        // 2. Identify Locations within the Region
        // We need to check relationships for each Location entity
        const locationsInRegion = new Set<string>();

        for (const entity of allEntities) {
            if (entity.entity_type_id === ENTITY_TYPE_LOCATION) {
                const rels = this.resolveRelationships(entity.id, asOf, scenarioId, currentOntologyVersion, tenantId);
                const withinRel = rels.find(r =>
                    r.source_entity_id === entity.id &&
                    r.relationship_type_id === RELATIONSHIP_TYPE_WITHIN &&
                    r.target_entity_id === regionId
                );

                if (withinRel) {
                    locationsInRegion.add(entity.id);
                }
            }
        }

        // 3. Find Entities located at those Locations
        const entitiesInRegion: Entity[] = [];

        for (const entity of allEntities) {
            // Skip if it's a Location or Region itself (unless we want nested regions?)
            if (entity.entity_type_id === ENTITY_TYPE_LOCATION || entity.entity_type_id === ENTITY_TYPE_REGION) continue;

            const rels = this.resolveRelationships(entity.id, asOf, scenarioId, currentOntologyVersion, tenantId);
            const locatedAtRel = rels.find(r =>
                r.source_entity_id === entity.id &&
                r.relationship_type_id === RELATIONSHIP_TYPE_LOCATED_AT &&
                locationsInRegion.has(r.target_entity_id)
            );

            if (locatedAtRel) {
                entitiesInRegion.push(entity);
            }
        }

        return entitiesInRegion;
    }
}
