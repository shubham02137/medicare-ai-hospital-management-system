import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicare_token') || sessionStorage.getItem('medicare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medicare_token');
      localStorage.removeItem('medicare_user');
      sessionStorage.removeItem('medicare_token');
      sessionStorage.removeItem('medicare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, string>) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Record<string, string>) =>
    api.put('/auth/profile', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// Patient APIs
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: Record<string, unknown>) => api.post('/patients', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  search: (query: string) => api.get(`/patients/search?q=${query}`),
};

// Doctor APIs
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: Record<string, unknown>) => api.post('/doctors', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
  getAvailability: (id: string, date: string) => api.get(`/doctors/${id}/availability?date=${date}`),
};

// Appointment APIs
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: Record<string, unknown>) => api.post('/appointments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/appointments/${id}`, data),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
  confirm: (id: string) => api.put(`/appointments/${id}/confirm`),
  reject: (id: string) => api.put(`/appointments/${id}/reject`),
  complete: (id: string) => api.put(`/appointments/${id}/complete`),
  getByDoctor: (doctorId: string) => api.get(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId: string) => api.get(`/appointments/patient/${patientId}`),
};

// Prescription APIs
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id: string) => api.get(`/prescriptions/${id}`),
  create: (data: Record<string, unknown>) => api.post('/prescriptions', data),
  getByPatient: (patientId: string) => api.get(`/prescriptions/patient/${patientId}`),
};

// Medicine APIs
export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  getById: (id: string) => api.get(`/medicines/${id}`),
  create: (data: Record<string, unknown>) => api.post('/medicines', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
  getLowStock: () => api.get('/medicines/low-stock'),
  getExpiring: () => api.get('/medicines/expiring'),
};

// Lab Report APIs
export const labReportAPI = {
  getAll: () => api.get('/lab-reports'),
  getById: (id: string) => api.get(`/lab-reports/${id}`),
  create: (data: Record<string, unknown>) => api.post('/lab-reports', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/lab-reports/${id}`, data),
  getByPatient: (patientId: string) => api.get(`/lab-reports/patient/${patientId}`),
};

// Billing APIs
export const billingAPI = {
  getAll: () => api.get('/billings'),
  getById: (id: string) => api.get(`/billings/${id}`),
  create: (data: Record<string, unknown>) => api.post('/billings', data),
  getByPatient: (patientId: string) => api.get(`/billings/patient/${patientId}`),
};

// Vitals APIs
export const vitalsAPI = {
  getAll: () => api.get('/vitals'),
  create: (data: Record<string, unknown>) => api.post('/vitals', data),
  getByPatient: (patientId: string) => api.get(`/vitals/patient/${patientId}`),
  delete: (id: string) => api.delete(`/vitals/${id}`),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: Record<string, unknown>) => api.post('/departments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getMonthlyPatients: () => api.get('/analytics/monthly-patients'),
  getRevenueTrend: () => api.get('/analytics/revenue-trend'),
  getAppointmentStats: () => api.get('/analytics/appointment-stats'),
  getDepartmentPerformance: () => api.get('/analytics/department-performance'),
};

// AI APIs
export const aiAPI = {
  checkSymptoms: (symptoms: string[]) =>
    api.post('/ai/symptom-check', { symptoms }),
  summarizeReport: (reportText: string) =>
    api.post('/ai/summarize', { report_text: reportText }),
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post('/ai/chat', { message, history }),
};

export default api;
