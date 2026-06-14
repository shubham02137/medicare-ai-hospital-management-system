import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL!;

async function testSelect() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, name FROM departments;');
    console.log('--- DEPARTMENTS IN POSTGRESQL ---');
    console.log(res.rows);
    await client.end();
  } catch (err: any) {
    console.error('Error:', err);
  }
}

testSelect();
