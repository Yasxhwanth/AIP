/**
 * =============================================================================
 * SEMANTIC QUERY ENGINE
 * Phase 9 - Semantic Query Language
 * =============================================================================
 * 
 * Core engine for executing declarative ontology queries.
 * Supports filtering, sorting, pagination, and traversal.
 * Fully scenario-aware and temporal-aware.
 * 
 * INVARIANTS:
 * - Deterministic: same query, scenario, and time yields same results.
 * - Scenario-Aware: overlays scenario mutations on truth.
 * - Metadata-Driven: uses compiled ontology for type and relationship resolution.
 */

import { Entity, EntityId } from '../types';
import { 
    OntologyQueryService, 
    QueryBuilder 
} from './query-service';
import { 
    EntityQuery, 
    TraversalQuery, 
    Filter, 
    FilterOperator, 
    AttributeFilter, 
    LogicalFilter,
    SortOption
} from './query-types';
import { ScenarioAwareQueryResolver } from '../ScenarioAwareQueryResolver';
import { ontologySnapshotResolver } from '../definition/OntologySnapshotResolver';
import { TenantContextManager } from '../../tenant/TenantContext';

export class SemanticQueryEngine implements OntologyQueryService {
    
    /**
     * Searches for entities matching the given query criteria.
     */
    public async searchEntities(query: EntityQuery): Promise<Entity[]> {
        const tenantId = TenantContextManager.getContext().tenantId;
        const asOf = query.asOf || new Date();
        const scenarioId = (query as any).scenarioId || null;

        // 1. Resolve Active Ontology Version for this time
        const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
        const ontologyVersionId = snapshot.ontology_version_id;

        // 2. Resolve entities with scenario overlays (materialized with attributes)
        const allEntities = ScenarioAwareQueryResolver.resolveMaterializedEntities(
            asOf,
            scenarioId,
            ontologyVersionId,
            tenantId
        );

        // 3. Filter by type
        let filtered = allEntities.filter(e => e.entity_type_id === query.entityType);

        // 4. Apply attribute/logical filters
        if (query.filter) {
            filtered = filtered.filter(e => this.evaluateFilter(e, query.filter!));
        }

        // 5. Apply sorting
        if (query.sort && query.sort.length > 0) {
            filtered = this.applySorting(filtered, query.sort);
        }

        // 6. Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit !== undefined ? query.limit : filtered.length;
        
        return filtered.slice(offset, offset + limit);
    }

    /**
     * Traverses relationships from a starting entity.
     */
    public async traverse(query: TraversalQuery): Promise<Entity[]> {
        const tenantId = TenantContextManager.getContext().tenantId;
        const asOf = query.asOf || new Date();
        const scenarioId = (query as any).scenarioId || null;

        // 1. Resolve Active Ontology Version
        const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
        const ontologyVersionId = snapshot.ontology_version_id;

        // 2. Resolve relationships for the entity
        const relationships = ScenarioAwareQueryResolver.resolveRelationships(
            query.from,
            asOf,
            scenarioId,
            ontologyVersionId,
            tenantId
        );

        // 2. Filter relationships by type and direction
        const filteredRels = relationships.filter(r => {
            const matchesType = r.relationship_type_id === query.relationshipType;
            if (!matchesType) return false;

            if (query.direction === 'OUTGOING') return r.source_entity_id === query.from;
            if (query.direction === 'INGOING') return r.target_entity_id === query.from;
            return true;
        });

        // 3. Resolve target entities
        const targetIds = filteredRels.map(r => 
            r.source_entity_id === query.from ? r.target_entity_id : r.source_entity_id
        );

        // 4. Fetch target entity snapshots (with scenario overlays)
        const allEntities = ScenarioAwareQueryResolver.resolveMaterializedEntities(
            asOf,
            scenarioId,
            ontologyVersionId,
            tenantId
        );

        let targets = allEntities.filter(e => targetIds.includes(e.id));

        // 5. Apply target filter if provided
        if (query.targetFilter) {
            targets = targets.filter(e => this.evaluateFilter(e, query.targetFilter!));
        }

        return targets;
    }

    /**
     * Retrieves a single entity by its ID with optional temporal support.
     */
    public async getEntity(id: EntityId, asOf?: Date): Promise<Entity | null> {
        const tenantId = TenantContextManager.getContext().tenantId;
        const queryTime = asOf || new Date();
        
        const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(queryTime, tenantId);
        const ontologyVersionId = snapshot.ontology_version_id;

        const entities = ScenarioAwareQueryResolver.resolveMaterializedEntities(
            queryTime,
            null,
            ontologyVersionId,
            tenantId
        );

        return entities.find(e => e.id === id) || null;
    }

    /**
     * Counts the number of entities matching the given query criteria.
     */
    public async countEntities(query: Omit<EntityQuery, 'limit' | 'offset' | 'sort'>): Promise<number> {
        const results = await this.searchEntities(query as EntityQuery);
        return results.length;
    }

    /**
     * Evaluates a filter against an entity.
     */
    public evaluateFilter(entity: Entity, filter: Filter): boolean {
        if (filter.type === 'attribute') {
            return this.evaluateAttributeFilter(entity, filter);
        } else {
            return this.evaluateLogicalFilter(entity, filter);
        }
    }

    private evaluateAttributeFilter(entity: Entity, filter: AttributeFilter): boolean {
        const value = (entity as any)[filter.attributeName];
        const target = filter.value;

        switch (filter.operator) {
            case FilterOperator.EQUALS:
                return value === target;
            case FilterOperator.NOT_EQUALS:
                return value !== target;
            case FilterOperator.GREATER_THAN:
                return (value as any) > (target as any);
            case FilterOperator.LESS_THAN:
                return (value as any) < (target as any);
            case FilterOperator.GREATER_THAN_OR_EQUAL:
                return (value as any) >= (target as any);
            case FilterOperator.LESS_THAN_OR_EQUAL:
                return (value as any) <= (target as any);
            case FilterOperator.CONTAINS:
                return typeof value === 'string' && value.includes(target as string);
            case FilterOperator.STARTS_WITH:
                return typeof value === 'string' && value.startsWith(target as string);
            case FilterOperator.ENDS_WITH:
                return typeof value === 'string' && value.endsWith(target as string);
            case FilterOperator.IN:
                return Array.isArray(target) && target.includes(value);
            case FilterOperator.IS_NULL:
                return value === null || value === undefined;
            case FilterOperator.IS_NOT_NULL:
                return value !== null && value !== undefined;
            default:
                return false;
        }
    }

    private evaluateLogicalFilter(entity: Entity, filter: LogicalFilter): boolean {
        switch (filter.operator) {
            case 'AND':
                return filter.filters.every(f => this.evaluateFilter(entity, f));
            case 'OR':
                return filter.filters.some(f => this.evaluateFilter(entity, f));
            case 'NOT':
                return !this.evaluateFilter(entity, filter.filters[0]);
            default:
                return false;
        }
    }

    private applySorting(entities: Entity[], sort: SortOption[]): Entity[] {
        return [...entities].sort((a, b) => {
            for (const option of sort) {
                const valA = (a as any)[option.attributeName];
                const valB = (b as any)[option.attributeName];

                if (valA === valB) continue;

                const comparison = valA > valB ? 1 : -1;
                return option.direction === 'ASC' ? comparison : -comparison;
            }
            return 0;
        });
    }
}

export const semanticQueryEngine = new SemanticQueryEngine();

/**
 * Fluent builder implementation.
 */
export class SemanticQueryBuilder implements QueryBuilder {
    private query: EntityQuery = {
        entityType: '',
    };

    forType(entityType: string): this {
        this.query.entityType = entityType;
        return this;
    }

    where(filter: Filter): this {
        this.query.filter = filter;
        return this;
    }

    orderBy(attribute: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
        if (!this.query.sort) this.query.sort = [];
        this.query.sort.push({ attributeName: attribute, direction });
        return this;
    }

    limit(count: number): this {
        this.query.limit = count;
        return this;
    }

    offset(count: number): this {
        this.query.offset = count;
        return this;
    }

    asOf(time: Date): this {
        this.query.asOf = time;
        return this;
    }

    build(): EntityQuery {
        return { ...this.query };
    }
}
