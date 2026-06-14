import fs from 'fs';
import path from 'path';

const DB_JSON_PATH = path.resolve(__dirname, 'src/data/db.json');

if (!fs.existsSync(DB_JSON_PATH)) {
  console.error(`❌ Error: db.json not found at ${DB_JSON_PATH}`);
  process.exit(1);
}

function analyzeDb() {
  const rawData = fs.readFileSync(DB_JSON_PATH, 'utf-8');
  const data = JSON.parse(rawData);

  console.log('======================================================');
  console.log('         DATABASE MIGRATION PREVIEW REPORT            ');
  console.log('======================================================\n');

  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      counts[key] = value.length;
    }
  }

  console.log('--- RECORD COUNTS ---');
  console.log(`Users: ${counts.users || 0}`);
  console.log(`Departments: ${counts.departments || 0}`);
  console.log(`Patients: ${counts.patients || 0}`);
  console.log(`Doctors: ${counts.doctors || 0}`);
  console.log(`Appointments: ${counts.appointments || 0}`);
  console.log(`Prescriptions: ${counts.prescriptions || 0}`);
  console.log(`Medicines: ${counts.medicines || 0}`);
  console.log(`Lab Reports: ${counts.labReports || 0}`);
  console.log(`Billings: ${counts.billings || 0}`);
  console.log(`Vitals: ${counts.vitals || 0}`);
  console.log(`Admins: ${counts.admins || 0}`);
  console.log(`Nurses: ${counts.nurses || 0}`);
  console.log(`Receptionists: ${counts.receptionists || 0}`);
  console.log(`Pharmacists: ${counts.pharmacists || 0}`);
  console.log(`Lab Technicians: ${counts.labTechnicians || 0}\n`);

  console.log('--- RELATIONSHIP & INTEGRITY AUDIT ---');
  
  // Audits
  const userIds = new Set(data.users.map((u: any) => u.id));
  const deptIds = new Set(data.departments.map((d: any) => d.id));
  const patientIds = new Set(data.patients.map((p: any) => p.id));
  const doctorIds = new Set(data.doctors.map((d: any) => d.id));
  const appointmentIds = new Set(data.appointments.map((a: any) => a.id));

  let orphans = 0;
  let duplicates = 0;

  // Check duplicate IDs within tables
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      const ids = value.map((item: any) => item.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.log(`⚠️ Warning: Duplicate IDs found in collection '${key}'`);
        duplicates += (ids.length - uniqueIds.size);
      }
    }
  }

  // Check user profiles relationship (1-to-1)
  for (const p of data.patients) {
    if (p.user_id && !userIds.has(p.user_id)) {
      console.log(`⚠️ Orphan Patient Profile: Patient ID '${p.id}' references non-existent User ID '${p.user_id}'`);
      orphans++;
    }
  }

  for (const d of data.doctors) {
    if (d.user_id && !userIds.has(d.user_id)) {
      console.log(`⚠️ Orphan Doctor Profile: Doctor ID '${d.id}' references non-existent User ID '${d.user_id}'`);
      orphans++;
    }
    if (d.department_id && !deptIds.has(d.department_id)) {
      console.log(`⚠️ Orphan Doctor Reference: Doctor ID '${d.id}' references non-existent Department ID '${d.department_id}'`);
      orphans++;
    }
  }

  // Check appointments relationships
  for (const a of data.appointments) {
    if (!patientIds.has(a.patient_id)) {
      console.log(`⚠️ Orphan Appointment: Appointment '${a.id}' references non-existent Patient '${a.patient_id}'`);
      orphans++;
    }
    if (!doctorIds.has(a.doctor_id)) {
      console.log(`⚠️ Orphan Appointment: Appointment '${a.id}' references non-existent Doctor '${a.doctor_id}'`);
      orphans++;
    }
  }

  // Check prescriptions relationships
  for (const pr of data.prescriptions) {
    if (pr.appointment_id && !appointmentIds.has(pr.appointment_id)) {
      console.log(`⚠️ Orphan Prescription: Prescription '${pr.id}' references non-existent Appointment '${pr.appointment_id}'`);
      orphans++;
    }
    if (!doctorIds.has(pr.doctor_id)) {
      console.log(`⚠️ Orphan Prescription: Prescription '${pr.id}' references non-existent Doctor '${pr.doctor_id}'`);
      orphans++;
    }
    if (!patientIds.has(pr.patient_id)) {
      console.log(`⚠️ Orphan Prescription: Prescription '${pr.id}' references non-existent Patient '${pr.patient_id}'`);
      orphans++;
    }
  }

  // Check lab reports relationships
  for (const lr of data.labReports) {
    if (!patientIds.has(lr.patient_id)) {
      console.log(`⚠️ Orphan Lab Report: Lab Report '${lr.id}' references non-existent Patient '${lr.patient_id}'`);
      orphans++;
    }
    if (!doctorIds.has(lr.doctor_id)) {
      console.log(`⚠️ Orphan Lab Report: Lab Report '${lr.id}' references non-existent Doctor '${lr.doctor_id}'`);
      orphans++;
    }
    if (lr.technician_id && !userIds.has(lr.technician_id)) {
      console.log(`⚠️ Orphan Lab Report: Lab Report '${lr.id}' references non-existent Technician User '${lr.technician_id}'`);
      orphans++;
    }
  }

  // Check billing records relationships
  for (const b of data.billings) {
    if (!patientIds.has(b.patient_id)) {
      console.log(`⚠️ Orphan Billing: Billing '${b.id}' references non-existent Patient '${b.patient_id}'`);
      orphans++;
    }
    if (b.appointment_id && !appointmentIds.has(b.appointment_id)) {
      console.log(`⚠️ Orphan Billing: Billing '${b.id}' references non-existent Appointment '${b.appointment_id}'`);
      orphans++;
    }
  }

  // Check vitals relationships
  for (const v of data.vitals) {
    if (!patientIds.has(v.patient_id)) {
      console.log(`⚠️ Orphan Vitals: Vitals '${v.id}' references non-existent Patient '${v.patient_id}'`);
      orphans++;
    }
    if (v.nurse_id && !userIds.has(v.nurse_id)) {
      console.log(`⚠️ Orphan Vitals: Vitals '${v.id}' references non-existent Nurse User '${v.nurse_id}'`);
      orphans++;
    }
  }

  console.log(`\nAudit finished with: ${orphans} orphan references, ${duplicates} duplicate primary keys.`);
  
  if (orphans === 0 && duplicates === 0) {
    console.log('\nRESULT_SAFE_TO_MIGRATE: YES');
  } else {
    console.log('\nRESULT_SAFE_TO_MIGRATE: NO');
  }
}

analyzeDb();
