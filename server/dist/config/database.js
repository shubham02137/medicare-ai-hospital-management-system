"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.query = exports.getPool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
let pool = null;
if (env_1.env.DATABASE_URL) {
    pool = new pg_1.Pool({
        connectionString: env_1.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });
    pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err);
    });
}
const getPool = () => pool;
exports.getPool = getPool;
const query = async (text, params) => {
    if (!pool) {
        throw new Error('Database not configured – running in demo mode');
    }
    return pool.query(text, params);
};
exports.query = query;
const testConnection = async () => {
    if (!pool)
        return false;
    try {
        await pool.query('SELECT NOW()');
        return true;
    }
    catch {
        return false;
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=database.js.map