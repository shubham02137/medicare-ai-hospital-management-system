import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;

async function testConnection() {
  console.log(`Checking connection using DATABASE_URL: ${dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'undefined'}`);
  
  if (!dbUrl || dbUrl.includes('placeholder')) {
    console.log('RESULT_CONNECTION_SUCCESSFUL: NO');
    console.log('RESULT_REACHED: NO');
    console.log('RESULT_VERSION: N/A');
    console.log('RESULT_DB_NAME: N/A');
    console.log('REASON: DATABASE_URL is not configured (contains placeholder or is empty).');
    process.exit(0);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('sslmode=require') || dbUrl.includes('neon.tech') || dbUrl.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await client.connect();
    
    const versionRes = await client.query('SELECT version();');
    const dbNameRes = await client.query('SELECT current_database();');
    
    console.log('RESULT_CONNECTION_SUCCESSFUL: YES');
    console.log('RESULT_REACHED: YES');
    console.log(`RESULT_VERSION: ${versionRes.rows[0].version}`);
    console.log(`RESULT_DB_NAME: ${dbNameRes.rows[0].current_database}`);
    
    await client.end();
  } catch (err: any) {
    console.log('RESULT_CONNECTION_SUCCESSFUL: NO');
    console.log('RESULT_REACHED: NO');
    console.log('RESULT_VERSION: N/A');
    console.log('RESULT_DB_NAME: N/A');
    console.log(`REASON: ${err.message}`);
  }
}

testConnection();
