import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { demoUsers } from '../../data/mockData';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password, rememberMe);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please try a demo account below.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    const success = await login(demoEmail, demoPassword, rememberMe);
    if (success) {
      navigate('/admin');
    }
    setLoading(false);
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-primary-100 text-primary-700',
    nurse: 'bg-pink-100 text-pink-700',
    receptionist: 'bg-amber-100 text-amber-700',
    patient: 'bg-accent-100 text-accent-700',
    pharmacist: 'bg-orange-100 text-orange-700',
    lab_technician: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-bg relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 gradient-bg opacity-[0.02]" />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Heart size={26} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-medical-text-primary">MediCare AI</span>
          </Link>
          <p className="text-medical-muted text-sm">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-slide-up">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-medical-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-11"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="current-password" className="block text-sm font-medium text-medical-text-primary">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="current-password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-11 !pr-11"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-medical-muted hover:text-medical-text-secondary">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-medical-border text-primary-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-medical-text-secondary">Remember me</span>
              </label>
            </div>

            <button type="submit" id="login-submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-medical-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up</Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 glass-card p-5">
          <h3 className="text-sm font-semibold text-medical-text-primary mb-3 text-center">Quick Demo Access</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleDemoLogin(u.email, u.password)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-all duration-200 group"
              >
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${roleColors[u.role]}`}>
                  {u.role.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-medical-text-secondary truncate group-hover:text-primary-600 transition-colors">{u.full_name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
