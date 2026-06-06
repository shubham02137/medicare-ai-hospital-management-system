import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Brain, Activity, Shield, Users, Stethoscope, Building2, Clock,
  ArrowRight, ChevronRight, Star, Zap, BarChart3, Lock, Sparkles, Menu, X,
  FileText, MessageSquare, ChevronDown, CheckCircle2, TrendingUp, Sparkle
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'doctor' | 'patient'>('admin');

  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: 'AI Symptom Checker',
      description: 'Input symptoms in natural language and map them to critical body systems and specialized medical departments instantly.',
      color: 'from-blue-500 to-indigo-600',
      badge: 'Interactive',
      demo: (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs font-mono space-y-2">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>INPUT: "sharp chest pain"</span>
            <span className="text-primary-600 font-bold">Processed</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <p className="font-bold text-slate-800">Recommendation: Cardiology</p>
            <p className="text-slate-500 text-[10px] mt-1">Suggested Specialist: Dr. Priya Sharma</p>
          </div>
        </div>
      )
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: 'AI Report Summarizer',
      description: 'Upload complex clinical lab reports and let Gemini extract key findings, highlight abnormal indicators, and summarize results.',
      color: 'from-teal-500 to-emerald-600',
      badge: 'Gemini 1.5 Pro',
      demo: (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-2">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>REPORT: Complete Blood Count</span>
            <span className="text-red-500 font-bold">Warning</span>
          </div>
          <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-800">
            <span className="font-bold">WBC Count: 11,200 /µL</span> (Abnormal High)
          </div>
          <p className="text-slate-500 text-[10px] italic">"AI: Findings suggest minor acute infection..."</p>
        </div>
      )
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: 'AI Healthcare Chatbot',
      description: 'Get immediate clinical assistance, schedule guidance, and smart medical answers dynamically generated in real-time.',
      color: 'from-purple-500 to-pink-600',
      badge: '24/7 Available',
      demo: (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-2 text-left">
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">U</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 max-w-[80%]">How long should I take Metformin?</div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="bg-primary-50 p-2 rounded-lg border border-primary-100 text-primary-950 max-w-[80%]">Take strictly as directed by your clinician, typically twice daily with meals.</div>
            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold">AI</div>
          </div>
        </div>
      )
    }
  ];

  const stats = [
    { value: '1,500+', label: 'Patients Registered', icon: <Users className="w-5 h-5" /> },
    { value: '50+', label: 'Expert Doctors', icon: <Stethoscope className="w-5 h-5" /> },
    { value: '8', label: 'Clinics & Departments', icon: <Building2 className="w-5 h-5" /> },
    { value: '99.9%', label: 'Platform Uptime', icon: <Clock className="w-5 h-5" /> },
  ];

  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Cardiology Head', text: 'The patient dashboards and AI diagnosis routing save me hours of manual intake. MediCare AI has streamlined our entire ward schedule.', rating: 5 },
    { name: 'Dr. Amit Verma', role: 'Chief Neurologist', text: 'Analyzing complex MRI and blood work notes is fast and precise with the AI Report Summarizer. The UI is clean, intuitive, and modern.', rating: 5 },
    { name: 'Rohan Deshmukh', role: 'Patient User', text: 'Booking consultations and downloading prescription PDFs is incredibly fast. The AI symptom checker recommended the exact doctor I needed.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-primary-200 selection:text-primary-900">
      
      {/* ─── STICKY NAVIGATION HEADER ───────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary-600/20">
                <Heart size={20} className="text-white animate-pulse-slow" fill="white" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 tracking-tight block">MediCare AI</span>
                <span className="text-[10px] text-primary-600 font-bold tracking-wider uppercase block -mt-1">Smart Healthcare</span>
              </div>
            </Link>

            {/* Desktop Navigation links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">AI Features</a>
              <a href="#workspaces" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Workspaces</a>
              <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Reviews</a>
              <a href="#stats" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Stats</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-primary-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-1.5 hover:shadow-primary-700/20">
                Create Account <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 animate-slide-up">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50">AI Features</a>
              <a href="#workspaces" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50">Workspaces</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50">Reviews</a>
              <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50">Stats</a>
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-750">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION WITH INTERACTIVE PREVIEW ──────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text column */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold animate-pulse-slow">
                <Sparkle size={12} className="fill-primary-600" />
                <span>Next-Generation Healthcare SaaS</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] tracking-tight">
                Smart Healthcare, <br />
                <span className="gradient-text">Powered by AI</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                MediCare AI combines intelligent diagnosis automation, dynamic clinical worksheets, and instant PDF reporting to bridge the gap between clinicians and patients.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link to="/register" className="btn-primary w-full sm:w-auto text-sm !px-7 !py-3.5 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-600/20">
                  Create Free Account <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary w-full sm:w-auto text-sm !px-7 !py-3.5 flex items-center justify-center gap-2 bg-white hover:bg-slate-50">
                  Sign In to Portal
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg text-slate-900">HIPAA</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Security Standard</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg text-slate-900">Gemini</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Engine Active</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg text-slate-900">PDF</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">One-Click Export</span>
                </div>
              </div>
            </div>

            {/* Right side interactive dashboard preview */}
            <div className="lg:col-span-7">
              <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-scale-in">
                
                {/* Mock Browser Title bar */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="bg-slate-800 rounded-lg px-6 py-0.5 text-[10px] text-slate-400 font-mono select-none">
                    medicare-ai.health/dashboard
                  </div>
                  <div className="w-8" />
                </div>

                {/* Dashboard Tabs Selector */}
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1.5">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white text-primary-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-200/60'}`}
                  >
                    Clinical Analytics (Admin)
                  </button>
                  <button
                    onClick={() => setActiveTab('doctor')}
                    className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'doctor' ? 'bg-white text-primary-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-200/60'}`}
                  >
                    Doctor Worksheet
                  </button>
                  <button
                    onClick={() => setActiveTab('patient')}
                    className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'patient' ? 'bg-white text-primary-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-200/60'}`}
                  >
                    Patient Portal
                  </button>
                </div>

                {/* Interactive Mock Content Window */}
                <div className="p-6 min-h-[300px] bg-slate-50/20 text-left">
                  
                  {/* TAB 1: ADMIN PREVIEW */}
                  {activeTab === 'admin' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 bg-white border border-slate-200/70 rounded-2xl shadow-sm">
                          <span className="text-[10px] text-slate-500 font-bold block">TOTAL REVENUE</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">$89,240</span>
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block">+18.2%</span>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200/70 rounded-2xl shadow-sm">
                          <span className="text-[10px] text-slate-500 font-bold block">WARD OCCUPANCY</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">84%</span>
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block">Optimal</span>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200/70 rounded-2xl shadow-sm">
                          <span className="text-[10px] text-slate-500 font-bold block">CLINICAL AUDITS</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">100%</span>
                          <span className="text-[9px] text-primary-600 bg-primary-50 font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block">Fully Compliant</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 border border-slate-200/70 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-slate-800">Monthly Patient Consultations</span>
                          <span className="text-[10px] text-primary-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> Active Trends</span>
                        </div>
                        <div className="h-28 flex items-end gap-2 pt-2 border-b border-slate-100">
                          {[35, 60, 45, 80, 65, 95, 75, 110, 85, 100, 90, 115].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md hover:from-primary-700 hover:to-primary-500 transition-all duration-300" style={{ height: `${val * 0.7}px` }} />
                              <span className="text-[8px] text-slate-400 font-mono mt-1">{['J','F','M','A','M','J','J','A','S','O','N','D'][idx]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DOCTOR PREVIEW */}
                  {activeTab === 'doctor' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-white p-4 border border-slate-200/70 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Today's Appointment Ledger</h4>
                            <p className="text-[9px] text-slate-400">Dr. Priya Sharma | Cardiology Department</p>
                          </div>
                          <span className="text-[9px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded-lg">4 Pending</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { time: '14:00', patient: 'Rahul Verma', reason: 'Hypertension Check', status: 'In Consultation', statusColor: 'text-amber-600 bg-amber-50' },
                            { time: '14:45', patient: 'Ananya Desai', reason: 'ECG Review & Report Analysis', status: 'Scheduled', statusColor: 'text-slate-500 bg-slate-100' },
                          ].map((apt, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400 font-bold">{apt.time}</span>
                                <div>
                                  <span className="font-bold text-slate-800 block">{apt.patient}</span>
                                  <span className="text-[9px] text-slate-500">{apt.reason}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${apt.statusColor}`}>{apt.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-primary-50/50 border border-primary-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <Brain className="text-primary-600 w-5 h-5 animate-pulse-slow" />
                          <div>
                            <span className="font-bold text-primary-950 block">AI Clinical Assistant Active</span>
                            <span className="text-[9px] text-primary-700">Analyzed Symptoms: "Sharp chest pain radiating to left shoulder"</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-primary-700 bg-white border border-primary-200 px-2 py-1 rounded-lg">Match: 92% Cardiology</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PATIENT PREVIEW */}
                  {activeTab === 'patient' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 border border-slate-200/70 rounded-2xl shadow-sm space-y-2">
                          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                            <Activity size={12} className="text-red-500 animate-pulse-slow" /> Vitals Ledger
                          </h4>
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between"><span className="text-slate-500">Blood Pressure:</span><span className="font-bold text-slate-800">120/80 mmHg</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Heart Rate:</span><span className="font-bold text-slate-800">72 bpm</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Blood Sugar:</span><span className="font-bold text-slate-800">95 mg/dL</span></div>
                          </div>
                        </div>

                        <div className="bg-white p-3 border border-slate-200/70 rounded-2xl shadow-sm space-y-2">
                          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                            <FileText size={12} className="text-primary-500" /> Active Prescriptions
                          </h4>
                          <div className="space-y-1.5 text-[10px]">
                            <div className="p-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                              <span className="font-bold text-slate-700">Atorvastatin 10mg</span>
                              <span className="text-slate-400">1x Daily</span>
                            </div>
                            <div className="p-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                              <span className="font-bold text-slate-700">Metformin 500mg</span>
                              <span className="text-slate-400">2x Daily</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 border border-slate-200/70 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <Sparkle size={12} className="text-primary-600 fill-primary-600" /> MediCare AI Assistant
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                        </div>
                        <div className="text-[10px] text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "I have processed your blood test report. All critical counts are within reference biological intervals. Let me know if you would like me to compile a summary PDF."
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── AI MODULES & FEATURES SECTION ──────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 bg-white border-y border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Zap size={12} fill="currentColor" /> AI-Driven Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clinically Verified AI Capabilities
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              MediCare AI is packed with production-ready AI services powered by Gemini, designed to assist medical practitioners and patients alike.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50/50 hover:bg-white rounded-3xl p-6 border border-slate-200/70 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <span className="text-[9px] font-extrabold text-primary-700 bg-primary-50 border border-primary-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {feature.demo}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── ROLE WORKSPACE SHOWCASE ────────────────────────────────── */}
      <section id="workspaces" className="py-20 lg:py-28 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Workspaces for Every Role
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every staff member and patient gets an interface custom-tailored for their specific workflows and tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: 'Administrator', desc: 'Manage system configurations, departments, clinical registries, and download aggregate reports.', color: 'border-l-purple-500' },
              { role: 'Medical Doctor', desc: 'Write electronic prescriptions, diagnose patient symptoms, manage schedules, and check vitals records.', color: 'border-l-blue-500' },
              { role: 'Hospital Nurse', desc: 'Perform vital checks, manage patient ward sheets, update bedside records, and supervise medications.', color: 'border-l-rose-500' },
              { role: 'Patient User', desc: 'Access electronic prescriptions, consult the AI symptom checker, consult the chatbot, and download files.', color: 'border-l-emerald-500' },
              { role: 'Pharmacist', desc: 'Track medicine stock levels, fulfill clinical prescriptions, dispense drugs, and monitor drug warnings.', color: 'border-l-amber-500' },
              { role: 'Lab Technician', desc: 'Audit diagnostic test requests, upload test parameter tables, and complete lab reports.', color: 'border-l-cyan-500' }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-2xl border border-slate-200/80 border-l-4 ${item.color} shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200`}>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{item.role}</h3>
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">{item.desc}</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold">Workspace Ready</span>
                  <Link to="/login" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5 hover:underline">
                    Access Portal <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── STATISTICS SECTION ─────────────────────────────────────── */}
      <section id="stats" className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center text-primary-300">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white pt-2">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ───────────────────────────────────── */}
      <section id="testimonials" className="py-20 lg:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Clinicians & Patients Say
            </h2>
            <p className="text-slate-500 text-sm">
              Read how MediCare AI improves hospital flows and delivers secure clinical insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed">
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 mt-6">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-[11px] font-black">
                    {t.name[4] === ' ' ? t.name[5] : t.name[4]}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CALL TO ACTION BANNER ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-700 to-slate-900 text-white shadow-xl shadow-primary-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
            
            <div className="px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Upgrade Your Clinical Worksheet Flow?
              </h2>
              <p className="text-primary-100 text-sm leading-relaxed">
                Unlock instant PDF medical records export, secure prescription fulfillment queues, and advanced clinical analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-white text-primary-700 font-bold rounded-xl text-sm shadow-md hover:bg-slate-100 active:scale-[0.98] transition-all">
                  Register New Account
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white border border-primary-500 font-bold rounded-xl text-sm hover:bg-primary-650 active:scale-[0.98] transition-all">
                  Sign In to Live Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROFESSIONAL FOOTER ────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Heart size={16} className="text-white" fill="white" />
                </div>
                <span className="text-white font-black tracking-tight">MediCare AI</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Bridging the gap between patient care and clinical operations with secure, intelligent SaaS worksheets.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Portals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Worksheet</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Nurse Monitoring</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Safe Harbor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-600">
            <p>© {new Date().getFullYear()} MediCare AI. All rights reserved. Registered college demo project.</p>
            <div className="flex items-center gap-1">
              <span>Built with</span>
              <Heart size={10} className="text-red-500" fill="currentColor" />
              <span>for better healthcare.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
