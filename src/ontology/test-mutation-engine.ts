import { mutationEngine } from './MutationEngine';
import { MutationType, EntityId, EntityTypeId, AttributeDefinitionId } from './types';
import { ontologyStore } from './OntologyStore';
import { SideEffectManager } from './SideEffectManager';

async function runTests() {
    console.log('--- Starting MutationEngine Tests ---');

    const tenantId = 'TENANT-1';
    const entityId = 'TEST-ENTITY-1' as EntityId;

    // 1. Test Entity Creation
    console.log('\n[Test 1] Creating Entity...');
    mutationEngine.applyMutation({
        type: MutationType.CREATE_ENTITY,
        tenant_id: tenantId,
        entity_id: entityId,
        entity_type_id: 'LOCATION' as EntityTypeId,
        newValue: {
            name: 'Test Location',
            status: 'ACTIVE'
        }
    });

    const entity = ontologyStore.getEntitySnapshot(entityId, new Date(), tenantId);
    if (entity && entity.name === 'Test Location') {
        console.log('✅ Entity created successfully');
    } else {
        console.error('❌ Entity creation failed');
        process.exit(1);
    }

    // 2. Test Attribute Update
    console.log('\n[Test 2] Updating Attribute...');
    mutationEngine.applyMutation({
        type: MutationType.UPDATE_ATTRIBUTE,
        tenant_id: tenantId,
        entity_id: entityId,
        attribute_definition_id: 'status' as AttributeDefinitionId,
        newValue: 'INACTIVE'
    });

    const updatedEntity = ontologyStore.getEntitySnapshot(entityId, new Date(), tenantId);
    if (updatedEntity && updatedEntity.status === 'INACTIVE' && updatedEntity._version.version_number === 2) {
        console.log('✅ Attribute updated successfully (Version 2)');
    } else {
        console.error('❌ Attribute update failed', updatedEntity);
        process.exit(1);
    }

    // 3. Test Side Effect Triggering
    console.log('\n[Test 3] Testing Side Effects...');
    let sideEffectTriggered = false;
    SideEffectManager.registerHandler(MutationType.UPDATE_ATTRIBUTE, (m) => {
        if (m.entity_id === entityId && m.newValue === 'RETIRED') {
            sideEffectTriggered = true;
        }
    });

    mutationEngine.applyMutation({
        type: MutationType.UPDATE_ATTRIBUTE,
        tenant_id: tenantId,
        entity_id: entityId,
        attribute_definition_id: 'status' as AttributeDefinitionId,
        newValue: 'RETIRED'
    });

    if (sideEffectTriggered) {
        console.log('✅ Side effect triggered successfully');
    } else {
        console.error('❌ Side effect failed to trigger');
        process.exit(1);
    }

    // 4. Test Entity Deletion
    console.log('\n[Test 4] Deleting Entity...');
    mutationEngine.applyMutation({
        type: MutationType.DELETE_ENTITY,
        tenant_id: tenantId,
        entity_id: entityId
    });

    const deletedEntity = (ontologyStore as any).entities.get(entityId);
    if (deletedEntity && deletedEntity.deleted_at !== null) {
        console.log('✅ Entity soft-deleted successfully');
    } else {
        console.error('❌ Entity deletion failed');
        process.exit(1);
    }

    console.log('\n--- All MutationEngine Tests Passed! ---');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
