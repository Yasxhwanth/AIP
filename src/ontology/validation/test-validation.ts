import { ValidationEngine } from './validation-engine.js';
import {
    AttributeDataType,
    OntologyVersionStatus,
    ConstraintType,
    VisibilityMarker
} from '../types.js';
import {
    createOntologyVersionId,
    createEntityTypeId,
    createAttributeDefinitionId,
    createEntityConstraintId
} from '../types.js';

async function runTests() {
    console.log('🚀 Starting ValidationEngine Tests...\n');

    const engine = new ValidationEngine();

    // 1. Setup Mock Metadata
    const mockVersionId = createOntologyVersionId('v1');
    const mockEntityTypeId = createEntityTypeId('et1');

    const mockEntityType = {
        id: mockEntityTypeId,
        ontology_version_id: mockVersionId,
        name: 'customer',
        display_name: 'Customer',
        description: 'A customer entity',
        icon: 'mdi:account',
        color: '#3B82F6',
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null,
        deleted_at: null
    };

    const mockAttributes = [
        {
            id: createAttributeDefinitionId('ad1'),
            entity_type_id: mockEntityTypeId,
            name: 'name',
            display_name: 'Name',
            data_type: AttributeDataType.STRING,
            is_required: true,
            is_unique: false,
            is_indexed: true,
            is_primary_display: true,
            validation_rules: { min_length: 2 },
            ordinal: 0,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null
        },
        {
            id: createAttributeDefinitionId('ad2'),
            entity_type_id: mockEntityTypeId,
            name: 'age',
            display_name: 'Age',
            data_type: AttributeDataType.INTEGER,
            is_required: false,
            is_unique: false,
            is_indexed: false,
            is_primary_display: false,
            validation_rules: { min: 0, max: 120 },
            ordinal: 1,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null
        }
    ];

    const mockConstraints = [
        {
            id: createEntityConstraintId('ec1'),
            entity_type_id: mockEntityTypeId,
            name: 'age_check',
            display_name: 'Age Check',
            constraint_type: ConstraintType.CONDITIONAL_REQUIRED,
            configuration: {
                if_attribute: 'name',
                if_value: 'Adult',
                then_required: ['age']
            },
            error_message: 'Age is required for Adults',
            ordinal: 0,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            created_by: null,
            deleted_at: null
        }
    ];

    // 2. Test Scenarios
    const scenarios = [
        {
            name: 'Valid Entity',
            data: { name: 'John Doe', age: 30 },
            expectedValid: true
        },
        {
            name: 'Missing Required Attribute',
            data: { age: 30 },
            expectedValid: false,
            expectedError: 'Name is required'
        },
        {
            name: 'Invalid Data Type (String for Integer)',
            data: { name: 'John Doe', age: 'thirty' },
            expectedValid: false,
            expectedError: 'Expected number'
        },
        {
            name: 'Validation Rule Violation (Min Length)',
            data: { name: 'J', age: 30 },
            expectedValid: false,
            expectedError: 'at least 2 characters'
        },
        {
            name: 'Conditional Required Constraint Violation',
            data: { name: 'Adult' },
            expectedValid: false,
            expectedError: 'Age is required for Adults'
        }
    ];

    let passed = 0;
    for (const scenario of scenarios) {
        console.log(`Testing: ${scenario.name}...`);
        const result = engine.validateEntity(scenario.data, mockEntityType as any, mockAttributes as any, mockConstraints as any);

        const isValid = result.valid;
        const hasExpectedError = scenario.expectedError
            ? result.errors.some(e => e.message.toLowerCase().includes(scenario.expectedError!.toLowerCase()))
            : true;

        if (isValid === scenario.expectedValid && hasExpectedError) {
            console.log('✅ PASSED');
            passed++;
        } else {
            console.log('❌ FAILED');
            console.log('  Result:', JSON.stringify(result, null, 2));
        }
        console.log('');
    }

    console.log(`\nSummary: ${passed}/${scenarios.length} tests passed.`);
}

runTests().catch(console.error);
