// ==========================================
// MediCare AI - Shared Type Definitions
// ==========================================

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist' | 'lab_technician';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  blood_group: string;
  phone: string;
  address: string;
  emergency_contact: string;
  medical_history: string;
  created_at: string;
  
  // Extended fields
  allergies?: string[];
}

export interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department_id: string;
  department_name?: string;
  specialization: string;
  experience_years: number;
  availability: DoctorAvailability;
  consultation_fee: number;
  avatar?: string;
  created_at: string;
  
  // Extended fields
  qualification?: string;
  license_number?: string;
  available_days?: string[];
  available_time?: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  contact_details: string;
  avatar?: string;
  created_at: string;
}

export interface NurseProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  department: string;
  shift: string;
  qualification: string;
  experience: number;
  avatar?: string;
  created_at: string;
}

export interface ReceptionistProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  desk_number: string;
  shift: string;
  experience: number;
  avatar?: string;
  created_at: string;
}

export interface PharmacistProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  license_number: string;
  qualification: string;
  experience: number;
  avatar?: string;
  created_at: string;
}

export interface LabTechnicianProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  lab_department: string;
  qualification: string;
  license_number: string;
  experience: number;
  avatar?: string;
  created_at: string;
}

export interface DoctorAvailability {
  monday?: { start: string; end: string };
  tuesday?: { start: string; end: string };
  wednesday?: { start: string; end: string };
  thursday?: { start: string; end: string };
  friday?: { start: string; end: string };
  saturday?: { start: string; end: string };
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  department?: string;
  department_name?: string;
  date: string;
  time_slot: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string;
  patient_name: string;
  diagnosis: string;
  medicines?: PrescriptionMedicine[];
  instructions: string;
  clinical_notes?: string;
  request_admission?: boolean;
  admission_notes?: string;
  referral_specialist_id?: string;
  referral_specialist_name?: string;
  referral_notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  expiry_date: string;
  price: number;
  manufacturer: string;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  technician_id?: string;
  technician_name?: string;
  test_name: string;
  test_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  results?: Record<string, string | number>;
  report_url?: string;
  created_at: string;
}

export interface Billing {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id?: string;
  consultation_fee: number;
  lab_charges: number;
  medicine_charges: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'partial';
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head_doctor_id?: string;
  head_doctor_name?: string;
  created_at: string;
}

export interface Vitals {
  id: string;
  patient_id: string;
  patient_name: string;
  nurse_id: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  oxygen_level: number;
  weight: number;
  recorded_at: string;
}

// Analytics types
export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  total_nurses: number;
  total_appointments: number;
  total_revenue: number;
  pharmacy_items: number;
  appointments_today: number;
  pending_lab_reports: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// AI types
export interface SymptomCheckResult {
  possibleConditions: {
    condition: string;
    probability: string;
    description: string;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedDepartment: string;
  suggestedAction: string;
  recommendedDoctor?: string;
  disclaimer?: string;
}

export interface ReportSummary {
  key_findings: string[];
  abnormal_values: any[];
  summary: string;
  follow_up_recommendation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Navigation
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
