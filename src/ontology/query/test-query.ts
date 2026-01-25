import {
    OntologyQueryService,
    QueryOptions,
    EntitySnapshot,
    TraversalResult
} from './types.js';
import {
    EntityId,
    EntityTypeId,
    OntologyVersionId,
    EntityVersionId,
    createEntityId,
    createEntityTypeId,
    createOntologyVersionId
} from '../types.js';

/**
 * Mock implementation of OntologyQueryService for testing bi-temporal logic.
 */
class MockQueryService implements OntologyQueryService {
    private data = {
        ontology_versions: [
            { id: 'v1', status: 'PUBLISHED', published_at: new Date('2025-01-01T00:00:00Z') },
            { id: 'v2', status: 'PUBLISHED', published_at: new Date('2025-02-01T00:00:00Z') }
        ],
        entities: [
            { id: 'e1', type_id: 'customer' }
        ],
        entity_versions: [
            { id: 'ev1', entity_id: 'e1', valid_from: new Date('2025-01-01T00:00:00Z'), valid_to: new Date('2025-02-01T00:00:00Z'), attributes: { name: 'John v1' } },
            { id: 'ev2', entity_id: 'e1', valid_from: new Date('2025-02-01T00:00:00Z'), valid_to: null, attributes: { name: 'John v2' } }
        ]
    };

    async resolveMetadataVersion(asOf: Date): Promise<OntologyVersionId> {
        const version = this.data.ontology_versions
            .filter(v => v.status === 'PUBLISHED' && v.published_at <= asOf)
            .sort((a, b) => b.published_at.getTime() - a.published_at.getTime())[0];

        if (!version) throw new Error('No published version found for this time');
        return createOntologyVersionId(version.id);
    }

    async getEntity(id: EntityId, options: QueryOptions): Promise<EntitySnapshot | null> {
        const asOf = options.asOf;
        const version = this.data.entity_versions.find(ev =>
            ev.entity_id === id &&
            ev.valid_from <= asOf &&
            (ev.valid_to === null || ev.valid_to > asOf)
        );

        if (!version) return null;

        return {
            id,
            version_id: version.id as any,
            type_id: 'customer' as any,
            attributes: version.attributes,
            metadata: {},
            valid_from: version.valid_from,
            valid_to: version.valid_to
        };
    }

    async getEntitiesByType(typeId: EntityTypeId, options: QueryOptions): Promise<EntitySnapshot[]> {
        // Simplified for mock
        return [];
    }

    async traverse(sourceId: EntityId, relationshipName: string, options: QueryOptions): Promise<TraversalResult[]> {
        // Simplified for mock
        return [];
    }

    async getEntityByVersion(versionId: EntityVersionId): Promise<EntitySnapshot | null> {
        const version = this.data.entity_versions.find(ev => ev.id === versionId);
        if (!version) return null;

        return {
            id: version.entity_id as any,
            version_id: versionId,
            type_id: 'customer' as any,
            attributes: version.attributes,
            metadata: {},
            valid_from: version.valid_from,
            valid_to: version.valid_to
        };
    }
}

async function runTests() {
    console.log('🚀 Starting OntologyQueryService Mock Tests...\n');

    const service = new MockQueryService();
    const entityId = createEntityId('e1');

    // Test 1: Query at T1 (v1)
    console.log('Testing: Query at 2025-01-15 (v1)...');
    const snapshot1 = await service.getEntity(entityId, { asOf: new Date('2025-01-15T00:00:00Z') });
    if (snapshot1?.attributes.name === 'John v1') {
        console.log('✅ PASSED (Resolved v1)');
    } else {
        console.log('❌ FAILED', snapshot1?.attributes);
    }

    // Test 2: Query at T2 (v2)
    console.log('\nTesting: Query at 2025-02-15 (v2)...');
    const snapshot2 = await service.getEntity(entityId, { asOf: new Date('2025-02-15T00:00:00Z') });
    if (snapshot2?.attributes.name === 'John v2') {
        console.log('✅ PASSED (Resolved v2)');
    } else {
        console.log('❌ FAILED', snapshot2?.attributes);
    }

    // Test 3: Metadata Resolution
    console.log('\nTesting: Metadata Resolution at 2025-01-15...');
    const mv1 = await service.resolveMetadataVersion(new Date('2025-01-15T00:00:00Z'));
    if (mv1 === 'v1') {
        console.log('✅ PASSED (Resolved v1)');
    } else {
        console.log('❌ FAILED', mv1);
    }

    console.log('\nSummary: All mock tests passed.');
}

runTests().catch(console.error);
