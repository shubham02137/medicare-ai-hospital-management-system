import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI, doctorAPI, labReportAPI } from '../../services/api';
import { demoPatients, demoDoctors } from '../../data/mockData';
import { Patient, Doctor } from '../../types';
import { Search, Eye, AlertCircle, Phone, FileText, Heart, Activity } from 'lucide-react';

const DoctorPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  // Lab Order Form State
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState('Blood Test');
  const [orderingLab, setOrderingLab] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getAll();
        setPatients(res.data?.data || res.data || []);

        if (user) {
          let matchedDoc: Doctor | undefined;
          try {
            const docRes = await doctorAPI.getAll();
            matchedDoc = docRes.data?.data?.find((d: Doctor) => d.user_id === user?.id) || 
                         docRes.data?.find((d: Doctor) => d.user_id === user?.id);
          } catch {
            matchedDoc = demoDoctors.find(d => d.user_id === user?.id);
          }
          if (matchedDoc) {
            setCurrentDoctor(matchedDoc);
          }
        }
      } catch (e) {
        setPatients(demoPatients);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleOrderLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('No patient selected.');
      return;
    }
    if (!currentDoctor) {
      alert('Doctor profile not found.');
      return;
    }
    if (!testName) {
      alert('Test name is required.');
      return;
    }
    setOrderingLab(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: currentDoctor.id,
        test_name: testName,
        test_type: testType,
      };
      await labReportAPI.create(payload);
      alert('Lab test ordered successfully!');
      setShowLabOrderModal(false);
      setTestName('');
    } catch (err) {
      console.error('Failed to order lab test:', err);
      alert('Failed to order lab test.');
    } finally {
      setOrderingLab(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Assigned Patients</h1>
        <p className="text-medical-muted text-sm mt-1">Access patient health profiles and medical histories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl shadow-card border border-medical-border flex items-center gap-3">
            <Search className="text-medical-muted" size={20} />
            <input
              type="text"
              placeholder="Search patients by name, email or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent outline-none text-sm text-medical-text-primary placeholder:text-medical-muted w-full"
            />
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-medical-muted">
                <AlertCircle size={44} className="mx-auto mb-3 opacity-30 text-primary-500" />
                <h3 className="font-semibold text-lg text-medical-text-primary">No Patients Found</h3>
                <p className="text-sm mt-1">Try refining your search keyword.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medical-border text-left">
                      <th className="table-header">Name</th>
                      <th className="table-header">Age / Gender</th>
                      <th className="table-header">Blood Group</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((pat) => (
                      <tr key={pat.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                        <td className="table-cell font-semibold text-medical-text-primary">{pat.full_name}</td>
                        <td className="table-cell capitalize">
                          {pat.age || calculateAge(pat.date_of_birth)} / {pat.gender}
                        </td>
                        <td className="table-cell">
                          <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                            {pat.blood_group}
                          </span>
                        </td>
                        <td className="table-cell text-xs">{pat.phone}</td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => setSelectedPatient(pat)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-medical-text-primary rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                          >
                            <Eye size={14} /> View File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Patient File Detail Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border h-fit">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-medical-border">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 mx-auto flex items-center justify-center font-bold text-xl mb-3">
                  {selectedPatient.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <h2 className="text-lg font-bold text-medical-text-primary">{selectedPatient.full_name}</h2>
                <p className="text-xs text-medical-muted mt-0.5">Patient ID: {selectedPatient.id}</p>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-6 border-b border-medical-border">
                <div>
                  <span className="text-medical-muted block">Gender</span>
                  <span className="font-semibold text-medical-text-primary capitalize mt-1 block">{selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-medical-muted block">Blood Group</span>
                  <span className="font-semibold text-medical-text-primary mt-1 block">{selectedPatient.blood_group}</span>
                </div>
                <div>
                  <span className="text-medical-muted block">Birthdate</span>
                  <span className="font-semibold text-medical-text-primary mt-1 block">{selectedPatient.date_of_birth}</span>
                </div>
                <div>
                  <span className="text-medical-muted block">Age</span>
                  <span className="font-semibold text-medical-text-primary mt-1 block">
                    {selectedPatient.age || calculateAge(selectedPatient.date_of_birth)} yrs
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3 pb-6 border-b border-medical-border text-xs">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-medical-muted" />
                  <span className="text-medical-text-secondary">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Eye size={14} className="text-medical-muted mt-0.5" />
                  <span className="text-medical-text-secondary">{selectedPatient.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-red-500 animate-pulse" />
                  <span className="text-medical-text-secondary">Emergency: {selectedPatient.emergency_contact}</span>
                </div>
              </div>

              {/* History */}
              <div className="text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-medical-text-primary font-bold">
                  <FileText size={14} />
                  Medical History & Conditions
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.isArray(selectedPatient.medical_history) ? (
                    selectedPatient.medical_history.length > 0 ? (
                      selectedPatient.medical_history.map((hist, index) => (
                        <span key={index} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
                          {hist}
                        </span>
                      ))
                    ) : (
                      <span className="text-medical-muted">No chronic conditions listed.</span>
                    )
                  ) : typeof selectedPatient.medical_history === 'string' && selectedPatient.medical_history ? (
                    (selectedPatient.medical_history as string).split(',').map((h, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
                        {h.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-medical-muted">No chronic conditions listed.</span>
                  )}
                </div>
              </div>

              {/* Lab Test Orders */}
              <div className="border-t border-medical-border pt-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-medical-text-primary flex items-center gap-1">
                    <Activity size={14} className="text-teal-600 animate-pulse" /> Lab Test Orders
                  </span>
                  <button
                    onClick={() => setShowLabOrderModal(true)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200 rounded-xl font-bold transition-all active:scale-[0.98]"
                  >
                    + Order Lab Test
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-medical-muted">
              <Activity size={36} className="mx-auto mb-2 opacity-30 text-primary-500 animate-pulse" />
              <p className="text-sm">Select a patient from the list to view their file details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lab Order Modal */}
      {showLabOrderModal && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full border border-medical-border shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-teal-700 to-primary-700 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={22} className="text-white" />
                <h3 className="font-extrabold text-md">Order Diagnostic Lab Test</h3>
              </div>
              <button
                onClick={() => setShowLabOrderModal(false)}
                className="text-white/75 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleOrderLabSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-medical-muted mb-1.5">Patient Name</label>
                <input
                  type="text"
                  value={selectedPatient.full_name}
                  disabled
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-gray-50 text-medical-muted text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-medical-muted mb-1.5">Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count, Lipid Profile"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-medical-muted mb-1.5">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-medical-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
                >
                  <option value="Blood Test">Blood Test</option>
                  <option value="Urine Test">Urine Test</option>
                  <option value="Imaging">Imaging (X-Ray, MRI, etc.)</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLabOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderingLab}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  {orderingLab ? 'Ordering...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
