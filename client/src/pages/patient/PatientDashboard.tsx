import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI, appointmentAPI, prescriptionAPI, vitalsAPI } from '../../services/api';
import { demoPatients, demoAppointments, demoPrescriptions, demoVitals } from '../../data/mockData';
import { Patient, Appointment, Prescription, Vitals } from '../../types';
import {
  Calendar, Heart, FileText, Activity, Brain, MessageSquare,
  ArrowRight, ShieldCheck, Thermometer, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        let patId = '';
        let matchedPat: Patient | undefined;

        // Try getting patient matching user.id
        try {
          const patRes = await patientAPI.getAll();
          matchedPat = patRes.data?.data?.find((p: Patient) => p.user_id === user?.id) ||
                       patRes.data?.find((p: Patient) => p.user_id === user?.id);
        } catch {
          matchedPat = demoPatients.find(p => p.user_id === user?.id);
        }

        if (matchedPat) {
          setCurrentPatient(matchedPat);
          patId = matchedPat.id;
        }

        if (patId) {
          // Fetch appointments
          try {
            const aptRes = await appointmentAPI.getByPatient(patId);
            setAppointments(aptRes.data?.data || aptRes.data || []);
          } catch {
            setAppointments(demoAppointments.filter(a => a.patient_id === patId));
          }

          // Fetch prescriptions
          try {
            const prescRes = await prescriptionAPI.getByPatient(patId);
            setPrescriptions(prescRes.data?.data || prescRes.data || []);
          } catch {
            setPrescriptions(demoPrescriptions.filter(p => p.patient_id === patId));
          }

          // Fetch vitals
          try {
            const vitRes = await vitalsAPI.getByPatient(patId);
            setVitals(vitRes.data?.data || vitRes.data || []);
          } catch {
            setVitals(demoVitals.filter(v => v.patient_id === patId));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const nextAppointment = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const latestVital = vitals[0]; // assuming sorted by date desc or first in list is latest

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-teal-600/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hello, {user?.full_name}!</h1>
            <p className="text-teal-100 text-sm mt-1">
              MediCare ID: {currentPatient?.id || 'N/A'} | Blood Group: {currentPatient?.blood_group || 'O+'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={16} /> Patient Account Secure & Active
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Next Appointment', value: nextAppointment ? `${nextAppointment.date} • ${nextAppointment.time_slot}` : 'None Scheduled', desc: nextAppointment ? `With ${nextAppointment.doctor_name}` : 'Book one below', icon: <Calendar size={20} />, path: '/patient/appointments' },
          { label: 'Active Prescriptions', value: prescriptions.length, desc: 'Review medication instructions', icon: <FileText size={20} />, path: '/patient/prescriptions' },
          { label: 'Last Recorded BP', value: latestVital?.blood_pressure || '120/80', desc: 'Blood pressure tension', icon: <Heart size={20} />, path: '/patient' },
          { label: 'Pulse Rate', value: latestVital ? `${latestVital.heart_rate} bpm` : '72 bpm', desc: 'Heart rate frequency', icon: <Activity size={20} />, path: '/patient' },
        ].map((stat, i) => (
          <Link key={i} to={stat.path} className="bg-white p-5 rounded-2xl shadow-card border border-medical-border flex items-center justify-between hover:shadow-card-hover hover:border-primary-200 transition-all">
            <div>
              <p className="text-sm text-medical-muted">{stat.label}</p>
              <p className="text-base font-bold text-medical-text-primary mt-1.5 truncate max-w-[200px]">{stat.value}</p>
              <p className="text-xs text-medical-muted mt-1">{stat.desc}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600">
              {stat.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details & Vitals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals monitoring */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Activity className="text-teal-600" size={20} />
              My Health Vitals Log
            </h2>
            {vitals.length === 0 ? (
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-2.5 text-xs text-teal-800">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">No registered vitals log</h4>
                  <p className="mt-0.5">Please consult our care nurse on your next physical checkup to record your parameters.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Blood Pressure', value: latestVital?.blood_pressure || 'N/A', icon: <Heart size={18} className="text-red-500" /> },
                  { label: 'Pulse Rate', value: latestVital ? `${latestVital.heart_rate} bpm` : 'N/A', icon: <Activity size={18} className="text-primary-500" /> },
                  { label: 'Temperature', value: latestVital ? `${latestVital.temperature} °F` : 'N/A', icon: <Thermometer size={18} className="text-orange-500" /> },
                  { label: 'Oxygen Level', value: latestVital ? `${latestVital.oxygen_level} %` : 'N/A', icon: <Activity size={18} className="text-emerald-500" /> },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-medical-border flex flex-col items-center justify-center text-center">
                    {item.icon}
                    <span className="text-[11px] text-medical-muted mt-2">{item.label}</span>
                    <span className="text-sm font-bold text-medical-text-primary mt-1">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admitted emergency contacts */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h2 className="section-title mb-3">Clinical Profile Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 border border-medical-border rounded-xl">
                <span className="text-medical-muted block">Emergency Contact</span>
                <span className="font-semibold text-medical-text-primary block mt-1">{currentPatient?.emergency_contact || 'N/A'}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-medical-border rounded-xl">
                <span className="text-medical-muted block">Home Address</span>
                <span className="font-semibold text-medical-text-primary block mt-1">{currentPatient?.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Quick Helpers */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <div className="flex items-center gap-2 mb-4 text-teal-600 font-semibold">
              <Brain size={20} />
              <h2 className="section-title">AI Symptoms Evaluator</h2>
            </div>
            <p className="text-xs text-medical-muted mb-4">Identify probable health concerns by entering your current symptoms.</p>
            <Link to="/ai/symptoms" className="w-full btn-primary flex items-center justify-center gap-1.5 py-2.5 text-sm">
              Open Symptom Checker <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <div className="flex items-center gap-2 mb-4 text-primary-600 font-semibold">
              <MessageSquare size={20} />
              <h2 className="section-title">AI Healthcare Assistant</h2>
            </div>
            <p className="text-xs text-medical-muted mb-4">Chat instantly with Medicare AI doctor for general healthcare suggestions.</p>
            <Link to="/ai/chat" className="w-full btn-secondary flex items-center justify-center gap-1.5 py-2.5 text-sm border-teal-200 text-teal-700 hover:bg-teal-50">
              Open Chatbot <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
