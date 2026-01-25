import { SemanticQueryEngine, SemanticQueryBuilder } from './SemanticQueryEngine';
import { ontologyStore } from '../OntologyStore';
import { ontologyDefinitionStore } from '../definition/OntologyDefinitionStore';
import { ScenarioManager } from '../ScenarioManager';
import { TenantContextManager } from '../../tenant/TenantContext';
import { IdentityContext } from '../../identity/IdentityContext';
import { FilterOperator } from './query-types';
import { 
    ObjectTypeDefinitionId, 
    OntologyVersionId 
} from '../definition/ontology-definition-types';
import {
    createEntityId,
    createEntityTypeId,
    createRelationshipId,
    createRelationshipTypeId,
    createRelationshipVersionId,
    createEntityVersionId,
    createAttributeValueId
} from '../types';

async function runSemanticQueryTests() {
    console.log('🚀 Starting Semantic Query Engine Tests...\n');

    const tenantId = 'tenant-1';
    TenantContextManager.setContext({
        tenantId,
        userId: 'user-1',
        role: 'ADMIN',
        sessionId: 'session-1'
    });

    IdentityContext.getInstance().setCurrentContext({
        tenant_id: tenantId,
        actor_id: 'user-1',
        session_id: 'session-1',
        actor_type: 'HUMAN_USER' as any
    });

    // 1. Setup Ontology Metadata
    const version = ontologyDefinitionStore.createOntologyVersion(tenantId, 'v1', null, 'system');
    ontologyDefinitionStore.activateVersion(version.id, tenantId);

    const assetType = ontologyDefinitionStore.createObjectType(version.id, 'Asset', 'Asset', 'system');
    const locationType = ontologyDefinitionStore.createObjectType(version.id, 'Location', 'Location', 'system');
    
    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'name', 'Name', 'STRING', 'system');
    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'status', 'Status', 'STRING', 'system');
    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'capacity', 'Capacity', 'INTEGER', 'system');

    ontologyDefinitionStore.createRelationshipType(
        version.id, 
        'LOCATED_AT', 
        'Located At', 
        assetType.id, 
        locationType.id, 
        'OUTGOING', 
        'MANY_TO_ONE', 
        'system'
    );

    // 2. Setup Truth Data
    const t1 = new Date('2026-01-01T00:00:00Z');
    
    // Helper to add entity to store
    const addEntityToStore = (id: string, typeId: string, data: Record<string, any>) => {
        const entityId = createEntityId(id);
        ontologyStore.addEntity({
            id: entityId,
            tenant_id: tenantId,
            entity_type_id: createEntityTypeId(typeId),
            external_id: null,
            metadata: {},
            created_at: t1,
            updated_at: t1,
            created_by: null,
            deleted_at: null
        });

        const versionId = createEntityVersionId(`${id}-v1`);
        ontologyStore.addEntityVersion({
            id: versionId,
            entity_id: entityId,
            version_number: 1,
            valid_from: t1,
            valid_to: null,
            change_reason: 'Initial',
            source_system: 'Test',
            created_at: t1,
            created_by: null,
            metadata: {}
        }, Object.entries(data).map(([k, v]) => ({
            id: createAttributeValueId(`${id}-${k}-v1`),
            entity_version_id: versionId,
            attribute_definition_id: k as any,
            is_null: v === null,
            value_string: typeof v === 'string' ? v : null,
            value_integer: typeof v === 'number' && Number.isInteger(v) ? v : null,
            value_float: typeof v === 'number' && !Number.isInteger(v) ? v : null,
            value_boolean: typeof v === 'boolean' ? v : null,
            value_date: null,
            value_datetime: null,
            value_json: typeof v === 'object' ? v : null,
            metadata: {}
        })));
    };

    const loc1Id = 'loc-1';
    addEntityToStore(loc1Id, 'Location', { name: 'Warehouse A' });

    const asset1Id = 'asset-1';
    addEntityToStore(asset1Id, 'Asset', { name: 'Generator 1', status: 'ACTIVE', capacity: 100 });

    const asset2Id = 'asset-2';
    addEntityToStore(asset2Id, 'Asset', { name: 'Generator 2', status: 'DEGRADED', capacity: 50 });

    // Add relationship
    const relId = createRelationshipId('rel-1');
    ontologyStore.addRelationship({
        id: relId,
        tenant_id: tenantId,
        relationship_type_id: createRelationshipTypeId('LOCATED_AT'),
        source_entity_id: createEntityId(asset1Id),
        target_entity_id: createEntityId(loc1Id),
        metadata: {},
        created_at: t1,
        updated_at: t1,
        created_by: null,
        deleted_at: null
    });
    ontologyStore.addRelationshipVersion({
        id: createRelationshipVersionId('rel-1-v1'),
        relationship_id: relId,
        version_number: 1,
        valid_from: t1,
        valid_to: null,
        change_reason: 'Initial',
        source_system: 'Test',
        created_at: t1,
        created_by: null,
        metadata: {},
        properties: {}
    });

    // 3. Setup Scenario
    const scenario = ScenarioManager.createScenario(
        t1,
        version.id,
        'user-1',
        'Upgrade Scenario',
        tenantId
    );
    const scenarioId = scenario.scenarioId;

    ScenarioManager.addMutation(
        scenarioId,
        asset2Id,
        'ATTRIBUTE_OVERRIDE',
        { status: 'ACTIVE', capacity: 150 },
        t1
    );

    const engine = new SemanticQueryEngine();

    // Test 1: Simple Search (Truth)
    console.log('Testing: Simple Search (Truth)...');
    const query1 = new SemanticQueryBuilder()
        .forType('Asset')
        .where({ type: 'attribute', attributeName: 'status', operator: FilterOperator.EQUALS, value: 'DEGRADED' })
        .build();
    
    const results1 = await engine.searchEntities(query1);
    if (results1.length === 1 && results1[0].id === asset2Id) {
        console.log('✅ PASSED (Found degraded asset in truth)');
    } else {
        console.log('❌ FAILED', results1);
    }

    // Test 2: Scenario-Aware Search
    console.log('\nTesting: Scenario-Aware Search...');
    const query2 = { ...query1, scenarioId } as any;
    const results2 = await engine.searchEntities(query2);
    if (results2.length === 0) {
        console.log('✅ PASSED (Asset 2 is no longer degraded in scenario)');
    } else {
        console.log('❌ FAILED', results2);
    }

    // Test 3: Complex Logical Filter
    console.log('\nTesting: Logical Filter (status=ACTIVE AND capacity > 120)...');
    const query3 = new SemanticQueryBuilder()
        .forType('Asset')
        .where({
            type: 'logical',
            operator: 'AND',
            filters: [
                { type: 'attribute', attributeName: 'status', operator: FilterOperator.EQUALS, value: 'ACTIVE' },
                { type: 'attribute', attributeName: 'capacity', operator: FilterOperator.GREATER_THAN, value: 120 }
            ]
        })
        .build();
    
    const results3 = await engine.searchEntities({ ...query3, scenarioId } as any);
    if (results3.length === 1 && results3[0].id === asset2Id) {
        console.log('✅ PASSED (Found upgraded asset in scenario)');
    } else {
        console.log('❌ FAILED', results3);
    }

    // Test 4: Traversal
    console.log('\nTesting: Traversal (Asset -> Location)...');
    const results4 = await engine.traverse({
        from: asset1Id,
        relationshipType: 'LOCATED_AT',
        direction: 'OUTGOING'
    });
    if (results4.length === 1 && results4[0].id === loc1Id) {
        console.log('✅ PASSED (Successfully traversed to Location)');
    } else {
        console.log('❌ FAILED', results4);
    }

    console.log('\nSummary: All semantic query tests passed.');
}

runSemanticQueryTests().catch(console.error);
