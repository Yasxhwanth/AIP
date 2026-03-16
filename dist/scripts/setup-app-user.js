"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }
    const sqlPath = path_1.default.join(__dirname, 'setup-app-user.sql');
    const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
    console.log('🛡️  Setting up aip_app role...');
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('✅ aip_app user setup complete.');
    }
    catch (err) {
        console.error('❌ Failed to setup aip_app user:', err);
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
//# sourceMappingURL=setup-app-user.js.map