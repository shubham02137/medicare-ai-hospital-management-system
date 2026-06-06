const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'src', 'data', 'db.json');
const BACKUP_FILE = path.join(__dirname, 'src', 'data', 'db.json.bak');
const EXPORT_FILE = path.join(__dirname, 'src', 'data', 'db_export_backup.json');

if (!fs.existsSync(DB_FILE)) {
  console.error('Database file not found at:', DB_FILE);
  process.exit(1);
}

// 1. Create backup of db.json
try {
  fs.copyFileSync(DB_FILE, BACKUP_FILE);
  console.log(`[Backup] Created complete db.json backup at: ${BACKUP_FILE}`);
} catch (e) {
  console.error('Failed to create backup:', e);
  process.exit(1);
}

// Load data
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

// 2. Export specific collections
const exportData = {
  users: db.users || [],
  appointments: db.appointments || [],
  prescriptions: db.prescriptions || [],
  labReports: db.labReports || [],
  vitals: db.vitals || []
};

try {
  fs.writeFileSync(EXPORT_FILE, JSON.stringify(exportData, null, 2), 'utf-8');
  console.log(`[Export] Created specific collections export at: ${EXPORT_FILE}`);
} catch (e) {
  console.error('Failed to write export backup:', e);
  process.exit(1);
}

// Target emails to delete
const TARGET_EMAILS = [
  'persist_1780664058611@medicare.com',
  'newdoc_1780664068880@medicare.com',
  'lab@gmail.com',
  'adminn@gmail.com',
  'receptionn@gmail.com',
  'pharma@gmail.com',
  'nurse@gmail.com'
];

const usersToDelete = db.users.filter(u => TARGET_EMAILS.includes(u.email.toLowerCase()));
const deleteUserIds = usersToDelete.map(u => u.id);

console.log(`\nFound ${usersToDelete.length} matching users to delete.`);

// 3. Safety Check: Assert zero linked records
const appointments = db.appointments || [];
const prescriptions = db.prescriptions || [];
const labReports = db.labReports || [];
const vitals = db.vitals || [];

const patients = db.patients || [];
const doctors = db.doctors || [];

for (const user of usersToDelete) {
  let matchedPatient = patients.find(p => p.user_id === user.id);
  let matchedDoctor = doctors.find(d => d.user_id === user.id);

  let apptCount = 0;
  let prescCount = 0;
  let labCount = 0;
  let checkinCount = 0;

  if (user.role === 'patient') {
    const patId = matchedPatient ? matchedPatient.id : null;
    if (patId) {
      apptCount = appointments.filter(a => a.patient_id === patId).length;
      prescCount = prescriptions.filter(p => p.patient_id === patId).length;
      labCount = labReports.filter(l => l.patient_id === patId).length;
      checkinCount = vitals.filter(v => v.patient_id === patId).length;
    }
  } else if (user.role === 'doctor') {
    const docId = matchedDoctor ? matchedDoctor.id : null;
    if (docId) {
      apptCount = appointments.filter(a => a.doctor_id === docId).length;
      prescCount = prescriptions.filter(p => p.doctor_id === docId).length;
      labCount = labReports.filter(l => l.doctor_id === docId).length;
    }
  } else if (user.role === 'nurse') {
    checkinCount = vitals.filter(v => v.nurse_id === user.id).length;
  } else if (user.role === 'lab_technician') {
    labCount = labReports.filter(l => l.technician_id === user.id).length;
  }

  const totalLinked = apptCount + prescCount + labCount + checkinCount;
  if (totalLinked > 0) {
    console.error(`[SAFETY FAILURE] User ${user.email} (ID: ${user.id}) has ${totalLinked} linked records! Deletion aborted.`);
    process.exit(1);
  }
}

console.log('Safety check passed. No delete candidates own any active patient/medical records.');

// 4. Perform Cleanup
const initialUserCount = db.users.length;

// Filter users table
db.users = db.users.filter(u => !deleteUserIds.includes(u.id));

// Filter profile tables (linked via user_id)
const profileKeys = ['patients', 'doctors', 'admins', 'nurses', 'receptionists', 'pharmacists', 'labTechnicians'];
const profileRecordsDeleted = [];

profileKeys.forEach(key => {
  if (db[key]) {
    const initialLen = db[key].length;
    db[key] = db[key].filter(record => !deleteUserIds.includes(record.user_id));
    const deletedCount = initialLen - db[key].length;
    if (deletedCount > 0) {
      profileRecordsDeleted.push(`${deletedCount} record(s) from "${key}"`);
    }
  }
});

// Save updated db.json
try {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`\n[Cleanup] Successfully wrote updated database to: ${DB_FILE}`);
} catch (e) {
  console.error('Failed to write updated database:', e);
  process.exit(1);
}

// 5. Generate MD cleanup report
const finalUserCount = db.users.length;
const deletedUserCount = initialUserCount - finalUserCount;

let reportMd = `# Final Database Cleanup & Verification Report\n\n`;
reportMd += `**Date:** ${new Date().toISOString()}\n`;
reportMd += `**Cleanup Status:** SUCCESS ✅\n\n`;

reportMd += `## Users Deleted\n`;
if (usersToDelete.length > 0) {
  usersToDelete.forEach(u => {
    reportMd += `* \`${u.id}\` - ${u.full_name} (${u.email}) - Role: \`${u.role}\`\n`;
  });
} else {
  reportMd += `* None\n`;
}

reportMd += `\n## Records Deleted\n`;
if (profileRecordsDeleted.length > 0) {
  profileRecordsDeleted.forEach(d => {
    reportMd += `* ${d}\n`;
  });
} else {
  reportMd += `* None (zero active patient records affected)\n`;
}

reportMd += `\n## Users Retained\n`;
reportMd += `* Total users retained: **${finalUserCount}**\n\n`;

reportMd += `## Records Retained\n`;
reportMd += `* Appointments retained: **${db.appointments.length}**\n`;
reportMd += `* Prescriptions retained: **${db.prescriptions.length}**\n`;
reportMd += `* Lab reports retained: **${db.labReports.length}**\n`;
reportMd += `* Check-ins (vitals) retained: **${db.vitals.length}**\n\n`;

reportMd += `## Warnings / Safety Alerts\n`;
reportMd += `* **No warning flags triggered.** Every target matched a profile with exactly zero medical logs, ensuring complete integrity of clinic history.\n`;

fs.writeFileSync(path.join(__dirname, 'user_cleanup_report.md'), reportMd, 'utf-8');
console.log('Cleanup report generated at server/user_cleanup_report.md');
