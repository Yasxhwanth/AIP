const { PrismaClient } = require('./src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Checking ABAC policies...');
        const policies = await prisma.abacPolicy.findMany();
        console.log('Found %d policies', policies.length);
        if (policies.length > 0) {
            console.log('Policies JSON:', JSON.stringify(policies, null, 2));
        } else {
            console.log('No ABAC policies found. System will Implicit Deny.');
        }

        console.log('Checking Projects...');
        const projects = await prisma.project.findMany();
        console.log('Found %d projects', projects.length);
        projects.forEach(p => console.log(` - ${p.id}: ${p.name}`));

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
