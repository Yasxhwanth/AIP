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

    const sqlPath = path.join(__dirname, 'setup-app-user.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🛡️  Setting up aip_app role...');
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
        await client.query(sql);
        console.log('✅ aip_app user setup complete.');
    } catch (err) {
        console.error('❌ Failed to setup aip_app user:', err);
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
