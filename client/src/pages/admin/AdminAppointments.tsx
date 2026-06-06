import { useState } from 'react';
import { demoAppointments } from '../../data/mockData';
import { AppointmentStatus } from '../../types';
import { Search, Calendar, Filter, Clock, User, Stethoscope } from 'lucide-react';

const AdminAppointments = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const filtered = demoAppointments.filter(a => {
    const matchSearch = a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.department?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: AppointmentStatus) => {
    const map: Record<AppointmentStatus, string> = { 
      pending: 'badge-warning',
      confirmed: 'badge-info', 
      completed: 'badge-success', 
      cancelled: 'badge-danger',
    };
    return map[status];
  };

  const statusCounts = {
    all: demoAppointments.length,
    pending: demoAppointments.filter(a => a.status === 'pending').length,
    confirmed: demoAppointments.filter(a => a.status === 'confirmed').length,
    completed: demoAppointments.filter(a => a.status === 'completed').length,
    cancelled: demoAppointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Appointments</h1>
        <p className="text-medical-muted text-sm mt-1">Manage all hospital appointments</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${statusFilter === status
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-white text-medical-text-secondary border border-medical-border hover:border-primary-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-70">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-medical-border flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-11" placeholder="Search patient, doctor, or department..." />
        </div>
        <button className="btn-secondary flex items-center gap-2 !py-2.5">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filtered.map((apt, i) => (
          <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-card border border-medical-border hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-medical-text-primary">{apt.patient_name}</h3>
                    <span className={statusBadge(apt.status)}>{apt.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-medical-muted">
                    <span className="flex items-center gap-1"><Stethoscope size={14} /> {apt.doctor_name}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {apt.time_slot}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:flex-shrink-0">
                <span className="badge-info">{apt.department}</span>
                {apt.notes && (
                  <span className="text-xs text-medical-muted max-w-[200px] truncate hidden lg:block">{apt.notes}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-medical-muted bg-white rounded-2xl border border-medical-border">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p>No appointments found</p>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
