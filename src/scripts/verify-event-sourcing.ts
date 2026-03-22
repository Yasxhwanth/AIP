import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import { OntologyService } from '../ontology-service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ontologySvc = new OntologyService(prisma);

async function verify() {
    console.log('🧪 Starting Event-Sourcing Verification...');

    let testProjectId = 'test-project-' + Date.now();
    const logicalId = 'test-entity-' + Date.now();
    const actor = 'verification-script';

    // 1. Create a Project and EntityType
    const project = await prisma.project.create({
        data: {
            name: 'Verification Project',
        }
    });

    testProjectId = project.id;

    const entityType = await prisma.entityType.create({
        data: {
            projectId: testProjectId,
            name: 'TestEntity',
            version: 1
        }
    });

    console.log(`Created test project ${testProjectId} and entity type ${entityType.id}`);

    // --- TEST 1: Creation ---
    console.log('Step 1: Testing Entity Creation...');
    const createResult = await ontologySvc.recordDomainEventAndApply({
        eventType: 'EntityCreated',
        logicalId,
        entityTypeId: entityType.id,
        data: { foo: 'bar' },
        projectId: testProjectId,
        actor
    });

    const event1 = await prisma.domainEvent.findFirst({
        where: { id: createResult.event.id }
    });
    const state1 = await prisma.currentEntityState.findUnique({
        where: { logicalId }
    });

    if (!event1 || !state1 || state1.data['foo'] !== 'bar') {
        throw new Error('Creation verification failed');
    }
    console.log('✅ Creation verified: DomainEvent and CurrentEntityState match.');

    // --- TEST 2: Update ---
    console.log('Step 2: Testing Entity Update...');
    await ontologySvc.recordDomainEventAndApply({
        eventType: 'EntityUpdated',
        logicalId,
        entityTypeId: entityType.id,
        data: { foo: 'baz', updated: true },
        projectId: testProjectId,
        actor
    });

    const events = await prisma.domainEvent.findMany({
        where: { logicalId, projectId: testProjectId },
        orderBy: { occurredAt: 'asc' }
    });
    const state2 = await prisma.currentEntityState.findUnique({
        where: { logicalId }
    });

    if (events.length !== 2 || state2?.data['foo'] !== 'baz') {
        throw new Error('Update verification failed');
    }
    console.log('✅ Update verified: Second DomainEvent recorded and State updated.');

    // --- TEST 3: Legal Hold ---
    console.log('Step 3: Testing Legal Hold...');
    await ontologySvc.recordDomainEventAndApply({
        eventType: 'LegalHoldChanged',
        logicalId,
        entityTypeId: entityType.id,
        data: { enabled: true, reason: 'Test Hold' },
        projectId: testProjectId,
        actor
    });

    const state3 = await prisma.currentEntityState.findUnique({
        where: { logicalId }
    });
    if (!state3?.legalHold) {
        throw new Error('Legal Hold verification failed');
    }
    console.log('✅ Legal Hold verified: State marked with legalHold=true.');

    // --- TEST 4: Deletion ---
    console.log('Step 4: Testing Deletion...');
    await ontologySvc.recordDomainEventAndApply({
        eventType: 'EntityDeleted',
        logicalId,
        entityTypeId: entityType.id,
        data: {},
        projectId: testProjectId,
        actor
    });

    const state4 = await prisma.currentEntityState.findUnique({
        where: { logicalId }
    });
    if (state4) {
        throw new Error('Deletion verification failed: State still exists');
    }
    const finalEvents = await prisma.domainEvent.findMany({
        where: { logicalId, projectId: testProjectId }
    });
    if (finalEvents.length !== 4) {
        throw new Error(`Deletion verification failed: Expected 4 events, got ${finalEvents.length}`);
    }
    console.log('✅ Deletion verified: State removed, deletion event recorded.');

    console.log('🎉 ALL TESTS PASSED!');
}

verify()
    .catch(err => {
        const fs = require('fs');
        console.error('❌ Verification FAILED');
        fs.writeFileSync('verification_error.json', JSON.stringify(err, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
