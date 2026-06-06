import {
  Users, Stethoscope, Calendar, DollarSign, Pill, FlaskConical, TrendingUp, TrendingDown,
  ArrowUpRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  dashboardStats, monthlyPatientsData, revenueData, appointmentStatsData,
  departmentPerformanceData, demoAppointments
} from '../../data/mockData';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdminDashboard = () => {
  const statCards = [
    { label: 'Total Patients', value: dashboardStats.total_patients.toLocaleString(), icon: <Users size={22} />, trend: '+12.5%', up: true, color: 'bg-primary-50 text-primary-600', ring: 'ring-primary-500/20' },
    { label: 'Active Doctors', value: dashboardStats.total_doctors.toString(), icon: <Stethoscope size={22} />, trend: '+4.2%', up: true, color: 'bg-accent-50 text-accent-600', ring: 'ring-accent-500/20' },
    { label: 'Appointments Today', value: dashboardStats.appointments_today.toString(), icon: <Calendar size={22} />, trend: '+8.3%', up: true, color: 'bg-violet-50 text-violet-600', ring: 'ring-violet-500/20' },
    { label: 'Total Revenue', value: `$${(dashboardStats.total_revenue / 1000).toFixed(0)}K`, icon: <DollarSign size={22} />, trend: '+23.1%', up: true, color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-500/20' },
    { label: 'Pharmacy Items', value: dashboardStats.pharmacy_items.toString(), icon: <Pill size={22} />, trend: '-2.1%', up: false, color: 'bg-orange-50 text-orange-600', ring: 'ring-orange-500/20' },
    { label: 'Pending Lab Reports', value: dashboardStats.pending_lab_reports.toString(), icon: <FlaskConical size={22} />, trend: '-5.0%', up: false, color: 'bg-cyan-50 text-cyan-600', ring: 'ring-cyan-500/20' },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return styles[status] || 'badge-info';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="text-medical-muted text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-medical-muted bg-white px-4 py-2 rounded-xl border border-medical-border">
          <Clock size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? 'text-accent-600' : 'text-red-500'}`}>
                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-medical-text-primary">{stat.value}</p>
            <p className="text-xs text-medical-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Patients */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Monthly Patients</h2>
            <span className="text-xs font-medium text-medical-muted bg-gray-50 px-3 py-1 rounded-lg">2024-2025</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyPatientsData}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPatients)" name="Total" />
              <Area type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" name="New" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Revenue Analytics</h2>
            <span className="text-xs font-medium text-medical-muted bg-gray-50 px-3 py-1 rounded-lg">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: number) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, '']} />
              <Bar dataKey="consultations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consultations" />
              <Bar dataKey="lab" fill="#10b981" radius={[4, 4, 0, 0]} name="Lab" />
              <Bar dataKey="pharmacy" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pharmacy" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <h2 className="section-title mb-6">Appointment Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={appointmentStatsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {appointmentStatsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Appointments</h2>
            <button className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-border">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoAppointments.slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-medium text-medical-text-primary">{apt.patient_name}</td>
                    <td className="table-cell">{apt.doctor_name}</td>
                    <td className="table-cell">{apt.department}</td>
                    <td className="table-cell">{apt.date} • {apt.time_slot}</td>
                    <td className="table-cell">
                      <span className={statusBadge(apt.status)}>{apt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        <h2 className="section-title mb-6">Department Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentPerformanceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Bar dataKey="patients" radius={[0, 6, 6, 0]}>
              {departmentPerformanceData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
