const { PrismaClient } = require('./src/generated/prisma');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Checking ABAC policies...');
        const policies = await prisma.abacPolicy.findMany();
        console.log('Found %d policies', policies.length);
        console.log('Policies JSON:', JSON.stringify(policies, null, 2));
    } catch (err) {
        console.error('Error fetching ABAC policies:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
