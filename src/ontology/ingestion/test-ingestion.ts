/**
 * =============================================================================
 * INGESTION FABRIC VERIFICATION
 * Phase 22 - Data Ingestion & Streaming
 * =============================================================================
 */

import { IngestionEngine } from './IngestionEngine.js';
import {
    IngestionSource,
    IngestionSourceVersion,
    IngestionSourceType,
    IngestionSourceStatus,
    IngestionEventStatus,
    MappingRules
} from './ingestion-types.js';
import {
    EntityType,
    AttributeDefinition,
    AttributeDataType,
    EntityConstraint,
    createEntityTypeId,
    createAttributeDefinitionId,
    createOntologyVersionId
} from '../types.js';

async function runTests() {
    console.log('🚀 Starting Ingestion Fabric Tests...\n');

    const engine = new IngestionEngine();

    // -------------------------------------------------------------------------
    // SETUP MOCK DATA
    // -------------------------------------------------------------------------
    const tenantId = 'tenant-1';
    const mockSource: IngestionSource = {
        id: 'src-1' as any,
        tenant_id: tenantId,
        name: 'CRM API',
        source_type: IngestionSourceType.API,
        status: IngestionSourceStatus.ACTIVE,
        created_at: new Date(),
        created_by: null,
        description: 'Mock CRM'
    };

    const mockMapping: MappingRules = {
        target_entity_type_id: 'et-customer' as any,
        field_mappings: {
            'name': 'data.fullName', // Nested extraction
            'email': 'data.contact.email',
            'status': { static_value: 'ACTIVE' }, // Static value
            'age': { source_path: 'data.age', transform: 'toNumber' } // Transform
        }
    };

    const mockVersion: IngestionSourceVersion = {
        id: 'v1' as any,
        ingestion_source_id: mockSource.id,
        mapping_rules: mockMapping,
        created_at: new Date(),
        created_by: null
    };

    // Ontology Definitions
    const mockEntityType: EntityType = {
        id: 'et-customer' as any,
        ontology_version_id: createOntologyVersionId('ov1'),
        name: 'customer',
        display_name: 'Customer',
        description: null,
        icon: null,
        color: null,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null,
        deleted_at: null
    };

    const mockAttributes: AttributeDefinition[] = [
        {
            id: createAttributeDefinitionId('ad1'),
            entity_type_id: mockEntityType.id,
            name: 'name',
            display_name: 'Name',
            description: null,
            data_type: AttributeDataType.STRING,
            is_required: true,
            is_unique: false,
            is_indexed: false,
            is_primary_display: true,
            default_value: null,
            validation_rules: {},
            ordinal: 0,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,

        },
        {
            id: createAttributeDefinitionId('ad2'),
            entity_type_id: mockEntityType.id,
            name: 'email',
            display_name: 'Email',
            description: null,
            data_type: AttributeDataType.STRING,
            is_required: true,
            is_unique: true,
            is_indexed: true,
            is_primary_display: false,
            default_value: null,
            validation_rules: {},
            ordinal: 1,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,

        },
        {
            id: createAttributeDefinitionId('ad3'),
            entity_type_id: mockEntityType.id,
            name: 'status',
            display_name: 'Status',
            description: null,
            data_type: AttributeDataType.STRING,
            is_required: true,
            is_unique: false,
            is_indexed: false,
            is_primary_display: false,
            default_value: null,
            validation_rules: {},
            ordinal: 2,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,

        },
        {
            id: createAttributeDefinitionId('ad4'),
            entity_type_id: mockEntityType.id,
            name: 'age',
            display_name: 'Age',
            description: null,
            data_type: AttributeDataType.INTEGER,
            is_required: false,
            is_unique: false,
            is_indexed: false,
            is_primary_display: false,
            default_value: null,
            validation_rules: { min: 18 },
            ordinal: 3,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null,

        }
    ];

    const mockConstraints: EntityConstraint[] = [];

    // -------------------------------------------------------------------------
    // TEST 1: Successful Ingestion
    // -------------------------------------------------------------------------
    console.log('Test 1: Successful Ingestion');
    const validPayload = {
        data: {
            fullName: 'Alice Smith',
            age: '30', // String should be coerced to number
            contact: {
                email: 'alice@example.com'
            }
        }
    };

    const event1 = await engine.ingest(
        validPayload,
        mockSource,
        mockVersion,
        mockEntityType,
        mockAttributes,
        mockConstraints
    );

    if (event1.status === IngestionEventStatus.PROCESSED && event1.candidate_ids?.length === 1) {
        const candidate = engine.getCandidate(event1.candidate_ids[0]);
        if (candidate?.proposed_data['name'] === 'Alice Smith' &&
            candidate?.proposed_data['status'] === 'ACTIVE' &&
            candidate?.proposed_data['age'] === 30) {
            console.log('✅ PASSED: Event processed and candidate created correctly.');
        } else {
            console.log('❌ FAILED: Candidate data incorrect', candidate?.proposed_data);
        }
    } else {
        console.log('❌ FAILED: Event status incorrect', event1);
    }
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 2: Validation Failure
    // -------------------------------------------------------------------------
    console.log('Test 2: Validation Failure (Underage)');
    const invalidPayload = {
        data: {
            fullName: 'Bob Kid',
            age: '10', // < 18, should fail validation
            contact: {
                email: 'bob@example.com'
            }
        }
    };

    const event2 = await engine.ingest(
        invalidPayload,
        mockSource,
        mockVersion,
        mockEntityType,
        mockAttributes,
        mockConstraints
    );

    if (event2.status === IngestionEventStatus.REJECTED && event2.validation_errors?.length) {
        console.log('✅ PASSED: Event rejected due to validation errors.');
    } else {
        console.log('❌ FAILED: Event should have been rejected', event2);
    }
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 3: Replay Capability
    // -------------------------------------------------------------------------
    console.log('Test 3: Replay Capability');
    // Replay the rejected event with a NEW version that allows age 10 (e.g., lower min age)

    // Update validation rules for 'age' in a "new" attribute definition set
    const relaxedAttributes = mockAttributes.map(attr => {
        if (attr.name === 'age') {
            return { ...attr, validation_rules: { min: 5 } };
        }
        return attr;
    });

    const replayEvent = await engine.replayEvent(
        event2.id,
        mockVersion, // Using same mapping
        mockEntityType,
        relaxedAttributes, // Using relaxed validation
        mockConstraints
    );

    if (replayEvent.status === IngestionEventStatus.PROCESSED) {
        console.log('✅ PASSED: Replayed event processed successfully with new rules.');
    } else {
        console.log('❌ FAILED: Replay failed', replayEvent);
    }
    console.log('');
}

runTests().catch(console.error);
