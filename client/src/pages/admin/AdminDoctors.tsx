import { useState } from 'react';
import { demoDoctors, demoDepartments } from '../../data/mockData';
import { Doctor } from '../../types';
import { Search, Plus, Edit3, X, Stethoscope, Mail, DollarSign, Award, Calendar } from 'lucide-react';

const AdminDoctors = () => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const filtered = demoDoctors.filter(d => {
    const matchSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || d.department_id === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Doctor Management</h1>
          <p className="text-medical-muted text-sm mt-1">{filtered.length} doctors on staff</p>
        </div>
        <button onClick={() => { setEditingDoctor(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-medical-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-11" placeholder="Search by name or specialization..." />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-field !w-auto min-w-[180px]">
          <option value="all">All Departments</option>
          {demoDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doctor, i) => (
          <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                  {doctor.full_name.split(' ').slice(1).map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-medical-text-primary">{doctor.full_name}</h3>
                  <p className="text-xs text-medical-muted">{doctor.email}</p>
                </div>
              </div>
              <button onClick={() => { setEditingDoctor(doctor); setShowModal(true); }} className="p-2 rounded-lg hover:bg-primary-50 text-medical-muted hover:text-primary-600 transition-colors">
                <Edit3 size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope size={15} className="text-medical-muted" />
                <span className="text-medical-text-secondary">{doctor.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={15} className="text-medical-muted" />
                <span className="badge-info">{doctor.department_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award size={15} className="text-medical-muted" />
                <span className="text-medical-text-secondary">{doctor.experience_years} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={15} className="text-medical-muted" />
                <span className="text-medical-text-secondary">${doctor.consultation_fee} consultation fee</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-medical-border">
              <p className="text-xs text-medical-muted mb-2">Available Days:</p>
              <div className="flex flex-wrap gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                  const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][idx] as keyof typeof doctor.availability;
                  const available = doctor.availability[dayKey];
                  return (
                    <span key={day} className={`text-[10px] font-semibold px-2 py-1 rounded-md ${available ? 'bg-accent-50 text-accent-700' : 'bg-gray-50 text-gray-400'}`}>
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-medical-muted">
          <Stethoscope size={48} className="mx-auto mb-3 opacity-30" />
          <p>No doctors found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-medical-border">
              <h3 className="section-title">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Full Name</label>
                  <input defaultValue={editingDoctor?.full_name} className="input-field !py-2.5 text-sm" placeholder="Dr. Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Email</label>
                  <input defaultValue={editingDoctor?.email} className="input-field !py-2.5 text-sm" placeholder="Email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Department</label>
                  <select defaultValue={editingDoctor?.department_id || '1'} className="input-field !py-2.5 text-sm">
                    {demoDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Specialization</label>
                  <input defaultValue={editingDoctor?.specialization} className="input-field !py-2.5 text-sm" placeholder="Specialty" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Experience (years)</label>
                  <input type="number" defaultValue={editingDoctor?.experience_years} className="input-field !py-2.5 text-sm" placeholder="Years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Consultation Fee ($)</label>
                  <input type="number" defaultValue={editingDoctor?.consultation_fee} className="input-field !py-2.5 text-sm" placeholder="Fee" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-medical-border">
              <button onClick={() => setShowModal(false)} className="btn-secondary !py-2.5 text-sm">Cancel</button>
              <button onClick={() => setShowModal(false)} className="btn-primary !py-2.5 text-sm">{editingDoctor ? 'Save Changes' : 'Add Doctor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
