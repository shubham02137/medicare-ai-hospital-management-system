import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionAPI, patientAPI } from '../../services/api';
import { demoPrescriptions, demoPatients } from '../../data/mockData';
import { Prescription, Patient } from '../../types';
import { FileText, Calendar, Heart, ShieldAlert, AlertCircle } from 'lucide-react';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        let patId = '';
        let matchedPat: Patient | undefined;

        try {
          const patRes = await patientAPI.getAll();
          matchedPat = patRes.data?.data?.find((p: Patient) => p.user_id === user?.id) ||
                       patRes.data?.find((p: Patient) => p.user_id === user?.id);
        } catch {
          matchedPat = demoPatients.find(p => p.user_id === user?.id);
        }

        if (matchedPat) {
          patId = matchedPat.id;
        }

        if (patId) {
          try {
            const prescRes = await prescriptionAPI.getByPatient(patId);
            setPrescriptions(prescRes.data?.data || prescRes.data || []);
          } catch {
            setPrescriptions(demoPrescriptions.filter(p => p.patient_id === patId));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="page-title">My Prescriptions</h1>
        <p className="text-medical-muted text-sm mt-1">Review active diagnoses and home dosing schedules</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-card border border-medical-border text-center">
          <AlertCircle size={44} className="mx-auto mb-3 opacity-30 text-teal-600" />
          <h3 className="font-semibold text-lg text-medical-text-primary">No Prescriptions Registered</h3>
          <p className="text-sm text-medical-muted mt-1">You do not have any active prescription records.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((presc) => (
            <div key={presc.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-4 animate-slide-up">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-medical-border pb-3">
                <div>
                  <h3 className="font-bold text-lg text-medical-text-primary">Diagnosis: {presc.diagnosis}</h3>
                  <p className="text-xs text-medical-muted mt-0.5">Diagnosing Doctor: {presc.doctor_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-medical-muted bg-gray-50 px-3 py-1.5 rounded-xl border border-medical-border">
                    <Calendar size={14} />
                    Prescribed: {presc.created_at.slice(0, 10)}
                  </div>
                  <button
                    onClick={() => generatePrescriptionPDF(presc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    <FileText size={14} /> Download PDF
                  </button>
                </div>
              </div>

              {/* Medicines Grid */}
              {presc.medicines && presc.medicines.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-medical-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <Heart size={14} className="text-red-500" /> Meds Intake Regimen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {presc.medicines.map((med, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 border border-medical-border/55 rounded-xl flex items-start justify-between">
                        <div>
                          <span className="font-bold text-sm text-medical-text-primary block">{med.name}</span>
                          <span className="text-xs text-medical-muted mt-0.5 block">Dosage: {med.dosage}</span>
                          <span className="text-[11px] text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-2 py-0.5 mt-2 inline-block">
                            {med.frequency}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-medical-muted">Duration: {med.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              {presc.clinical_notes && (
                <div className="p-4 bg-blue-50/55 border border-blue-200/50 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-blue-800 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600" /> Clinical Notes / Evaluation
                  </span>
                  <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">{presc.clinical_notes}</p>
                </div>
              )}

              {/* Admission Recommendation */}
              {presc.request_admission && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-xs">
                  <span className="font-bold text-red-800 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-red-600 animate-pulse" /> Hospital Admission Recommended
                  </span>
                  <p className="text-red-700 leading-relaxed font-semibold">
                    The physician has recommended hospital admission for you. Please coordinate with the reception desk to complete your check-in.
                  </p>
                  {presc.admission_notes && (
                    <p className="text-red-600 mt-1 italic whitespace-pre-wrap bg-white/50 p-2 rounded-lg border border-red-100">
                      Admission Notes: {presc.admission_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Specialist Referral */}
              {presc.referral_specialist_id && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 text-xs">
                  <span className="font-bold text-teal-800 flex items-center gap-1.5">
                    <Heart size={14} className="text-teal-600" /> Specialist Referral
                  </span>
                  <p className="text-teal-700 leading-relaxed">
                    You have been referred to specialist: <span className="font-bold">{presc.referral_specialist_name || 'Specialist'}</span>.
                  </p>
                  {presc.referral_notes && (
                    <p className="text-teal-600 mt-1 italic whitespace-pre-wrap bg-white/50 p-2 rounded-lg border border-teal-100">
                      Reason for Referral: {presc.referral_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Instructions */}
              {presc.instructions && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <ShieldAlert size={14} /> Care Directions & Precautions
                  </span>
                  <p className="text-amber-700 leading-relaxed">{presc.instructions}</p>
                </div>
              )}

              {/* Follow up date */}
              {presc.follow_up_date && (
                <div className="text-xs text-medical-muted text-right">
                  Follow-up recommended on: <span className="font-bold text-medical-text-primary">{presc.follow_up_date}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
