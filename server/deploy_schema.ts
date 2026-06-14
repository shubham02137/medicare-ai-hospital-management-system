import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || dbUrl.includes('placeholder')) {
  console.error('❌ Error: DATABASE_URL is not configured properly.');
  process.exit(1);
}

const activeUrl: string = dbUrl;
const SCHEMA_PATH = path.resolve(__dirname, 'src/config/schema.sql');

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`❌ Error: schema.sql file not found at ${SCHEMA_PATH}`);
  process.exit(1);
}

async function deploySchema() {
  console.log('🚀 Connecting to PostgreSQL and deploying schema...');
  
  const client = new Client({
    connectionString: activeUrl,
    ssl: activeUrl.includes('sslmode=require') || activeUrl.includes('neon.tech') || activeUrl.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await client.connect();
    console.log('✅ Connection established.');

    console.log('📖 Reading schema.sql...');
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');

    console.log('⚡ Executing schema SQL queries...');
    await client.query(schemaSql);
    console.log('✅ Schema deployment completed successfully.');

    // Verification queries
    console.log('🔍 Verifying created tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tablesRes = await client.query(tablesQuery);
    const tables = tablesRes.rows.map(row => row.table_name);
    console.log(`Created tables: ${tables.join(', ')}`);

    console.log('🔍 Verifying constraints...');
    const constraintsQuery = `
      SELECT constraint_name, table_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public'
      ORDER BY table_name, constraint_type;
    `;
    const constraintsRes = await client.query(constraintsQuery);
    console.log(`Found ${constraintsRes.rowCount} total constraints in schema.`);

    console.log('🔍 Verifying trigger configuration...');
    const triggersQuery = `
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public';
    `;
    const triggersRes = await client.query(triggersQuery);
    console.log(`Found triggers: ${triggersRes.rows.map(r => `${r.trigger_name} on ${r.event_object_table}`).join(', ')}`);

    console.log('\n--- VERIFICATION REPORT ---');
    console.log(`STATUS: SUCCESS`);
    console.log(`TABLES_COUNT: ${tables.length}`);
    console.log(`CONSTRAINTS_COUNT: ${constraintsRes.rowCount}`);
    console.log(`TRIGGERS_COUNT: ${triggersRes.rowCount}`);

    await client.end();
  } catch (err: any) {
    console.error('❌ Error deploying schema:', err);
    process.exit(1);
  }
}

deploySchema();
