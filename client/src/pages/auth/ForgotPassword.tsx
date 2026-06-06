import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-bg relative overflow-hidden p-4">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Heart size={26} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-medical-text-primary">MediCare AI</span>
          </Link>
          <p className="text-medical-muted text-sm">Reset your password</p>
        </div>

        <div className="glass-card p-8">
          {submitted ? (
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-accent-600" />
              </div>
              <h3 className="text-lg font-bold text-medical-text-primary mb-2">Check Your Email</h3>
              <p className="text-sm text-medical-muted mb-6">
                We've sent a password reset link to <span className="font-semibold text-medical-text-secondary">{email}</span>
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={18} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Mail size={28} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-medical-text-primary">Forgot Password?</h3>
                <p className="text-sm text-medical-muted mt-1">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-medical-text-primary mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medical-muted" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field !pl-11"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send Reset Link <Send size={18} /></>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-medical-muted mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
