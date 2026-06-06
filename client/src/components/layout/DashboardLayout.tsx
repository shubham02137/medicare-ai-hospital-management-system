import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard, Users, UserCog, Calendar, FileText, Pill, FlaskConical, CreditCard,
  Brain, Settings, LogOut, Menu, X, Bell, Search, ChevronDown,
  Stethoscope, Heart, ClipboardList, BedDouble, Activity, UserPlus,
  Package, AlertTriangle, TestTube, MessageSquare, TrendingUp, Building2,
  Sun, Moon, Laptop
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItems = (role: UserRole): NavItem[] => {
  const common: NavItem[] = [
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Patients', path: '/admin/patients', icon: <Users size={20} /> },
        { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope size={20} /> },
        { label: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
        { label: 'Departments', path: '/admin/departments', icon: <Building2 size={20} /> },
        { label: 'Pharmacy', path: '/pharmacy', icon: <Pill size={20} /> },
        { label: 'Laboratory', path: '/lab', icon: <FlaskConical size={20} /> },
        { label: 'Billing', path: '/billing', icon: <CreditCard size={20} /> },
        { label: 'Analytics', path: '/admin/analytics', icon: <TrendingUp size={20} /> },
        { label: 'AI Center', path: '/ai', icon: <Brain size={20} /> },
        ...common,
      ];
    case 'doctor':
      return [
        { label: 'Dashboard', path: '/doctor', icon: <LayoutDashboard size={20} /> },
        { label: 'My Appointments', path: '/doctor/appointments', icon: <Calendar size={20} /> },
        { label: 'My Patients', path: '/doctor/patients', icon: <Users size={20} /> },
        { label: 'Prescriptions', path: '/doctor/prescriptions', icon: <FileText size={20} /> },
        { label: 'Lab Reports', path: '/lab', icon: <FlaskConical size={20} /> },
        { label: 'AI Assistant', path: '/ai', icon: <Brain size={20} /> },
        ...common,
      ];
    case 'nurse':
      return [
        { label: 'Dashboard', path: '/nurse', icon: <LayoutDashboard size={20} /> },
        { label: 'Patient Monitor', path: '/nurse/monitoring', icon: <Activity size={20} /> },
        { label: 'Vitals', path: '/nurse/vitals', icon: <Heart size={20} /> },
        { label: 'Ward Mgmt', path: '/nurse/wards', icon: <BedDouble size={20} /> },
        { label: 'Medications', path: '/nurse/medications', icon: <Pill size={20} /> },
        ...common,
      ];
    case 'receptionist':
      return [
        { label: 'Dashboard', path: '/receptionist', icon: <LayoutDashboard size={20} /> },
        { label: 'Register Patient', path: '/receptionist/register', icon: <UserPlus size={20} /> },
        { label: 'Appointments', path: '/receptionist/appointments', icon: <Calendar size={20} /> },
        { label: 'Check-In', path: '/receptionist/checkin', icon: <ClipboardList size={20} /> },
        { label: 'Billing', path: '/billing', icon: <CreditCard size={20} /> },
        ...common,
      ];
    case 'patient':
      return [
        { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard size={20} /> },
        { label: 'Appointments', path: '/patient/appointments', icon: <Calendar size={20} /> },
        { label: 'Prescriptions', path: '/patient/prescriptions', icon: <FileText size={20} /> },
        { label: 'Lab Reports', path: '/patient/reports', icon: <FlaskConical size={20} /> },
        { label: 'AI Symptom Checker', path: '/patient/symptoms', icon: <Brain size={20} /> },
        { label: 'AI Chatbot', path: '/patient/chat', icon: <MessageSquare size={20} /> },
        ...common,
      ];
    case 'pharmacist':
      return [
        { label: 'Dashboard', path: '/pharmacy', icon: <LayoutDashboard size={20} /> },
        { label: 'Inventory', path: '/pharmacy/inventory', icon: <Package size={20} /> },
        { label: 'Prescriptions', path: '/pharmacy/prescriptions', icon: <FileText size={20} /> },
        { label: 'Alerts', path: '/pharmacy/alerts', icon: <AlertTriangle size={20} /> },
        ...common,
      ];
    case 'lab_technician':
      return [
        { label: 'Dashboard', path: '/lab', icon: <LayoutDashboard size={20} /> },
        { label: 'Test Requests', path: '/lab/requests', icon: <TestTube size={20} /> },
        { label: 'Upload Results', path: '/lab/upload', icon: <FlaskConical size={20} /> },
        { label: 'Reports', path: '/lab/reports', icon: <FileText size={20} /> },
        ...common,
      ];
    default:
      return common;
  }
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  patient: 'Patient',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500',
  doctor: 'bg-primary-500',
  nurse: 'bg-pink-500',
  receptionist: 'bg-amber-500',
  patient: 'bg-accent-500',
  pharmacist: 'bg-orange-500',
  lab_technician: 'bg-cyan-500',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-medical-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-medical-sidebar transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Heart size={22} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">MediCare AI</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Smart Hospital</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${roleColors[user.role]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {roleLabels[user.role]}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-9 h-9 rounded-lg ${roleColors[user.role]} flex items-center justify-center text-white text-sm font-bold`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-medical-border flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-medical-muted">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-80">
              <Search size={16} className="text-medical-muted" />
              <input type="text" placeholder="Search patients, doctors, records..." className="bg-transparent outline-none text-sm text-medical-text-primary placeholder:text-medical-muted w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-50 text-medical-muted hover:text-medical-text-primary transition-colors text-xs font-semibold"
                aria-label="Toggle Theme"
              >
                {theme === 'light' && <Sun size={18} />}
                {theme === 'dark' && <Moon size={18} />}
                {theme === 'system' && <Laptop size={18} />}
                <span className="hidden sm:inline">Theme</span>
                <ChevronDown size={14} className="opacity-60" />
              </button>

              {themeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 w-32 bg-white rounded-xl shadow-lg border border-medical-border py-1.5 z-50 animate-scale-in text-xs font-medium">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          setThemeDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-medical-text-secondary hover:bg-gray-50 hover:text-medical-text-primary transition-colors w-full text-left capitalize ${
                          theme === t ? 'bg-primary-50/50 text-primary-600 font-bold dark:bg-primary-950/20' : ''
                        }`}
                      >
                        {t === 'light' && <Sun size={14} />}
                        {t === 'dark' && <Moon size={14} />}
                        {t === 'system' && <Laptop size={14} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-gray-50 text-medical-muted transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${roleColors[user.role]} flex items-center justify-center text-white text-xs font-bold`}>
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-medical-text-primary">{user.full_name.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-medical-muted" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-medical-border py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-medical-border">
                      <p className="text-sm font-medium text-medical-text-primary">{user.full_name}</p>
                      <p className="text-xs text-medical-muted">{user.email}</p>
                    </div>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-medical-text-secondary hover:bg-gray-50 transition-colors">
                      <UserCog size={16} />
                      Profile Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
