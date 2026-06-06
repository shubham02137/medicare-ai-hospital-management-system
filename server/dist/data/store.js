"use strict";
/**
 * In-memory data store for MediCare AI demo mode.
 * All CRUD operations work on plain arrays – no database required.
 * Pre-seeded with realistic demo data and pre-hashed passwords.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStockMedicines = exports.getMedicineById = exports.getMedicines = exports.createPrescription = exports.getPrescriptionsByPatient = exports.getPrescriptionById = exports.getPrescriptions = exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentsByDoctor = exports.getAppointmentsByPatient = exports.getAppointmentById = exports.getAppointments = exports.updatePatientProfileByUserId = exports.updateDoctorProfileByUserId = exports.updateLabTechnicianProfile = exports.getLabTechnicianProfileByUserId = exports.updatePharmacistProfile = exports.getPharmacistProfileByUserId = exports.updateReceptionistProfile = exports.getReceptionistProfileByUserId = exports.updateNurseProfile = exports.getNurseProfileByUserId = exports.updateAdminProfile = exports.getAdminProfileByUserId = exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorByUserId = exports.getDoctorById = exports.getDoctors = exports.deletePatient = exports.updatePatient = exports.createPatient = exports.searchPatients = exports.getPatientByUserId = exports.getPatientById = exports.getPatients = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartmentById = exports.getDepartments = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.getUserById = exports.getUsers = void 0;
exports.loadFromDisk = exports.saveToDisk = exports.deleteVital = exports.createVital = exports.getVitalsByPatient = exports.getVitalById = exports.getVitals = exports.createBilling = exports.getBillingsByPatient = exports.getBillingById = exports.getBillings = exports.deleteLabReport = exports.updateLabReport = exports.createLabReport = exports.getLabReportsByPatient = exports.getLabReportById = exports.getLabReports = exports.deleteMedicine = exports.updateMedicine = exports.createMedicine = exports.getExpiringMedicines = void 0;
const helpers_1 = require("../utils/helpers");
// ─── Pre-hashed passwords (bcrypt, 10 rounds) ──────────────────────────
// All demo passwords are hashed at startup via synchronous bcrypt in the
// seed block at the bottom of this file. The hashes below were generated
// from the plain-text passwords listed in the system prompt.
//
// admin123    → $2a$10$...
// We generate them at module load time so they're always correct.
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const h = (pw) => bcryptjs_1.default.hashSync(pw, 10);
// ─── Users ──────────────────────────────────────────────────────────────
const users = [
    {
        id: 'usr-001', email: 'admin@medicare.com', password_hash: h('admin123'),
        role: 'admin', full_name: 'Dr. Admin Kumar', phone: '+91-9876543210',
        avatar: '', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
    },
    {
        id: 'usr-002', email: 'doctor@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Priya Sharma', phone: '+91-9876543211',
        avatar: '', is_active: true, created_at: '2025-01-02T00:00:00Z', updated_at: '2025-01-02T00:00:00Z',
    },
    {
        id: 'usr-003', email: 'nurse@medicare.com', password_hash: h('nurse123'),
        role: 'nurse', full_name: 'Nurse Anjali Patel', phone: '+91-9876543212',
        avatar: '', is_active: true, created_at: '2025-01-03T00:00:00Z', updated_at: '2025-01-03T00:00:00Z',
    },
    {
        id: 'usr-004', email: 'reception@medicare.com', password_hash: h('reception123'),
        role: 'receptionist', full_name: 'Reena Gupta', phone: '+91-9876543213',
        avatar: '', is_active: true, created_at: '2025-01-04T00:00:00Z', updated_at: '2025-01-04T00:00:00Z',
    },
    {
        id: 'usr-005', email: 'patient@medicare.com', password_hash: h('patient123'),
        role: 'patient', full_name: 'Rahul Verma', phone: '+91-9876543214',
        avatar: '', is_active: true, created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-05T00:00:00Z',
    },
    {
        id: 'usr-006', email: 'pharma@medicare.com', password_hash: h('pharma123'),
        role: 'pharmacist', full_name: 'Suresh Reddy', phone: '+91-9876543215',
        avatar: '', is_active: true, created_at: '2025-01-06T00:00:00Z', updated_at: '2025-01-06T00:00:00Z',
    },
    {
        id: 'usr-007', email: 'lab@medicare.com', password_hash: h('lab123'),
        role: 'lab_technician', full_name: 'Meena Iyer', phone: '+91-9876543216',
        avatar: '', is_active: true, created_at: '2025-01-07T00:00:00Z', updated_at: '2025-01-07T00:00:00Z',
    },
    {
        id: 'usr-008', email: 'doctor2@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Amit Verma', phone: '+91-9876543217',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-009', email: 'gupta@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Rajesh Gupta', phone: '+91-9876543218',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-011', email: 'singh@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Neha Singh', phone: '+91-9876543219',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-012', email: 'rao@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Vikram Rao', phone: '+91-9876543220',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-013', email: 'jain@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Rohit Jain', phone: '+91-9876543221',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-014', email: 'kapoor@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Pooja Kapoor', phone: '+91-9876543222',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-015', email: 'mehta@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Arjun Mehta', phone: '+91-9876543223',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-016', email: 'shah@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Kunal Shah', phone: '+91-9876543224',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-017', email: 'nair@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Sneha Nair', phone: '+91-9876543225',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-018', email: 'malhotra@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Ritu Malhotra', phone: '+91-9876543226',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'usr-019', email: 'akapoor@medicare.com', password_hash: h('doctor123'),
        role: 'doctor', full_name: 'Dr. Aditya Kapoor', phone: '+91-9876543227',
        avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z',
    },
];
// ─── Departments ────────────────────────────────────────────────────────
const departments = [
    { id: 'dep-001', name: 'Cardiology', description: 'Heart and cardiovascular system', head_doctor_id: 'usr-002', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-002', name: 'Neurology', description: 'Brain and nervous system', head_doctor_id: 'usr-008', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-003', name: 'Orthopedics', description: 'Bones, joints, and muscles', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-004', name: 'Pediatrics', description: 'Child healthcare', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-005', name: 'Dermatology', description: 'Skin, hair, and nails', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-006', name: 'General Medicine', description: 'General healthcare and diagnostics', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-007', name: 'Ophthalmology', description: 'Eye care and vision', created_at: '2025-01-01T00:00:00Z' },
    { id: 'dep-008', name: 'ENT', description: 'Ear, nose, and throat', created_at: '2025-01-01T00:00:00Z' },
];
// ─── Patients ───────────────────────────────────────────────────────────
const patients = [
    {
        id: 'pat-001', user_id: 'usr-005', full_name: 'Rahul Verma', email: 'patient@medicare.com',
        phone: '+91-9876543214', date_of_birth: '1990-05-15', gender: 'male', blood_group: 'B+',
        address: '123, MG Road, Bangalore', emergency_contact: '+91-9876000001',
        medical_history: ['Hypertension', 'Diabetes Type 2'], created_at: '2025-01-05T00:00:00Z',
    },
    {
        id: 'pat-002', user_id: '', full_name: 'Ananya Desai', email: 'ananya@email.com',
        phone: '+91-9876543220', date_of_birth: '1985-08-22', gender: 'female', blood_group: 'A+',
        address: '45, Koramangala, Bangalore', emergency_contact: '+91-9876000002',
        medical_history: ['Asthma'], created_at: '2025-02-10T00:00:00Z',
    },
    {
        id: 'pat-003', user_id: '', full_name: 'Arjun Mehta', email: 'arjun@email.com',
        phone: '+91-9876543221', date_of_birth: '1978-12-03', gender: 'male', blood_group: 'O+',
        address: '78, Indiranagar, Bangalore', emergency_contact: '+91-9876000003',
        medical_history: ['Heart Disease', 'High Cholesterol'], created_at: '2025-03-15T00:00:00Z',
    },
    {
        id: 'pat-004', user_id: '', full_name: 'Sneha Nair', email: 'sneha@email.com',
        phone: '+91-9876543222', date_of_birth: '1995-03-18', gender: 'female', blood_group: 'AB-',
        address: '12, JP Nagar, Bangalore', emergency_contact: '+91-9876000004',
        medical_history: [], created_at: '2025-04-01T00:00:00Z',
    },
    {
        id: 'pat-005', user_id: '', full_name: 'Kiran Rao', email: 'kiran@email.com',
        phone: '+91-9876543223', date_of_birth: '2000-11-30', gender: 'male', blood_group: 'O-',
        address: '56, Whitefield, Bangalore', emergency_contact: '+91-9876000005',
        medical_history: ['Migraine'], created_at: '2025-04-20T00:00:00Z',
    },
];
// ─── Doctors ────────────────────────────────────────────────────────────
const doctors = [
    {
        id: 'doc-001', user_id: 'usr-002', full_name: 'Dr. Priya Sharma', email: 'doctor@medicare.com',
        phone: '+91-9876543211', department_id: 'dep-001', department_name: 'Cardiology',
        specialization: 'Interventional Cardiology', experience_years: 12,
        availability: [
            { day: 'Monday', start: '09:00', end: '17:00' },
            { day: 'Wednesday', start: '09:00', end: '17:00' },
            { day: 'Friday', start: '09:00', end: '13:00' },
        ],
        consultation_fee: 800, avatar: '', created_at: '2025-01-02T00:00:00Z',
    },
    {
        id: 'doc-002', user_id: 'usr-008', full_name: 'Dr. Amit Verma', email: 'doctor2@medicare.com',
        phone: '+91-9876543217', department_id: 'dep-002', department_name: 'Neurology',
        specialization: 'Neurophysiology', experience_years: 15,
        availability: [
            { day: 'Tuesday', start: '10:00', end: '18:00' },
            { day: 'Thursday', start: '10:00', end: '18:00' },
            { day: 'Saturday', start: '09:00', end: '14:00' },
        ],
        consultation_fee: 1000, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-003', user_id: 'usr-009', full_name: 'Dr. Rajesh Gupta', email: 'gupta@medicare.com',
        phone: '+91-9876543218', department_id: 'dep-001', department_name: 'Cardiology',
        specialization: 'Clinical Cardiology', experience_years: 10,
        availability: [
            { day: 'Tuesday', start: '09:00', end: '17:00' },
            { day: 'Thursday', start: '09:00', end: '17:00' },
        ],
        consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-005', user_id: 'usr-011', full_name: 'Dr. Neha Singh', email: 'singh@medicare.com',
        phone: '+91-9876543219', department_id: 'dep-002', department_name: 'Neurology',
        specialization: 'Cognitive Neurology', experience_years: 8,
        availability: [
            { day: 'Monday', start: '10:00', end: '16:00' },
            { day: 'Wednesday', start: '10:00', end: '16:00' },
        ],
        consultation_fee: 900, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-006', user_id: 'usr-012', full_name: 'Dr. Vikram Rao', email: 'rao@medicare.com',
        phone: '+91-9876543220', department_id: 'dep-003', department_name: 'Orthopedics',
        specialization: 'Joint Replacement', experience_years: 14,
        availability: [
            { day: 'Monday', start: '09:00', end: '15:00' },
            { day: 'Thursday', start: '09:00', end: '15:00' },
        ],
        consultation_fee: 850, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-007', user_id: 'usr-013', full_name: 'Dr. Rohit Jain', email: 'jain@medicare.com',
        phone: '+91-9876543221', department_id: 'dep-003', department_name: 'Orthopedics',
        specialization: 'Sports Medicine', experience_years: 9,
        availability: [
            { day: 'Tuesday', start: '11:00', end: '17:00' },
            { day: 'Friday', start: '11:00', end: '17:00' },
        ],
        consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-008', user_id: 'usr-014', full_name: 'Dr. Pooja Kapoor', email: 'kapoor@medicare.com',
        phone: '+91-9876543222', department_id: 'dep-005', department_name: 'Dermatology',
        specialization: 'Cosmetic Dermatology', experience_years: 11,
        availability: [
            { day: 'Wednesday', start: '09:00', end: '17:00' },
            { day: 'Saturday', start: '09:00', end: '14:00' },
        ],
        consultation_fee: 700, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-009', user_id: 'usr-015', full_name: 'Dr. Arjun Mehta', email: 'mehta@medicare.com',
        phone: '+91-9876543223', department_id: 'dep-005', department_name: 'Dermatology',
        specialization: 'Pediatric Dermatology', experience_years: 7,
        availability: [
            { day: 'Monday', start: '09:00', end: '16:00' },
            { day: 'Thursday', start: '09:00', end: '16:00' },
        ],
        consultation_fee: 650, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-010', user_id: 'usr-016', full_name: 'Dr. Kunal Shah', email: 'shah@medicare.com',
        phone: '+91-9876543224', department_id: 'dep-008', department_name: 'ENT',
        specialization: 'Otology', experience_years: 13,
        availability: [
            { day: 'Tuesday', start: '09:00', end: '17:00' },
            { day: 'Thursday', start: '09:00', end: '17:00' },
        ],
        consultation_fee: 800, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-011', user_id: 'usr-017', full_name: 'Dr. Sneha Nair', email: 'nair@medicare.com',
        phone: '+91-9876543225', department_id: 'dep-008', department_name: 'ENT',
        specialization: 'Rhinology', experience_years: 8,
        availability: [
            { day: 'Wednesday', start: '10:00', end: '16:00' },
            { day: 'Friday', start: '10:00', end: '16:00' },
        ],
        consultation_fee: 700, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-012', user_id: 'usr-018', full_name: 'Dr. Ritu Malhotra', email: 'malhotra@medicare.com',
        phone: '+91-9876543226', department_id: 'dep-007', department_name: 'Ophthalmology',
        specialization: 'Cataract & Refractive', experience_years: 12,
        availability: [
            { day: 'Monday', start: '09:00', end: '17:00' },
            { day: 'Friday', start: '09:00', end: '17:00' },
        ],
        consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
    {
        id: 'doc-013', user_id: 'usr-019', full_name: 'Dr. Aditya Kapoor', email: 'akapoor@medicare.com',
        phone: '+91-9876543227', department_id: 'dep-007', department_name: 'Ophthalmology',
        specialization: 'Glaucoma Specialist', experience_years: 9,
        availability: [
            { day: 'Tuesday', start: '09:00', end: '17:00' },
            { day: 'Wednesday', start: '09:00', end: '17:00' },
        ],
        consultation_fee: 800, avatar: '', created_at: '2025-01-08T00:00:00Z',
    },
];
const admins = [];
const nurses = [];
const receptionists = [];
const pharmacists = [];
const labTechnicians = [];
// ─── Appointments ───────────────────────────────────────────────────────
const appointments = [
    {
        id: 'apt-001', patient_id: 'pat-001', patient_name: 'Rahul Verma',
        doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology',
        date: '2025-06-10', time_slot: '10:00-10:30', status: 'confirmed',
        notes: 'Follow-up for hypertension', created_at: '2025-06-01T00:00:00Z',
    },
    {
        id: 'apt-002', patient_id: 'pat-002', patient_name: 'Ananya Desai',
        doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology',
        date: '2025-06-10', time_slot: '11:00-11:30', status: 'confirmed',
        notes: 'Recurring headaches evaluation', created_at: '2025-06-02T00:00:00Z',
    },
    {
        id: 'apt-003', patient_id: 'pat-003', patient_name: 'Arjun Mehta',
        doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology',
        date: '2025-06-08', time_slot: '14:00-14:30', status: 'completed',
        notes: 'Chest pain investigation', created_at: '2025-05-30T00:00:00Z',
    },
    {
        id: 'apt-004', patient_id: 'pat-004', patient_name: 'Sneha Nair',
        doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology',
        date: '2025-06-05', time_slot: '09:30-10:00', status: 'completed',
        notes: 'Annual check-up', created_at: '2025-05-28T00:00:00Z',
    },
    {
        id: 'apt-005', patient_id: 'pat-005', patient_name: 'Kiran Rao',
        doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology',
        date: '2025-06-12', time_slot: '10:00-10:30', status: 'pending',
        notes: 'Migraine treatment review', created_at: '2025-06-03T00:00:00Z',
    },
    {
        id: 'apt-006', patient_id: 'pat-001', patient_name: 'Rahul Verma',
        doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology',
        date: '2025-06-03', time_slot: '15:00-15:30', status: 'cancelled',
        notes: 'Patient requested cancellation', created_at: '2025-05-25T00:00:00Z',
    },
];
// ─── Prescriptions ─────────────────────────────────────────────────────
const prescriptions = [
    {
        id: 'presc-001', appointment_id: 'apt-003', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma',
        patient_id: 'pat-003', patient_name: 'Arjun Mehta', diagnosis: 'Angina Pectoris',
        medicines: [
            { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', duration: '30 days' },
            { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', duration: '30 days' },
        ],
        instructions: 'Avoid fatty foods. Regular exercise (30 min walking). Follow-up in 4 weeks.',
        follow_up_date: '2025-07-06', created_at: '2025-06-08T14:30:00Z',
    },
    {
        id: 'presc-002', appointment_id: 'apt-004', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma',
        patient_id: 'pat-004', patient_name: 'Sneha Nair', diagnosis: 'Healthy – routine check-up',
        medicines: [
            { name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly', duration: '8 weeks' },
        ],
        instructions: 'Maintain healthy diet. Repeat Vitamin D levels after 8 weeks.',
        follow_up_date: '2025-08-01', created_at: '2025-06-05T10:00:00Z',
    },
];
// ─── Medicines ──────────────────────────────────────────────────────────
const medicines = [
    { id: 'med-001', name: 'Aspirin', category: 'Cardiovascular', stock_quantity: 500, expiry_date: '2026-12-31', price: 5.50, manufacturer: 'Sun Pharma', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-002', name: 'Atorvastatin', category: 'Cardiovascular', stock_quantity: 300, expiry_date: '2026-08-15', price: 12.00, manufacturer: 'Cipla', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-003', name: 'Metoprolol', category: 'Cardiovascular', stock_quantity: 200, expiry_date: '2026-06-30', price: 8.75, manufacturer: 'Dr. Reddy\'s', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-004', name: 'Paracetamol', category: 'Analgesic', stock_quantity: 1000, expiry_date: '2027-03-01', price: 2.00, manufacturer: 'GSK', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-005', name: 'Amoxicillin', category: 'Antibiotic', stock_quantity: 15, expiry_date: '2025-07-01', price: 18.50, manufacturer: 'Cipla', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-006', name: 'Ibuprofen', category: 'NSAID', stock_quantity: 800, expiry_date: '2027-01-15', price: 4.25, manufacturer: 'Sun Pharma', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-007', name: 'Cetirizine', category: 'Antihistamine', stock_quantity: 5, expiry_date: '2025-08-20', price: 3.00, manufacturer: 'Mankind', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-008', name: 'Vitamin D3', category: 'Supplement', stock_quantity: 250, expiry_date: '2027-06-01', price: 15.00, manufacturer: 'Abbott', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-009', name: 'Omeprazole', category: 'Gastrointestinal', stock_quantity: 0, expiry_date: '2026-11-10', price: 6.50, manufacturer: 'Dr. Reddy\'s', created_at: '2025-01-01T00:00:00Z' },
    { id: 'med-010', name: 'Metformin', category: 'Antidiabetic', stock_quantity: 400, expiry_date: '2026-09-20', price: 7.00, manufacturer: 'USV', created_at: '2025-01-01T00:00:00Z' },
];
// ─── Lab Reports ────────────────────────────────────────────────────────
const labReports = [
    {
        id: 'lab-001', patient_id: 'pat-001', patient_name: 'Rahul Verma',
        doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', technician_id: 'usr-007',
        test_name: 'Complete Blood Count', test_type: 'Hematology', status: 'completed',
        results: [
            { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', normal_range: '13.0-17.0', is_abnormal: false },
            { parameter: 'WBC Count', value: '11200', unit: '/µL', normal_range: '4000-11000', is_abnormal: true },
            { parameter: 'Platelet Count', value: '250000', unit: '/µL', normal_range: '150000-400000', is_abnormal: false },
            { parameter: 'RBC Count', value: '4.8', unit: 'million/µL', normal_range: '4.5-5.5', is_abnormal: false },
        ],
        created_at: '2025-06-01T00:00:00Z',
    },
    {
        id: 'lab-002', patient_id: 'pat-003', patient_name: 'Arjun Mehta',
        doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', technician_id: 'usr-007',
        test_name: 'Lipid Profile', test_type: 'Biochemistry', status: 'completed',
        results: [
            { parameter: 'Total Cholesterol', value: '265', unit: 'mg/dL', normal_range: '<200', is_abnormal: true },
            { parameter: 'LDL', value: '175', unit: 'mg/dL', normal_range: '<100', is_abnormal: true },
            { parameter: 'HDL', value: '38', unit: 'mg/dL', normal_range: '>40', is_abnormal: true },
            { parameter: 'Triglycerides', value: '210', unit: 'mg/dL', normal_range: '<150', is_abnormal: true },
        ],
        created_at: '2025-06-07T00:00:00Z',
    },
    {
        id: 'lab-003', patient_id: 'pat-005', patient_name: 'Kiran Rao',
        doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh',
        test_name: 'MRI Brain', test_type: 'Radiology', status: 'pending',
        results: [],
        created_at: '2025-06-09T00:00:00Z',
    },
];
// ─── Billings ───────────────────────────────────────────────────────────
const billings = [
    {
        id: 'bill-001', patient_id: 'pat-003', patient_name: 'Arjun Mehta',
        appointment_id: 'apt-003', consultation_fee: 800, lab_charges: 1200,
        medicine_charges: 450, total_amount: 2450, payment_status: 'paid',
        created_at: '2025-06-08T15:00:00Z',
    },
    {
        id: 'bill-002', patient_id: 'pat-004', patient_name: 'Sneha Nair',
        appointment_id: 'apt-004', consultation_fee: 800, lab_charges: 0,
        medicine_charges: 120, total_amount: 920, payment_status: 'paid',
        created_at: '2025-06-05T10:30:00Z',
    },
    {
        id: 'bill-003', patient_id: 'pat-001', patient_name: 'Rahul Verma',
        appointment_id: 'apt-001', consultation_fee: 800, lab_charges: 600,
        medicine_charges: 0, total_amount: 1400, payment_status: 'pending',
        created_at: '2025-06-10T10:30:00Z',
    },
];
// ─── Vitals ─────────────────────────────────────────────────────────────
const vitals = [
    {
        id: 'vit-001', patient_id: 'pat-001', patient_name: 'Rahul Verma',
        nurse_id: 'usr-003', blood_pressure: '140/90', heart_rate: 82,
        temperature: 98.4, oxygen_level: 97, weight: 78.5, recorded_at: '2025-06-10T09:45:00Z',
    },
    {
        id: 'vit-002', patient_id: 'pat-003', patient_name: 'Arjun Mehta',
        nurse_id: 'usr-003', blood_pressure: '155/95', heart_rate: 88,
        temperature: 98.6, oxygen_level: 96, weight: 85.0, recorded_at: '2025-06-08T13:45:00Z',
    },
    {
        id: 'vit-003', patient_id: 'pat-004', patient_name: 'Sneha Nair',
        nurse_id: 'usr-003', blood_pressure: '118/76', heart_rate: 72,
        temperature: 98.2, oxygen_level: 99, weight: 58.0, recorded_at: '2025-06-05T09:15:00Z',
    },
    {
        id: 'vit-004', patient_id: 'pat-002', patient_name: 'Ananya Desai',
        nurse_id: 'usr-003', blood_pressure: '122/80', heart_rate: 74,
        temperature: 99.1, oxygen_level: 98, weight: 62.0, recorded_at: '2025-06-09T11:00:00Z',
    },
];
// ═══════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════
// ─── Users ──────────────────────────────────────────────────────────
const getUsers = () => users;
exports.getUsers = getUsers;
const getUserById = (id) => users.find(u => u.id === id);
exports.getUserById = getUserById;
const getUserByEmail = (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase());
exports.getUserByEmail = getUserByEmail;
const createUser = (user) => { users.push(user); (0, exports.saveToDisk)(); return user; };
exports.createUser = createUser;
const updateUser = (id, data) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1)
        return undefined;
    users[idx] = { ...users[idx], ...data, updated_at: (0, helpers_1.nowISO)() };
    (0, exports.saveToDisk)();
    return users[idx];
};
exports.updateUser = updateUser;
const deleteUser = (id) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1)
        return false;
    users.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteUser = deleteUser;
// ─── Departments ────────────────────────────────────────────────────
const getDepartments = () => departments;
exports.getDepartments = getDepartments;
const getDepartmentById = (id) => departments.find(d => d.id === id);
exports.getDepartmentById = getDepartmentById;
const createDepartment = (dept) => { departments.push(dept); (0, exports.saveToDisk)(); return dept; };
exports.createDepartment = createDepartment;
const updateDepartment = (id, data) => {
    const idx = departments.findIndex(d => d.id === id);
    if (idx === -1)
        return undefined;
    departments[idx] = { ...departments[idx], ...data };
    (0, exports.saveToDisk)();
    return departments[idx];
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = (id) => {
    const idx = departments.findIndex(d => d.id === id);
    if (idx === -1)
        return false;
    departments.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteDepartment = deleteDepartment;
// ─── Patients ───────────────────────────────────────────────────────
const getPatients = () => patients;
exports.getPatients = getPatients;
const getPatientById = (id) => patients.find(p => p.id === id);
exports.getPatientById = getPatientById;
const getPatientByUserId = (userId) => {
    let patient = patients.find(p => p.user_id === userId);
    if (!patient) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'patient') {
            patient = {
                id: 'pat-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                date_of_birth: '1990-01-01',
                gender: 'male',
                blood_group: 'O+',
                address: '',
                emergency_contact: '',
                medical_history: [],
                created_at: user.created_at,
            };
            patients.push(patient);
            (0, exports.saveToDisk)();
        }
    }
    return patient;
};
exports.getPatientByUserId = getPatientByUserId;
const searchPatients = (query) => {
    const q = query.toLowerCase();
    return patients.filter(p => p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q));
};
exports.searchPatients = searchPatients;
const createPatient = (patient) => { patients.push(patient); (0, exports.saveToDisk)(); return patient; };
exports.createPatient = createPatient;
const updatePatient = (id, data) => {
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1)
        return undefined;
    patients[idx] = { ...patients[idx], ...data };
    (0, exports.saveToDisk)();
    return patients[idx];
};
exports.updatePatient = updatePatient;
const deletePatient = (id) => {
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1)
        return false;
    patients.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deletePatient = deletePatient;
// ─── Doctors ────────────────────────────────────────────────────────
const getDoctors = () => doctors;
exports.getDoctors = getDoctors;
const getDoctorById = (id) => doctors.find(d => d.id === id);
exports.getDoctorById = getDoctorById;
const getDoctorByUserId = (userId) => {
    let doctor = doctors.find(d => d.user_id === userId);
    if (!doctor) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'doctor') {
            doctor = {
                id: 'doc-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                department_id: 'dep-006', // Default to General Medicine
                department_name: 'General Medicine',
                specialization: 'General Medicine',
                experience_years: 5,
                availability: [
                    { day: 'Monday', start: '09:00', end: '17:00' },
                    { day: 'Wednesday', start: '09:00', end: '17:00' },
                    { day: 'Friday', start: '09:00', end: '17:00' },
                ],
                consultation_fee: 500,
                avatar: '',
                created_at: user.created_at,
            };
            doctors.push(doctor);
            (0, exports.saveToDisk)();
        }
    }
    return doctor;
};
exports.getDoctorByUserId = getDoctorByUserId;
const createDoctor = (doctor) => { doctors.push(doctor); (0, exports.saveToDisk)(); return doctor; };
exports.createDoctor = createDoctor;
const updateDoctor = (id, data) => {
    const idx = doctors.findIndex(d => d.id === id);
    if (idx === -1)
        return undefined;
    doctors[idx] = { ...doctors[idx], ...data };
    (0, exports.saveToDisk)();
    return doctors[idx];
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = (id) => {
    const idx = doctors.findIndex(d => d.id === id);
    if (idx === -1)
        return false;
    doctors.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteDoctor = deleteDoctor;
// ─── Admins ─────────────────────────────────────────────────────────
const getAdminProfileByUserId = (userId) => {
    let admin = admins.find(a => a.user_id === userId);
    if (!admin) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'admin') {
            admin = {
                id: 'adm-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                designation: 'Administrator',
                department: 'IT & Operations',
                contact_details: user.phone,
                avatar: user.avatar || '',
                created_at: user.created_at,
            };
            admins.push(admin);
            (0, exports.saveToDisk)();
        }
    }
    return admin;
};
exports.getAdminProfileByUserId = getAdminProfileByUserId;
const updateAdminProfile = (userId, data) => {
    const profile = (0, exports.getAdminProfileByUserId)(userId);
    if (!profile)
        return undefined;
    Object.assign(profile, data);
    const user = users.find(u => u.id === userId);
    if (user) {
        if (data.full_name)
            user.full_name = data.full_name;
        if (data.phone)
            user.phone = data.phone;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        user.updated_at = (0, helpers_1.nowISO)();
    }
    (0, exports.saveToDisk)();
    return profile;
};
exports.updateAdminProfile = updateAdminProfile;
// ─── Nurses ─────────────────────────────────────────────────────────
const getNurseProfileByUserId = (userId) => {
    let nurse = nurses.find(n => n.user_id === userId);
    if (!nurse) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'nurse') {
            nurse = {
                id: 'nur-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                department: 'General Ward',
                shift: 'Morning',
                qualification: 'B.Sc. Nursing',
                experience: 2,
                avatar: user.avatar || '',
                created_at: user.created_at,
            };
            nurses.push(nurse);
            (0, exports.saveToDisk)();
        }
    }
    return nurse;
};
exports.getNurseProfileByUserId = getNurseProfileByUserId;
const updateNurseProfile = (userId, data) => {
    const profile = (0, exports.getNurseProfileByUserId)(userId);
    if (!profile)
        return undefined;
    Object.assign(profile, data);
    const user = users.find(u => u.id === userId);
    if (user) {
        if (data.full_name)
            user.full_name = data.full_name;
        if (data.phone)
            user.phone = data.phone;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        user.updated_at = (0, helpers_1.nowISO)();
    }
    (0, exports.saveToDisk)();
    return profile;
};
exports.updateNurseProfile = updateNurseProfile;
// ─── Receptionists ──────────────────────────────────────────────────
const getReceptionistProfileByUserId = (userId) => {
    let receptionist = receptionists.find(r => r.user_id === userId);
    if (!receptionist) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'receptionist') {
            receptionist = {
                id: 'rec-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                desk_number: 'Desk 1',
                shift: 'Morning',
                experience: 2,
                avatar: user.avatar || '',
                created_at: user.created_at,
            };
            receptionists.push(receptionist);
            (0, exports.saveToDisk)();
        }
    }
    return receptionist;
};
exports.getReceptionistProfileByUserId = getReceptionistProfileByUserId;
const updateReceptionistProfile = (userId, data) => {
    const profile = (0, exports.getReceptionistProfileByUserId)(userId);
    if (!profile)
        return undefined;
    Object.assign(profile, data);
    const user = users.find(u => u.id === userId);
    if (user) {
        if (data.full_name)
            user.full_name = data.full_name;
        if (data.phone)
            user.phone = data.phone;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        user.updated_at = (0, helpers_1.nowISO)();
    }
    (0, exports.saveToDisk)();
    return profile;
};
exports.updateReceptionistProfile = updateReceptionistProfile;
// ─── Pharmacists ────────────────────────────────────────────────────
const getPharmacistProfileByUserId = (userId) => {
    let pharmacist = pharmacists.find(p => p.user_id === userId);
    if (!pharmacist) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'pharmacist') {
            pharmacist = {
                id: 'phr-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                license_number: 'PHA-999999',
                qualification: 'B.Pharm',
                experience: 2,
                avatar: user.avatar || '',
                created_at: user.created_at,
            };
            pharmacists.push(pharmacist);
            (0, exports.saveToDisk)();
        }
    }
    return pharmacist;
};
exports.getPharmacistProfileByUserId = getPharmacistProfileByUserId;
const updatePharmacistProfile = (userId, data) => {
    const profile = (0, exports.getPharmacistProfileByUserId)(userId);
    if (!profile)
        return undefined;
    Object.assign(profile, data);
    const user = users.find(u => u.id === userId);
    if (user) {
        if (data.full_name)
            user.full_name = data.full_name;
        if (data.phone)
            user.phone = data.phone;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        user.updated_at = (0, helpers_1.nowISO)();
    }
    (0, exports.saveToDisk)();
    return profile;
};
exports.updatePharmacistProfile = updatePharmacistProfile;
// ─── Lab Technicians ────────────────────────────────────────────────
const getLabTechnicianProfileByUserId = (userId) => {
    let labTech = labTechnicians.find(l => l.user_id === userId);
    if (!labTech) {
        const user = users.find(u => u.id === userId);
        if (user && user.role === 'lab_technician') {
            labTech = {
                id: 'lab-' + (0, helpers_1.generateId)().split('-').pop(),
                user_id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                lab_department: 'Pathology',
                qualification: 'B.Sc. MLT',
                license_number: 'LAB-999999',
                experience: 2,
                avatar: user.avatar || '',
                created_at: user.created_at,
            };
            labTechnicians.push(labTech);
            (0, exports.saveToDisk)();
        }
    }
    return labTech;
};
exports.getLabTechnicianProfileByUserId = getLabTechnicianProfileByUserId;
const updateLabTechnicianProfile = (userId, data) => {
    const profile = (0, exports.getLabTechnicianProfileByUserId)(userId);
    if (!profile)
        return undefined;
    Object.assign(profile, data);
    const user = users.find(u => u.id === userId);
    if (user) {
        if (data.full_name)
            user.full_name = data.full_name;
        if (data.phone)
            user.phone = data.phone;
        if (data.avatar !== undefined)
            user.avatar = data.avatar;
        user.updated_at = (0, helpers_1.nowISO)();
    }
    (0, exports.saveToDisk)();
    return profile;
};
exports.updateLabTechnicianProfile = updateLabTechnicianProfile;
const updateDoctorProfileByUserId = (userId, data) => {
    let doctor = (0, exports.getDoctorByUserId)(userId);
    if (!doctor)
        return undefined;
    const idx = doctors.findIndex(d => d.user_id === userId);
    if (idx !== -1) {
        doctors[idx] = { ...doctors[idx], ...data };
        const user = users.find(u => u.id === userId);
        if (user) {
            if (data.full_name)
                user.full_name = data.full_name;
            if (data.phone)
                user.phone = data.phone;
            if (data.avatar !== undefined)
                user.avatar = data.avatar;
            user.updated_at = (0, helpers_1.nowISO)();
        }
        (0, exports.saveToDisk)();
        return doctors[idx];
    }
    return undefined;
};
exports.updateDoctorProfileByUserId = updateDoctorProfileByUserId;
const updatePatientProfileByUserId = (userId, data) => {
    let patient = (0, exports.getPatientByUserId)(userId);
    if (!patient)
        return undefined;
    const idx = patients.findIndex(p => p.user_id === userId);
    if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...data };
        const user = users.find(u => u.id === userId);
        if (user) {
            if (data.full_name)
                user.full_name = data.full_name;
            if (data.phone)
                user.phone = data.phone;
            user.updated_at = (0, helpers_1.nowISO)();
        }
        (0, exports.saveToDisk)();
        return patients[idx];
    }
    return undefined;
};
exports.updatePatientProfileByUserId = updatePatientProfileByUserId;
// ─── Appointments ───────────────────────────────────────────────────
const getAppointments = () => appointments;
exports.getAppointments = getAppointments;
const getAppointmentById = (id) => appointments.find(a => a.id === id);
exports.getAppointmentById = getAppointmentById;
const getAppointmentsByPatient = (patientId) => appointments.filter(a => a.patient_id === patientId);
exports.getAppointmentsByPatient = getAppointmentsByPatient;
const getAppointmentsByDoctor = (doctorId) => appointments.filter(a => a.doctor_id === doctorId);
exports.getAppointmentsByDoctor = getAppointmentsByDoctor;
const createAppointment = (appt) => { appointments.push(appt); (0, exports.saveToDisk)(); return appt; };
exports.createAppointment = createAppointment;
const updateAppointment = (id, data) => {
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1)
        return undefined;
    appointments[idx] = { ...appointments[idx], ...data };
    (0, exports.saveToDisk)();
    return appointments[idx];
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = (id) => {
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1)
        return false;
    appointments.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteAppointment = deleteAppointment;
// ─── Prescriptions ─────────────────────────────────────────────────
const getPrescriptions = () => prescriptions;
exports.getPrescriptions = getPrescriptions;
const getPrescriptionById = (id) => prescriptions.find(p => p.id === id);
exports.getPrescriptionById = getPrescriptionById;
const getPrescriptionsByPatient = (patientId) => prescriptions.filter(p => p.patient_id === patientId);
exports.getPrescriptionsByPatient = getPrescriptionsByPatient;
const createPrescription = (presc) => { prescriptions.push(presc); (0, exports.saveToDisk)(); return presc; };
exports.createPrescription = createPrescription;
// ─── Medicines ──────────────────────────────────────────────────────
const getMedicines = () => medicines;
exports.getMedicines = getMedicines;
const getMedicineById = (id) => medicines.find(m => m.id === id);
exports.getMedicineById = getMedicineById;
const getLowStockMedicines = (threshold = 20) => medicines.filter(m => m.stock_quantity <= threshold);
exports.getLowStockMedicines = getLowStockMedicines;
const getExpiringMedicines = (withinDays = 90) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return medicines.filter(m => new Date(m.expiry_date) <= cutoff);
};
exports.getExpiringMedicines = getExpiringMedicines;
const createMedicine = (med) => { medicines.push(med); (0, exports.saveToDisk)(); return med; };
exports.createMedicine = createMedicine;
const updateMedicine = (id, data) => {
    const idx = medicines.findIndex(m => m.id === id);
    if (idx === -1)
        return undefined;
    medicines[idx] = { ...medicines[idx], ...data };
    (0, exports.saveToDisk)();
    return medicines[idx];
};
exports.updateMedicine = updateMedicine;
const deleteMedicine = (id) => {
    const idx = medicines.findIndex(m => m.id === id);
    if (idx === -1)
        return false;
    medicines.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteMedicine = deleteMedicine;
// ─── Lab Reports ────────────────────────────────────────────────────
const getLabReports = () => labReports;
exports.getLabReports = getLabReports;
const getLabReportById = (id) => labReports.find(l => l.id === id);
exports.getLabReportById = getLabReportById;
const getLabReportsByPatient = (patientId) => labReports.filter(l => l.patient_id === patientId);
exports.getLabReportsByPatient = getLabReportsByPatient;
const createLabReport = (report) => { labReports.push(report); (0, exports.saveToDisk)(); return report; };
exports.createLabReport = createLabReport;
const updateLabReport = (id, data) => {
    const idx = labReports.findIndex(l => l.id === id);
    if (idx === -1)
        return undefined;
    labReports[idx] = { ...labReports[idx], ...data };
    (0, exports.saveToDisk)();
    return labReports[idx];
};
exports.updateLabReport = updateLabReport;
const deleteLabReport = (id) => {
    const idx = labReports.findIndex(l => l.id === id);
    if (idx === -1)
        return false;
    labReports.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteLabReport = deleteLabReport;
// ─── Billings ───────────────────────────────────────────────────────
const getBillings = () => billings;
exports.getBillings = getBillings;
const getBillingById = (id) => billings.find(b => b.id === id);
exports.getBillingById = getBillingById;
const getBillingsByPatient = (patientId) => billings.filter(b => b.patient_id === patientId);
exports.getBillingsByPatient = getBillingsByPatient;
const createBilling = (bill) => { billings.push(bill); (0, exports.saveToDisk)(); return bill; };
exports.createBilling = createBilling;
// ─── Vitals ─────────────────────────────────────────────────────────
const getVitals = () => vitals;
exports.getVitals = getVitals;
const getVitalById = (id) => vitals.find(v => v.id === id);
exports.getVitalById = getVitalById;
const getVitalsByPatient = (patientId) => vitals.filter(v => v.patient_id === patientId);
exports.getVitalsByPatient = getVitalsByPatient;
const createVital = (vital) => { vitals.push(vital); (0, exports.saveToDisk)(); return vital; };
exports.createVital = createVital;
const deleteVital = (id) => {
    const idx = vitals.findIndex(v => v.id === id);
    if (idx === -1)
        return false;
    vitals.splice(idx, 1);
    (0, exports.saveToDisk)();
    return true;
};
exports.deleteVital = deleteVital;
// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE LAYER (JSON FLAT-FILE DATABASE)
// ═══════════════════════════════════════════════════════════════════════
const DB_FILE = path_1.default.join(__dirname, 'db.json');
const saveToDisk = () => {
    const data = {
        users,
        departments,
        patients,
        doctors,
        appointments,
        prescriptions,
        medicines,
        labReports,
        billings,
        vitals,
        admins,
        nurses,
        receptionists,
        pharmacists,
        labTechnicians
    };
    try {
        fs_1.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    catch (e) {
        console.error('Failed to write database to disk:', e);
    }
};
exports.saveToDisk = saveToDisk;
const loadFromDisk = () => {
    if (fs_1.default.existsSync(DB_FILE)) {
        try {
            const fileData = fs_1.default.readFileSync(DB_FILE, 'utf-8');
            const data = JSON.parse(fileData);
            if (data.users) {
                users.length = 0;
                users.push(...data.users);
            }
            if (data.departments) {
                departments.length = 0;
                departments.push(...data.departments);
            }
            if (data.patients) {
                patients.length = 0;
                patients.push(...data.patients);
            }
            if (data.doctors) {
                doctors.length = 0;
                doctors.push(...data.doctors);
            }
            if (data.appointments) {
                appointments.length = 0;
                appointments.push(...data.appointments);
            }
            if (data.prescriptions) {
                prescriptions.length = 0;
                prescriptions.push(...data.prescriptions);
            }
            if (data.medicines) {
                medicines.length = 0;
                medicines.push(...data.medicines);
            }
            if (data.labReports) {
                labReports.length = 0;
                labReports.push(...data.labReports);
            }
            if (data.billings) {
                billings.length = 0;
                billings.push(...data.billings);
            }
            if (data.vitals) {
                vitals.length = 0;
                vitals.push(...data.vitals);
            }
            if (data.admins) {
                admins.length = 0;
                admins.push(...data.admins);
            }
            if (data.nurses) {
                nurses.length = 0;
                nurses.push(...data.nurses);
            }
            if (data.receptionists) {
                receptionists.length = 0;
                receptionists.push(...data.receptionists);
            }
            if (data.pharmacists) {
                pharmacists.length = 0;
                pharmacists.push(...data.pharmacists);
            }
            if (data.labTechnicians) {
                labTechnicians.length = 0;
                labTechnicians.push(...data.labTechnicians);
            }
        }
        catch (e) {
            console.error('Failed to load database from disk, using in-memory defaults:', e);
        }
    }
    else {
        // Initial save to create the file
        (0, exports.saveToDisk)();
    }
};
exports.loadFromDisk = loadFromDisk;
// Auto-load database state from file at module load time
(0, exports.loadFromDisk)();
//# sourceMappingURL=store.js.map