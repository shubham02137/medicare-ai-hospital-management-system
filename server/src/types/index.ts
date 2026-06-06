// ─── Enums ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist' | 'lab_technician';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Gender = 'male' | 'female' | 'other';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded';

export type LabReportStatus = 'pending' | 'in_progress' | 'completed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ─── Core Interfaces ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  phone: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head_doctor_id?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  blood_group: BloodGroup;
  address: string;
  emergency_contact: string;
  medical_history: string[];
  created_at: string;
  
  // Extended fields
  age?: number;
  allergies?: string[];
}

export interface DoctorAvailability {
  day: string;
  start: string;
  end: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  department_name?: string;
  specialization: string;
  experience_years: number;
  availability: DoctorAvailability[];
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

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  department_name?: string;
  date: string;
  time_slot: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  doctor_name?: string;
  patient_id: string;
  patient_name?: string;
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

export interface LabReportResult {
  parameter: string;
  value: string;
  unit: string;
  normal_range: string;
  is_abnormal: boolean;
}

export interface LabReport {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  technician_id?: string;
  test_name: string;
  test_type: string;
  status: LabReportStatus;
  results: LabReportResult[];
  report_url?: string;
  created_at: string;
}

export interface Billing {
  id: string;
  patient_id: string;
  patient_name?: string;
  appointment_id?: string;
  consultation_fee: number;
  lab_charges: number;
  medicine_charges: number;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Vitals {
  id: string;
  patient_id: string;
  patient_name?: string;
  nurse_id?: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  oxygen_level: number;
  weight: number;
  recorded_at: string;
}

// ─── API Response ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Auth Payloads ──────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
}

// ─── AI Types ───────────────────────────────────────────────────────────

export interface SymptomCheckResult {
  possibleConditions: Array<{
    condition: string;
    probability: string;
    description: string;
  }>;
  riskLevel: RiskLevel;
  recommendedDepartment: string;
  recommendedDoctor?: string;
  suggestedAction: string;
  disclaimer: string;
}

export interface ReportSummary {
  keyFindings: string[];
  abnormalValues: any[];
  summary: string;
  followUpRecommendations: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Express augmentation ───────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
