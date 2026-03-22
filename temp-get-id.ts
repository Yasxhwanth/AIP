import { PrismaClient } from './src/generated/prisma';
const prisma = new PrismaClient();
async function main() {
    const project = await prisma.project.findFirst({ where: { name: 'Global Logistics & Readiness' } });
    console.log(project?.id);
}
main().finally(() => prisma.$disconnect());
