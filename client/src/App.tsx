import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import { UserRole } from './types';
import React, { Suspense, lazy } from 'react';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Dashboards
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPatients = lazy(() => import('./pages/admin/AdminPatients'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorPrescriptions = lazy(() => import('./pages/doctor/DoctorPrescriptions'));

const NurseDashboard = lazy(() => import('./pages/nurse/NurseDashboard'));
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientAppointments = lazy(() => import('./pages/patient/PatientAppointments'));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions'));
const PatientReports = lazy(() => import('./pages/patient/PatientReports'));

const PharmacyDashboard = lazy(() => import('./pages/pharmacy/PharmacyDashboard'));
const LabDashboard = lazy(() => import('./pages/lab/LabDashboard'));
const BillingPage = lazy(() => import('./pages/billing/BillingPage'));

const AICenter = lazy(() => import('./pages/ai/AICenter'));
const SymptomChecker = lazy(() => import('./pages/ai/SymptomChecker'));
const ReportSummarizer = lazy(() => import('./pages/ai/ReportSummarizer'));
const AIChatbot = lazy(() => import('./pages/ai/AIChatbot'));

const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-medical-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-medical-muted text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    // Redirect to their role's dashboard
    const dashboardRoutes: Record<UserRole, string> = {
      admin: '/admin',
      doctor: '/doctor',
      nurse: '/nurse',
      receptionist: '/receptionist',
      patient: '/patient',
      pharmacist: '/pharmacy',
      lab_technician: '/lab',
    };
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }
  return <>{children}</>;
};

// Dashboard wrapper
const DashboardRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

// Redirect authenticated users to their dashboard
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated && user) {
    const dashboardRoutes: Record<UserRole, string> = {
      admin: '/admin',
      doctor: '/doctor',
      nurse: '/nurse',
      receptionist: '/receptionist',
      patient: '/patient',
      pharmacist: '/pharmacy',
      lab_technician: '/lab',
    };
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }
  return <>{children}</>;
};

// DashboardRedirect dynamically redirects users to their default portal page based on their role
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dashboardRoutes: Record<UserRole, string> = {
    admin: '/admin',
    doctor: '/doctor',
    nurse: '/nurse/monitoring',
    receptionist: '/receptionist/register',
    patient: '/patient',
    pharmacist: '/pharmacy/inventory',
    lab_technician: '/lab/requests',
  };
  return <Navigate to={dashboardRoutes[user.role]} replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

        {/* Dynamic dashboard entry route */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<DashboardRoute roles={['admin']}><AdminDashboard /></DashboardRoute>} />
        <Route path="/admin/patients" element={<DashboardRoute roles={['admin']}><AdminPatients /></DashboardRoute>} />
        <Route path="/admin/doctors" element={<DashboardRoute roles={['admin']}><AdminDoctors /></DashboardRoute>} />
        <Route path="/admin/appointments" element={<DashboardRoute roles={['admin']}><AdminAppointments /></DashboardRoute>} />
        <Route path="/admin/departments" element={<DashboardRoute roles={['admin']}><AdminDepartments /></DashboardRoute>} />
        <Route path="/admin/analytics" element={<DashboardRoute roles={['admin']}><AdminAnalytics /></DashboardRoute>} />

        {/* Root-level redirects for convenience/auditing */}
        <Route path="/patients" element={<ProtectedRoute><Navigate to="/admin/patients" replace /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><Navigate to="/admin/doctors" replace /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Navigate to="/admin/appointments" replace /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><Navigate to="/admin/departments" replace /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Navigate to="/admin/analytics" replace /></ProtectedRoute>} />
        <Route path="/laboratory" element={<ProtectedRoute><Navigate to="/lab/requests" replace /></ProtectedRoute>} />

        {/* Doctor routes */}
        <Route path="/doctor" element={<DashboardRoute roles={['doctor']}><DoctorDashboard /></DashboardRoute>} />
        <Route path="/doctor/appointments" element={<DashboardRoute roles={['doctor']}><DoctorAppointments /></DashboardRoute>} />
        <Route path="/doctor/patients" element={<DashboardRoute roles={['doctor']}><DoctorPatients /></DashboardRoute>} />
        <Route path="/doctor/prescriptions" element={<DashboardRoute roles={['doctor']}><DoctorPrescriptions /></DashboardRoute>} />

        {/* Nurse routes */}
        <Route path="/nurse" element={<Navigate to="/nurse/monitoring" replace />} />
        <Route path="/nurse/monitoring" element={<DashboardRoute roles={['nurse']}><NurseDashboard /></DashboardRoute>} />
        <Route path="/nurse/vitals" element={<DashboardRoute roles={['nurse']}><NurseDashboard /></DashboardRoute>} />
        <Route path="/nurse/wards" element={<DashboardRoute roles={['nurse']}><NurseDashboard /></DashboardRoute>} />
        <Route path="/nurse/medications" element={<DashboardRoute roles={['nurse']}><NurseDashboard /></DashboardRoute>} />

        {/* Receptionist routes */}
        <Route path="/receptionist" element={<Navigate to="/receptionist/register" replace />} />
        <Route path="/receptionist/register" element={<DashboardRoute roles={['receptionist']}><ReceptionistDashboard /></DashboardRoute>} />
        <Route path="/receptionist/appointments" element={<DashboardRoute roles={['receptionist']}><ReceptionistDashboard /></DashboardRoute>} />
        <Route path="/receptionist/checkin" element={<DashboardRoute roles={['receptionist']}><ReceptionistDashboard /></DashboardRoute>} />
        <Route path="/receptionist/admissions" element={<DashboardRoute roles={['receptionist']}><ReceptionistDashboard /></DashboardRoute>} />

        {/* Patient routes */}
        <Route path="/patient" element={<DashboardRoute roles={['patient']}><PatientDashboard /></DashboardRoute>} />
        <Route path="/patient/appointments" element={<DashboardRoute roles={['patient']}><PatientAppointments /></DashboardRoute>} />
        <Route path="/patient/prescriptions" element={<DashboardRoute roles={['patient']}><PatientPrescriptions /></DashboardRoute>} />
        <Route path="/patient/reports" element={<DashboardRoute roles={['patient']}><PatientReports /></DashboardRoute>} />
        <Route path="/patient/symptoms" element={<DashboardRoute roles={['patient']}><SymptomChecker /></DashboardRoute>} />
        <Route path="/patient/chat" element={<DashboardRoute roles={['patient']}><AIChatbot /></DashboardRoute>} />

        {/* Pharmacy routes */}
        <Route path="/pharmacy" element={<Navigate to="/pharmacy/inventory" replace />} />
        <Route path="/pharmacy/inventory" element={<DashboardRoute roles={['admin', 'pharmacist']}><PharmacyDashboard /></DashboardRoute>} />
        <Route path="/pharmacy/prescriptions" element={<DashboardRoute roles={['admin', 'pharmacist']}><PharmacyDashboard /></DashboardRoute>} />
        <Route path="/pharmacy/alerts" element={<DashboardRoute roles={['admin', 'pharmacist']}><PharmacyDashboard /></DashboardRoute>} />

        {/* Lab routes */}
        <Route path="/lab" element={<Navigate to="/lab/requests" replace />} />
        <Route path="/lab/requests" element={<DashboardRoute roles={['admin', 'doctor', 'lab_technician']}><LabDashboard /></DashboardRoute>} />
        <Route path="/lab/upload" element={<DashboardRoute roles={['lab_technician']}><LabDashboard /></DashboardRoute>} />
        <Route path="/lab/reports" element={<DashboardRoute roles={['admin', 'doctor', 'lab_technician']}><LabDashboard /></DashboardRoute>} />

        {/* Billing */}
        <Route path="/billing" element={<DashboardRoute roles={['admin', 'receptionist', 'patient']}><BillingPage /></DashboardRoute>} />

        {/* AI Center */}
        <Route path="/ai" element={<DashboardRoute><AICenter /></DashboardRoute>} />
        <Route path="/ai/symptoms" element={<DashboardRoute><SymptomChecker /></DashboardRoute>} />
        <Route path="/ai/summarizer" element={<Navigate to="/ai/summarize" replace />} />
        <Route path="/ai/summarize" element={<DashboardRoute><ReportSummarizer /></DashboardRoute>} />
        <Route path="/ai/chat" element={<DashboardRoute><AIChatbot /></DashboardRoute>} />

        {/* Settings */}
        <Route path="/settings" element={<DashboardRoute><SettingsPage /></DashboardRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
