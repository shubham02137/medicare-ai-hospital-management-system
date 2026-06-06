import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vitalsAPI, patientAPI } from '../../services/api';
import { demoPatients, demoVitals } from '../../data/mockData';
import { Patient, Vitals } from '../../types';
import {
  Activity, Heart, PlusCircle, LayoutGrid, ClipboardList,
  AlertTriangle, Check, UserPlus, Info, CheckCircle2, Trash2, PenTool
} from 'lucide-react';

const NurseDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'monitoring' | 'vitals' | 'wards' | 'medications'>('monitoring');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitalsList, setVitalsList] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weight, setWeight] = useState('');
  const [submittingVitals, setSubmittingVitals] = useState(false);

  // Ward bed map state (simulated)
  const [wards, setWards] = useState([
    { id: 'w1', name: 'General Ward A', beds: [{ id: '101', patient: 'Rahul Verma', status: 'occupied' }, { id: '102', patient: '', status: 'available' }, { id: '103', patient: 'Ananya Desai', status: 'occupied' }, { id: '104', patient: '', status: 'available' }] },
    { id: 'w2', name: 'ICU Unit 1', beds: [{ id: '201', patient: 'Arjun Mehta', status: 'occupied' }, { id: '202', patient: '', status: 'available' }] },
    { id: 'w3', name: 'Pediatrics Ward', beds: [{ id: '301', patient: 'Kiran Rao', status: 'occupied' }, { id: '302', patient: '', status: 'available' }] },
  ]);

  // Bed Assignment Form State
  const [assignPatient, setAssignPatient] = useState('');
  const [assignWard, setAssignWard] = useState('w1');
  const [assignBed, setAssignBed] = useState('');

  // Medication schedules state (simulated)
  const [meds, setMeds] = useState([
    { id: 'm1', patient: 'Rahul Verma', med: 'Amlodipine 10mg', time: '14:00', given: false },
    { id: 'm2', patient: 'Arjun Mehta', med: 'Aspirin 75mg', time: '16:00', given: false },
    { id: 'm3', patient: 'Ananya Desai', med: 'Cetirizine 10mg', time: '18:00', given: true },
    { id: 'm4', patient: 'Kiran Rao', med: 'Paracetamol 500mg', time: '20:00', given: false },
  ]);

  // Progress notes state (simulated)
  const [notes, setNotes] = useState([
    { id: 'n1', patientName: 'Rahul Verma', note: 'Post-op recovery stable. Vitals normal.', recordedAt: '2026-06-05T09:30:00.000Z', nurseName: 'Nurse Anjali Patel' },
    { id: 'n2', patientName: 'Arjun Mehta', note: 'Complaining of mild headache. Administered paracetamol.', recordedAt: '2026-06-05T10:45:00.000Z', nurseName: 'Nurse Anjali Patel' },
  ]);
  const [selectedNotePatient, setSelectedNotePatient] = useState('');
  const [noteText, setNoteText] = useState('');

  // Sync tab with route path
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/vitals')) {
      setActiveTab('vitals');
    } else if (path.endsWith('/wards')) {
      setActiveTab('wards');
    } else if (path.endsWith('/medications')) {
      setActiveTab('medications');
    } else {
      setActiveTab('monitoring');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    navigate(`/nurse/${tabId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch patients
        try {
          const patRes = await patientAPI.getAll();
          setPatients(patRes.data?.data || patRes.data || []);
        } catch {
          setPatients(demoPatients);
        }

        // Fetch vitals
        try {
          const vitRes = await vitalsAPI.getAll();
          setVitalsList(vitRes.data?.data || vitRes.data || []);
        } catch {
          setVitalsList(demoVitals);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !bp || !hr || !temp || !spo2 || !weight) {
      alert('Please fill out all vitals parameters.');
      return;
    }
    setSubmittingVitals(true);

    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      const newVital = {
        patient_id: selectedPatientId,
        patient_name: selectedPatient?.full_name || '',
        nurse_id: user?.id || '',
        blood_pressure: bp,
        heart_rate: Number(hr),
        temperature: Number(temp),
        oxygen_level: Number(spo2),
        weight: Number(weight),
      };

      try {
        const res = await vitalsAPI.create(newVital);
        const savedVital = res.data?.data || res.data;
        if (savedVital) {
          setVitalsList([savedVital, ...vitalsList]);
        }
      } catch {
        // Fallback for mock demo
        const savedMock: Vitals = {
          id: 'vit-' + Math.random().toString(36).substr(2, 9),
          ...newVital,
          recorded_at: new Date().toISOString(),
        };
        setVitalsList([savedMock, ...vitalsList]);
      }

      alert('Patient vitals recorded successfully!');
      // Clear form
      setSelectedPatientId('');
      setBp('');
      setHr('');
      setTemp('');
      setSpo2('');
      setWeight('');
      handleTabChange('monitoring');
    } catch (err) {
      console.error(err);
      alert('Failed to record vitals.');
    } finally {
      setSubmittingVitals(false);
    }
  };

  const handleDeleteVital = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vitals record?')) return;
    try {
      await vitalsAPI.delete(id);
      setVitalsList(prev => prev.filter(v => v.id !== id));
      alert('Vitals record deleted.');
    } catch {
      // Fallback
      setVitalsList(prev => prev.filter(v => v.id !== id));
      alert('Vitals record deleted (offline fallback).');
    }
  };

  const handleGiveMed = (id: string) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, given: true } : m));
  };

  const handleAssignBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignPatient || !assignWard || !assignBed) {
      alert('Please fill out all bed assignment fields.');
      return;
    }
    
    setWards(prevWards => prevWards.map(ward => {
      if (ward.id === assignWard) {
        return {
          ...ward,
          beds: ward.beds.map(bed => {
            if (bed.id === assignBed) {
              return { ...bed, patient: assignPatient, status: 'occupied' };
            }
            return bed;
          })
        };
      }
      return ward;
    }));

    alert(`Patient ${assignPatient} assigned to Bed ${assignBed} successfully.`);
    setAssignPatient('');
    setAssignBed('');
  };

  const handleDischargeBed = (wardId: string, bedId: string) => {
    if (!window.confirm('Are you sure you want to discharge the patient from this bed?')) return;
    setWards(prevWards => prevWards.map(ward => {
      if (ward.id === wardId) {
        return {
          ...ward,
          beds: ward.beds.map(bed => {
            if (bed.id === bedId) {
              return { ...bed, patient: '', status: 'available' };
            }
            return bed;
          })
        };
      }
      return ward;
    }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotePatient || !noteText) {
      alert('Please select a patient and enter a note.');
      return;
    }

    const newNote = {
      id: 'n-' + Date.now(),
      patientName: selectedNotePatient,
      note: noteText,
      recordedAt: new Date().toISOString(),
      nurseName: user?.full_name || 'Care Nurse',
    };

    setNotes([newNote, ...notes]);
    setSelectedNotePatient('');
    setNoteText('');
    alert('Progress note logged successfully!');
  };

  const availableBeds = wards.find(w => w.id === assignWard)?.beds.filter(b => b.status === 'available') || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Nurse Care Station</h1>
          <p className="text-medical-muted text-sm mt-1">Logged in as Care Nurse | Emergency response and floor care management</p>
        </div>

        {/* Tab triggers */}
        <div className="bg-white p-1 rounded-xl border border-medical-border flex gap-1 text-sm font-semibold">
          {[
            { id: 'monitoring', label: 'Monitor', icon: <Activity size={16} /> },
            { id: 'vitals', label: 'Vitals Intake', icon: <PlusCircle size={16} /> },
            { id: 'wards', label: 'Ward Map', icon: <LayoutGrid size={16} /> },
            { id: 'medications', label: 'Meds Schedule', icon: <ClipboardList size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md' : 'text-medical-text-secondary hover:bg-gray-50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: MONITORING & PROGRESS NOTES ───────────────────────── */}
      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main vitals logs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Activity className="text-primary-600" size={20} />
                Recent Vitals Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medical-border text-left">
                      <th className="table-header">Patient</th>
                      <th className="table-header">BP</th>
                      <th className="table-header">Heart Rate</th>
                      <th className="table-header">Temp (°F)</th>
                      <th className="table-header">Oxygen (SpO2)</th>
                      <th className="table-header">Weight</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsList.map((vital) => {
                      const isSpO2Low = vital.oxygen_level < 95;
                      const isBpHigh = vital.blood_pressure.startsWith('14') || vital.blood_pressure.startsWith('15');
                      return (
                        <tr key={vital.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                          <td className="table-cell font-semibold text-medical-text-primary">{vital.patient_name}</td>
                          <td className={`table-cell font-medium ${isBpHigh ? 'text-red-500 font-bold' : ''}`}>{vital.blood_pressure}</td>
                          <td className="table-cell">{vital.heart_rate} bpm</td>
                          <td className="table-cell">{vital.temperature}°F</td>
                          <td className={`table-cell font-medium ${isSpO2Low ? 'text-red-500 font-bold' : 'text-emerald-600'}`}>{vital.oxygen_level}%</td>
                          <td className="table-cell">{vital.weight} kg</td>
                          <td className="table-cell text-right">
                            <button
                              onClick={() => handleDeleteVital(vital.id!)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete vitals"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Notes Log */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <PenTool className="text-primary-600" size={20} />
                Patient Progress Notes
              </h2>
              
              <form onSubmit={handleAddNote} className="mb-6 bg-gray-50 p-4 rounded-xl border border-medical-border space-y-4">
                <h3 className="text-xs font-bold text-medical-text-primary uppercase tracking-wide">Add Clinical Progress Note</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-medical-text-secondary mb-1">Patient</label>
                    <select
                      value={selectedNotePatient}
                      onChange={(e) => setSelectedNotePatient(e.target.value)}
                      className="input-field py-1.5 text-xs"
                      required
                    >
                      <option value="">-- Select --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.full_name}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-medical-text-secondary mb-1">Clinical Note / Observation</label>
                    <input
                      type="text"
                      placeholder="e.g. Complained of minor dizziness, monitored and stable."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="input-field py-1.5 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary py-1.5 px-4 text-xs">Save Progress Note</button>
                </div>
              </form>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 border-l-4 border-primary-500 bg-gray-50/50 rounded-r-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-medical-text-primary">{n.patientName}</span>
                      <span className="text-medical-muted">{new Date(n.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm mt-1 text-medical-text-secondary">{n.note}</p>
                    <div className="text-[10px] text-medical-muted mt-1 text-right">Logged by {n.nurseName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals Warnings Side Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border h-fit">
            <div className="flex items-center gap-2 mb-4 text-red-500 font-semibold">
              <AlertTriangle size={20} />
              <h2 className="section-title">Anomalous Vitals (Alerts)</h2>
            </div>
            <p className="text-xs text-medical-muted mb-4">Immediate clinical follow-up required by assigned doctors.</p>

            <div className="space-y-3">
              {vitalsList.filter(v => v.oxygen_level < 95 || v.blood_pressure.startsWith('15') || v.blood_pressure.startsWith('14')).map((v, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <Heart size={16} className="text-red-500 mt-0.5" fill="red" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800">{v.patient_name}</h4>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      BP: {v.blood_pressure} | SpO2: {v.oxygen_level}% (Low oxygen tension)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: RECORD VITALS ────────────────────────────────────── */}
      {activeTab === 'vitals' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <PlusCircle className="text-primary-600" size={20} />
            Record Patient Vitals
          </h2>
          <form onSubmit={handleVitalsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Blood Pressure</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g. 72"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 98.6"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Oxygen Level (SpO2 %)</label>
                <input
                  type="number"
                  placeholder="e.g. 98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submittingVitals}
                className="btn-primary flex items-center gap-1.5"
              >
                <ClipboardList size={18} />
                {submittingVitals ? 'Saving Vitals...' : 'Log Patient Vitals'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: WARD MAP & ASSIGNMENTS ───────────────────────────── */}
      {activeTab === 'wards' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bed Layouts */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {wards.map((ward) => (
                <div key={ward.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
                  <h3 className="section-title text-sm font-bold border-b border-medical-border pb-3 mb-4">{ward.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {ward.beds.map((bed) => {
                      const occupied = bed.status === 'occupied';
                      return (
                        <div
                          key={bed.id}
                          className={`p-4 rounded-xl border flex flex-col items-center text-center justify-center gap-2 ${occupied ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <span className="text-xs font-bold text-medical-muted">Bed {bed.id}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${occupied ? 'bg-primary-500 shadow-md shadow-primary-500/20' : 'bg-gray-300'}`}>
                            <LayoutGrid size={16} />
                          </div>
                          <span className="text-xs font-semibold text-medical-text-primary truncate max-w-full">
                            {occupied ? bed.patient : 'Empty Bed'}
                          </span>
                          {occupied && (
                            <button
                              onClick={() => handleDischargeBed(ward.id, bed.id)}
                              className="mt-1 text-[10px] text-red-500 hover:underline font-bold"
                            >
                              Discharge
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bed Assignment Side Form */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border h-fit">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-primary-600" />
                Assign Ward Bed
              </h3>
              <form onSubmit={handleAssignBedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Patient</label>
                  <select
                    value={assignPatient}
                    onChange={(e) => setAssignPatient(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.full_name}>{p.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Ward / Room</label>
                  <select
                    value={assignWard}
                    onChange={(e) => { setAssignWard(e.target.value); setAssignBed(''); }}
                    className="input-field"
                    required
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Bed Number</label>
                  <select
                    value={assignBed}
                    onChange={(e) => setAssignBed(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">-- Select Bed --</option>
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>Bed {b.id}</option>
                    ))}
                  </select>
                  {availableBeds.length === 0 && (
                    <p className="text-[11px] text-red-500 mt-1">No beds available in this ward.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={availableBeds.length === 0}
                  className="w-full btn-primary py-2.5 mt-2"
                >
                  Confirm Bed Assignment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: MEDICATION SCHEDULE ──────────────────────────────── */}
      {activeTab === 'medications' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <ClipboardList className="text-primary-600" size={20} />
            Today's In-Patient Medication Schedule
          </h2>
          <p className="text-xs text-medical-muted mb-4">Mark medications as administered after dosing the patients.</p>

          <div className="space-y-3">
            {meds.map((m) => (
              <div key={m.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${m.given ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${m.given ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-medical-muted'}`}>
                    <Heart size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-medical-text-primary">{m.patient}</h4>
                    <p className="text-xs text-medical-text-secondary mt-0.5">{m.med} • Scheduled: {m.time}</p>
                  </div>
                </div>

                {m.given ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xs font-semibold bg-emerald-100/50 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={14} /> Given
                  </span>
                ) : (
                  <button
                    onClick={() => handleGiveMed(m.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Check size={14} /> Mark Given
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;
