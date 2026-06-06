import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, doctorAPI, patientAPI, departmentAPI } from '../../services/api';
import { demoAppointments, demoDoctors, demoPatients, demoDepartments } from '../../data/mockData';
import { Appointment, Doctor, Patient, Department } from '../../types';
import { Calendar, Clock, Filter, AlertCircle, Plus, Info, XOctagon } from 'lucide-react';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00-09:30');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let patId = '';
        let matchedPat: Patient | undefined;

        // Try getting patient
        try {
          const patRes = await patientAPI.getAll();
          matchedPat = patRes.data?.data?.find((p: Patient) => p.user_id === user?.id) ||
                       patRes.data?.find((p: Patient) => p.user_id === user?.id);
        } catch {
          matchedPat = demoPatients.find(p => p.user_id === user?.id);
        }

        if (matchedPat) {
          setCurrentPatient(matchedPat);
          patId = matchedPat.id;
        }

        if (patId) {
          // Appointments
          try {
            const aptRes = await appointmentAPI.getByPatient(patId);
            setAppointments(aptRes.data?.data || aptRes.data || []);
          } catch {
            setAppointments(demoAppointments.filter(a => a.patient_id === patId));
          }
        }

        // Doctors
        try {
          const docRes = await doctorAPI.getAll();
          setDoctors(docRes.data?.data || docRes.data || []);
        } catch {
          setDoctors(demoDoctors);
        }

        // Departments
        try {
          const deptRes = await departmentAPI.getAll();
          setDepartments(deptRes.data?.data || deptRes.data || []);
        } catch {
          setDepartments(demoDepartments);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      } catch (e) {
        // Fallback for demo
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      }
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) {
      alert('Patient details missing.');
      return;
    }
    if (!selectedDoctorId || !appointmentDate || !timeSlot) {
      alert('Please select doctor, date and time.');
      return;
    }
    setBooking(true);

    try {
      const payload = {
        patient_id: currentPatient.id,
        doctor_id: selectedDoctorId,
        date: appointmentDate,
        time_slot: timeSlot,
        notes,
      };

      let savedAppointment: Appointment;

      try {
        const res = await appointmentAPI.create(payload);
        savedAppointment = res.data?.data || res.data;
      } catch (error) {
        // Mock fallback
        const doctorObj = doctors.find(d => d.id === selectedDoctorId);
        savedAppointment = {
          id: `apt-${Date.now().toString().slice(-3)}`,
          patient_id: currentPatient.id,
          patient_name: currentPatient.full_name,
          doctor_id: selectedDoctorId,
          doctor_name: doctorObj?.full_name || 'Dr. Michael Chen',
          department: doctorObj?.department_name || 'General Medicine',
          date: appointmentDate,
          time_slot: timeSlot,
          status: 'pending',
          notes,
          created_at: new Date().toISOString(),
        };
      }

      setAppointments([savedAppointment, ...appointments]);
      alert('Appointment booked successfully!');
      
      // Reset & close
      setSelectedDoctorId('');
      setSelectedDeptId('');
      setAppointmentDate('');
      setNotes('');
      setShowBookForm(false);
    } catch (err) {
      console.error(err);
      alert('Error booking appointment.');
    } finally {
      setBooking(false);
    }
  };

  // Filter doctors by selected department name/id
  const filteredDoctors = doctors.filter(d => {
    if (!selectedDeptId) return true;
    // selectedDeptId holds department ID
    const dept = departments.find(dep => dep.id === selectedDeptId);
    return d.department_id === selectedDeptId || d.department_name === dept?.name;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'confirmed': return 'badge-info';
      case 'pending': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="text-medical-muted text-sm mt-1">Book new consultations or review scheduling history</p>
        </div>
        {!showBookForm && (
          <button
            onClick={() => setShowBookForm(true)}
            className="btn-primary flex items-center gap-1.5 self-start"
          >
            <Plus size={18} /> Schedule Appointment
          </button>
        )}
      </div>

      {/* Booking Form Overlay / Inline */}
      {showBookForm && (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-primary-100 animate-slide-up max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-medical-border pb-3">
            <h2 className="section-title text-sm">Schedule Appointment Wizard</h2>
            <button
              onClick={() => setShowBookForm(false)}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
              Cancel Wizard
            </button>
          </div>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Specialty Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedDoctorId(''); }}
                  className="input-field"
                >
                  <option value="">-- All Departments --</option>
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
                    <option key={d.id} value={d.id}>{d.full_name} (${d.consultation_fee})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Preferred Date</label>
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
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Briefly describe your symptoms</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cough and cold symptoms, regular review..."
                className="input-field resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={booking}
                className="btn-primary"
              >
                {booking ? 'Scheduling...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointment History */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        <h2 className="section-title mb-4">Appointments Logs</h2>
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-medical-muted">
            <AlertCircle size={44} className="mx-auto mb-3 opacity-30 text-primary-500" />
            <h3 className="font-semibold text-lg text-medical-text-primary">No Appointments Booked</h3>
            <p className="text-sm mt-1">Book an appointment using the wizard above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-border text-left">
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Time Slot</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-semibold text-medical-text-primary">{apt.doctor_name}</td>
                    <td className="table-cell">{apt.department_name || apt.department || 'General Medicine'}</td>
                    <td className="table-cell">{apt.date}</td>
                    <td className="table-cell">{apt.time_slot}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      {apt.status === 'pending' || apt.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <XOctagon size={14} /> Cancel
                        </button>
                      ) : (
                        <span className="text-medical-muted text-xs font-medium">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
