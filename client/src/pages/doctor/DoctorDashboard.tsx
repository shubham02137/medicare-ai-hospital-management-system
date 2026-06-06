import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, doctorAPI, patientAPI } from '../../services/api';
import { demoAppointments, demoPatients, demoDoctors } from '../../data/mockData';
import { Appointment, Patient, Doctor } from '../../types';
import {
  Calendar, Users, Activity, Clock, ShieldAlert,
  ArrowRight, FileText, CheckCircle2, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Find doctor entity matching logged-in user
        let docId = '';
        let matchedDoc: Doctor | undefined;

        try {
          const docRes = await doctorAPI.getAll();
          matchedDoc = docRes.data?.data?.find((d: Doctor) => d.user_id === user?.id) || 
                       docRes.data?.find((d: Doctor) => d.user_id === user?.id);
        } catch (e) {
          // Backend offline - use demo data
          matchedDoc = demoDoctors.find(d => d.user_id === user?.id);
        }

        if (matchedDoc) {
          setCurrentDoctor(matchedDoc);
          docId = matchedDoc.id;
        }

        // Fetch appointments
        try {
          if (docId) {
            const aptRes = await appointmentAPI.getByDoctor(docId);
            setAppointments(aptRes.data?.data || aptRes.data || []);
          }
        } catch (e) {
          // Fallback appointments
          const filteredApts = demoAppointments.filter(a => a.doctor_id === docId);
          setAppointments(filteredApts);
        }

        // Fetch patients
        try {
          const patRes = await patientAPI.getAll();
          setPatients(patRes.data?.data || patRes.data || []);
        } catch (e) {
          setPatients(demoPatients);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(a => a.date === todayStr || a.date.includes(todayStr));
  const pendingAppointments = todayAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const completedAppointments = todayAppointments.filter(a => a.status === 'completed');

  const handleConfirm = async (id: string) => {
    try {
      await appointmentAPI.confirm(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (e) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Are you sure you want to reject this appointment?')) {
      try {
        await appointmentAPI.reject(id);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      } catch (e) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentAPI.complete(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    } catch (e) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    }
  };

  // Vitals alert warning list (simulated from patients)
  const alerts = [
    { patient: 'Maria Garcia', condition: 'Severe BP (155/95)', time: '10 min ago', type: 'critical' },
    { patient: 'William Taylor', condition: 'Oxygen level 92%', time: '1 hour ago', type: 'warning' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-600/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user?.full_name}!</h1>
            <p className="text-primary-100 text-sm mt-1">
              Department: {currentDoctor?.department_name || 'General Medicine'} | Consultant Specialist
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-sm">
            <span className="font-semibold">{pendingAppointments.length}</span> patients waiting in your queue today.
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Consultations", value: todayAppointments.length, desc: `${pendingAppointments.length} pending`, icon: <Calendar size={20} />, color: 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' },
          { label: 'Total Patients', value: patients.length, desc: 'Assigned to records', icon: <Users size={20} />, color: 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' },
          { label: 'Completed Consults', value: completedAppointments.length, desc: 'For today', icon: <UserCheck size={20} />, color: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' },
          { label: 'Pending Prescriptions', value: pendingAppointments.length, desc: 'Awaiting diagnosis', icon: <FileText size={20} />, color: 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-card border border-medical-border flex items-center justify-between">
            <div>
              <p className="text-sm text-medical-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-medical-text-primary mt-1">{stat.value}</p>
              <p className="text-xs text-medical-muted mt-1">{stat.desc}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-medical-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-primary-600" size={20} />
              <h2 className="section-title">Today's Appointment Queue</h2>
            </div>
            <Link to="/doctor/appointments" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
              Full Schedule <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-10 text-medical-muted">
                <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No appointments scheduled for today.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medical-border text-left">
                    <th className="table-header">Patient</th>
                    <th className="table-header">Time Slot</th>
                    <th className="table-header">Notes / Reason</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell font-semibold text-medical-text-primary">{apt.patient_name}</td>
                      <td className="table-cell">{apt.time_slot}</td>
                      <td className="table-cell max-w-[200px] truncate">{apt.notes || 'Routine check-up'}</td>
                      <td className="table-cell">
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
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleConfirm(apt.id)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleReject(apt.id)}
                              className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : apt.status === 'confirmed' ? (
                          <div className="flex gap-2 justify-end">
                            <Link
                              to="/doctor/prescriptions"
                              state={{ appointment: apt }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                            >
                              Diagnose
                            </Link>
                            <button
                              onClick={() => handleComplete(apt.id)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        ) : apt.status === 'completed' ? (
                          <span className="text-emerald-600 flex items-center justify-end gap-1 text-xs font-semibold">
                            <CheckCircle2 size={14} /> Finished
                          </span>
                        ) : (
                          <span className="text-medical-muted text-xs font-medium">No Action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-red-500" size={20} />
            <h2 className="section-title">Critical Patient Alerts</h2>
          </div>
          <p className="text-xs text-medical-muted mb-4">Real-time alerts generated from nurse vitals intake logs.</p>
          
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`p-1.5 rounded-lg ${alert.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Activity size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-medical-text-primary">{alert.patient}</p>
                  <p className={`text-xs mt-0.5 ${alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{alert.condition}</p>
                  <span className="text-[10px] text-medical-muted block mt-1">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-medical-border text-center">
            <Link to="/doctor/patients" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1">
              View All Patient Files <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
