const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
async function main() {
    const proj = await prisma.project.findFirst();
    await prisma.dataSource.create({
        data: {
            name: 'Mock_Troop_Roster_API',
            type: 'REST_API',
            connectionConfig: {
                url: 'https://jsonplaceholder.typicode.com/users', // using dummy json
                method: 'GET'
            },
            projectId: proj.id
        }
    });
    console.log('Mock Data Source created in DB!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
