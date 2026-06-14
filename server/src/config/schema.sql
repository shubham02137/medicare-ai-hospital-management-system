-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  MediCare AI — PostgreSQL Database Schema                       ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('admin','doctor','nurse','receptionist','patient','pharmacist','lab_technician')),
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(20) NOT NULL DEFAULT '',
  avatar        TEXT DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ─── Departments ────────────────────────────────────────────────────
CREATE TABLE departments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  head_doctor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Patients ───────────────────────────────────────────────────────
CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth     DATE NOT NULL DEFAULT '1990-01-01',
  gender            VARCHAR(10) NOT NULL DEFAULT 'male' CHECK (gender IN ('male','female','other')),
  blood_group       VARCHAR(5) NOT NULL DEFAULT 'O+' CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  address           TEXT NOT NULL DEFAULT '',
  emergency_contact VARCHAR(20) NOT NULL DEFAULT '',
  medical_history   JSONB NOT NULL DEFAULT '[]'::jsonb,
  allergies         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);

-- ─── Doctors ────────────────────────────────────────────────────────
CREATE TABLE doctors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
  specialization    VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
  experience_years  INTEGER NOT NULL DEFAULT 0,
  availability      JSONB NOT NULL DEFAULT '[]'::jsonb,
  consultation_fee  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  qualification     VARCHAR(100) DEFAULT '',
  license_number    VARCHAR(100) DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_department ON doctors(department_id);
CREATE INDEX idx_doctors_user_id    ON doctors(user_id);

-- ─── Admin Profiles ─────────────────────────────────────────────────
CREATE TABLE admin_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  designation     VARCHAR(100) NOT NULL DEFAULT 'Administrator',
  department      VARCHAR(100) NOT NULL DEFAULT 'IT & Operations',
  contact_details VARCHAR(255) NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_user ON admin_profiles(user_id);

-- ─── Nurse Profiles ─────────────────────────────────────────────────
CREATE TABLE nurse_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department      VARCHAR(100) NOT NULL DEFAULT 'General Ward',
  shift           VARCHAR(50) NOT NULL DEFAULT 'Morning',
  qualification   VARCHAR(100) NOT NULL DEFAULT 'B.Sc. Nursing',
  experience      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nurse_profiles_user ON nurse_profiles(user_id);

-- ─── Receptionist Profiles ──────────────────────────────────────────
CREATE TABLE receptionist_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  desk_number     VARCHAR(50) NOT NULL DEFAULT 'Desk 1',
  shift           VARCHAR(50) NOT NULL DEFAULT 'Morning',
  experience      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receptionist_profiles_user ON receptionist_profiles(user_id);

-- ─── Pharmacist Profiles ────────────────────────────────────────────
CREATE TABLE pharmacist_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number  VARCHAR(100) NOT NULL DEFAULT '',
  qualification   VARCHAR(100) NOT NULL DEFAULT 'B.Pharm',
  experience      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacist_profiles_user ON pharmacist_profiles(user_id);

-- ─── Lab Technician Profiles ────────────────────────────────────────
CREATE TABLE lab_technician_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  lab_department  VARCHAR(100) NOT NULL DEFAULT 'Pathology',
  qualification   VARCHAR(100) NOT NULL DEFAULT 'B.Sc. MLT',
  license_number  VARCHAR(100) NOT NULL DEFAULT '',
  experience      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_technician_profiles_user ON lab_technician_profiles(user_id);

-- ─── Appointments ───────────────────────────────────────────────────
CREATE TABLE appointments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id   UUID NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
  date        DATE NOT NULL,
  time_slot   VARCHAR(20) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor  ON appointments(doctor_id);
CREATE INDEX idx_appointments_date    ON appointments(date);
CREATE INDEX idx_appointments_status  ON appointments(status);

-- ─── Prescriptions ─────────────────────────────────────────────────
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id       UUID NOT NULL REFERENCES doctors(id)   ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id)  ON DELETE CASCADE,
  diagnosis       TEXT NOT NULL,
  medicines       JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions    TEXT NOT NULL DEFAULT '',
  follow_up_date  DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor  ON prescriptions(doctor_id);

-- ─── Medicines ──────────────────────────────────────────────────────
CREATE TABLE medicines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  expiry_date     DATE NOT NULL,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  manufacturer    VARCHAR(200) NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_expiry   ON medicines(expiry_date);

-- ─── Lab Reports ────────────────────────────────────────────────────
CREATE TABLE lab_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
  technician_id   UUID REFERENCES users(id)             ON DELETE SET NULL,
  test_name       VARCHAR(200) NOT NULL,
  test_type       VARCHAR(100) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  results         JSONB NOT NULL DEFAULT '[]'::jsonb,
  report_url      TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX idx_lab_reports_status  ON lab_reports(status);

-- ─── Billings ───────────────────────────────────────────────────────
CREATE TABLE billings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id    UUID REFERENCES appointments(id)      ON DELETE SET NULL,
  consultation_fee  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  lab_charges       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  medicine_charges  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partially_paid','refunded')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billings_patient ON billings(patient_id);
CREATE INDEX idx_billings_status  ON billings(payment_status);

-- ─── Vitals ─────────────────────────────────────────────────────────
CREATE TABLE vitals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id        UUID REFERENCES users(id)             ON DELETE SET NULL,
  blood_pressure  VARCHAR(20) NOT NULL,
  heart_rate      INTEGER NOT NULL,
  temperature     NUMERIC(4,1) NOT NULL,
  oxygen_level    INTEGER NOT NULL,
  weight          NUMERIC(5,1) NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_patient ON vitals(patient_id);
CREATE INDEX idx_vitals_time    ON vitals(recorded_at);

-- ─── Trigger: auto-update updated_at on users ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
