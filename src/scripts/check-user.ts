import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query('SELECT current_user, session_user, current_setting(\'is_superuser\')');
    console.log('--- User Info ---');
    console.table(res.rows);

    const res2 = await pool.query('SELECT * FROM pg_roles WHERE rolname = current_user');
    console.log('--- Current User Roles ---');
    console.table(res2.rows);

    await pool.end();
}

main();
