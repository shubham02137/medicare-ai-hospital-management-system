import { demoDepartments, demoDoctors } from '../../data/mockData';
import { Building2, Users, Stethoscope, Star } from 'lucide-react';

const deptColors = [
  'from-primary-500 to-primary-700',
  'from-violet-500 to-purple-700',
  'from-accent-500 to-accent-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600',
  'from-indigo-500 to-blue-700',
  'from-red-500 to-rose-700',
];

const AdminDepartments = () => {
  const getDoctorCount = (deptId: string) => demoDoctors.filter(d => d.department_id === deptId).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Departments</h1>
        <p className="text-medical-muted text-sm mt-1">{demoDepartments.length} active departments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {demoDepartments.map((dept, i) => {
          const doctorCount = getDoctorCount(dept.id);
          return (
            <div key={dept.id} className="group bg-white rounded-2xl shadow-card border border-medical-border hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Header gradient */}
              <div className={`h-2 bg-gradient-to-r ${deptColors[i % deptColors.length]}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deptColors[i % deptColors.length]} flex items-center justify-center text-white shadow-lg`}>
                    <Building2 size={22} />
                  </div>
                  <span className="badge-info">{doctorCount} doctors</span>
                </div>

                <h3 className="text-lg font-bold text-medical-text-primary mb-1">{dept.name}</h3>
                <p className="text-sm text-medical-muted mb-4">{dept.description}</p>

                {dept.head_doctor_name && (
                  <div className="flex items-center gap-2 pt-4 border-t border-medical-border">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Stethoscope size={16} className="text-medical-muted" />
                    </div>
                    <div>
                      <p className="text-xs text-medical-muted">Head Doctor</p>
                      <p className="text-sm font-medium text-medical-text-primary">{dept.head_doctor_name}</p>
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-medical-border">
                  <div className="text-center">
                    <Users size={14} className="mx-auto text-medical-muted mb-1" />
                    <p className="text-xs text-medical-muted">Doctors</p>
                    <p className="text-sm font-bold text-medical-text-primary">{doctorCount}</p>
                  </div>
                  <div className="text-center">
                    <Star size={14} className="mx-auto text-medical-muted mb-1" />
                    <p className="text-xs text-medical-muted">Rating</p>
                    <p className="text-sm font-bold text-medical-text-primary">4.{8 - i % 3}</p>
                  </div>
                  <div className="text-center">
                    <Users size={14} className="mx-auto text-medical-muted mb-1" />
                    <p className="text-xs text-medical-muted">Patients</p>
                    <p className="text-sm font-bold text-medical-text-primary">{(doctorCount * 40 + 50)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDepartments;
