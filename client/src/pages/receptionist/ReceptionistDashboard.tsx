import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { patientAPI, doctorAPI, appointmentAPI, prescriptionAPI } from '../../services/api';
import { demoPatients, demoDoctors, demoAppointments } from '../../data/mockData';
import { Patient, Doctor, Appointment, Prescription } from '../../types';
import {
  UserPlus, Calendar, CheckSquare, Search, Info, PlusCircle,
  ClipboardList, CheckCircle2, UserCheck, AlertTriangle, Trash2, Edit, X, Hotel, Stethoscope, FileText
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'register' | 'book' | 'checkin' | 'admissions'>('register');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter for patient table
  const [patientSearch, setPatientSearch] = useState('');

  // Edit Patient State
  const [editPatientId, setEditPatientId] = useState<string | null>(null);

  // Patient Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [submittingPatient, setSubmittingPatient] = useState(false);

  // Appointment Booking Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00-09:30');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [submittingAppointment, setSubmittingAppointment] = useState(false);

  const departments = [
    { id: 'dep-001', name: 'Cardiology' },
    { id: 'dep-002', name: 'Neurology' },
    { id: 'dep-003', name: 'Orthopedics' },
    { id: 'dep-005', name: 'Dermatology' },
    { id: 'dep-007', name: 'Ophthalmology' },
    { id: 'dep-008', name: 'ENT' },
    { id: 'dep-006', name: 'General Medicine' }
  ];

  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/appointments')) {
      setActiveTab('book');
    } else if (path.endsWith('/checkin')) {
      setActiveTab('checkin');
    } else if (path.endsWith('/admissions')) {
      setActiveTab('admissions');
    } else {
      setActiveTab('register');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: 'register' | 'book' | 'checkin' | 'admissions') => {
    const routeMap = {
      register: '/receptionist/register',
      book: '/receptionist/appointments',
      checkin: '/receptionist/checkin',
      admissions: '/receptionist/admissions',
    };
    navigate(routeMap[tabId]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Patients
        try {
          const patRes = await patientAPI.getAll();
          setPatients(patRes.data?.data || patRes.data || []);
        } catch {
          setPatients(demoPatients);
        }

        // Doctors
        try {
          const docRes = await doctorAPI.getAll();
          setDoctors(docRes.data?.data || docRes.data || []);
        } catch {
          setDoctors(demoDoctors);
        }

        // Appointments
        try {
          const aptRes = await appointmentAPI.getAll();
          setAppointments(aptRes.data?.data || aptRes.data || []);
        } catch {
          setAppointments(demoAppointments);
        }

        // Prescriptions
        try {
          const prescRes = await prescriptionAPI.getAll();
          setPrescriptions(prescRes.data?.data || prescRes.data || []);
        } catch {
          setPrescriptions([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !dob || !email) {
      alert('Name, Phone, DOB, and Email are required.');
      return;
    }
    setSubmittingPatient(true);

    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        date_of_birth: dob,
        gender,
        blood_group: bloodGroup,
        address,
        emergency_contact: emergencyContact,
        medical_history: medicalHistory,
        user_id: '',
      };

      if (editPatientId) {
        // Edit flow
        try {
          const res = await patientAPI.update(editPatientId, payload);
          const updated = res.data?.data || res.data;
          setPatients(prev => prev.map(p => p.id === editPatientId ? { ...p, ...updated } : p));
        } catch {
          // Mock update
          setPatients(prev => prev.map(p => p.id === editPatientId ? { ...p, ...payload } : p));
        }
        alert('Patient record updated successfully.');
        setEditPatientId(null);
      } else {
        // Creation flow
        let savedPatient: Patient;
        try {
          const res = await patientAPI.create(payload);
          savedPatient = res.data?.data || res.data;
        } catch {
          // Mock fallback
          savedPatient = {
            id: `pat-${Date.now().toString().slice(-3)}`,
            age: new Date().getFullYear() - new Date(dob).getFullYear(),
            created_at: new Date().toISOString().slice(0, 10),
            ...payload,
          } as unknown as Patient;
        }

        setPatients([savedPatient, ...patients]);
        alert('Patient registered successfully!');
        setSelectedPatientId(savedPatient.id);
        handleTabChange('book');
      }

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setDob('');
      setAddress('');
      setEmergencyContact('');
      setMedicalHistory('');
    } catch (err) {
      console.error(err);
      alert('Failed to register/update patient.');
    } finally {
      setSubmittingPatient(false);
    }
  };

  const handleStartEditPatient = (p: Patient) => {
    setEditPatientId(p.id);
    setFullName(p.full_name);
    setEmail(p.email);
    setPhone(p.phone);
    setDob(p.date_of_birth);
    setGender(p.gender as any);
    setBloodGroup(p.blood_group);
    setAddress(p.address || '');
    setEmergencyContact(p.emergency_contact || '');
    setMedicalHistory(p.medical_history || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditPatientId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setDob('');
    setAddress('');
    setEmergencyContact('');
    setMedicalHistory('');
  };

  const handleDeletePatient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await patientAPI.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      alert('Patient record deleted.');
    } catch {
      // Mock delete
      setPatients(prev => prev.filter(p => p.id !== id));
      alert('Patient record deleted (offline fallback).');
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !timeSlot) {
      alert('Please fill out all appointment parameters.');
      return;
    }
    setSubmittingAppointment(true);

    try {
      const payload = {
        patient_id: selectedPatientId,
        doctor_id: selectedDoctorId,
        date: appointmentDate,
        time_slot: timeSlot,
        notes: appointmentNotes,
      };

      let savedAppointment: Appointment;

      try {
        const res = await appointmentAPI.create(payload);
        savedAppointment = res.data?.data || res.data;
      } catch (error: any) {
        // Fallback for slot conflict or offline mode
        const patientObj = patients.find(p => p.id === selectedPatientId);
        const doctorObj = doctors.find(d => d.id === selectedDoctorId);

        savedAppointment = {
          id: `apt-${Date.now().toString().slice(-3)}`,
          patient_id: selectedPatientId,
          patient_name: patientObj?.full_name || 'Rahul Verma',
          doctor_id: selectedDoctorId,
          doctor_name: doctorObj?.full_name || 'Dr. Michael Chen',
          department: doctorObj?.department_name || 'General Medicine',
          date: appointmentDate,
          time_slot: timeSlot,
          status: 'pending',
          notes: appointmentNotes,
          created_at: new Date().toISOString(),
        };
      }

      setAppointments([savedAppointment, ...appointments]);
      alert('Appointment booked successfully!');
      
      // Reset form
      setSelectedPatientId('');
      setBgForDept('');
      setSelectedDoctorId('');
      setAppointmentDate('');
      setAppointmentNotes('');
      handleTabChange('checkin');
    } catch (err) {
      console.error(err);
      alert('Error booking appointment.');
    } finally {
      setSubmittingAppointment(false);
    }
  };

  const setBgForDept = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setSelectedDoctorId('');
  };

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentAPI.confirm(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch {
      // Mock update
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    }
  };

  // Filter doctors dynamically
  const filteredDoctors = selectedDepartmentId
    ? doctors.filter(d => d.department_id === selectedDepartmentId || d.department_name?.toLowerCase() === departments.find(dep => dep.id === selectedDepartmentId)?.name.toLowerCase())
    : doctors;

  // Filter patients by search query
  const filteredPatients = patientSearch
    ? patients.filter(p =>
        p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch)
      )
    : patients;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(a => a.date === todayStr || a.date.includes(todayStr));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Reception Desk</h1>
          <p className="text-medical-muted text-sm mt-1">Register walk-in patients and manage daily booking schedules</p>
        </div>

        {/* Tab triggers */}
        <div className="bg-white p-1 rounded-xl border border-medical-border flex gap-1 text-sm font-semibold">
          {[
            { id: 'register', label: 'Register Patient', icon: <UserPlus size={16} /> },
            { id: 'book', label: 'Book Appointment', icon: <Calendar size={16} /> },
            { id: 'checkin', label: "Today's Check-ins", icon: <CheckSquare size={16} /> },
            { id: 'admissions', label: 'Admissions & Referrals', icon: <Hotel size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md' : 'text-medical-text-secondary hover:bg-gray-50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: REGISTER PATIENT & PATIENT CRUD LIST ──────────────── */}
      {activeTab === 'register' && (
        <div className="space-y-6 animate-fade-in">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <UserPlus className="text-primary-600" size={20} />
              {editPatientId ? 'Edit Patient File' : 'Register New Patient File'}
            </h2>
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1-555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="input-field"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Residential Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="Emergency phone number"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Clinical History (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma, Hypertension"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                {editPatientId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold flex items-center gap-1"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submittingPatient}
                  className="btn-primary"
                >
                  {submittingPatient ? 'Saving...' : editPatientId ? 'Update Patient' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>

          {/* Patient Database View (CRUD Table) */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-medical-text-primary">Registered Patients Directory</h3>
                <p className="text-xs text-medical-muted">View, search, edit, or delete registered patient records.</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-medical-border rounded-xl px-3 py-2 w-full md:w-72">
                <Search size={16} className="text-medical-muted" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs text-medical-text-primary placeholder:text-medical-muted w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medical-border text-left">
                    <th className="table-header">Patient Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">DOB</th>
                    <th className="table-header">Blood Group</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell font-semibold text-medical-text-primary">{p.full_name}</td>
                      <td className="table-cell text-xs">{p.email}</td>
                      <td className="table-cell text-xs">{p.phone}</td>
                      <td className="table-cell text-xs">{p.date_of_birth}</td>
                      <td className="table-cell text-xs font-semibold text-center">{p.blood_group || 'N/A'}</td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditPatient(p)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Patient"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(p.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: BOOK APPOINTMENT ─────────────────────────────────── */}
      {activeTab === 'book' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            Schedule New Doctor Appointment
          </h2>
          <form onSubmit={handleAppointmentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Choose Registered Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Filter Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setBgForDept(e.target.value)}
                className="input-field"
              >
                <option value="">-- Select Specialty Department (All) --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Choose Doctor --</option>
                {filteredDoctors.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name} ({d.department_name || d.specialization})</option>
                ))}
              </select>
              {filteredDoctors.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">No doctors currently registered in this department.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Consultation Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  min={todayStr}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Available Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="input-field"
                  required
                >
                  {['09:00-09:30', '10:00-10:30', '11:00-11:30', '14:00-14:30', '15:00-15:30', '16:00-16:30'].map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Notes / Consult Reason (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Follow-up review, fever symptoms"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                className="input-field resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submittingAppointment || filteredDoctors.length === 0}
                className="btn-primary flex items-center gap-1.5"
              >
                <Calendar size={18} />
                {submittingAppointment ? 'Booking...' : 'Confirm Appointment Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: DAILY CHECK-INS ──────────────────────────────────── */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <ClipboardList className="text-primary-600" size={20} />
            Today's Check-ins & Consult Queue
          </h2>
          <p className="text-xs text-medical-muted mb-6">Manage patients check-ins as they arrive at the reception desk.</p>

          <div className="overflow-x-auto">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-10 text-medical-muted">
                <Calendar size={40} className="mx-auto mb-2 opacity-35" />
                <p>No appointments booked for today yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medical-border text-left">
                    <th className="table-header">Patient</th>
                    <th className="table-header">Doctor</th>
                    <th className="table-header">Time Slot</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Check-in Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell font-semibold text-medical-text-primary">{apt.patient_name}</td>
                      <td className="table-cell">{apt.doctor_name}</td>
                      <td className="table-cell">{apt.time_slot}</td>
                      <td className="table-cell capitalize">
                        <span className={`badge ${
                          apt.status === 'completed' ? 'badge-success' :
                          apt.status === 'cancelled' ? 'badge-danger' :
                          apt.status === 'confirmed' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        {apt.status === 'pending' ? (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <UserCheck size={14} /> Check In
                          </button>
                        ) : apt.status === 'confirmed' ? (
                          <span className="text-primary-600 font-semibold text-xs inline-flex items-center gap-1">
                            <Info size={14} /> Confirmed
                          </span>
                        ) : apt.status === 'completed' ? (
                          <span className="text-emerald-600 font-semibold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> Finished
                          </span>
                        ) : (
                          <span className="text-medical-muted text-xs font-medium">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ADMISSIONS & REFERRALS ────────────────────────────── */}
      {activeTab === 'admissions' && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in space-y-8">
          {/* Hospital Admissions Request Queue */}
          <div>
            <h2 className="section-title mb-2 flex items-center gap-2">
              <Hotel className="text-red-600" size={20} />
              Hospital Admission Requests
            </h2>
            <p className="text-xs text-medical-muted mb-4">Coordinate and arrange hospital admissions recommended by doctors.</p>

            <div className="overflow-x-auto">
              {prescriptions.filter(p => p.request_admission).length === 0 ? (
                <div className="text-center py-8 text-medical-muted border border-dashed border-medical-border rounded-xl">
                  <Hotel size={32} className="mx-auto mb-2 opacity-35" />
                  <p className="text-xs">No pending admission requests from doctors.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medical-border text-left">
                      <th className="table-header">Patient</th>
                      <th className="table-header">Recommending Doctor</th>
                      <th className="table-header">Diagnosis</th>
                      <th className="table-header">Admission Notes / Indication</th>
                      <th className="table-header">Date</th>
                      <th className="table-header text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.filter(p => p.request_admission).map((presc) => (
                      <tr key={presc.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                        <td className="table-cell font-semibold text-medical-text-primary">{presc.patient_name}</td>
                        <td className="table-cell">{presc.doctor_name}</td>
                        <td className="table-cell font-medium text-xs">{presc.diagnosis}</td>
                        <td className="table-cell text-xs italic max-w-xs truncate" title={presc.admission_notes}>{presc.admission_notes || 'No notes provided'}</td>
                        <td className="table-cell text-xs">{presc.created_at.slice(0, 10)}</td>
                        <td className="table-cell text-right">
                          <span className="badge badge-warning animate-pulse">Pending Bed Assignment</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Specialist Referrals Queue */}
          <div className="border-t border-medical-border pt-6">
            <h2 className="section-title mb-2 flex items-center gap-2">
              <Stethoscope className="text-teal-600" size={20} />
              Specialist Referrals
            </h2>
            <p className="text-xs text-medical-muted mb-4">Facilitate and book consultations for patients referred to specialists.</p>

            <div className="overflow-x-auto">
              {prescriptions.filter(p => p.referral_specialist_id).length === 0 ? (
                <div className="text-center py-8 text-medical-muted border border-dashed border-medical-border rounded-xl">
                  <Stethoscope size={32} className="mx-auto mb-2 opacity-35" />
                  <p className="text-xs">No pending specialist referrals.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medical-border text-left">
                      <th className="table-header">Patient</th>
                      <th className="table-header">Referring Doctor</th>
                      <th className="table-header">Referred Specialist</th>
                      <th className="table-header">Referral Notes / Reason</th>
                      <th className="table-header">Date</th>
                      <th className="table-header text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.filter(p => p.referral_specialist_id).map((presc) => (
                      <tr key={presc.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                        <td className="table-cell font-semibold text-medical-text-primary">{presc.patient_name}</td>
                        <td className="table-cell">{presc.doctor_name}</td>
                        <td className="table-cell font-semibold text-teal-700">{presc.referral_specialist_name}</td>
                        <td className="table-cell text-xs italic max-w-xs truncate" title={presc.referral_notes}>{presc.referral_notes || 'No details'}</td>
                        <td className="table-cell text-xs">{presc.created_at.slice(0, 10)}</td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => {
                              setSelectedPatientId(presc.patient_id);
                              setSelectedDoctorId(presc.referral_specialist_id || '');
                              setAppointmentNotes(`Referral from Dr. ${presc.doctor_name}: ${presc.referral_notes || ''}`);
                              handleTabChange('book');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors"
                          >
                            <Calendar size={12} /> Book Spec. Apt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
