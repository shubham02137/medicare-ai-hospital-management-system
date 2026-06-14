/**
 * In-memory data store with PostgreSQL synchronization for MediCare AI.
 * Falls back to local db.json demo mode if DATABASE_URL is not configured.
 */

import {
  User, Patient, Doctor, Appointment, Prescription,
  Medicine, LabReport, Billing, Vitals, Department,
  AdminProfile, NurseProfile, ReceptionistProfile, PharmacistProfile, LabTechnicianProfile
} from '../types';
import { generateId, nowISO } from '../utils/helpers';
import { query } from '../config/database';
import { env } from '../config/env';

import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const h = (pw: string) => bcrypt.hashSync(pw, 10);

// ─── Local Arrays (Populated from PostgreSQL on boot, or falls back to hardcoded seeds) ───

const users: User[] = [
  { id: 'usr-001', email: 'admin@medicare.com', password_hash: h('admin123'), role: 'admin', full_name: 'Dr. Admin Kumar', phone: '+91-9876543210', avatar: '', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'usr-002', email: 'doctor@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Priya Sharma', phone: '+91-9876543211', avatar: '', is_active: true, created_at: '2025-01-02T00:00:00Z', updated_at: '2025-01-02T00:00:00Z' },
  { id: 'usr-003', email: 'nurse@medicare.com', password_hash: h('nurse123'), role: 'nurse', full_name: 'Nurse Anjali Patel', phone: '+91-9876543212', avatar: '', is_active: true, created_at: '2025-01-03T00:00:00Z', updated_at: '2025-01-03T00:00:00Z' },
  { id: 'usr-004', email: 'reception@medicare.com', password_hash: h('reception123'), role: 'receptionist', full_name: 'Reena Gupta', phone: '+91-9876543213', avatar: '', is_active: true, created_at: '2025-01-04T00:00:00Z', updated_at: '2025-01-04T00:00:00Z' },
  { id: 'usr-005', email: 'patient@medicare.com', password_hash: h('patient123'), role: 'patient', full_name: 'Rahul Verma', phone: '+91-9876543214', avatar: '', is_active: true, created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-05T00:00:00Z' },
  { id: 'usr-006', email: 'pharma@medicare.com', password_hash: h('pharma123'), role: 'pharmacist', full_name: 'Suresh Reddy', phone: '+91-9876543215', avatar: '', is_active: true, created_at: '2025-01-06T00:00:00Z', updated_at: '2025-01-06T00:00:00Z' },
  { id: 'usr-007', email: 'lab@medicare.com', password_hash: h('lab123'), role: 'lab_technician', full_name: 'Meena Iyer', phone: '+91-9876543216', avatar: '', is_active: true, created_at: '2025-01-07T00:00:00Z', updated_at: '2025-01-07T00:00:00Z' },
  { id: 'usr-008', email: 'doctor2@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Amit Verma', phone: '+91-9876543217', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-009', email: 'gupta@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Rajesh Gupta', phone: '+91-9876543218', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-011', email: 'singh@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Neha Singh', phone: '+91-9876543219', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-012', email: 'rao@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Vikram Rao', phone: '+91-9876543220', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-013', email: 'jain@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Rohit Jain', phone: '+91-9876543221', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-014', email: 'kapoor@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Pooja Kapoor', phone: '+91-9876543222', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-015', email: 'mehta@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Arjun Mehta', phone: '+91-9876543223', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-016', email: 'shah@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Kunal Shah', phone: '+91-9876543224', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-017', email: 'nair@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Sneha Nair', phone: '+91-9876543225', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-018', email: 'malhotra@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Ritu Malhotra', phone: '+91-9876543226', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' },
  { id: 'usr-019', email: 'akapoor@medicare.com', password_hash: h('doctor123'), role: 'doctor', full_name: 'Dr. Aditya Kapoor', phone: '+91-9876543227', avatar: '', is_active: true, created_at: '2025-01-08T00:00:00Z', updated_at: '2025-01-08T00:00:00Z' }
];

const departments: Department[] = [
  { id: 'dep-001', name: 'Cardiology', description: 'Heart and cardiovascular system', head_doctor_id: 'usr-002', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-002', name: 'Neurology', description: 'Brain and nervous system', head_doctor_id: 'usr-008', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-003', name: 'Orthopedics', description: 'Bones, joints, and muscles', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-004', name: 'Pediatrics', description: 'Child healthcare', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-005', name: 'Dermatology', description: 'Skin, hair, and nails', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-006', name: 'General Medicine', description: 'General healthcare and diagnostics', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-007', name: 'Ophthalmology', description: 'Eye care and vision', created_at: '2025-01-01T00:00:00Z' },
  { id: 'dep-008', name: 'ENT', description: 'Ear, nose, and throat', created_at: '2025-01-01T00:00:00Z' }
];

const patients: Patient[] = [
  { id: 'pat-001', user_id: 'usr-005', full_name: 'Rahul Verma', email: 'patient@medicare.com', phone: '+91-9876543214', date_of_birth: '1990-05-15', gender: 'male', blood_group: 'B+', address: '123, MG Road, Bangalore', emergency_contact: '+91-9876000001', medical_history: ['Hypertension', 'Diabetes Type 2'], created_at: '2025-01-05T00:00:00Z' },
  { id: 'pat-002', user_id: '', full_name: 'Ananya Desai', email: 'ananya@email.com', phone: '+91-9876543220', date_of_birth: '1985-08-22', gender: 'female', blood_group: 'A+', address: '45, Koramangala, Bangalore', emergency_contact: '+91-9876000002', medical_history: ['Asthma'], created_at: '2025-02-10T00:00:00Z' },
  { id: 'pat-003', user_id: '', full_name: 'Arjun Mehta', email: 'arjun@email.com', phone: '+91-9876543221', date_of_birth: '1978-12-03', gender: 'male', blood_group: 'O+', address: '78, Indiranagar, Bangalore', emergency_contact: '+91-9876000003', medical_history: ['Heart Disease', 'High Cholesterol'], created_at: '2025-03-15T00:00:00Z' },
  { id: 'pat-004', user_id: '', full_name: 'Sneha Nair', email: 'sneha@email.com', phone: '+91-9876543222', date_of_birth: '1995-03-18', gender: 'female', blood_group: 'AB-', address: '12, JP Nagar, Bangalore', emergency_contact: '+91-9876000004', medical_history: [], created_at: '2025-04-01T00:00:00Z' },
  { id: 'pat-005', user_id: '', full_name: 'Kiran Rao', email: 'kiran@email.com', phone: '+91-9876543223', date_of_birth: '2000-11-30', gender: 'male', blood_group: 'O-', address: '56, Whitefield, Bangalore', emergency_contact: '+91-9876000005', medical_history: ['Migraine'], created_at: '2025-04-20T00:00:00Z' }
];

const doctors: Doctor[] = [
  { id: 'doc-001', user_id: 'usr-002', full_name: 'Dr. Priya Sharma', email: 'doctor@medicare.com', phone: '+91-9876543211', department_id: 'dep-001', department_name: 'Cardiology', specialization: 'Interventional Cardiology', experience_years: 12, availability: [{ day: 'Monday', start: '09:00', end: '17:00' }, { day: 'Wednesday', start: '09:00', end: '17:00' }, { day: 'Friday', start: '09:00', end: '13:00' }], consultation_fee: 800, avatar: '', created_at: '2025-01-02T00:00:00Z' },
  { id: 'doc-002', user_id: 'usr-008', full_name: 'Dr. Amit Verma', email: 'doctor2@medicare.com', phone: '+91-9876543217', department_id: 'dep-002', department_name: 'Neurology', specialization: 'Neurophysiology', experience_years: 15, availability: [{ day: 'Tuesday', start: '10:00', end: '18:00' }, { day: 'Thursday', start: '10:00', end: '18:00' }, { day: 'Saturday', start: '09:00', end: '14:00' }], consultation_fee: 1000, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-003', user_id: 'usr-009', full_name: 'Dr. Rajesh Gupta', email: 'gupta@medicare.com', phone: '+91-9876543218', department_id: 'dep-001', department_name: 'Cardiology', specialization: 'Clinical Cardiology', experience_years: 10, availability: [{ day: 'Tuesday', start: '09:00', end: '17:00' }, { day: 'Thursday', start: '09:00', end: '17:00' }], consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-005', user_id: 'usr-011', full_name: 'Dr. Neha Singh', email: 'singh@medicare.com', phone: '+91-9876543219', department_id: 'dep-002', department_name: 'Neurology', specialization: 'Cognitive Neurology', experience_years: 8, availability: [{ day: 'Monday', start: '10:00', end: '16:00' }, { day: 'Wednesday', start: '10:00', end: '16:00' }], consultation_fee: 900, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-006', user_id: 'usr-012', full_name: 'Dr. Vikram Rao', email: 'rao@medicare.com', phone: '+91-9876543220', department_id: 'dep-003', department_name: 'Orthopedics', specialization: 'Joint Replacement', experience_years: 14, availability: [{ day: 'Monday', start: '09:00', end: '15:00' }, { day: 'Thursday', start: '09:00', end: '15:00' }], consultation_fee: 850, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-007', user_id: 'usr-013', full_name: 'Dr. Rohit Jain', email: 'jain@medicare.com', phone: '+91-9876543221', department_id: 'dep-003', department_name: 'Orthopedics', specialization: 'Sports Medicine', experience_years: 9, availability: [{ day: 'Tuesday', start: '11:00', end: '17:00' }, { day: 'Friday', start: '11:00', end: '17:00' }], consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-008', user_id: 'usr-014', full_name: 'Dr. Pooja Kapoor', email: 'kapoor@medicare.com', phone: '+91-9876543222', department_id: 'dep-005', department_name: 'Dermatology', specialization: 'Cosmetic Dermatology', experience_years: 11, availability: [{ day: 'Wednesday', start: '09:00', end: '17:00' }, { day: 'Saturday', start: '09:00', end: '14:00' }], consultation_fee: 700, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-009', user_id: 'usr-015', full_name: 'Dr. Arjun Mehta', email: 'mehta@medicare.com', phone: '+91-9876543223', department_id: 'dep-005', department_name: 'Dermatology', specialization: 'Pediatric Dermatology', experience_years: 7, availability: [{ day: 'Monday', start: '09:00', end: '16:00' }, { day: 'Thursday', start: '09:00', end: '16:00' }], consultation_fee: 650, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-010', user_id: 'usr-016', full_name: 'Dr. Kunal Shah', email: 'shah@medicare.com', phone: '+91-9876543224', department_id: 'dep-008', department_name: 'ENT', specialization: 'Otology', experience_years: 13, availability: [{ day: 'Tuesday', start: '09:00', end: '17:00' }, { day: 'Thursday', start: '09:00', end: '17:00' }], consultation_fee: 800, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-011', user_id: 'usr-017', full_name: 'Dr. Sneha Nair', email: 'nair@medicare.com', phone: '+91-9876543225', department_id: 'dep-008', department_name: 'ENT', specialization: 'Rhinology', experience_years: 8, availability: [{ day: 'Wednesday', start: '10:00', end: '16:00' }, { day: 'Friday', start: '10:00', end: '16:00' }], consultation_fee: 700, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-012', user_id: 'usr-018', full_name: 'Dr. Ritu Malhotra', email: 'malhotra@medicare.com', phone: '+91-9876543226', department_id: 'dep-007', department_name: 'Ophthalmology', specialization: 'Cataract & Refractive', experience_years: 12, availability: [{ day: 'Monday', start: '09:00', end: '17:00' }, { day: 'Friday', start: '09:00', end: '17:00' }], consultation_fee: 750, avatar: '', created_at: '2025-01-08T00:00:00Z' },
  { id: 'doc-013', user_id: 'usr-019', full_name: 'Dr. Aditya Kapoor', email: 'akapoor@medicare.com', phone: '+91-9876543227', department_id: 'dep-007', department_name: 'Ophthalmology', specialization: 'Glaucoma Specialist', experience_years: 9, availability: [{ day: 'Tuesday', start: '09:00', end: '17:00' }, { day: 'Wednesday', start: '09:00', end: '17:00' }], consultation_fee: 800, avatar: '', created_at: '2025-01-08T00:00:00Z' }
];

const admins: AdminProfile[] = [];
const nurses: NurseProfile[] = [];
const receptionists: ReceptionistProfile[] = [];
const pharmacists: PharmacistProfile[] = [];
const labTechnicians: LabTechnicianProfile[] = [];

const appointments: Appointment[] = [
  { id: 'apt-001', patient_id: 'pat-001', patient_name: 'Rahul Verma', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology', date: '2025-06-10', time_slot: '10:00-10:30', status: 'confirmed', notes: 'Follow-up for hypertension', created_at: '2025-06-01T00:00:00Z' },
  { id: 'apt-002', patient_id: 'pat-002', patient_name: 'Ananya Desai', doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology', date: '2025-06-10', time_slot: '11:00-11:30', status: 'confirmed', notes: 'Recurring headaches evaluation', created_at: '2025-06-02T00:00:00Z' },
  { id: 'apt-003', patient_id: 'pat-003', patient_name: 'Arjun Mehta', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology', date: '2025-06-08', time_slot: '14:00-14:30', status: 'completed', notes: 'Chest pain investigation', created_at: '2025-05-30T00:00:00Z' },
  { id: 'apt-004', patient_id: 'pat-004', patient_name: 'Sneha Nair', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', department_name: 'Cardiology', date: '2025-06-05', time_slot: '09:30-10:00', status: 'completed', notes: 'Annual check-up', created_at: '2025-05-28T00:00:00Z' },
  { id: 'apt-005', patient_id: 'pat-005', patient_name: 'Kiran Rao', doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology', date: '2025-06-12', time_slot: '10:00-10:30', status: 'pending', notes: 'Migraine treatment review', created_at: '2025-06-03T00:00:00Z' },
  { id: 'apt-006', patient_id: 'pat-001', patient_name: 'Rahul Verma', doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', department_name: 'Neurology', date: '2025-06-03', time_slot: '15:00-15:30', status: 'cancelled', notes: 'Patient requested cancellation', created_at: '2025-05-25T00:00:00Z' }
];

const prescriptions: Prescription[] = [
  { id: 'presc-001', appointment_id: 'apt-003', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', patient_id: 'pat-003', patient_name: 'Arjun Mehta', diagnosis: 'Angina Pectoris', medicines: [{ name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', duration: '30 days' }, { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', duration: '30 days' }], instructions: 'Avoid fatty foods. Regular exercise (30 min walking). Follow-up in 4 weeks.', follow_up_date: '2025-07-06', created_at: '2025-06-08T14:30:00Z' },
  { id: 'presc-002', appointment_id: 'apt-004', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', patient_id: 'pat-004', patient_name: 'Sneha Nair', diagnosis: 'Healthy – routine check-up', medicines: [{ name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly', duration: '8 weeks' }], instructions: 'Maintain healthy diet. Repeat Vitamin D levels after 8 weeks.', follow_up_date: '2025-08-01', created_at: '2025-06-05T10:00:00Z' }
];

const medicines: Medicine[] = [
  { id: 'med-001', name: 'Aspirin', category: 'Cardiovascular', stock_quantity: 500, expiry_date: '2026-12-31', price: 5.50, manufacturer: 'Sun Pharma', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-002', name: 'Atorvastatin', category: 'Cardiovascular', stock_quantity: 300, expiry_date: '2026-08-15', price: 12.00, manufacturer: 'Cipla', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-003', name: 'Metoprolol', category: 'Cardiovascular', stock_quantity: 200, expiry_date: '2026-06-30', price: 8.75, manufacturer: 'Dr. Reddy\'s', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-004', name: 'Paracetamol', category: 'Analgesic', stock_quantity: 1000, expiry_date: '2027-03-01', price: 2.00, manufacturer: 'GSK', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-005', name: 'Amoxicillin', category: 'Antibiotic', stock_quantity: 15, expiry_date: '2025-07-01', price: 18.50, manufacturer: 'Cipla', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-006', name: 'Ibuprofen', category: 'NSAID', stock_quantity: 800, expiry_date: '2027-01-15', price: 4.25, manufacturer: 'Sun Pharma', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-007', name: 'Cetirizine', category: 'Antihistamine', stock_quantity: 5, expiry_date: '2025-08-20', price: 3.00, manufacturer: 'Mankind', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-008', name: 'Vitamin D3', category: 'Supplement', stock_quantity: 250, expiry_date: '2027-06-01', price: 15.00, manufacturer: 'Abbott', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-009', name: 'Omeprazole', category: 'Gastrointestinal', stock_quantity: 0, expiry_date: '2026-11-10', price: 6.50, manufacturer: 'Dr. Reddy\'s', created_at: '2025-01-01T00:00:00Z' },
  { id: 'med-010', name: 'Metformin', category: 'Antidiabetic', stock_quantity: 400, expiry_date: '2026-09-20', price: 7.00, manufacturer: 'USV', created_at: '2025-01-01T00:00:00Z' }
];

const labReports: LabReport[] = [
  { id: 'lab-001', patient_id: 'pat-001', patient_name: 'Rahul Verma', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', technician_id: 'usr-007', test_name: 'Complete Blood Count', test_type: 'Hematology', status: 'completed', results: [{ parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', normal_range: '13.0-17.0', is_abnormal: false }, { parameter: 'WBC Count', value: '11200', unit: '/µL', normal_range: '4000-11000', is_abnormal: true }, { parameter: 'Platelet Count', value: '250000', unit: '/µL', normal_range: '150000-400000', is_abnormal: false }, { parameter: 'RBC Count', value: '4.8', unit: 'million/µL', normal_range: '4.5-5.5', is_abnormal: false }], created_at: '2025-06-01T00:00:00Z' },
  { id: 'lab-002', patient_id: 'pat-003', patient_name: 'Arjun Mehta', doctor_id: 'doc-001', doctor_name: 'Dr. Priya Sharma', technician_id: 'usr-007', test_name: 'Lipid Profile', test_type: 'Biochemistry', status: 'completed', results: [{ parameter: 'Total Cholesterol', value: '265', unit: 'mg/dL', normal_range: '<200', is_abnormal: true }, { parameter: 'LDL', value: '175', unit: 'mg/dL', normal_range: '<100', is_abnormal: true }, { parameter: 'HDL', value: '38', unit: 'mg/dL', normal_range: '>40', is_abnormal: true }, { parameter: 'Triglycerides', value: '210', unit: 'mg/dL', normal_range: '<150', is_abnormal: true }], created_at: '2025-06-07T00:00:00Z' },
  { id: 'lab-003', patient_id: 'pat-005', patient_name: 'Kiran Rao', doctor_id: 'doc-002', doctor_name: 'Dr. Vikram Singh', test_name: 'MRI Brain', test_type: 'Radiology', status: 'pending', results: [], created_at: '2025-06-09T00:00:00Z' }
];

const billings: Billing[] = [
  { id: 'bill-001', patient_id: 'pat-003', patient_name: 'Arjun Mehta', appointment_id: 'apt-003', consultation_fee: 800, lab_charges: 1200, medicine_charges: 450, total_amount: 2450, payment_status: 'paid', created_at: '2025-06-08T15:00:00Z' },
  { id: 'bill-002', patient_id: 'pat-004', patient_name: 'Sneha Nair', appointment_id: 'apt-004', consultation_fee: 800, lab_charges: 0, medicine_charges: 120, total_amount: 920, payment_status: 'paid', created_at: '2025-06-05T10:30:00Z' },
  { id: 'bill-003', patient_id: 'pat-001', patient_name: 'Rahul Verma', appointment_id: 'apt-001', consultation_fee: 800, lab_charges: 600, medicine_charges: 0, total_amount: 1400, payment_status: 'pending', created_at: '2025-06-10T10:30:00Z' }
];

const vitals: Vitals[] = [
  { id: 'vit-001', patient_id: 'pat-001', patient_name: 'Rahul Verma', nurse_id: 'usr-003', blood_pressure: '140/90', heart_rate: 82, temperature: 98.4, oxygen_level: 97, weight: 78.5, recorded_at: '2025-06-10T09:45:00Z' },
  { id: 'vit-002', patient_id: 'pat-003', patient_name: 'Arjun Mehta', nurse_id: 'usr-003', blood_pressure: '155/95', heart_rate: 88, temperature: 98.6, oxygen_level: 96, weight: 85.0, recorded_at: '2025-06-08T13:45:00Z' },
  { id: 'vit-003', patient_id: 'pat-004', patient_name: 'Sneha Nair', nurse_id: 'usr-003', blood_pressure: '118/76', heart_rate: 72, temperature: 98.2, oxygen_level: 99, weight: 58.0, recorded_at: '2025-06-05T09:15:00Z' },
  { id: 'vit-004', patient_id: 'pat-002', patient_name: 'Ananya Desai', nurse_id: 'usr-003', blood_pressure: '122/80', heart_rate: 74, temperature: 99.1, oxygen_level: 98, weight: 62.0, recorded_at: '2026-06-09T11:00:00Z' }
];

// ─── SQL Columns Schema Filter Whitelist ───

const SCHEMA_COLUMNS: Record<string, string[]> = {
  users: ['id', 'email', 'password_hash', 'role', 'full_name', 'phone', 'avatar', 'is_active', 'created_at', 'updated_at'],
  departments: ['id', 'name', 'description', 'head_doctor_id', 'created_at'],
  patients: ['id', 'user_id', 'date_of_birth', 'gender', 'blood_group', 'address', 'emergency_contact', 'medical_history', 'allergies', 'created_at'],
  doctors: ['id', 'user_id', 'department_id', 'specialization', 'experience_years', 'availability', 'consultation_fee', 'qualification', 'license_number', 'created_at'],
  admin_profiles: ['id', 'user_id', 'designation', 'department', 'contact_details', 'created_at'],
  nurse_profiles: ['id', 'user_id', 'department', 'shift', 'qualification', 'experience', 'created_at'],
  receptionist_profiles: ['id', 'user_id', 'desk_number', 'shift', 'experience', 'created_at'],
  pharmacist_profiles: ['id', 'user_id', 'license_number', 'qualification', 'experience', 'created_at'],
  lab_technician_profiles: ['id', 'user_id', 'lab_department', 'qualification', 'license_number', 'experience', 'created_at'],
  appointments: ['id', 'patient_id', 'doctor_id', 'date', 'time_slot', 'status', 'notes', 'created_at'],
  prescriptions: ['id', 'appointment_id', 'doctor_id', 'patient_id', 'diagnosis', 'medicines', 'instructions', 'follow_up_date', 'created_at'],
  medicines: ['id', 'name', 'category', 'stock_quantity', 'expiry_date', 'price', 'manufacturer', 'created_at'],
  lab_reports: ['id', 'patient_id', 'doctor_id', 'technician_id', 'test_name', 'test_type', 'status', 'results', 'report_url', 'created_at'],
  billings: ['id', 'patient_id', 'appointment_id', 'consultation_fee', 'lab_charges', 'medicine_charges', 'total_amount', 'payment_status', 'created_at'],
  vitals: ['id', 'patient_id', 'nurse_id', 'blood_pressure', 'heart_rate', 'temperature', 'oxygen_level', 'weight', 'recorded_at']
};

function filterObjectForTable(table: string, data: Record<string, any>): Record<string, any> {
  const allowed = SCHEMA_COLUMNS[table];
  if (!allowed) return data;
  const filtered: Record<string, any> = {};
  for (const k of allowed) {
    if (data[k] !== undefined) {
      filtered[k] = data[k];
    }
  }
  return filtered;
}

// ─── SQL Generic Sync Helpers ───

async function insertPGTable(table: string, rawData: Record<string, any>) {
  if (env.isDemoMode) return;
  const data = filterObjectForTable(table, rawData);
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const columns = fields.map(f => `"${f}"`).join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const values = fields.map(f => {
    const val = data[f];
    return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
  });
  await query(`INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`, values);
}

async function updatePGTable(table: string, idCol: string, idVal: string, rawData: Record<string, any>) {
  if (env.isDemoMode) return;
  const data = filterObjectForTable(table, rawData);
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  if (fields.length === 0) return;
  const setClause = fields.map((f, i) => `"${f}" = $${i + 2}`).join(', ');
  const values = fields.map(f => {
    const val = data[f];
    return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
  });
  await query(`UPDATE "${table}" SET ${setClause} WHERE "${idCol}" = $1`, [idVal, ...values]);
}

async function deletePGTable(table: string, idCol: string, idVal: string) {
  if (env.isDemoMode) return;
  await query(`DELETE FROM "${table}" WHERE "${idCol}" = $1`, [idVal]);
}

// ─── Initial Database Loading ───

export const initDb = async () => {
  if (env.isDemoMode) {
    console.log('ℹ️ Running in Demo Mode (using local db.json)...');
    loadFromDisk();
    return;
  }

  console.log('🔌 Initializing store from PostgreSQL...');
  try {
    // 1. Users
    const usersRes = await query('SELECT * FROM users');
    users.length = 0;
    users.push(...usersRes.rows);

    // 2. Departments
    const deptsRes = await query('SELECT * FROM departments');
    departments.length = 0;
    departments.push(...deptsRes.rows);

    // 3. Patients
    const patientsRes = await query(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p
       JOIN users u ON p.user_id = u.id`
    );
    patients.length = 0;
    patients.push(...patientsRes.rows.map(r => ({
      ...r,
      date_of_birth: r.date_of_birth instanceof Date ? r.date_of_birth.toISOString().split('T')[0] : r.date_of_birth
    })));

    // 4. Doctors
    const doctorsRes = await query(
      `SELECT d.*, u.full_name, u.email, u.phone, u.avatar, dep.name AS department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN departments dep ON d.department_id = dep.id`
    );
    doctors.length = 0;
    doctors.push(...doctorsRes.rows);

    // 5. Admin Profiles
    const adminsRes = await query('SELECT * FROM admin_profiles');
    admins.length = 0;
    admins.push(...adminsRes.rows.map(r => ({
      ...r,
      full_name: users.find(u => u.id === r.user_id)?.full_name || '',
      email: users.find(u => u.id === r.user_id)?.email || '',
      phone: users.find(u => u.id === r.user_id)?.phone || '',
      avatar: users.find(u => u.id === r.user_id)?.avatar || ''
    })));

    // 6. Nurse Profiles
    const nursesRes = await query('SELECT * FROM nurse_profiles');
    nurses.length = 0;
    nurses.push(...nursesRes.rows.map(r => ({
      ...r,
      full_name: users.find(u => u.id === r.user_id)?.full_name || '',
      phone: users.find(u => u.id === r.user_id)?.phone || '',
      avatar: users.find(u => u.id === r.user_id)?.avatar || ''
    })));

    // 7. Receptionist Profiles
    const receptionistsRes = await query('SELECT * FROM receptionist_profiles');
    receptionists.length = 0;
    receptionists.push(...receptionistsRes.rows.map(r => ({
      ...r,
      full_name: users.find(u => u.id === r.user_id)?.full_name || '',
      phone: users.find(u => u.id === r.user_id)?.phone || '',
      avatar: users.find(u => u.id === r.user_id)?.avatar || ''
    })));

    // 8. Pharmacist Profiles
    const pharmacistsRes = await query('SELECT * FROM pharmacist_profiles');
    pharmacists.length = 0;
    pharmacists.push(...pharmacistsRes.rows.map(r => ({
      ...r,
      full_name: users.find(u => u.id === r.user_id)?.full_name || '',
      phone: users.find(u => u.id === r.user_id)?.phone || '',
      avatar: users.find(u => u.id === r.user_id)?.avatar || ''
    })));

    // 9. Lab Technician Profiles
    const labTechsRes = await query('SELECT * FROM lab_technician_profiles');
    labTechnicians.length = 0;
    labTechnicians.push(...labTechsRes.rows.map(r => ({
      ...r,
      full_name: users.find(u => u.id === r.user_id)?.full_name || '',
      phone: users.find(u => u.id === r.user_id)?.phone || '',
      avatar: users.find(u => u.id === r.user_id)?.avatar || ''
    })));

    // 10. Appointments
    const apptsRes = await query('SELECT * FROM appointments');
    appointments.length = 0;
    appointments.push(...apptsRes.rows.map(r => ({
      ...r,
      patient_name: patients.find(p => p.id === r.patient_id)?.full_name || '',
      doctor_name: doctors.find(d => d.id === r.doctor_id)?.full_name || '',
      department_name: doctors.find(d => d.id === r.doctor_id)?.department_name || '',
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date
    })));

    // 11. Prescriptions
    const prescriptionsRes = await query('SELECT * FROM prescriptions');
    prescriptions.length = 0;
    prescriptions.push(...prescriptionsRes.rows.map(r => ({
      ...r,
      doctor_name: doctors.find(d => d.id === r.doctor_id)?.full_name || '',
      patient_name: patients.find(p => p.id === r.patient_id)?.full_name || '',
      follow_up_date: r.follow_up_date ? (r.follow_up_date instanceof Date ? r.follow_up_date.toISOString().split('T')[0] : r.follow_up_date) : undefined
    })));

    // 12. Medicines
    const medicinesRes = await query('SELECT * FROM medicines');
    medicines.length = 0;
    medicines.push(...medicinesRes.rows.map(r => ({
      ...r,
      expiry_date: r.expiry_date instanceof Date ? r.expiry_date.toISOString().split('T')[0] : r.expiry_date,
      price: Number(r.price)
    })));

    // 13. Lab Reports
    const labReportsRes = await query('SELECT * FROM lab_reports');
    labReports.length = 0;
    labReports.push(...labReportsRes.rows.map(r => ({
      ...r,
      patient_name: patients.find(p => p.id === r.patient_id)?.full_name || '',
      doctor_name: doctors.find(d => d.id === r.doctor_id)?.full_name || ''
    })));

    // 14. Billings
    const billingsRes = await query('SELECT * FROM billings');
    billings.length = 0;
    billings.push(...billingsRes.rows.map(r => ({
      ...r,
      patient_name: patients.find(p => p.id === r.patient_id)?.full_name || '',
      consultation_fee: Number(r.consultation_fee),
      lab_charges: Number(r.lab_charges),
      medicine_charges: Number(r.medicine_charges),
      total_amount: Number(r.total_amount)
    })));

    // 15. Vitals
    const vitalsRes = await query('SELECT * FROM vitals');
    vitals.length = 0;
    vitals.push(...vitalsRes.rows.map(r => ({
      ...r,
      patient_name: patients.find(p => p.id === r.patient_id)?.full_name || '',
      temperature: Number(r.temperature),
      weight: Number(r.weight)
    })));

    console.log('✅ Local store successfully populated from PostgreSQL.');
    saveToDisk(); // Update backup db.json
  } catch (err) {
    console.error('❌ Failed to load data from PostgreSQL:', err);
    throw err;
  }
};

// ═══════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS (Awaited with PG for Write operations)
// ═══════════════════════════════════════════════════════════════════════

// ─── Users ──────────────────────────────────────────────────────────

export const getUsers = async (): Promise<User[]> => {
  if (env.isDemoMode) return users;
  try {
    const res = await query('SELECT * FROM users');
    return res.rows;
  } catch (err) {
    console.error('PG getUsers Error:', err);
    return users;
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  if (env.isDemoMode) return users.find(u => u.id === id);
  try {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  } catch (err) {
    console.error('PG getUserById Error:', err);
    return users.find(u => u.id === id);
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  if (env.isDemoMode) return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  try {
    const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return res.rows[0];
  } catch (err) {
    console.error('PG getUserByEmail Error:', err);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
};

export const createUser = async (user: User): Promise<User> => {
  users.push(user);
  await insertPGTable('users', user);
  saveToDisk();
  return user;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User | undefined> => {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...data, updated_at: nowISO() };
  await updatePGTable('users', 'id', id, data);
  saveToDisk();
  return users[idx];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  await deletePGTable('users', 'id', id);
  saveToDisk();
  return true;
};

// ─── Departments ────────────────────────────────────────────────────

export const getDepartments = async (): Promise<Department[]> => {
  if (env.isDemoMode) return departments;
  try {
    const res = await query('SELECT * FROM departments');
    return res.rows;
  } catch (err) {
    console.error('PG getDepartments Error:', err);
    return departments;
  }
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  if (env.isDemoMode) return departments.find(d => d.id === id);
  try {
    const res = await query('SELECT * FROM departments WHERE id = $1', [id]);
    return res.rows[0];
  } catch (err) {
    console.error('PG getDepartmentById Error:', err);
    return departments.find(d => d.id === id);
  }
};

export const createDepartment = async (dept: Department): Promise<Department> => {
  departments.push(dept);
  await insertPGTable('departments', dept);
  saveToDisk();
  return dept;
};

export const updateDepartment = async (id: string, data: Partial<Department>): Promise<Department | undefined> => {
  const idx = departments.findIndex(d => d.id === id);
  if (idx === -1) return undefined;
  departments[idx] = { ...departments[idx], ...data };
  await updatePGTable('departments', 'id', id, data);
  saveToDisk();
  return departments[idx];
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  const idx = departments.findIndex(d => d.id === id);
  if (idx === -1) return false;
  departments.splice(idx, 1);
  await deletePGTable('departments', 'id', id);
  saveToDisk();
  return true;
};

// ─── Patients ───────────────────────────────────────────────────────

export const getPatients = async (): Promise<Patient[]> => {
  if (env.isDemoMode) return patients;
  try {
    const res = await query(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p
       JOIN users u ON p.user_id = u.id`
    );
    return res.rows.map(r => ({
      ...r,
      date_of_birth: r.date_of_birth instanceof Date ? r.date_of_birth.toISOString().split('T')[0] : r.date_of_birth
    }));
  } catch (err) {
    console.error('PG getPatients Error:', err);
    return patients;
  }
};

export const getPatientById = async (id: string): Promise<Patient | undefined> => {
  if (env.isDemoMode) return patients.find(p => p.id === id);
  try {
    const res = await query(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    if (res.rows[0]) {
      res.rows[0].date_of_birth = res.rows[0].date_of_birth instanceof Date 
        ? res.rows[0].date_of_birth.toISOString().split('T')[0] 
        : res.rows[0].date_of_birth;
    }
    return res.rows[0];
  } catch (err) {
    console.error('PG getPatientById Error:', err);
    return patients.find(p => p.id === id);
  }
};

export const getPatientByUserId = async (userId: string): Promise<Patient | undefined> => {
  if (env.isDemoMode) {
    let patient = patients.find(p => p.user_id === userId);
    if (!patient) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'patient') {
        patient = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return patient;
  }

  try {
    const res = await query(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );
    if (res.rows[0]) {
      res.rows[0].date_of_birth = res.rows[0].date_of_birth instanceof Date 
        ? res.rows[0].date_of_birth.toISOString().split('T')[0] 
        : res.rows[0].date_of_birth;
      return res.rows[0];
    }

    const user = await getUserById(userId);
    if (user && user.role === 'patient') {
      const newPatient: Patient = {
        id: generateId(),
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
      patients.push(newPatient);
      await insertPGTable('patients', newPatient);
      saveToDisk();
      return newPatient;
    }
    return undefined;
  } catch (err) {
    console.error('PG getPatientByUserId Error:', err);
    return patients.find(p => p.user_id === userId);
  }
};

export const searchPatients = async (queryStr: string): Promise<Patient[]> => {
  if (env.isDemoMode) {
    const q = queryStr.toLowerCase();
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }
  try {
    const q = `%${queryStr.toLowerCase()}%`;
    const res = await query(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE LOWER(u.full_name) LIKE $1 OR LOWER(u.email) LIKE $1 OR u.phone LIKE $1`,
      [q]
    );
    return res.rows.map(r => ({
      ...r,
      date_of_birth: r.date_of_birth instanceof Date ? r.date_of_birth.toISOString().split('T')[0] : r.date_of_birth
    }));
  } catch (err) {
    console.error('PG searchPatients Error:', err);
    const q = queryStr.toLowerCase();
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }
};

export const createPatient = async (patient: Patient): Promise<Patient> => {
  patients.push(patient);
  await insertPGTable('patients', patient);
  saveToDisk();
  return patient;
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient | undefined> => {
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  patients[idx] = { ...patients[idx], ...data };
  await updatePGTable('patients', 'id', id, data);
  saveToDisk();
  return patients[idx];
};

export const deletePatient = async (id: string): Promise<boolean> => {
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return false;
  patients.splice(idx, 1);
  await deletePGTable('patients', 'id', id);
  saveToDisk();
  return true;
};

// ─── Doctors ────────────────────────────────────────────────────────

export const getDoctors = async (): Promise<Doctor[]> => {
  if (env.isDemoMode) return doctors;
  try {
    const res = await query(
      `SELECT d.*, u.full_name, u.email, u.phone, u.avatar, dep.name AS department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN departments dep ON d.department_id = dep.id`
    );
    return res.rows;
  } catch (err) {
    console.error('PG getDoctors Error:', err);
    return doctors;
  }
};

export const getDoctorById = async (id: string): Promise<Doctor | undefined> => {
  if (env.isDemoMode) return doctors.find(d => d.id === id);
  try {
    const res = await query(
      `SELECT d.*, u.full_name, u.email, u.phone, u.avatar, dep.name AS department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN departments dep ON d.department_id = dep.id
       WHERE d.id = $1`,
      [id]
    );
    return res.rows[0];
  } catch (err) {
    console.error('PG getDoctorById Error:', err);
    return doctors.find(d => d.id === id);
  }
};

export const getDoctorByUserId = async (userId: string): Promise<Doctor | undefined> => {
  if (env.isDemoMode) {
    let doctor = doctors.find(d => d.user_id === userId);
    if (!doctor) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'doctor') {
        doctor = {
          id: generateId(),
          user_id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          department_id: 'dep-006',
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
        saveToDisk();
      }
    }
    return doctor;
  }

  try {
    const res = await query(
      `SELECT d.*, u.full_name, u.email, u.phone, u.avatar, dep.name AS department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN departments dep ON d.department_id = dep.id
       WHERE d.user_id = $1`,
      [userId]
    );
    if (res.rows[0]) return res.rows[0];

    const user = await getUserById(userId);
    if (user && user.role === 'doctor') {
      const depts = await getDepartments();
      const genMed = depts.find(d => d.name === 'General Medicine');
      const newDoctor: Doctor = {
        id: generateId(),
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        department_id: genMed ? genMed.id : 'e2983620-a359-4652-8fd3-95222833680c',
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
      doctors.push(newDoctor);
      await insertPGTable('doctors', newDoctor);
      saveToDisk();
      return newDoctor;
    }
    return undefined;
  } catch (err) {
    console.error('PG getDoctorByUserId Error:', err);
    return doctors.find(d => d.user_id === userId);
  }
};

export const createDoctor = async (doctor: Doctor): Promise<Doctor> => {
  doctors.push(doctor);
  await insertPGTable('doctors', doctor);
  saveToDisk();
  return doctor;
};

export const updateDoctor = async (id: string, data: Partial<Doctor>): Promise<Doctor | undefined> => {
  const idx = doctors.findIndex(d => d.id === id);
  if (idx === -1) return undefined;
  doctors[idx] = { ...doctors[idx], ...data };
  await updatePGTable('doctors', 'id', id, data);
  saveToDisk();
  return doctors[idx];
};

export const deleteDoctor = async (id: string): Promise<boolean> => {
  const idx = doctors.findIndex(d => d.id === id);
  if (idx === -1) return false;
  doctors.splice(idx, 1);
  await deletePGTable('doctors', 'id', id);
  saveToDisk();
  return true;
};

// ─── Admins ─────────────────────────────────────────────────────────

export const getAdminProfileByUserId = async (userId: string): Promise<AdminProfile | undefined> => {
  if (env.isDemoMode) {
    let admin = admins.find(a => a.user_id === userId);
    if (!admin) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'admin') {
        admin = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return admin;
  }

  try {
    const res = await query('SELECT * FROM admin_profiles WHERE user_id = $1', [userId]);
    if (res.rows[0]) {
      const user = await getUserById(userId);
      return {
        ...res.rows[0],
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
      };
    }
    const user = await getUserById(userId);
    if (user && user.role === 'admin') {
      const admin: AdminProfile = {
        id: generateId(),
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
      await insertPGTable('admin_profiles', admin);
      saveToDisk();
      return admin;
    }
    return undefined;
  } catch (err) {
    console.error('PG getAdminProfileByUserId Error:', err);
    return admins.find(a => a.user_id === userId);
  }
};

export const updateAdminProfile = async (userId: string, data: Partial<AdminProfile>): Promise<AdminProfile | undefined> => {
  const profile = await getAdminProfileByUserId(userId);
  if (!profile) return undefined;
  Object.assign(profile, data);
  const user = await getUserById(userId);
  if (user) {
    if (data.full_name) user.full_name = data.full_name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updated_at = nowISO();
  }
  await updatePGTable('admin_profiles', 'user_id', userId, data);
  saveToDisk();
  return profile;
};

// ─── Nurses ─────────────────────────────────────────────────────────

export const getNurseProfileByUserId = async (userId: string): Promise<NurseProfile | undefined> => {
  if (env.isDemoMode) {
    let nurse = nurses.find(n => n.user_id === userId);
    if (!nurse) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'nurse') {
        nurse = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return nurse;
  }

  try {
    const res = await query('SELECT * FROM nurse_profiles WHERE user_id = $1', [userId]);
    if (res.rows[0]) {
      const user = await getUserById(userId);
      return {
        ...res.rows[0],
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
      };
    }
    const user = await getUserById(userId);
    if (user && user.role === 'nurse') {
      const nurse: NurseProfile = {
        id: generateId(),
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
      await insertPGTable('nurse_profiles', nurse);
      saveToDisk();
      return nurse;
    }
    return undefined;
  } catch (err) {
    console.error('PG getNurseProfileByUserId Error:', err);
    return nurses.find(n => n.user_id === userId);
  }
};

export const updateNurseProfile = async (userId: string, data: Partial<NurseProfile>): Promise<NurseProfile | undefined> => {
  const profile = await getNurseProfileByUserId(userId);
  if (!profile) return undefined;
  Object.assign(profile, data);
  const user = await getUserById(userId);
  if (user) {
    if (data.full_name) user.full_name = data.full_name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updated_at = nowISO();
  }
  await updatePGTable('nurse_profiles', 'user_id', userId, data);
  saveToDisk();
  return profile;
};

// ─── Receptionists ──────────────────────────────────────────────────

export const getReceptionistProfileByUserId = async (userId: string): Promise<ReceptionistProfile | undefined> => {
  if (env.isDemoMode) {
    let receptionist = receptionists.find(r => r.user_id === userId);
    if (!receptionist) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'receptionist') {
        receptionist = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return receptionist;
  }

  try {
    const res = await query('SELECT * FROM receptionist_profiles WHERE user_id = $1', [userId]);
    if (res.rows[0]) {
      const user = await getUserById(userId);
      return {
        ...res.rows[0],
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
      };
    }
    const user = await getUserById(userId);
    if (user && user.role === 'receptionist') {
      const receptionist: ReceptionistProfile = {
        id: generateId(),
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
      await insertPGTable('receptionist_profiles', receptionist);
      saveToDisk();
      return receptionist;
    }
    return undefined;
  } catch (err) {
    console.error('PG getReceptionistProfileByUserId Error:', err);
    return receptionists.find(r => r.user_id === userId);
  }
};

export const updateReceptionistProfile = async (userId: string, data: Partial<ReceptionistProfile>): Promise<ReceptionistProfile | undefined> => {
  const profile = await getReceptionistProfileByUserId(userId);
  if (!profile) return undefined;
  Object.assign(profile, data);
  const user = await getUserById(userId);
  if (user) {
    if (data.full_name) user.full_name = data.full_name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updated_at = nowISO();
  }
  await updatePGTable('receptionist_profiles', 'user_id', userId, data);
  saveToDisk();
  return profile;
};

// ─── Pharmacists ────────────────────────────────────────────────────

export const getPharmacistProfileByUserId = async (userId: string): Promise<PharmacistProfile | undefined> => {
  if (env.isDemoMode) {
    let pharmacist = pharmacists.find(p => p.user_id === userId);
    if (!pharmacist) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'pharmacist') {
        pharmacist = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return pharmacist;
  }

  try {
    const res = await query('SELECT * FROM pharmacist_profiles WHERE user_id = $1', [userId]);
    if (res.rows[0]) {
      const user = await getUserById(userId);
      return {
        ...res.rows[0],
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
      };
    }
    const user = await getUserById(userId);
    if (user && user.role === 'pharmacist') {
      const pharmacist: PharmacistProfile = {
        id: generateId(),
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
      await insertPGTable('pharmacist_profiles', pharmacist);
      saveToDisk();
      return pharmacist;
    }
    return undefined;
  } catch (err) {
    console.error('PG getPharmacistProfileByUserId Error:', err);
    return pharmacists.find(p => p.user_id === userId);
  }
};

export const updatePharmacistProfile = async (userId: string, data: Partial<PharmacistProfile>): Promise<PharmacistProfile | undefined> => {
  const profile = await getPharmacistProfileByUserId(userId);
  if (!profile) return undefined;
  Object.assign(profile, data);
  const user = await getUserById(userId);
  if (user) {
    if (data.full_name) user.full_name = data.full_name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updated_at = nowISO();
  }
  await updatePGTable('pharmacist_profiles', 'user_id', userId, data);
  saveToDisk();
  return profile;
};

// ─── Lab Technicians ────────────────────────────────────────────────

export const getLabTechnicianProfileByUserId = async (userId: string): Promise<LabTechnicianProfile | undefined> => {
  if (env.isDemoMode) {
    let labTech = labTechnicians.find(l => l.user_id === userId);
    if (!labTech) {
      const user = users.find(u => u.id === userId);
      if (user && user.role === 'lab_technician') {
        labTech = {
          id: generateId(),
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
        saveToDisk();
      }
    }
    return labTech;
  }

  try {
    const res = await query('SELECT * FROM lab_technician_profiles WHERE user_id = $1', [userId]);
    if (res.rows[0]) {
      const user = await getUserById(userId);
      return {
        ...res.rows[0],
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
      };
    }
    const user = await getUserById(userId);
    if (user && user.role === 'lab_technician') {
      const labTech: LabTechnicianProfile = {
        id: generateId(),
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
      await insertPGTable('lab_technician_profiles', labTech);
      saveToDisk();
      return labTech;
    }
    return undefined;
  } catch (err) {
    console.error('PG getLabTechnicianProfileByUserId Error:', err);
    return labTechnicians.find(l => l.user_id === userId);
  }
};

export const updateLabTechnicianProfile = async (userId: string, data: Partial<LabTechnicianProfile>): Promise<LabTechnicianProfile | undefined> => {
  const profile = await getLabTechnicianProfileByUserId(userId);
  if (!profile) return undefined;
  Object.assign(profile, data);
  const user = await getUserById(userId);
  if (user) {
    if (data.full_name) user.full_name = data.full_name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updated_at = nowISO();
  }
  await updatePGTable('lab_technician_profiles', 'user_id', userId, data);
  saveToDisk();
  return profile;
};

export const updateDoctorProfileByUserId = async (userId: string, data: Partial<Doctor>): Promise<Doctor | undefined> => {
  const doctor = await getDoctorByUserId(userId);
  if (!doctor) return undefined;
  const idx = doctors.findIndex(d => d.user_id === userId);
  if (idx !== -1) {
    doctors[idx] = { ...doctors[idx], ...data };
    const user = await getUserById(userId);
    if (user) {
      if (data.full_name) user.full_name = data.full_name;
      if (data.phone) user.phone = data.phone;
      if (data.avatar !== undefined) user.avatar = data.avatar;
      user.updated_at = nowISO();
    }
    await updatePGTable('doctors', 'user_id', userId, data);
    saveToDisk();
    return doctors[idx];
  }
  return undefined;
};

export const updatePatientProfileByUserId = async (userId: string, data: Partial<Patient>): Promise<Patient | undefined> => {
  const patient = await getPatientByUserId(userId);
  if (!patient) return undefined;
  const idx = patients.findIndex(p => p.user_id === userId);
  if (idx !== -1) {
    patients[idx] = { ...patients[idx], ...data };
    const user = await getUserById(userId);
    if (user) {
      if (data.full_name) user.full_name = data.full_name;
      if (data.phone) user.phone = data.phone;
      user.updated_at = nowISO();
    }
    await updatePGTable('patients', 'user_id', userId, data);
    saveToDisk();
    return patients[idx];
  }
  return undefined;
};

// Helper mappings for PostgreSQL rows to clean frontend types
const mapAppointmentPGRow = async (r: any): Promise<Appointment> => {
  const patient = await getPatientById(r.patient_id);
  const doctor = await getDoctorById(r.doctor_id);
  return {
    ...r,
    patient_name: patient?.full_name || '',
    doctor_name: doctor?.full_name || '',
    department_name: doctor?.department_name || '',
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date
  };
};

const mapPrescriptionPGRow = async (r: any): Promise<Prescription> => {
  const patient = await getPatientById(r.patient_id);
  const doctor = await getDoctorById(r.doctor_id);
  return {
    ...r,
    doctor_name: doctor?.full_name || '',
    patient_name: patient?.full_name || '',
    follow_up_date: r.follow_up_date ? (r.follow_up_date instanceof Date ? r.follow_up_date.toISOString().split('T')[0] : r.follow_up_date) : undefined
  };
};

// ─── Appointments ───────────────────────────────────────────────────

export const getAppointments = async (): Promise<Appointment[]> => {
  if (env.isDemoMode) return appointments;
  try {
    const res = await query('SELECT * FROM appointments ORDER BY date DESC, time_slot DESC');
    return Promise.all(res.rows.map(mapAppointmentPGRow));
  } catch (err) {
    console.error('PG getAppointments Error:', err);
    return appointments;
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  if (env.isDemoMode) return appointments.find(a => a.id === id);
  try {
    const res = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (res.rows[0]) {
      return mapAppointmentPGRow(res.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error('PG getAppointmentById Error:', err);
    return appointments.find(a => a.id === id);
  }
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  if (env.isDemoMode) return appointments.filter(a => a.patient_id === patientId);
  try {
    const res = await query('SELECT * FROM appointments WHERE patient_id = $1 ORDER BY date DESC, time_slot DESC', [patientId]);
    return Promise.all(res.rows.map(mapAppointmentPGRow));
  } catch (err) {
    console.error('PG getAppointmentsByPatient Error:', err);
    return appointments.filter(a => a.patient_id === patientId);
  }
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  if (env.isDemoMode) return appointments.filter(a => a.doctor_id === doctorId);
  try {
    const res = await query('SELECT * FROM appointments WHERE doctor_id = $1 ORDER BY date DESC, time_slot DESC', [doctorId]);
    return Promise.all(res.rows.map(mapAppointmentPGRow));
  } catch (err) {
    console.error('PG getAppointmentsByDoctor Error:', err);
    return appointments.filter(a => a.doctor_id === doctorId);
  }
};

export const createAppointment = async (appt: Appointment): Promise<Appointment> => {
  appointments.push(appt);
  await insertPGTable('appointments', appt);
  saveToDisk();
  return appt;
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment | undefined> => {
  const idx = appointments.findIndex(a => a.id === id);
  if (idx !== -1) {
    appointments[idx] = { ...appointments[idx], ...data };
  }
  await updatePGTable('appointments', 'id', id, data);
  saveToDisk();
  return getAppointmentById(id);
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  const idx = appointments.findIndex(a => a.id === id);
  if (idx === -1) return false;
  appointments.splice(idx, 1);
  await deletePGTable('appointments', 'id', id);
  saveToDisk();
  return true;
};

// ─── Prescriptions ─────────────────────────────────────────────────

export const getPrescriptions = async (): Promise<Prescription[]> => {
  if (env.isDemoMode) return prescriptions;
  try {
    const res = await query('SELECT * FROM prescriptions ORDER BY created_at DESC');
    return Promise.all(res.rows.map(mapPrescriptionPGRow));
  } catch (err) {
    console.error('PG getPrescriptions Error:', err);
    return prescriptions;
  }
};

export const getPrescriptionById = async (id: string): Promise<Prescription | undefined> => {
  if (env.isDemoMode) return prescriptions.find(p => p.id === id);
  try {
    const res = await query('SELECT * FROM prescriptions WHERE id = $1', [id]);
    if (res.rows[0]) {
      return mapPrescriptionPGRow(res.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error('PG getPrescriptionById Error:', err);
    return prescriptions.find(p => p.id === id);
  }
};

export const getPrescriptionsByPatient = async (patientId: string): Promise<Prescription[]> => {
  if (env.isDemoMode) return prescriptions.filter(p => p.patient_id === patientId);
  try {
    const res = await query('SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    return Promise.all(res.rows.map(mapPrescriptionPGRow));
  } catch (err) {
    console.error('PG getPrescriptionsByPatient Error:', err);
    return prescriptions.filter(p => p.patient_id === patientId);
  }
};

export const createPrescription = async (presc: Prescription): Promise<Prescription> => {
  prescriptions.push(presc);
  await insertPGTable('prescriptions', presc);
  saveToDisk();
  return presc;
};

// Helper mappings for Medicines, Lab Reports, Billings, and Vitals
const mapMedicinePGRow = (r: any): Medicine => {
  return {
    ...r,
    expiry_date: r.expiry_date instanceof Date ? r.expiry_date.toISOString().split('T')[0] : r.expiry_date,
    price: Number(r.price)
  };
};

const mapLabReportPGRow = async (r: any): Promise<LabReport> => {
  const patient = await getPatientById(r.patient_id);
  const doctor = await getDoctorById(r.doctor_id);
  return {
    ...r,
    patient_name: patient?.full_name || '',
    doctor_name: doctor?.full_name || ''
  };
};

const mapBillingPGRow = async (r: any): Promise<Billing> => {
  const patient = await getPatientById(r.patient_id);
  return {
    ...r,
    patient_name: patient?.full_name || '',
    consultation_fee: Number(r.consultation_fee),
    lab_charges: Number(r.lab_charges),
    medicine_charges: Number(r.medicine_charges),
    total_amount: Number(r.total_amount)
  };
};

const mapVitalPGRow = async (r: any): Promise<Vitals> => {
  const patient = await getPatientById(r.patient_id);
  return {
    ...r,
    patient_name: patient?.full_name || '',
    temperature: Number(r.temperature),
    weight: Number(r.weight)
  };
};

// ─── Medicines ──────────────────────────────────────────────────────

export const getMedicines = async (): Promise<Medicine[]> => {
  if (env.isDemoMode) return medicines;
  try {
    const res = await query('SELECT * FROM medicines ORDER BY name ASC');
    return res.rows.map(mapMedicinePGRow);
  } catch (err) {
    console.error('PG getMedicines Error:', err);
    return medicines;
  }
};

export const getMedicineById = async (id: string): Promise<Medicine | undefined> => {
  if (env.isDemoMode) return medicines.find(m => m.id === id);
  try {
    const res = await query('SELECT * FROM medicines WHERE id = $1', [id]);
    return res.rows[0] ? mapMedicinePGRow(res.rows[0]) : undefined;
  } catch (err) {
    console.error('PG getMedicineById Error:', err);
    return medicines.find(m => m.id === id);
  }
};

export const getLowStockMedicines = async (threshold = 20): Promise<Medicine[]> => {
  if (env.isDemoMode) return medicines.filter(m => m.stock_quantity <= threshold);
  try {
    const res = await query('SELECT * FROM medicines WHERE stock_quantity <= $1 ORDER BY stock_quantity ASC', [threshold]);
    return res.rows.map(mapMedicinePGRow);
  } catch (err) {
    console.error('PG getLowStockMedicines Error:', err);
    return medicines.filter(m => m.stock_quantity <= threshold);
  }
};

export const getExpiringMedicines = async (withinDays = 90): Promise<Medicine[]> => {
  if (env.isDemoMode) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return medicines.filter(m => new Date(m.expiry_date) <= cutoff);
  }
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    const res = await query('SELECT * FROM medicines WHERE expiry_date <= $1 ORDER BY expiry_date ASC', [cutoff]);
    return res.rows.map(mapMedicinePGRow);
  } catch (err) {
    console.error('PG getExpiringMedicines Error:', err);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return medicines.filter(m => new Date(m.expiry_date) <= cutoff);
  }
};

export const createMedicine = async (med: Medicine): Promise<Medicine> => {
  medicines.push(med);
  await insertPGTable('medicines', med);
  saveToDisk();
  return med;
};

export const updateMedicine = async (id: string, data: Partial<Medicine>): Promise<Medicine | undefined> => {
  const idx = medicines.findIndex(m => m.id === id);
  if (idx !== -1) {
    medicines[idx] = { ...medicines[idx], ...data };
  }
  await updatePGTable('medicines', 'id', id, data);
  saveToDisk();
  return getMedicineById(id);
};

export const deleteMedicine = async (id: string): Promise<boolean> => {
  const idx = medicines.findIndex(m => m.id === id);
  if (idx === -1) return false;
  medicines.splice(idx, 1);
  await deletePGTable('medicines', 'id', id);
  saveToDisk();
  return true;
};

// ─── Lab Reports ────────────────────────────────────────────────────

export const getLabReports = async (): Promise<LabReport[]> => {
  if (env.isDemoMode) return labReports;
  try {
    const res = await query('SELECT * FROM lab_reports ORDER BY created_at DESC');
    return Promise.all(res.rows.map(mapLabReportPGRow));
  } catch (err) {
    console.error('PG getLabReports Error:', err);
    return labReports;
  }
};

export const getLabReportById = async (id: string): Promise<LabReport | undefined> => {
  if (env.isDemoMode) return labReports.find(l => l.id === id);
  try {
    const res = await query('SELECT * FROM lab_reports WHERE id = $1', [id]);
    if (res.rows[0]) {
      return mapLabReportPGRow(res.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error('PG getLabReportById Error:', err);
    return labReports.find(l => l.id === id);
  }
};

export const getLabReportsByPatient = async (patientId: string): Promise<LabReport[]> => {
  if (env.isDemoMode) return labReports.filter(l => l.patient_id === patientId);
  try {
    const res = await query('SELECT * FROM lab_reports WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    return Promise.all(res.rows.map(mapLabReportPGRow));
  } catch (err) {
    console.error('PG getLabReportsByPatient Error:', err);
    return labReports.filter(l => l.patient_id === patientId);
  }
};

export const createLabReport = async (report: LabReport): Promise<LabReport> => {
  labReports.push(report);
  
  // Resolve mock lab reports tech-001 placeholder target mapping
  const pgReport = {
    ...report,
    technician_id: report.technician_id === 'tech-001' ? 'usr-007' : report.technician_id
  };
  await insertPGTable('lab_reports', pgReport);
  saveToDisk();
  return report;
};

export const updateLabReport = async (id: string, data: Partial<LabReport>): Promise<LabReport | undefined> => {
  const idx = labReports.findIndex(l => l.id === id);
  if (idx !== -1) {
    labReports[idx] = { ...labReports[idx], ...data };
  }
  
  const pgData = {
    ...data,
    ...(data.technician_id === 'tech-001' ? { technician_id: 'usr-007' } : {})
  };
  await updatePGTable('lab_reports', 'id', id, pgData);
  saveToDisk();
  return getLabReportById(id);
};

export const deleteLabReport = async (id: string): Promise<boolean> => {
  const idx = labReports.findIndex(l => l.id === id);
  if (idx === -1) return false;
  labReports.splice(idx, 1);
  await deletePGTable('lab_reports', 'id', id);
  saveToDisk();
  return true;
};

// ─── Billings ───────────────────────────────────────────────────────

export const getBillings = async (): Promise<Billing[]> => {
  if (env.isDemoMode) return billings;
  try {
    const res = await query('SELECT * FROM billings ORDER BY created_at DESC');
    return Promise.all(res.rows.map(mapBillingPGRow));
  } catch (err) {
    console.error('PG getBillings Error:', err);
    return billings;
  }
};

export const getBillingById = async (id: string): Promise<Billing | undefined> => {
  if (env.isDemoMode) return billings.find(b => b.id === id);
  try {
    const res = await query('SELECT * FROM billings WHERE id = $1', [id]);
    if (res.rows[0]) {
      return mapBillingPGRow(res.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error('PG getBillingById Error:', err);
    return billings.find(b => b.id === id);
  }
};

export const getBillingsByPatient = async (patientId: string): Promise<Billing[]> => {
  if (env.isDemoMode) return billings.filter(b => b.patient_id === patientId);
  try {
    const res = await query('SELECT * FROM billings WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    return Promise.all(res.rows.map(mapBillingPGRow));
  } catch (err) {
    console.error('PG getBillingsByPatient Error:', err);
    return billings.filter(b => b.patient_id === patientId);
  }
};

export const createBilling = async (bill: Billing): Promise<Billing> => {
  billings.push(bill);
  
  // Normalize payment status partial enum check
  const pgBill = {
    ...bill,
    payment_status: ((bill.payment_status as string) === 'partial' ? 'partially_paid' : bill.payment_status) as any
  };
  await insertPGTable('billings', pgBill);
  saveToDisk();
  return bill;
};

// ─── Vitals ─────────────────────────────────────────────────────────

export const getVitals = async (): Promise<Vitals[]> => {
  if (env.isDemoMode) return vitals;
  try {
    const res = await query('SELECT * FROM vitals ORDER BY recorded_at DESC');
    return Promise.all(res.rows.map(mapVitalPGRow));
  } catch (err) {
    console.error('PG getVitals Error:', err);
    return vitals;
  }
};

export const getVitalById = async (id: string): Promise<Vitals | undefined> => {
  if (env.isDemoMode) return vitals.find(v => v.id === id);
  try {
    const res = await query('SELECT * FROM vitals WHERE id = $1', [id]);
    if (res.rows[0]) {
      return mapVitalPGRow(res.rows[0]);
    }
    return undefined;
  } catch (err) {
    console.error('PG getVitalById Error:', err);
    return vitals.find(v => v.id === id);
  }
};

export const getVitalsByPatient = async (patientId: string): Promise<Vitals[]> => {
  if (env.isDemoMode) return vitals.filter(v => v.patient_id === patientId);
  try {
    const res = await query('SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC', [patientId]);
    return Promise.all(res.rows.map(mapVitalPGRow));
  } catch (err) {
    console.error('PG getVitalsByPatient Error:', err);
    return vitals.filter(v => v.patient_id === patientId);
  }
};

export const createVital = async (vital: Vitals): Promise<Vitals> => {
  vitals.push(vital);
  await insertPGTable('vitals', vital);
  saveToDisk();
  return vital;
};

export const deleteVital = async (id: string): Promise<boolean> => {
  const idx = vitals.findIndex(v => v.id === id);
  if (idx === -1) return false;
  vitals.splice(idx, 1);
  await deletePGTable('vitals', 'id', id);
  saveToDisk();
  return true;
};

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE LAYER (JSON FLAT-FILE DATABASE - USED AS BACKUP)
// ═══════════════════════════════════════════════════════════════════════

const DB_FILE = path.join(__dirname, 'db.json');

export const saveToDisk = () => {
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
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database to disk:', e);
  }
};

export const loadFromDisk = () => {
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(fileData);
      
      if (data.users) { users.length = 0; users.push(...data.users); }
      if (data.departments) { departments.length = 0; departments.push(...data.departments); }
      if (data.patients) { patients.length = 0; patients.push(...data.patients); }
      if (data.doctors) { doctors.length = 0; doctors.push(...data.doctors); }
      if (data.appointments) { appointments.length = 0; appointments.push(...data.appointments); }
      if (data.prescriptions) { prescriptions.length = 0; prescriptions.push(...data.prescriptions); }
      if (data.medicines) { medicines.length = 0; medicines.push(...data.medicines); }
      if (data.labReports) { labReports.length = 0; labReports.push(...data.labReports); }
      if (data.billings) { billings.length = 0; billings.push(...data.billings); }
      if (data.vitals) { vitals.length = 0; vitals.push(...data.vitals); }
      if (data.admins) { admins.length = 0; admins.push(...data.admins); }
      if (data.nurses) { nurses.length = 0; nurses.push(...data.nurses); }
      if (data.receptionists) { receptionists.length = 0; receptionists.push(...data.receptionists); }
      if (data.pharmacists) { pharmacists.length = 0; pharmacists.push(...data.pharmacists); }
      if (data.labTechnicians) { labTechnicians.length = 0; labTechnicians.push(...data.labTechnicians); }
    } catch (e) {
      console.error('Failed to load database from disk, using in-memory defaults:', e);
    }
  } else {
    saveToDisk();
  }
};

// Automatically run initial load from disk at boot
loadFromDisk();
