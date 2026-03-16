"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }
    const schemaPath = path_1.default.resolve('prisma/schema.prisma');
    console.log(`🔍 Generating SQL for schema at: ${schemaPath}`);
    // Use spawnSync with explicit shell and absolute path for prisma
    const prismaRes = (0, child_process_1.spawnSync)('npx.cmd', [
        'prisma', 'migrate', 'diff',
        '--from-url', databaseUrl,
        '--to-schema', schemaPath,
        '--script'
    ], {
        shell: true,
        env: { ...process.env, CI: 'true' }
    });
    if (prismaRes.status !== 0) {
        console.error('❌ SQL generation failed:');
        console.error(prismaRes.stderr.toString());
        process.exit(1);
    }
    const sql = prismaRes.stdout.toString();
    console.log('✅ SQL generated, length:', sql.length);
    if (sql.length < 100) {
        console.error('❌ Generated SQL looks too short. Aborting.');
        process.exit(1);
    }
    console.log('🚀 Applying SQL to database...');
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Split by semicolon might be dangerous if there are semicolons in strings
        // But for Prisma generated DDL it is usually safe enough if we handle it carefully
        // Alternatively, just send the whole block
        await client.query(sql);
        await client.query('COMMIT');
        console.log('✨ Stage 3 Schema applied successfully!');
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to apply SQL:', err);
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
//# sourceMappingURL=apply-schema-raw.js.map