"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new prisma_1.PrismaClient({ adapter });
async function main() {
    console.log('🛡️  Starting Military Demo Data Seed...');
    // 1. Get or create a Project to house the Ontology
    let project = await prisma.project.findFirst({
        where: { name: 'Military Operations' }
    });
    if (!project) {
        project = await prisma.project.create({
            data: {
                name: 'Military Operations',
                description: 'Auto-generated project for the Palantir Military Pitch Demo'
            }
        });
        console.log(`Created new Project: ${project.id}`);
    }
    else {
        console.log(`Using existing Project: ${project.id}`);
    }
    const projectId = project.id;
    // 2. Define Entity Types
    const entityTypesData = [
        { name: 'Threat', version: 1, logicalIdPrefix: 'threat-' },
        { name: 'Asset', version: 1, logicalIdPrefix: 'asset-' },
        { name: 'Unit', version: 1, logicalIdPrefix: 'unit-' },
        { name: 'Resource', version: 1, logicalIdPrefix: 'resource-' },
    ];
    const entityTypeMap = {};
    for (const etData of entityTypesData) {
        let et = await prisma.entityType.findUnique({
            where: {
                projectId_name_version: { projectId, name: etData.name, version: etData.version }
            }
        });
        if (!et) {
            et = await prisma.entityType.create({
                data: {
                    projectId,
                    name: etData.name,
                    version: etData.version,
                }
            });
            console.log(`Created EntityType: ${et.name} (${et.id})`);
        }
        else {
            console.log(`Found EntityType: ${et.name} (${et.id})`);
        }
        entityTypeMap[etData.name] = et.id;
    }
    // 3. Seed CurrentEntityState properties
    // Palantir pitch: T-80 Tank (Threat), MQ-9 Drone (Asset), Stryker (Unit), Javelin/Jammer (Resource)
    const entitiesToSeed = [
        {
            logicalId: 'threat-t80-alpha',
            entityTypeId: entityTypeMap['Threat'],
            data: {
                type: 'Main Battle Tank',
                model: 'T-80',
                affiliation: 'Hostile',
                location: { lat: 48.8566, lng: 2.3522 }, // example coordinates
                speed_kmh: 0,
                detected_at: new Date().toISOString()
            },
            legalHold: false,
            updatedAt: new Date()
        },
        {
            logicalId: 'asset-drone-mq9',
            entityTypeId: entityTypeMap['Asset'],
            data: {
                type: 'Unmanned Aerial Vehicle',
                model: 'MQ-9 Reaper',
                callsign: 'REAPER-1',
                status: 'Airborne',
                fuel_pct: 85,
                location: { lat: 48.8600, lng: 2.3400 }
            },
            legalHold: false,
            updatedAt: new Date()
        },
        {
            logicalId: 'unit-stryker-platoon',
            entityTypeId: entityTypeMap['Unit'],
            data: {
                type: 'Ground Force',
                vehicle: 'Stryker ICV',
                unit_size: 'Platoon (30 pax)',
                status: 'Standing By',
                readiness: 'Green',
                location: { lat: 48.8500, lng: 2.3600 }
            },
            legalHold: false,
            updatedAt: new Date()
        },
        {
            logicalId: 'resource-javelin-01',
            entityTypeId: entityTypeMap['Resource'],
            data: {
                type: 'Weapon System',
                name: 'FGM-148 Javelin',
                quantity: 12,
                assigned_to: 'unit-stryker-platoon',
                status: 'Ready'
            },
            legalHold: false,
            updatedAt: new Date()
        },
        {
            logicalId: 'resource-jammer-ew',
            entityTypeId: entityTypeMap['Resource'],
            data: {
                type: 'Electronic Warfare',
                name: 'Tactical GNSS Jammer',
                status: 'Available',
                range_km: 15,
                target_nodes: ['comm-node-enemy-1']
            },
            legalHold: false,
            updatedAt: new Date()
        }
    ];
    for (const entity of entitiesToSeed) {
        await prisma.currentEntityState.upsert({
            where: { logicalId: entity.logicalId },
            update: {
                data: entity.data,
                updatedAt: entity.updatedAt
            },
            create: {
                logicalId: entity.logicalId,
                entityTypeId: entity.entityTypeId,
                data: entity.data,
                updatedAt: entity.updatedAt,
                legalHold: entity.legalHold
            }
        });
        console.log(`Upserted Entity State: ${entity.logicalId}`);
    }
    console.log('✅ Military Data Seed Complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-military-demo.js.map