import { PrismaClient } from './src/generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const proj = await prisma.project.findFirst();
    if (!proj) throw new Error("No project found");

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
