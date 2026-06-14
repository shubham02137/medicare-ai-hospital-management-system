import { Pool } from 'pg';
import { env } from './env';

let pool: Pool | null = null;

if (env.DATABASE_URL) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: env.DATABASE_URL.includes('sslmode=require') || env.DATABASE_URL.includes('neon.tech') || env.DATABASE_URL.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
  });
}

export const getPool = (): Pool | null => pool;

export const query = async (text: string, params?: unknown[]) => {
  if (!pool) {
    throw new Error('Database not configured – running in demo mode');
  }
  return pool.query(text, params);
};

export const testConnection = async (): Promise<boolean> => {
  if (!pool) return false;
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch {
    return false;
  }
};
