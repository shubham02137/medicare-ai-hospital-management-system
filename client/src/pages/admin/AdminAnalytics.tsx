import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  monthlyPatientsData, revenueData, appointmentStatsData, departmentPerformanceData
} from '../../data/mockData';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="text-medical-muted text-sm mt-1">Comprehensive hospital performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Patient Growth', value: '+23.5%', desc: 'vs last month', icon: <Users size={20} />, color: 'bg-primary-50 text-primary-600' },
          { label: 'Revenue Growth', value: '+18.2%', desc: 'vs last quarter', icon: <DollarSign size={20} />, color: 'bg-accent-50 text-accent-600' },
          { label: 'Avg Daily Appts', value: '24', desc: 'per day average', icon: <Calendar size={20} />, color: 'bg-violet-50 text-violet-600' },
          { label: 'Satisfaction', value: '4.8/5', desc: 'patient feedback', icon: <TrendingUp size={20} />, color: 'bg-amber-50 text-amber-600' },
        ].map((card, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>{card.icon}</div>
            <p className="text-2xl font-bold text-medical-text-primary">{card.value}</p>
            <p className="text-xs text-medical-muted mt-1">{card.label}</p>
            <p className="text-[10px] text-accent-600 font-medium mt-0.5">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Patient Growth Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        <div className="flex items-center gap-2 mb-6">
          <Users size={20} className="text-primary-600" />
          <h2 className="section-title">Patient Growth Trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={monthlyPatientsData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNewP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorTotal)" name="Total Patients" />
            <Area type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} fill="url(#colorNewP)" name="New Patients" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={20} className="text-accent-600" />
            <h2 className="section-title">Revenue Breakdown</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: number) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(v: any) => [`$${(v || 0).toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Consultations" />
              <Line type="monotone" dataKey="lab" stroke="#10b981" strokeWidth={2} dot={false} name="Lab" />
              <Line type="monotone" dataKey="pharmacy" stroke="#f59e0b" strokeWidth={2} dot={false} name="Pharmacy" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={20} className="text-violet-600" />
            <h2 className="section-title">Appointment Analytics</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={appointmentStatsData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {appointmentStatsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-orange-600" />
          <h2 className="section-title">Department Performance</h2>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={departmentPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Bar dataKey="patients" radius={[8, 8, 0, 0]} name="Patients Treated">
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

export default AdminAnalytics;
