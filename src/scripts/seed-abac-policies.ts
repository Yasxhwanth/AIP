import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL!.replace('aip_app:aip_password', 'aip_user:aip_password') });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🛡️ Seeding ABAC Policies...');

    const project = await prisma.project.findFirst({
        where: { name: 'Global Logistics & Readiness' }
    });
    if (!project) throw new Error('Project not found');

    const policies = [
        {
            name: 'Allow Admin Full Access',
            description: 'Admins can perform any action on any resource.',
            action: '*',
            resourceType: '*',
            condition: {},
            effect: 'ALLOW',
            projectId: project.id
        },
        {
            name: 'Allow Operator Read Access',
            description: 'Operators can read any resource.',
            action: 'READ',
            resourceType: '*',
            condition: { 'actor.role': 'OPERATOR' },
            effect: 'ALLOW',
            projectId: project.id
        }
    ];

    for (const p of policies) {
        await prisma.abacPolicy.upsert({
            where: { name: p.name },
            update: p,
            create: p as any
        });
    }


    console.log('✅ ABAC Policies Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
