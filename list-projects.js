const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://aip_user:aip_password@127.0.0.1:5432/aip_db' });

async function run() {
    try {
        const policies = await pool.query('SELECT * FROM "AbacPolicy"');
        console.log('Policies:', JSON.stringify(policies.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
