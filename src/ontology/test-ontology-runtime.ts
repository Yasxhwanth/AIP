import { seedOntology } from './definition/seed-ontology';
import { ontologyStore } from './OntologyStore';
import { MetricsEngine } from '../analysis/MetricsEngine';
import { ontologySnapshotResolver } from './definition/OntologySnapshotResolver';
import { ontologyCompiler } from './definition/OntologyCompiler';
import { truthAdmissionEngine } from './admission/TruthAdmissionEngine';
import { relationshipAdmissionEngine } from './admission/RelationshipAdmissionEngine';
import { materializationEngine } from './materialization/TruthMaterializationEngine';
import { AdmissionDecision } from './admission/truth-admission-types';
import { EntityId } from './types';
import { MockLogin } from '../identity/MockLogin';
import { authorityLifecycleManager } from '../authority/AuthorityLifecycleManager';
import { AuthorityEdgeType, AuthorityIntent, AuthorityNodeType } from '../authority/authority-types';
import { authorityEvaluator } from '../authority/AuthorityEvaluator';

async function testOntologyRuntime() {
    console.log('--- STARTING ONTOLOGY RUNTIME TEST ---');
    const tenantId = 'test-tenant';
    const asOf = new Date();

    // 0. Setup Context
    const session = MockLogin.login(tenantId, 'system', 'System Test');
    
    // Grant Authority to 'system' user in Lifecycle (for RelationshipAdmission)
    console.log('0. Granting authority...');
    authorityLifecycleManager.grantAuthority(
        'admin-group',
        session.actor_id,
        AuthorityIntent.APPROVE_EXECUTION,
        { operations: ['*'] },
        {},
        session.actor_id
    );

    // Populate AuthorityEvaluator (for DecisionJournal)
    authorityEvaluator.addNode({
        nodeId: session.actor_id,
        type: AuthorityNodeType.HUMAN
    });
    authorityEvaluator.addEdge({
        edgeId: 'test-edge-1',
        fromNodeId: session.actor_id,
        toNodeId: 'admin-action',
        type: AuthorityEdgeType.DIRECT,
        intent: AuthorityIntent.DECIDE_SCENARIO,
        scope: { operations: ['*'] }, // Added scope
        constraints: {},
        grantedAt: new Date().toISOString(),
        grantedBy: 'root'
    });

    // 1. Seed Ontology
    console.log('1. Seeding ontology...');
    seedOntology(tenantId);
    
    const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
    console.log(`   - Resolved snapshot for version: ${snapshot.ontology_version_id}`);
    console.log(`   - Object Types: ${Array.from(snapshot.object_types.values()).map(t => t.name).join(', ')}`);

    // 2. Add Test Entities
    console.log('2. Adding test entities...');
    const assetType = snapshot.object_types_by_name.get('asset')!;
    const locType = snapshot.object_types_by_name.get('location')!;

    // Create a location
    const loc1Id = 'loc-1' as any;
    ontologyStore.addEntity({
        id: loc1Id,
        tenant_id: tenantId,
        entity_type_id: locType.id as any,
        external_id: null,
        created_at: asOf,
        updated_at: asOf,
        created_by: 'system' as any,
        deleted_at: null,
        metadata: {}
    });
    ontologyStore.addEntityVersion({
        id: 'loc-1-v1' as any,
        entity_id: loc1Id,
        version_number: 1,
        valid_from: asOf,
        valid_to: null,
        change_reason: 'initial',
        source_system: 'test',
        created_at: asOf,
        created_by: 'system' as any,
        metadata: {}
    }, [
        { id: 'attr-1' as any, entity_version_id: 'loc-1-v1' as any, attribute_definition_id: 'name' as any, value_string: 'Headquarters', is_null: false, metadata: {} } as any
    ]);

    // Create 3 assets (2 operational, 1 degraded)
    for (let i = 1; i <= 3; i++) {
        const id = `asset-${i}` as any;
        const status = i === 3 ? 'DEGRADED' : 'OPERATIONAL';
        ontologyStore.addEntity({
            id,
            tenant_id: tenantId,
            entity_type_id: assetType.id as any,
            external_id: null,
            created_at: asOf,
            updated_at: asOf,
            created_by: 'system' as any,
            deleted_at: null,
            metadata: {}
        });
        ontologyStore.addEntityVersion({
            id: `${id}-v1` as any,
            entity_id: id,
            version_number: 1,
            valid_from: asOf,
            valid_to: null,
            change_reason: 'initial',
            source_system: 'test',
            created_at: asOf,
            created_by: 'system' as any,
            metadata: {}
        }, [
            { id: `attr-${id}-name` as any, entity_version_id: `${id}-v1` as any, attribute_definition_id: 'name' as any, value_string: `Asset ${i}`, is_null: false, metadata: {} } as any,
            { id: `attr-${id}-status` as any, entity_version_id: `${id}-v1` as any, attribute_definition_id: 'status' as any, value_string: status, is_null: false, metadata: {} } as any
        ]);
    }

    // 3. Test Metrics
    console.log('3. Testing Metrics Engine...');
    const metrics = MetricsEngine.computeOperationalMetrics(asOf, tenantId);
    console.log(`   - Total Entities: ${metrics.entities.totalEntities}`);
    console.log(`   - Entities by Status:`, metrics.entities.byStatus);
    
    if (metrics.semantic_metrics) {
        console.log(`   - Semantic Metrics calculated: ${metrics.semantic_metrics.length}`);
        metrics.semantic_metrics.forEach(m => {
            console.log(`     - ${m.display_name}: ${m.value}`);
        });
    }

    // 4. Test UI Compilation
    console.log('4. Testing UI Compilation...');
    const compiled = ontologyCompiler.compile(snapshot);
    const assetUISchema = compiled.ui_schemas.get(assetType.id);
    console.log(`   - UI Schema for Asset: ${assetUISchema ? 'Found' : 'MISSING'}`);
    if (assetUISchema) {
        console.log(`   - Form Fields: ${assetUISchema.form_fields.length}`);
        console.log(`   - Detail Sections: ${assetUISchema.display_config.detail_view_sections.length}`);
    }

    // 5. Test Relationship Materialization
    console.log('5. Testing Relationship Materialization...');
    const relType = Array.from(snapshot.relationship_types.values()).find(r => r.name === 'asset_at_location')!;
    
    // Propose relationship (Asset 1 is at Location 1)
    const candidate = relationshipAdmissionEngine.createCandidate(
        tenantId,
        relType.id as any,
        'asset-1' as EntityId,
        loc1Id,
        { floor: 1 }
    );
    console.log(`   - Proposed relationship: ${candidate.id}`);

    // Create admission case
    const admissionCase = relationshipAdmissionEngine.createAdmissionCase(candidate);
    console.log(`   - Admission case created: ${admissionCase.id}`);

    // Approve & Materialize
    await relationshipAdmissionEngine.submitDecision(
        admissionCase.id,
        AdmissionDecision.APPROVED,
        'Looks good vro',
        session.actor_id
    );
    console.log(`   - Decision submitted: APPROVED`);

    const result = await materializationEngine.applyRelationshipAdmissionDecision(admissionCase.id);
    console.log(`   - Materialization result: ${result.relationship_versions_created.length} versions created`);

    // Verify in store (using a slightly future time to account for valid_from)
    const verificationTime = new Date(Date.now() + 1000);
    const materializedRel = ontologyStore.getEntityRelationships('asset-1', verificationTime, tenantId);
    console.log(`   - Verified in store: ${materializedRel.length} relationship(s) found for asset-1`);

    console.log('--- ONTOLOGY RUNTIME TEST COMPLETE ---');
}

testOntologyRuntime().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
