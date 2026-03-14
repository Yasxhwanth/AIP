import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
        const res = await client.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE column_name = 'projectId' AND table_schema = 'public'
        `);
        console.log('Tables with projectId column:');
        res.rows.forEach(r => console.log(`- ${r.table_name}`));

        const allTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        console.log('\nAll tables:');
        allTables.rows.forEach(r => console.log(`- ${r.table_name}`));
    } finally {
        client.release();
        await pool.end();
    }
}

main();
