import { useState } from 'react';
import { demoPatients } from '../../data/mockData';
import { Patient } from '../../types';
import { Search, Plus, Edit3, Trash2, X, User, Mail, Phone, MapPin, Heart, AlertCircle } from 'lucide-react';

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>(demoPatients);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.blood_group.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="text-medical-muted text-sm mt-1">{filtered.length} patients registered</p>
        </div>
        <button onClick={() => { setEditingPatient(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-medical-border">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-11"
            placeholder="Search by name, email, or blood group..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-medical-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="table-header">Patient</th>
                <th className="table-header">Age/Gender</th>
                <th className="table-header">Blood Group</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Medical History</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, i) => (
                <tr key={patient.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm">
                        {patient.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-medical-text-primary">{patient.full_name}</p>
                        <p className="text-xs text-medical-muted">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{patient.age}y / {patient.gender === 'male' ? '♂' : patient.gender === 'female' ? '♀' : '⚧'} {patient.gender}</td>
                  <td className="table-cell"><span className="badge-danger">{patient.blood_group}</span></td>
                  <td className="table-cell">{patient.phone}</td>
                  <td className="table-cell max-w-[200px] truncate">{patient.medical_history}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(patient)} className="p-2 rounded-lg hover:bg-primary-50 text-medical-muted hover:text-primary-600 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(patient.id)} className="p-2 rounded-lg hover:bg-red-50 text-medical-muted hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-medical-muted">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p>No patients found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-medical-border">
              <h3 className="section-title">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-muted" />
                    <input defaultValue={editingPatient?.full_name} className="input-field !pl-9 !py-2.5 text-sm" placeholder="Patient name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-muted" />
                    <input defaultValue={editingPatient?.email} className="input-field !pl-9 !py-2.5 text-sm" placeholder="Email" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Date of Birth</label>
                  <input type="date" defaultValue={editingPatient?.date_of_birth} className="input-field !py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Gender</label>
                  <select defaultValue={editingPatient?.gender || 'male'} className="input-field !py-2.5 text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Blood Group</label>
                  <div className="relative">
                    <Heart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-muted" />
                    <input defaultValue={editingPatient?.blood_group} className="input-field !pl-9 !py-2.5 text-sm" placeholder="A+" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-muted" />
                    <input defaultValue={editingPatient?.phone} className="input-field !pl-9 !py-2.5 text-sm" placeholder="Phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-text-primary mb-1">Emergency Contact</label>
                  <input defaultValue={editingPatient?.emergency_contact} className="input-field !py-2.5 text-sm" placeholder="Emergency #" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-text-primary mb-1">Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-medical-muted" />
                  <input defaultValue={editingPatient?.address} className="input-field !pl-9 !py-2.5 text-sm" placeholder="Full address" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-text-primary mb-1">Medical History</label>
                <textarea defaultValue={editingPatient?.medical_history} className="input-field !py-2.5 text-sm" rows={3} placeholder="Known conditions..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-medical-border">
              <button onClick={() => setShowModal(false)} className="btn-secondary !py-2.5 text-sm">Cancel</button>
              <button onClick={() => setShowModal(false)} className="btn-primary !py-2.5 text-sm">{editingPatient ? 'Save Changes' : 'Add Patient'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-medical-text-primary mb-2">Delete Patient</h3>
            <p className="text-sm text-medical-muted mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary !py-2.5 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger !py-2.5 text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
