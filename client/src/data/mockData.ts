import { DashboardStats, Patient, Doctor, Appointment, Prescription, Medicine, LabReport, Billing, Department, Vitals, ChartData, User } from '../types';

// Demo users for each role
export const demoUsers: (User & { password: string })[] = [
  { id: '1', email: 'admin@medicare.com', password: 'admin123', role: 'admin', full_name: 'Dr. Sarah Johnson', phone: '+1-555-0101', is_active: true, created_at: '2024-01-01' },
  { id: '2', email: 'doctor@medicare.com', password: 'doctor123', role: 'doctor', full_name: 'Dr. Michael Chen', phone: '+1-555-0102', is_active: true, created_at: '2024-01-15' },
  { id: '3', email: 'nurse@medicare.com', password: 'nurse123', role: 'nurse', full_name: 'Emily Rodriguez', phone: '+1-555-0103', is_active: true, created_at: '2024-02-01' },
  { id: '4', email: 'reception@medicare.com', password: 'reception123', role: 'receptionist', full_name: 'James Wilson', phone: '+1-555-0104', is_active: true, created_at: '2024-02-15' },
  { id: '5', email: 'patient@medicare.com', password: 'patient123', role: 'patient', full_name: 'Alice Thompson', phone: '+1-555-0105', is_active: true, created_at: '2024-03-01' },
  { id: '6', email: 'pharma@medicare.com', password: 'pharma123', role: 'pharmacist', full_name: 'Robert Davis', phone: '+1-555-0106', is_active: true, created_at: '2024-03-15' },
  { id: '7', email: 'lab@medicare.com', password: 'lab123', role: 'lab_technician', full_name: 'Lisa Anderson', phone: '+1-555-0107', is_active: true, created_at: '2024-04-01' },
];

export const demoDepartments: Department[] = [
  { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system', head_doctor_name: 'Dr. Michael Chen', created_at: '2024-01-01' },
  { id: '2', name: 'Neurology', description: 'Brain and nervous system disorders', head_doctor_name: 'Dr. Sarah Kim', created_at: '2024-01-01' },
  { id: '3', name: 'Orthopedics', description: 'Bones, joints, and muscles', head_doctor_name: 'Dr. James Brown', created_at: '2024-01-01' },
  { id: '4', name: 'Pediatrics', description: 'Children\'s healthcare', head_doctor_name: 'Dr. Emily White', created_at: '2024-01-01' },
  { id: '5', name: 'Dermatology', description: 'Skin conditions and treatment', head_doctor_name: 'Dr. Lisa Park', created_at: '2024-01-01' },
  { id: '6', name: 'General Medicine', description: 'Primary care and general health', head_doctor_name: 'Dr. Robert Lee', created_at: '2024-01-01' },
  { id: '7', name: 'Ophthalmology', description: 'Eye care and vision', head_doctor_name: 'Dr. Anna Martinez', created_at: '2024-01-01' },
  { id: '8', name: 'Psychiatry', description: 'Mental health and behavioral disorders', head_doctor_name: 'Dr. David Clark', created_at: '2024-01-01' },
];

export const demoDoctors: Doctor[] = [
  { id: '1', user_id: '2', full_name: 'Dr. Michael Chen', email: 'mchen@medicare.com', department_id: '1', department_name: 'Cardiology', specialization: 'Interventional Cardiology', experience_years: 15, consultation_fee: 250, availability: { monday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '13:00' } }, created_at: '2024-01-15' },
  { id: '2', user_id: '8', full_name: 'Dr. Sarah Kim', email: 'skim@medicare.com', department_id: '2', department_name: 'Neurology', specialization: 'Neuroimaging', experience_years: 12, consultation_fee: 300, availability: { tuesday: { start: '10:00', end: '18:00' }, thursday: { start: '10:00', end: '18:00' } }, created_at: '2024-01-20' },
  { id: '3', user_id: '9', full_name: 'Dr. James Brown', email: 'jbrown@medicare.com', department_id: '3', department_name: 'Orthopedics', specialization: 'Sports Medicine', experience_years: 20, consultation_fee: 280, availability: { monday: { start: '08:00', end: '16:00' }, wednesday: { start: '08:00', end: '16:00' }, friday: { start: '08:00', end: '12:00' } }, created_at: '2024-02-01' },
  { id: '4', user_id: '10', full_name: 'Dr. Emily White', email: 'ewhite@medicare.com', department_id: '4', department_name: 'Pediatrics', specialization: 'Neonatal Care', experience_years: 8, consultation_fee: 200, availability: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' } }, created_at: '2024-02-10' },
  { id: '5', user_id: '11', full_name: 'Dr. Lisa Park', email: 'lpark@medicare.com', department_id: '5', department_name: 'Dermatology', specialization: 'Cosmetic Dermatology', experience_years: 10, consultation_fee: 220, availability: { tuesday: { start: '09:00', end: '15:00' }, wednesday: { start: '09:00', end: '15:00' }, friday: { start: '09:00', end: '15:00' } }, created_at: '2024-02-20' },
  { id: '6', user_id: '12', full_name: 'Dr. Robert Lee', email: 'rlee@medicare.com', department_id: '6', department_name: 'General Medicine', specialization: 'Internal Medicine', experience_years: 18, consultation_fee: 180, availability: { monday: { start: '08:00', end: '18:00' }, tuesday: { start: '08:00', end: '18:00' }, wednesday: { start: '08:00', end: '18:00' }, thursday: { start: '08:00', end: '18:00' }, friday: { start: '08:00', end: '14:00' } }, created_at: '2024-03-01' },
  { id: '7', user_id: '13', full_name: 'Dr. Anna Martinez', email: 'amartinez@medicare.com', department_id: '7', department_name: 'Ophthalmology', specialization: 'Retinal Surgery', experience_years: 14, consultation_fee: 260, availability: { monday: { start: '10:00', end: '16:00' }, thursday: { start: '10:00', end: '16:00' } }, created_at: '2024-03-10' },
  { id: '8', user_id: '14', full_name: 'Dr. David Clark', email: 'dclark@medicare.com', department_id: '8', department_name: 'Psychiatry', specialization: 'Clinical Psychology', experience_years: 11, consultation_fee: 350, availability: { monday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '13:00' } }, created_at: '2024-03-20' },
];

export const demoPatients: Patient[] = [
  { id: '1', user_id: '5', full_name: 'Alice Thompson', email: 'alice@email.com', date_of_birth: '1990-05-15', age: 35, gender: 'female', blood_group: 'A+', phone: '+1-555-0105', address: '123 Oak Street, Springfield', emergency_contact: '+1-555-0150', medical_history: 'Mild asthma, seasonal allergies', created_at: '2024-03-01' },
  { id: '2', user_id: '15', full_name: 'John Miller', email: 'john@email.com', date_of_birth: '1985-08-22', age: 40, gender: 'male', blood_group: 'O+', phone: '+1-555-0201', address: '456 Elm Avenue, Riverside', emergency_contact: '+1-555-0250', medical_history: 'Type 2 Diabetes', created_at: '2024-03-10' },
  { id: '3', user_id: '16', full_name: 'Maria Garcia', email: 'maria@email.com', date_of_birth: '1978-12-03', age: 47, gender: 'female', blood_group: 'B-', phone: '+1-555-0301', address: '789 Pine Road, Lakewood', emergency_contact: '+1-555-0350', medical_history: 'Hypertension, controlled with medication', created_at: '2024-03-15' },
  { id: '4', user_id: '17', full_name: 'David Wilson', email: 'david@email.com', date_of_birth: '1995-03-28', age: 30, gender: 'male', blood_group: 'AB+', phone: '+1-555-0401', address: '321 Maple Drive, Oakville', emergency_contact: '+1-555-0450', medical_history: 'No known conditions', created_at: '2024-04-01' },
  { id: '5', user_id: '18', full_name: 'Sophie Brown', email: 'sophie@email.com', date_of_birth: '1988-07-14', age: 37, gender: 'female', blood_group: 'O-', phone: '+1-555-0501', address: '654 Cedar Lane, Willowdale', emergency_contact: '+1-555-0550', medical_history: 'Previous knee surgery (2021)', created_at: '2024-04-10' },
  { id: '6', user_id: '19', full_name: 'Robert Johnson', email: 'robert@email.com', date_of_birth: '1972-11-19', age: 53, gender: 'male', blood_group: 'A-', phone: '+1-555-0601', address: '987 Birch Court, Maplewood', emergency_contact: '+1-555-0650', medical_history: 'High cholesterol, cardiac stent (2022)', created_at: '2024-04-15' },
  { id: '7', user_id: '20', full_name: 'Emma Davis', email: 'emma@email.com', date_of_birth: '2000-01-30', age: 25, gender: 'female', blood_group: 'B+', phone: '+1-555-0701', address: '147 Walnut Street, Brookfield', emergency_contact: '+1-555-0750', medical_history: 'Mild anxiety disorder', created_at: '2024-05-01' },
  { id: '8', user_id: '21', full_name: 'William Taylor', email: 'william@email.com', date_of_birth: '1965-06-08', age: 60, gender: 'male', blood_group: 'O+', phone: '+1-555-0801', address: '258 Spruce Avenue, Greenfield', emergency_contact: '+1-555-0850', medical_history: 'COPD, former smoker', created_at: '2024-05-10' },
  { id: '9', user_id: '22', full_name: 'Olivia Martinez', email: 'olivia@email.com', date_of_birth: '1992-09-25', age: 33, gender: 'female', blood_group: 'AB-', phone: '+1-555-0901', address: '369 Aspen Way, Rosewood', emergency_contact: '+1-555-0950', medical_history: 'Migraine headaches', created_at: '2024-05-15' },
  { id: '10', user_id: '23', full_name: 'James Anderson', email: 'james@email.com', date_of_birth: '1980-04-12', age: 45, gender: 'male', blood_group: 'A+', phone: '+1-555-1001', address: '741 Cypress Road, Ferndale', emergency_contact: '+1-555-1050', medical_history: 'Lower back pain, disc herniation', created_at: '2024-05-20' },
];

export const demoAppointments: Appointment[] = [
  { id: '1', patient_id: '1', patient_name: 'Alice Thompson', doctor_id: '1', doctor_name: 'Dr. Michael Chen', department: 'Cardiology', date: '2025-06-05', time_slot: '09:00', status: 'confirmed', notes: 'Follow-up for chest pain', created_at: '2025-06-01' },
  { id: '2', patient_id: '2', patient_name: 'John Miller', doctor_id: '6', doctor_name: 'Dr. Robert Lee', department: 'General Medicine', date: '2025-06-05', time_slot: '10:00', status: 'confirmed', notes: 'Diabetes check-up', created_at: '2025-06-01' },
  { id: '3', patient_id: '3', patient_name: 'Maria Garcia', doctor_id: '1', doctor_name: 'Dr. Michael Chen', department: 'Cardiology', date: '2025-06-05', time_slot: '11:00', status: 'completed', notes: 'BP monitoring', created_at: '2025-06-01' },
  { id: '4', patient_id: '4', patient_name: 'David Wilson', doctor_id: '3', doctor_name: 'Dr. James Brown', department: 'Orthopedics', date: '2025-06-06', time_slot: '09:00', status: 'pending', notes: 'Knee evaluation', created_at: '2025-06-02' },
  { id: '5', patient_id: '5', patient_name: 'Sophie Brown', doctor_id: '3', doctor_name: 'Dr. James Brown', department: 'Orthopedics', date: '2025-06-06', time_slot: '10:30', status: 'pending', notes: 'Post-surgery follow-up', created_at: '2025-06-02' },
  { id: '6', patient_id: '6', patient_name: 'Robert Johnson', doctor_id: '1', doctor_name: 'Dr. Michael Chen', department: 'Cardiology', date: '2025-06-04', time_slot: '14:00', status: 'completed', notes: 'Stent check-up', created_at: '2025-05-30' },
  { id: '7', patient_id: '7', patient_name: 'Emma Davis', doctor_id: '8', doctor_name: 'Dr. David Clark', department: 'Psychiatry', date: '2025-06-07', time_slot: '11:00', status: 'confirmed', notes: 'Therapy session', created_at: '2025-06-03' },
  { id: '8', patient_id: '8', patient_name: 'William Taylor', doctor_id: '6', doctor_name: 'Dr. Robert Lee', department: 'General Medicine', date: '2025-06-03', time_slot: '09:30', status: 'completed', notes: 'COPD management', created_at: '2025-05-28' },
  { id: '9', patient_id: '9', patient_name: 'Olivia Martinez', doctor_id: '2', doctor_name: 'Dr. Sarah Kim', department: 'Neurology', date: '2025-06-08', time_slot: '10:00', status: 'pending', notes: 'Migraine evaluation', created_at: '2025-06-04' },
  { id: '10', patient_id: '10', patient_name: 'James Anderson', doctor_id: '3', doctor_name: 'Dr. James Brown', department: 'Orthopedics', date: '2025-06-02', time_slot: '15:00', status: 'cancelled', notes: 'Back pain consultation', created_at: '2025-05-28' },
  { id: '11', patient_id: '1', patient_name: 'Alice Thompson', doctor_id: '5', doctor_name: 'Dr. Lisa Park', department: 'Dermatology', date: '2025-06-09', time_slot: '09:30', status: 'confirmed', created_at: '2025-06-05' },
  { id: '12', patient_id: '3', patient_name: 'Maria Garcia', doctor_id: '7', doctor_name: 'Dr. Anna Martinez', department: 'Ophthalmology', date: '2025-06-10', time_slot: '10:00', status: 'pending', created_at: '2025-06-05' },
];

export const demoPrescriptions: Prescription[] = [
  { id: '1', appointment_id: '3', doctor_id: '1', doctor_name: 'Dr. Michael Chen', patient_id: '3', patient_name: 'Maria Garcia', diagnosis: 'Hypertensive crisis, BP 180/110', medicines: [{ name: 'Amlodipine', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: '30 days' }], instructions: 'Monitor BP daily. Reduce salt intake. Avoid strenuous exercise.', follow_up_date: '2025-07-05', created_at: '2025-06-05' },
  { id: '2', appointment_id: '6', doctor_id: '1', doctor_name: 'Dr. Michael Chen', patient_id: '6', patient_name: 'Robert Johnson', diagnosis: 'Stable post-stent. Mild angina on exertion.', medicines: [{ name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '90 days' }, { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', duration: '90 days' }, { name: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', duration: '90 days' }], instructions: 'Continue cardiac rehab. Low-fat diet.', follow_up_date: '2025-09-04', created_at: '2025-06-04' },
  { id: '3', appointment_id: '8', doctor_id: '6', doctor_name: 'Dr. Robert Lee', patient_id: '8', patient_name: 'William Taylor', diagnosis: 'COPD exacerbation – moderate severity', medicines: [{ name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: '2 puffs, 4 times daily', duration: '14 days' }, { name: 'Prednisolone', dosage: '30mg', frequency: 'Once daily', duration: '5 days' }, { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' }], instructions: 'Complete full antibiotic course. Avoid cold air. Use inhaler before physical activity.', follow_up_date: '2025-06-17', created_at: '2025-06-03' },
];

export const demoMedicines: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', stock_quantity: 5000, expiry_date: '2026-12-31', price: 2.50, manufacturer: 'PharmaCorp', created_at: '2024-01-01' },
  { id: '2', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock_quantity: 3000, expiry_date: '2026-06-30', price: 8.00, manufacturer: 'MediLab', created_at: '2024-01-01' },
  { id: '3', name: 'Amlodipine 10mg', category: 'Antihypertensive', stock_quantity: 2500, expiry_date: '2027-03-31', price: 12.00, manufacturer: 'HeartCare Pharma', created_at: '2024-01-01' },
  { id: '4', name: 'Metformin 500mg', category: 'Antidiabetic', stock_quantity: 4000, expiry_date: '2026-09-30', price: 6.50, manufacturer: 'DiabCare', created_at: '2024-01-01' },
  { id: '5', name: 'Atorvastatin 40mg', category: 'Statin', stock_quantity: 1800, expiry_date: '2026-11-30', price: 15.00, manufacturer: 'LipidCare', created_at: '2024-01-01' },
  { id: '6', name: 'Omeprazole 20mg', category: 'Antacid', stock_quantity: 3500, expiry_date: '2027-01-31', price: 5.00, manufacturer: 'GastroHealth', created_at: '2024-01-01' },
  { id: '7', name: 'Salbutamol Inhaler 100mcg', category: 'Bronchodilator', stock_quantity: 800, expiry_date: '2026-08-31', price: 25.00, manufacturer: 'BreathEasy', created_at: '2024-01-01' },
  { id: '8', name: 'Losartan 50mg', category: 'Antihypertensive', stock_quantity: 2200, expiry_date: '2027-05-31', price: 10.00, manufacturer: 'HeartCare Pharma', created_at: '2024-01-01' },
  { id: '9', name: 'Cetirizine 10mg', category: 'Antihistamine', stock_quantity: 6000, expiry_date: '2027-02-28', price: 3.00, manufacturer: 'AllerFree', created_at: '2024-01-01' },
  { id: '10', name: 'Ibuprofen 400mg', category: 'NSAID', stock_quantity: 45, expiry_date: '2025-07-15', price: 4.00, manufacturer: 'PainRelief Inc', created_at: '2024-01-01' },
  { id: '11', name: 'Clopidogrel 75mg', category: 'Antiplatelet', stock_quantity: 1500, expiry_date: '2026-10-31', price: 18.00, manufacturer: 'CardioSafe', created_at: '2024-01-01' },
  { id: '12', name: 'Aspirin 75mg', category: 'Antiplatelet', stock_quantity: 8000, expiry_date: '2027-06-30', price: 1.50, manufacturer: 'PharmaCorp', created_at: '2024-01-01' },
  { id: '13', name: 'Prednisolone 5mg', category: 'Corticosteroid', stock_quantity: 30, expiry_date: '2025-08-31', price: 7.00, manufacturer: 'ImmunoPharm', created_at: '2024-01-01' },
  { id: '14', name: 'Vitamin D3 1000IU', category: 'Supplement', stock_quantity: 10000, expiry_date: '2027-12-31', price: 5.50, manufacturer: 'VitaHealth', created_at: '2024-01-01' },
  { id: '15', name: 'Diazepam 5mg', category: 'Anxiolytic', stock_quantity: 500, expiry_date: '2026-04-30', price: 12.00, manufacturer: 'NeuroCare', created_at: '2024-01-01' },
];

export const demoLabReports: LabReport[] = [
  { id: '1', patient_id: '1', patient_name: 'Alice Thompson', doctor_id: '6', doctor_name: 'Dr. Robert Lee', technician_id: '7', technician_name: 'Lisa Anderson', test_name: 'Complete Blood Count (CBC)', test_type: 'Hematology', status: 'completed', results: { 'Hemoglobin': '12.5 g/dL', 'WBC': '7,200 /μL', 'RBC': '4.5 million/μL', 'Platelets': '250,000 /μL', 'Hematocrit': '38%' }, created_at: '2025-06-01' },
  { id: '2', patient_id: '2', patient_name: 'John Miller', doctor_id: '6', doctor_name: 'Dr. Robert Lee', technician_id: '7', technician_name: 'Lisa Anderson', test_name: 'HbA1c', test_type: 'Biochemistry', status: 'completed', results: { 'HbA1c': '7.2%', 'Fasting Glucose': '145 mg/dL' }, created_at: '2025-06-02' },
  { id: '3', patient_id: '6', patient_name: 'Robert Johnson', doctor_id: '1', doctor_name: 'Dr. Michael Chen', test_name: 'Lipid Panel', test_type: 'Biochemistry', status: 'pending', created_at: '2025-06-04' },
  { id: '4', patient_id: '8', patient_name: 'William Taylor', doctor_id: '6', doctor_name: 'Dr. Robert Lee', technician_id: '7', technician_name: 'Lisa Anderson', test_name: 'Pulmonary Function Test', test_type: 'Pulmonology', status: 'in_progress', created_at: '2025-06-03' },
  { id: '5', patient_id: '9', patient_name: 'Olivia Martinez', doctor_id: '2', doctor_name: 'Dr. Sarah Kim', test_name: 'MRI Brain', test_type: 'Imaging', status: 'pending', created_at: '2025-06-05' },
];

export const demoBillings: Billing[] = [
  { id: '1', patient_id: '3', patient_name: 'Maria Garcia', appointment_id: '3', consultation_fee: 250, lab_charges: 0, medicine_charges: 45, total_amount: 295, payment_status: 'paid', created_at: '2025-06-05' },
  { id: '2', patient_id: '6', patient_name: 'Robert Johnson', appointment_id: '6', consultation_fee: 250, lab_charges: 120, medicine_charges: 85, total_amount: 455, payment_status: 'paid', created_at: '2025-06-04' },
  { id: '3', patient_id: '8', patient_name: 'William Taylor', appointment_id: '8', consultation_fee: 180, lab_charges: 200, medicine_charges: 95, total_amount: 475, payment_status: 'partial', created_at: '2025-06-03' },
  { id: '4', patient_id: '1', patient_name: 'Alice Thompson', appointment_id: '1', consultation_fee: 250, lab_charges: 80, medicine_charges: 0, total_amount: 330, payment_status: 'pending', created_at: '2025-06-05' },
  { id: '5', patient_id: '2', patient_name: 'John Miller', appointment_id: '2', consultation_fee: 180, lab_charges: 60, medicine_charges: 30, total_amount: 270, payment_status: 'paid', created_at: '2025-06-05' },
];

export const demoVitals: Vitals[] = [
  { id: '1', patient_id: '1', patient_name: 'Alice Thompson', nurse_id: '3', blood_pressure: '120/80', heart_rate: 72, temperature: 98.6, oxygen_level: 98, weight: 62, recorded_at: '2025-06-05T09:00:00' },
  { id: '2', patient_id: '3', patient_name: 'Maria Garcia', nurse_id: '3', blood_pressure: '155/95', heart_rate: 88, temperature: 98.4, oxygen_level: 97, weight: 70, recorded_at: '2025-06-05T09:30:00' },
  { id: '3', patient_id: '6', patient_name: 'Robert Johnson', nurse_id: '3', blood_pressure: '135/85', heart_rate: 76, temperature: 98.2, oxygen_level: 96, weight: 85, recorded_at: '2025-06-04T14:00:00' },
  { id: '4', patient_id: '8', patient_name: 'William Taylor', nurse_id: '3', blood_pressure: '140/90', heart_rate: 82, temperature: 99.1, oxygen_level: 92, weight: 78, recorded_at: '2025-06-03T10:00:00' },
];

export const dashboardStats: DashboardStats = {
  total_patients: 1284,
  total_doctors: 48,
  total_nurses: 96,
  total_appointments: 3567,
  total_revenue: 892450,
  pharmacy_items: 15,
  appointments_today: 24,
  pending_lab_reports: 8,
};

export const monthlyPatientsData: ChartData[] = [
  { name: 'Jan', value: 145, new: 45, returning: 100 },
  { name: 'Feb', value: 168, new: 52, returning: 116 },
  { name: 'Mar', value: 192, new: 58, returning: 134 },
  { name: 'Apr', value: 210, new: 63, returning: 147 },
  { name: 'May', value: 235, new: 72, returning: 163 },
  { name: 'Jun', value: 258, new: 80, returning: 178 },
  { name: 'Jul', value: 240, new: 68, returning: 172 },
  { name: 'Aug', value: 275, new: 85, returning: 190 },
  { name: 'Sep', value: 290, new: 90, returning: 200 },
  { name: 'Oct', value: 310, new: 95, returning: 215 },
  { name: 'Nov', value: 285, new: 82, returning: 203 },
  { name: 'Dec', value: 320, new: 98, returning: 222 },
];

export const revenueData: ChartData[] = [
  { name: 'Jan', value: 62000, consultations: 35000, lab: 15000, pharmacy: 12000 },
  { name: 'Feb', value: 68000, consultations: 38000, lab: 16500, pharmacy: 13500 },
  { name: 'Mar', value: 75000, consultations: 42000, lab: 18000, pharmacy: 15000 },
  { name: 'Apr', value: 72000, consultations: 40000, lab: 17000, pharmacy: 15000 },
  { name: 'May', value: 82000, consultations: 45000, lab: 20000, pharmacy: 17000 },
  { name: 'Jun', value: 89000, consultations: 49000, lab: 22000, pharmacy: 18000 },
  { name: 'Jul', value: 85000, consultations: 47000, lab: 21000, pharmacy: 17000 },
  { name: 'Aug', value: 92000, consultations: 51000, lab: 23000, pharmacy: 18000 },
  { name: 'Sep', value: 95000, consultations: 52000, lab: 24000, pharmacy: 19000 },
  { name: 'Oct', value: 98000, consultations: 54000, lab: 25000, pharmacy: 19000 },
  { name: 'Nov', value: 88000, consultations: 48000, lab: 22000, pharmacy: 18000 },
  { name: 'Dec', value: 86000, consultations: 47000, lab: 21000, pharmacy: 18000 },
];

export const appointmentStatsData: ChartData[] = [
  { name: 'Scheduled', value: 45 },
  { name: 'Completed', value: 120 },
  { name: 'Cancelled', value: 15 },
];

export const departmentPerformanceData: ChartData[] = [
  { name: 'Cardiology', value: 320, patients: 320 },
  { name: 'Neurology', value: 180, patients: 180 },
  { name: 'Orthopedics', value: 250, patients: 250 },
  { name: 'Pediatrics', value: 290, patients: 290 },
  { name: 'Dermatology', value: 150, patients: 150 },
  { name: 'General Med', value: 420, patients: 420 },
  { name: 'Ophthalmology', value: 130, patients: 130 },
  { name: 'Psychiatry', value: 95, patients: 95 },
];
