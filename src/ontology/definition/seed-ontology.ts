import { ontologyDefinitionStore } from './OntologyDefinitionStore';
import { AttributeDataType, ConstraintType } from './ontology-definition-types';

export function seedOntology(tenantId: string) {
    // 1. Create Version
    const version = ontologyDefinitionStore.createOntologyVersion(
        tenantId,
        'v1.0.0',
        null,
        'system'
    );

    // 2. Create Asset Type
    const assetType = ontologyDefinitionStore.createObjectType(
        version.id,
        'asset',
        'Asset',
        'system'
    );
    assetType.description = 'A physical or logical asset in the enterprise.';

    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'name', 'Name', AttributeDataType.STRING, 'system');
    const statusAttr = ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'status', 'Status', AttributeDataType.ENUM, 'system');
    statusAttr.enum_values = ['OPERATIONAL', 'DEGRADED', 'MAINTENANCE', 'OFFLINE'];
    statusAttr.is_required = true;

    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'description', 'Description', AttributeDataType.STRING, 'system');
    ontologyDefinitionStore.createAttribute(version.id, assetType.id, 'capacity', 'Capacity', AttributeDataType.INTEGER, 'system');
    
    // 3. Create Location Type
    const locationType = ontologyDefinitionStore.createObjectType(
        version.id,
        'location',
        'Location',
        'system'
    );
    locationType.description = 'A geographic location.';

    ontologyDefinitionStore.createAttribute(version.id, locationType.id, 'name', 'Name', AttributeDataType.STRING, 'system');
    ontologyDefinitionStore.createAttribute(version.id, locationType.id, 'address', 'Address', AttributeDataType.STRING, 'system');
    ontologyDefinitionStore.createAttribute(version.id, locationType.id, 'coordinates', 'Coordinates', AttributeDataType.GEO_POINT, 'system');

    // 4. Create Person Type
    const personType = ontologyDefinitionStore.createObjectType(
        version.id,
        'person',
        'Person',
        'system'
    );
    personType.description = 'An individual actor or employee.';

    ontologyDefinitionStore.createAttribute(version.id, personType.id, 'first_name', 'First Name', AttributeDataType.STRING, 'system');
    ontologyDefinitionStore.createAttribute(version.id, personType.id, 'last_name', 'Last Name', AttributeDataType.STRING, 'system');
    ontologyDefinitionStore.createAttribute(version.id, personType.id, 'email', 'Email', AttributeDataType.STRING, 'system');

    // 5. Create Relationships
    ontologyDefinitionStore.createRelationshipType(
        version.id,
        'asset_at_location',
        'Located At',
        assetType.id,
        locationType.id,
        'UNIDIRECTIONAL',
        'MANY_TO_ONE',
        'system'
    );

    ontologyDefinitionStore.createRelationshipType(
        version.id,
        'person_assigned_to_asset',
        'Assigned To',
        personType.id,
        assetType.id,
        'UNIDIRECTIONAL',
        'MANY_TO_MANY',
        'system'
    );

    // 6. Activate Version
    ontologyDefinitionStore.activateVersion(version.id, tenantId);

    console.log(`Ontology seeded and activated for tenant: ${tenantId}`);
}
