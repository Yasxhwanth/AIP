"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
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
    }
    finally {
        client.release();
        await pool.end();
    }
}
main();
//# sourceMappingURL=audit-db.js.map