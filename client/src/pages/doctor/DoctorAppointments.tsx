import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, doctorAPI } from '../../services/api';
import { demoAppointments, demoDoctors } from '../../data/mockData';
import { Appointment, Doctor } from '../../types';
import { Calendar, Clock, Filter, AlertCircle, XOctagon, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        let docId = '';
        let matchedDoc: Doctor | undefined;

        try {
          const docRes = await doctorAPI.getAll();
          matchedDoc = docRes.data?.data?.find((d: Doctor) => d.user_id === user?.id) || 
                       docRes.data?.find((d: Doctor) => d.user_id === user?.id);
        } catch (e) {
          matchedDoc = demoDoctors.find(d => d.user_id === user?.id);
        }

        if (matchedDoc) {
          setCurrentDoctor(matchedDoc);
          docId = matchedDoc.id;
        }

        try {
          if (docId) {
            const aptRes = await appointmentAPI.getByDoctor(docId);
            setAppointments(aptRes.data?.data || aptRes.data || []);
          }
        } catch (e) {
          const filteredApts = demoAppointments.filter(a => a.doctor_id === docId);
          setAppointments(filteredApts);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesStatus && matchesDate;
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
          <p className="text-medical-muted text-sm mt-1">Review and manage your patient consultation schedule</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-card border border-medical-border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-medical-text-secondary font-semibold">
          <Filter size={18} className="text-primary-600" />
          Filter Schedule
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-medical-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-medical-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {(statusFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-medical-muted">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-30 text-primary-500" />
            <h3 className="font-semibold text-lg text-medical-text-primary">No Appointments Found</h3>
            <p className="text-sm mt-1">Adjust filters or check back later for updates.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-border text-left">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Time Slot</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Notes / Symptoms</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-semibold text-medical-text-primary">{apt.patient_name}</td>
                    <td className="table-cell">{apt.date}</td>
                    <td className="table-cell">{apt.time_slot}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="table-cell max-w-[220px] truncate">{apt.notes || 'Routine consult'}</td>
                    <td className="table-cell text-right space-x-2">
                      {apt.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleReject(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : apt.status === 'confirmed' ? (
                        <>
                          <Link
                            to="/doctor/prescriptions"
                            state={{ appointment: apt }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                          >
                            Start Consult
                          </Link>
                          <button
                            onClick={() => handleComplete(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : apt.status === 'completed' ? (
                        <span className="text-emerald-600 inline-flex items-center gap-1 text-xs font-semibold">
                          <CheckCircle2 size={14} /> Consult Completed
                        </span>
                      ) : (
                        <span className="text-medical-muted text-xs font-medium">Cancelled</span>
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

export default DoctorAppointments;
