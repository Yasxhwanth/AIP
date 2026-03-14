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

    const sqlPath = path.join(__dirname, 'apply-rls.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error(`SQL file not found at ${sqlPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🛡️  Applying RLS Policies...');
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
        await client.query(sql);
        console.log('✅ RLS Policies applied successfully.');
    } catch (err) {
        console.error('❌ Failed to apply RLS Policies:', err);
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
