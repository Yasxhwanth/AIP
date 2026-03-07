import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('⚡ Starting Military Actions & Governance Seed...');

    const project = await prisma.project.findFirst({
        where: { name: 'Military Operations' }
    });

    if (!project) throw new Error("Military Operations project not found. Run seed-military-demo.ts first.");

    // 1. Create Action Definitions
    const actionsParams = [
        {
            name: 'Task MQ-9 Drone',
            type: 'UPDATE_ENTITY',
            config: {
                targetEntity: 'asset-drone-mq9',
                fields: { status: 'Engaging', target: 'threat-t80-alpha' }
            }
        },
        {
            name: 'Deploy Ground Forces',
            type: 'UPDATE_ENTITY',
            config: {
                targetEntity: 'unit-stryker-platoon',
                fields: { status: 'Intercepting', target: 'threat-t80-alpha' }
            }
        },
        {
            name: 'Initiate Jamming & Ground Assault',
            type: 'WEBHOOK',
            config: {
                url: 'https://api.military.local/ew/jam',
                method: 'POST',
                payload: {
                    target: 'threat-t80-alpha',
                    units: ['unit-stryker-platoon'],
                    resources: ['resource-jammer-ew', 'resource-javelin-01']
                }
            }
        }
    ];

    const actionMap: Record<string, string> = {};

    for (const act of actionsParams) {
        let action = await prisma.actionDefinition.findUnique({ where: { name: act.name } });
        if (!action) {
            action = await prisma.actionDefinition.create({ data: act });
            console.log(`Created Action: ${act.name}`);
        } else {
            console.log(`Found Action: ${act.name}`);
        }
        actionMap[act.name] = action.id;
    }

    // 2. Create Decision Rule (The Trigger Condition)
    const entityType = await prisma.entityType.findFirst({ where: { name: 'Threat' } });
    if (!entityType) throw new Error("Threat Entity Type not found");

    let rule = await prisma.decisionRule.findUnique({ where: { name: 'High-Value Target Response' } });
    if (!rule) {
        rule = await prisma.decisionRule.create({
            data: {
                name: 'High-Value Target Response',
                projectId: project.id,
                entityTypeId: entityType.id,
                conditions: [{ field: 'type', operator: '==', value: 'Main Battle Tank' }],
                logicOperator: 'AND',
                priority: 1,
                autoExecute: false, // Requires Commander Approval
            }
        });
        console.log(`Created DecisionRule: ${rule.name}`);

        // Link the rule to the Action definitions
        await prisma.executionPlan.create({
            data: {
                decisionRuleId: rule.id,
                actionDefinitionId: actionMap['Initiate Jamming & Ground Assault'] as string,
                stepOrder: 1
            }
        });
    }

    // 3. Stage the Escalation Inbox for the Demo
    // The demo needs a pending approval state for the Commander to review
    await prisma.decisionLog.create({
        data: {
            decisionRuleId: rule.id,
            logicalId: 'threat-t80-alpha',
            triggerType: 'MANUAL',
            status: 'PENDING_APPROVAL',
            decision: 'PENDING_APPROVAL',
            triggerData: {
                threatId: 'threat-t80-alpha',
                coa: 3,
                timeToTargetMinutes: 30,
                risk: 'Low',
                suggestedAction: 'Initiate Jamming & Ground Assault'
            },
            conditionResults: {
                passed: true,
                evaluations: ['type == Main Battle Tank']
            }
        }
    });
    console.log('📬 Staged Course of Action 3 into Commander Inbox.');

    console.log('✅ Military Actions Seed Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
