"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
async function main() {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query('SELECT "projectId", count(*) FROM "CurrentEntityState" GROUP BY "projectId"');
    console.log('--- CurrentEntityState counts by projectId ---');
    console.table(res.rows);
    const res2 = await pool.query('SELECT count(*) FROM "Project"');
    console.log('--- Project count ---');
    console.table(res2.rows);
    await pool.end();
}
main();
//# sourceMappingURL=check-counts.js.map