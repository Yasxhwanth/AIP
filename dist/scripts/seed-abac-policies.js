"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL.replace('aip_app:aip_password', 'aip_user:aip_password') });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new prisma_1.PrismaClient({ adapter });
async function main() {
    console.log('🛡️ Seeding ABAC Policies...');
    const project = await prisma.project.findFirst({
        where: { name: 'Global Logistics & Readiness' }
    });
    if (!project)
        throw new Error('Project not found');
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
            create: p
        });
    }
    console.log('✅ ABAC Policies Seeded!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-abac-policies.js.map