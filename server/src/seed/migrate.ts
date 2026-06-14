import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined in .env file.');
  process.exit(1);
}

const DB_JSON_PATH = path.resolve(__dirname, '../data/db.json');

if (!fs.existsSync(DB_JSON_PATH)) {
  console.error(`❌ Error: db.json file not found at ${DB_JSON_PATH}`);
  process.exit(1);
}

// Map to keep track of human-readable mock IDs to standard UUIDs
const idMap = new Map<string, string>();

function getUUID(oldId: string | undefined | null): string | null {
  if (!oldId || oldId.trim() === '') return null;
  
  // If it's already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(oldId)) return oldId;
  
  if (idMap.has(oldId)) {
    return idMap.get(oldId)!;
  }
  const newUUID = uuidv4();
  idMap.set(oldId, newUUID);
  return newUUID;
}

async function runMigration() {
  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not defined.');
    process.exit(1);
  }
  const activeUrl: string = DATABASE_URL;
  console.log('🚀 Starting PostgreSQL migration...');
  console.log(`Connecting to: ${activeUrl.replace(/:[^:@]+@/, ':****@')}`);
  
  const pool = new Pool({
    connectionString: activeUrl,
    ssl: activeUrl.includes('sslmode=require') || activeUrl.includes('render.com') || activeUrl.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : undefined
  });
  
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully.');
    
    // Read local db.json data
    const rawData = fs.readFileSync(DB_JSON_PATH, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Begin Transaction
    await client.query('BEGIN');
    console.log('📦 Clear existing tables...');
    
    // Truncate tables in reverse order of foreign keys
    const tablesToTruncate = [
      'vitals', 'billings', 'lab_reports', 'prescriptions', 'appointments',
      'lab_technician_profiles', 'pharmacist_profiles', 'receptionist_profiles',
      'nurse_profiles', 'admin_profiles', 'doctors', 'patients', 'departments', 'users', 'medicines'
    ];
    
    for (const table of tablesToTruncate) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
    
    // 1. Migrate Users
    console.log('👤 Migrating users...');
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        const newId = getUUID(u.id);
        await client.query(
          `INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newId,
            u.email,
            u.password_hash,
            u.role,
            u.full_name,
            u.phone || '',
            u.avatar || '',
            u.is_active ?? true,
            u.created_at || new Date().toISOString(),
            u.updated_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.users.length} users.`);
    }

    // 2. Migrate Departments
    console.log('🏢 Migrating departments...');
    if (Array.isArray(data.departments)) {
      for (const d of data.departments) {
        const newId = getUUID(d.id);
        const headDocId = getUUID(d.head_doctor_id);
        await client.query(
          `INSERT INTO departments (id, name, description, head_doctor_id, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            newId,
            d.name,
            d.description || '',
            headDocId,
            d.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.departments.length} departments.`);
    }

    // 3. Migrate Patients
    console.log('🏥 Migrating patient profiles...');
    if (Array.isArray(data.patients)) {
      for (const p of data.patients) {
        const newId = getUUID(p.id);
        const userId = getUUID(p.user_id);
        await client.query(
          `INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history, allergies, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newId,
            userId,
            p.date_of_birth || '1990-01-01',
            p.gender || 'male',
            p.blood_group || 'O+',
            p.address || '',
            p.emergency_contact || '',
            JSON.stringify(p.medical_history || []),
            JSON.stringify(p.allergies || []),
            p.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.patients.length} patients.`);
    }

    // 4. Migrate Doctors
    console.log('🩺 Migrating doctor profiles...');
    if (Array.isArray(data.doctors)) {
      for (const d of data.doctors) {
        const newId = getUUID(d.id);
        const userId = getUUID(d.user_id);
        const deptId = getUUID(d.department_id);
        await client.query(
          `INSERT INTO doctors (id, user_id, department_id, specialization, experience_years, availability, consultation_fee, qualification, license_number, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newId,
            userId,
            deptId,
            d.specialization || 'General Medicine',
            d.experience_years || 0,
            JSON.stringify(d.availability || []),
            d.consultation_fee || 0.00,
            d.qualification || '',
            d.license_number || '',
            d.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.doctors.length} doctors.`);
    }

    // 5. Migrate Admin Profiles
    console.log('🔑 Migrating admin profiles...');
    if (Array.isArray(data.admins)) {
      for (const a of data.admins) {
        const newId = getUUID(a.id);
        const userId = getUUID(a.user_id);
        await client.query(
          `INSERT INTO admin_profiles (id, user_id, designation, department, contact_details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newId,
            userId,
            a.designation || 'Administrator',
            a.department || 'IT & Operations',
            a.contact_details || '',
            a.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.admins.length} admin profiles.`);
    }

    // 6. Migrate Nurse Profiles
    console.log('🩹 Migrating nurse profiles...');
    if (Array.isArray(data.nurses)) {
      for (const n of data.nurses) {
        const newId = getUUID(n.id);
        const userId = getUUID(n.user_id);
        await client.query(
          `INSERT INTO nurse_profiles (id, user_id, department, shift, qualification, experience, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newId,
            userId,
            n.department || 'General Ward',
            n.shift || 'Morning',
            n.qualification || 'B.Sc. Nursing',
            n.experience || 0,
            n.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.nurses.length} nurse profiles.`);
    }

    // 7. Migrate Receptionist Profiles
    console.log('📋 Migrating receptionist profiles...');
    if (Array.isArray(data.receptionists)) {
      for (const r of data.receptionists) {
        const newId = getUUID(r.id);
        const userId = getUUID(r.user_id);
        await client.query(
          `INSERT INTO receptionist_profiles (id, user_id, desk_number, shift, experience, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newId,
            userId,
            r.desk_number || 'Desk 1',
            r.shift || 'Morning',
            r.experience || 0,
            r.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.receptionists.length} receptionist profiles.`);
    }

    // 8. Migrate Pharmacist Profiles
    console.log('💊 Migrating pharmacist profiles...');
    if (Array.isArray(data.pharmacists)) {
      for (const p of data.pharmacists) {
        const newId = getUUID(p.id);
        const userId = getUUID(p.user_id);
        await client.query(
          `INSERT INTO pharmacist_profiles (id, user_id, license_number, qualification, experience, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newId,
            userId,
            p.license_number || '',
            p.qualification || 'B.Pharm',
            p.experience || 0,
            p.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.pharmacists.length} pharmacist profiles.`);
    }

    // 9. Migrate Lab Technician Profiles
    console.log('🧪 Migrating lab technician profiles...');
    if (Array.isArray(data.labTechnicians)) {
      for (const l of data.labTechnicians) {
        const newId = getUUID(l.id);
        const userId = getUUID(l.user_id);
        await client.query(
          `INSERT INTO lab_technician_profiles (id, user_id, lab_department, qualification, license_number, experience, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newId,
            userId,
            l.lab_department || 'Pathology',
            l.qualification || 'B.Sc. MLT',
            l.license_number || '',
            l.experience || 0,
            l.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.labTechnicians.length} lab technician profiles.`);
    }

    // 10. Migrate Appointments
    console.log('📅 Migrating appointments...');
    if (Array.isArray(data.appointments)) {
      for (const a of data.appointments) {
        const newId = getUUID(a.id);
        const patientId = getUUID(a.patient_id);
        const doctorId = getUUID(a.doctor_id);
        await client.query(
          `INSERT INTO appointments (id, patient_id, doctor_id, date, time_slot, status, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            newId,
            patientId,
            doctorId,
            a.date,
            a.time_slot,
            a.status || 'pending',
            a.notes || '',
            a.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.appointments.length} appointments.`);
    }

    // 11. Migrate Prescriptions
    console.log('📝 Migrating prescriptions...');
    if (Array.isArray(data.prescriptions)) {
      for (const pr of data.prescriptions) {
        const newId = getUUID(pr.id);
        const apptId = getUUID(pr.appointment_id);
        const doctorId = getUUID(pr.doctor_id);
        const patientId = getUUID(pr.patient_id);
        await client.query(
          `INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, medicines, instructions, follow_up_date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newId,
            apptId,
            doctorId,
            patientId,
            pr.diagnosis,
            JSON.stringify(pr.medicines || []),
            pr.instructions || '',
            pr.follow_up_date || null,
            pr.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.prescriptions.length} prescriptions.`);
    }

    // 12. Migrate Medicines
    console.log('💊 Migrating medicines inventory...');
    if (Array.isArray(data.medicines)) {
      for (const m of data.medicines) {
        const newId = getUUID(m.id);
        await client.query(
          `INSERT INTO medicines (id, name, category, stock_quantity, expiry_date, price, manufacturer, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            newId,
            m.name,
            m.category || '',
            m.stock_quantity || 0,
            m.expiry_date || '2030-01-01',
            m.price || 0.00,
            m.manufacturer || '',
            m.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.medicines.length} medicines.`);
    }

    // 13. Migrate Lab Reports
    console.log('🧪 Migrating lab reports...');
    if (Array.isArray(data.labReports)) {
      for (const lr of data.labReports) {
        const newId = getUUID(lr.id);
        const patientId = getUUID(lr.patient_id);
        const doctorId = getUUID(lr.doctor_id);
        
        // Resolve orphan technician reference ('tech-001' maps to seeded technician user 'usr-007')
        const isUserExists = data.users.some((u: any) => u.id === lr.technician_id);
        const techId = isUserExists ? getUUID(lr.technician_id) : (lr.technician_id === 'tech-001' ? getUUID('usr-007') : null);
        await client.query(
          `INSERT INTO lab_reports (id, patient_id, doctor_id, technician_id, test_name, test_type, status, results, report_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newId,
            patientId,
            doctorId,
            techId,
            lr.test_name,
            lr.test_type || '',
            lr.status || 'pending',
            JSON.stringify(lr.results || []),
            lr.report_url || '',
            lr.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.labReports.length} lab reports.`);
    }

    // 14. Migrate Billings
    console.log('💵 Migrating billing records...');
    if (Array.isArray(data.billings)) {
      for (const b of data.billings) {
        const newId = getUUID(b.id);
        const patientId = getUUID(b.patient_id);
        const apptId = getUUID(b.appointment_id);
        await client.query(
          `INSERT INTO billings (id, patient_id, appointment_id, consultation_fee, lab_charges, medicine_charges, total_amount, payment_status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newId,
            patientId,
            apptId,
            b.consultation_fee || 0.00,
            b.lab_charges || 0.00,
            b.medicine_charges || 0.00,
            b.total_amount || 0.00,
            (b.payment_status === 'partial' ? 'partially_paid' : (b.payment_status || 'pending')),
            b.created_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.billings.length} billings.`);
    }

    // 15. Migrate Vitals
    console.log('💓 Migrating vitals records...');
    if (Array.isArray(data.vitals)) {
      for (const v of data.vitals) {
        const newId = getUUID(v.id);
        const patientId = getUUID(v.patient_id);
        const nurseId = getUUID(v.nurse_id);
        await client.query(
          `INSERT INTO vitals (id, patient_id, nurse_id, blood_pressure, heart_rate, temperature, oxygen_level, weight, recorded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newId,
            patientId,
            nurseId,
            v.blood_pressure,
            v.heart_rate || 0,
            v.temperature || 98.6,
            v.oxygen_level || 98,
            v.weight || 0.0,
            v.recorded_at || new Date().toISOString()
          ]
        );
      }
      console.log(`✅ Migrated ${data.vitals.length} vitals.`);
    }

    // Commit Transaction
    await client.query('COMMIT');
    console.log('🎉 Migration completed successfully and transaction committed!');
    
  } catch (err) {
    if (client) {
      console.log('🔄 Error encountered. Rolling back transaction...');
      await client.query('ROLLBACK');
    }
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigration();
