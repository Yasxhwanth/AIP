import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import { OntologyService } from '../ontology-service';

const baseUrl = process.env.DATABASE_URL || '';
const databaseUrl = baseUrl.replace('aip_app:aip_password', 'aip_user:aip_password');
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const ontologySvc = new OntologyService(prisma);

async function main() {
    console.log('🚛 Starting Global Logistics Maven Mission Seed...');

    // 1. Create/Get Project
    let project = await prisma.project.findFirst({
        where: { name: 'Global Logistics & Readiness' }
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                name: 'Global Logistics & Readiness',
                description: 'Autonomous mission command for global supply chain resilience.'
            }
        });
        console.log(`Created Project: ${project.id}`);
    } else {
        console.log(`Using Project: ${project.id}`);
    }
    const projectId = project.id;

    // 2. Define Entity Types
    const entityTypesData = [
        { name: 'Convoy', version: 1 },
        { name: 'Port', version: 1 },
        { name: 'SupplyHub', version: 1 },
    ];

    const entityTypeMap: Record<string, string> = {};

    for (const etData of entityTypesData) {
        let et = await prisma.entityType.findUnique({
            where: {
                projectId_name_version_branchName: { projectId, name: etData.name, version: etData.version, branchName: 'main' }
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
        } else {
            console.log(`Found EntityType: ${et.name} (${et.id})`);
        }
        entityTypeMap[etData.name] = et.id;
    }

    // 3. Seed Instances (SF/Oakland Area for Cesium Alignment)
    const entities = [
        {
            logicalId: 'port-sf-main',
            entityTypeId: entityTypeMap['Port'],
            data: {
                name: 'Port of San Francisco',
                status: 'CONGESTED',
                queue_vessels: 14,
                avg_dwell_time_hr: 72,
                location: { lat: 37.795, lng: -122.393 }
            }
        },
        {
            logicalId: 'port-oakland',
            entityTypeId: entityTypeMap['Port'],
            data: {
                name: 'Port of Oakland',
                status: 'OPERATIONAL',
                queue_vessels: 4,
                avg_dwell_time_hr: 24,
                location: { lat: 37.804, lng: -122.271 }
            }
        },
        {
            logicalId: 'convoy-09',
            entityTypeId: entityTypeMap['Convoy'],
            data: {
                name: 'Strategic Convoy 09',
                status: 'IN_TRANSIT',
                payload: 'Critical Engine Mounts',
                destination: 'port-sf-main',
                location: { lat: 37.750, lng: -122.350 },
                speed_kt: 18,
                fuel_level: 82
            }
        },
        {
            logicalId: 'hub-gamma',
            entityTypeId: entityTypeMap['SupplyHub'],
            data: {
                name: 'Distribution Hub Gamma',
                status: 'LOW_STOCK',
                inventory_pct: 18,
                location: { lat: 37.700, lng: -122.100 }
            }
        }
    ];

    for (const entity of entities) {
        await ontologySvc.recordDomainEventAndApply({
            eventType: 'EntityCreated',
            logicalId: entity.logicalId,
            entityTypeId: entity.entityTypeId,
            data: entity.data as any,
            projectId,
            actor: 'system-seed'
        });
        console.log(`Seeded entity: ${entity.logicalId}`);
    }

    // 4. Seed Maven Agent
    const agent = await prisma.aIPAgent.upsert({
        where: { id: 'agent-logistics-maven' },
        update: {
            projectId,
            name: 'Logistics Maven',
            description: 'Mission command assistant for fleet operations and supply chain resilience.',
            systemPrompt: 'You are MAVEN, an AI mission command assistant designed for Palantir AIP. Your goal is to monitor global logistics readiness and provide actionable, data-driven recommendations to maintain throughput. You have real-time access to Port, Convoy, and SupplyHub data. When suggesting actions, be decisive and professional. Suggest rerouting or resource deployment based on congestion and inventory levels.',
            model: 'gpt-4o',
            allowedTools: []
        },
        create: {
            id: 'agent-logistics-maven',
            projectId,
            name: 'Logistics Maven',
            description: 'Mission command assistant for fleet operations and supply chain resilience.',
            systemPrompt: 'You are MAVEN, an AI mission command assistant designed for Palantir AIP. Your goal is to monitor global logistics readiness and provide actionable, data-driven recommendations to maintain throughput. You have real-time access to Port, Convoy, and SupplyHub data. When suggesting actions, be decisive and professional. Suggest rerouting or resource deployment based on congestion and inventory levels.',
            model: 'gpt-4o',
            allowedTools: []
        }
    });
    console.log(`Seeded Maven Agent: ${agent.name}`);

    // 5. Seed Actions
    const actions = [
        {
            id: 'action-reroute-convoy',
            name: 'Reroute Convoy',
            description: 'Change the destination and route of a convoy to avoid congestion.',
            category: 'edit',
            objectType: 'Convoy',
            params: [
                { name: 'convoyId', type: 'string', required: true },
                { name: 'newDestination', type: 'string', required: true }
            ],
            writesTo: ['destination'],
            rbac: ['OPERATOR', 'ADMIN'],
            approvalRules: []
        },
        {
            id: 'action-deploy-auxiliary',
            name: 'Deploy Auxiliary Support',
            description: 'Deploy backup drones or personnel to assist a mission hub.',
            category: 'function-backed',
            objectType: 'SupplyHub',
            params: [
                { name: 'hubId', type: 'string', required: true },
                { name: 'supportLevel', type: 'string', required: true }
            ],
            writesTo: ['status'],
            rbac: ['OPERATOR', 'ADMIN'],
            approvalRules: []
        }
    ];

    for (const act of actions) {
        await prisma.aIPAction.upsert({
            where: { id: act.id },
            update: {
                projectId,
                ...act
            },
            create: {
                projectId,
                ...act
            }
        });
        console.log(`Seeded Action: ${act.name}`);
    }

    // 6. Seed Decision Rule for Alerts
    const portEt = entityTypeMap['Port'];
    await prisma.decisionRule.upsert({
        where: { name: 'Port Congestion Critical' }, // This one IS unique in schema
        update: {
            projectId,
            entityTypeId: portEt,
            conditions: [{ field: 'queue_vessels', operator: '>', value: 10 }],
            logicOperator: 'AND',
            autoExecute: false,
            priority: 1
        },
        create: {
            name: 'Port Congestion Critical', // Added back name for create if it doesn't exist
            projectId,
            entityTypeId: portEt,
            conditions: [{ field: 'queue_vessels', operator: '>', value: 10 }],
            logicOperator: 'AND',
            autoExecute: false,
            priority: 1
        }
    });
    console.log('Seeded Decision Rule: Port Congestion Critical');

    // 7. Seed Policy Definitions for Alerting
    await prisma.policyDefinition.upsert({
        where: { name: 'Congestion Critical Alert' },
        update: {
            projectId,
            entityTypeId: portEt,
            eventType: 'EntityStateChanged',
            condition: { field: 'queue_vessels', operator: '>', value: 10 } as any,
            actionType: 'EmitAlert',
            actionConfig: { alertType: 'PortCongestionAlert', severity: 'critical' } as any,
            enabled: true
        },
        create: {
            name: 'Congestion Critical Alert',
            projectId,
            entityTypeId: portEt,
            eventType: 'EntityStateChanged',
            condition: { field: 'queue_vessels', operator: '>', value: 10 } as any,
            actionType: 'EmitAlert',
            actionConfig: { alertType: 'PortCongestionAlert', severity: 'critical' } as any,
            enabled: true
        }
    });
    console.log('Seeded Policy: Congestion Critical Alert');

    console.log('✅ Maven Mission Infrastructure Seed Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
