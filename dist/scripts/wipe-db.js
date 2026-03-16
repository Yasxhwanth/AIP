"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }
    console.log('🗑️  Wiping database via pg...');
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
        // Drop and recreate public schema (standard way to wipe a Postgres DB)
        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');
        await client.query('GRANT ALL ON SCHEMA public TO public');
        console.log('✅ Database wiped successfully.');
    }
    catch (err) {
        console.error('❌ Failed to wipe database:', err);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
//# sourceMappingURL=wipe-db.js.map