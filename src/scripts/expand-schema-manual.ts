import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const sqlPath = path.join(__dirname, 'expand-schema-manual.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error(`SQL file not found at ${sqlPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🛠️  Expanding Schema Manually...');
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
        await client.query(sql);
        console.log('✅ Schema expanded successfully.');
    } catch (err) {
        console.error('❌ Failed to expand schema:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
