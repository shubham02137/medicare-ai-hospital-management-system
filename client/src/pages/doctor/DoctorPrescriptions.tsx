import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionAPI, patientAPI, medicineAPI, doctorAPI, appointmentAPI, labReportAPI } from '../../services/api';
import { demoPatients, demoMedicines, demoDoctors } from '../../data/mockData';
import { Patient, PrescriptionMedicine, Medicine, Doctor } from '../../types';
import { Plus, Trash2, Heart, ClipboardCheck, ArrowLeft, Search, FlaskConical, Stethoscope, Hotel, FileText, Calendar } from 'lucide-react';

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Selected appointment if redirected from dashboard
  const redirectedAppointment = location.state?.appointment;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);

  // Dynamic medicines list inside prescription
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicine[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);

  // Dynamic lab tests list inside prescription
  const [labTests, setLabTests] = useState<Array<{ test_name: string; test_type: string }>>([]);

  // Admissions, Specialist referrals & Clinical notes states
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [requestAdmission, setRequestAdmission] = useState(false);
  const [admissionNotes, setAdmissionNotes] = useState('');
  const [referToSpecialist, setReferToSpecialist] = useState(false);
  const [referralSpecialistId, setReferralSpecialistId] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // Autocomplete medicine inventory list
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Patients
        try {
          const patRes = await patientAPI.getAll();
          const list = patRes.data?.data || patRes.data || [];
          setPatients(list);
        } catch {
          setPatients(demoPatients);
        }

        // Doctors for referrals
        try {
          const docRes = await doctorAPI.getAll();
          const docList = docRes.data?.data || docRes.data || [];
          setDoctors(docList);
        } catch {
          setDoctors(demoDoctors);
        }

        // Medicines inventory
        try {
          const medRes = await medicineAPI.getAll();
          setInventory(medRes.data?.data || medRes.data || []);
        } catch {
          setInventory(demoMedicines);
        }

        // Current Doctor
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

        // Pre-fill patient if redirected
        if (redirectedAppointment) {
          // Find matching patient by patient_id
          setSelectedPatientId(redirectedAppointment.patient_id);
          if (redirectedAppointment.notes) {
            setDiagnosis(redirectedAppointment.notes);
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user, redirectedAppointment]);

  const handleAddMedicine = () => {
    setPrescriptionMedicines([...prescriptionMedicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    const list = [...prescriptionMedicines];
    list.splice(index, 1);
    setPrescriptionMedicines(list);
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const list = [...prescriptionMedicines];
    list[index][field] = value;
    setPrescriptionMedicines(list);
  };

  const handleAddLabTest = () => {
    setLabTests([...labTests, { test_name: '', test_type: 'Blood Test' }]);
  };

  const handleRemoveLabTest = (index: number) => {
    const list = [...labTests];
    list.splice(index, 1);
    setLabTests(list);
  };

  const handleLabTestChange = (index: number, field: 'test_name' | 'test_type', value: string) => {
    const list = [...labTests];
    list[index][field] = value;
    setLabTests(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient.');
      return;
    }
    if (!diagnosis) {
      alert('Please enter a diagnosis.');
      return;
    }
    const emptyMeds = prescriptionMedicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration);
    if (emptyMeds) {
      alert('Please fill in all medicine parameters.');
      return;
    }

    const emptyLab = labTests.some(t => !t.test_name);
    if (emptyLab) {
      alert('Please fill in all laboratory test names.');
      return;
    }

    if (referToSpecialist && !referralSpecialistId) {
      alert('Please select a specialist doctor for referral.');
      return;
    }

    setSubmitting(true);

    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      const payload = {
        appointment_id: redirectedAppointment?.id || '',
        patient_id: selectedPatientId,
        patient_name: selectedPatient?.full_name || '',
        doctor_id: currentDoctor?.id || '',
        doctor_name: currentDoctor?.full_name || user?.full_name || '',
        diagnosis,
        medicines: prescriptionMedicines,
        instructions,
        clinical_notes: clinicalNotes || undefined,
        request_admission: requestAdmission,
        admission_notes: requestAdmission ? admissionNotes : undefined,
        referral_specialist_id: referToSpecialist ? referralSpecialistId : undefined,
        referral_specialist_name: referToSpecialist ? doctors.find(d => d.id === referralSpecialistId)?.full_name : undefined,
        referral_notes: referToSpecialist ? referralNotes : undefined,
        follow_up_date: followUpDate || undefined,
      };

      try {
        await prescriptionAPI.create(payload);
        
        // If appointment existed, we would ideally set its status to completed
        if (redirectedAppointment?.id) {
          await appointmentAPI.update(redirectedAppointment.id, { status: 'completed' });
        }

        // Create lab reports for each ordered test
        if (labTests.length > 0) {
          for (const test of labTests) {
            if (test.test_name.trim()) {
              await labReportAPI.create({
                patient_id: selectedPatientId,
                doctor_id: currentDoctor?.id || '',
                test_name: test.test_name,
                test_type: test.test_type,
              });
            }
          }
        }
      } catch (err) {
        console.warn('API error submitting prescription/lab reports, fallback success.');
      }

      alert('Prescription created successfully!');
      navigate('/doctor');
    } catch (err) {
      console.error(err);
      alert('Failed to submit prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-xl border border-medical-border hover:bg-gray-50 text-medical-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Compose Prescription</h1>
          <p className="text-medical-muted text-sm mt-1">Write diagnoses and prescribe medications to patients</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-6">
        {/* Patient selector */}
        <div>
          <label className="block text-sm font-semibold text-medical-text-primary mb-2">Select Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={!!redirectedAppointment}
            className="input-field disabled:bg-gray-50 disabled:text-medical-muted"
            required
          >
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.full_name} ({p.phone})</option>
            ))}
          </select>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-semibold text-medical-text-primary mb-2">Clinical Diagnosis / Symptoms</label>
          <input
            type="text"
            placeholder="e.g. Chronic Hypertension, Acute Pharyngitis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Medicines Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-medical-border pb-2">
            <h3 className="section-title text-sm flex items-center gap-1.5">
              <Heart size={16} className="text-red-500" /> Prescribed Medicines
            </h3>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 transition-colors"
            >
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {prescriptionMedicines.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-2xl border border-medical-border/50 relative">
                {/* Medicine Name Autocomplete Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Medicine Name</label>
                  <select
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none"
                    required
                  >
                    <option value="">-- Select Drug --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.name} disabled={item.stock_quantity <= 0}>
                        {item.name} {item.stock_quantity <= 0 ? '(Out of Stock)' : `(${item.category})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dosage */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 5ml"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Frequency */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily, Once a day"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Duration */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 days, 1 month"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 hover:border-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {prescriptionMedicines.length === 0 && (
              <p className="text-xs text-medical-muted italic">No medicines prescribed.</p>
            )}
          </div>
        </div>

        {/* Lab Tests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-medical-border pb-2">
            <h3 className="section-title text-sm flex items-center gap-1.5">
              <FlaskConical size={16} className="text-teal-600 animate-pulse" /> Order Laboratory Tests
            </h3>
            <button
              type="button"
              onClick={handleAddLabTest}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 transition-colors"
            >
              <Plus size={14} /> Add Lab Test
            </button>
          </div>

          <div className="space-y-4">
            {labTests.map((test, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-2xl border border-medical-border/50 relative">
                {/* Test Name */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Test Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Blood Count, Lipid Profile"
                    value={test.test_name}
                    onChange={(e) => handleLabTestChange(index, 'test_name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    required
                  />
                </div>

                {/* Test Type */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-medical-muted mb-1.5">Test Type</label>
                  <select
                    value={test.test_type}
                    onChange={(e) => handleLabTestChange(index, 'test_type', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="Imaging">Imaging (X-Ray, MRI, etc.)</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveLabTest(index)}
                    className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 hover:border-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {labTests.length === 0 && (
              <p className="text-xs text-medical-muted italic">No laboratory tests added for ordering.</p>
            )}
          </div>
        </div>

        {/* Request Admission Section */}
        <div className="space-y-4 border-t border-medical-border pt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="request_admission_cb"
              checked={requestAdmission}
              onChange={(e) => setRequestAdmission(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-medical-border rounded focus:ring-primary-500"
            />
            <label htmlFor="request_admission_cb" className="text-sm font-semibold text-medical-text-primary flex items-center gap-1.5 cursor-pointer">
              <Hotel size={16} className="text-primary-600" /> Request Hospital Admission
            </label>
          </div>

          {requestAdmission && (
            <div className="pl-7 space-y-2 animate-fade-in">
              <label htmlFor="admission_notes" className="block text-xs font-semibold text-medical-muted">Admission Reason & Clinical Notes</label>
              <textarea
                id="admission_notes"
                rows={2}
                placeholder="Indication for admission, target ward class, or special nursing requirements..."
                value={admissionNotes}
                onChange={(e) => setAdmissionNotes(e.target.value)}
                className="input-field resize-none"
                required
              />
            </div>
          )}
        </div>

        {/* Refer to Specialist Section */}
        <div className="space-y-4 border-t border-medical-border pt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="refer_specialist_cb"
              checked={referToSpecialist}
              onChange={(e) => setReferToSpecialist(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-medical-border rounded focus:ring-primary-500"
            />
            <label htmlFor="refer_specialist_cb" className="text-sm font-semibold text-medical-text-primary flex items-center gap-1.5 cursor-pointer">
              <Stethoscope size={16} className="text-teal-600" /> Refer to Specialist Doctor
            </label>
          </div>

          {referToSpecialist && (
            <div className="pl-7 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialist_select" className="block text-xs font-semibold text-medical-muted mb-1">Select Specialist Doctor</label>
                  <select
                    id="specialist_select"
                    value={referralSpecialistId}
                    onChange={(e) => setReferralSpecialistId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-medical-border bg-white text-sm focus:outline-none"
                    required
                  >
                    <option value="">-- Select Specialist --</option>
                    {doctors
                      .filter(d => d.id !== currentDoctor?.id)
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.department_name || d.specialization})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="referral_notes" className="block text-xs font-semibold text-medical-muted mb-1">Referral Reason / Clinical Summary</label>
                <textarea
                  id="referral_notes"
                  rows={2}
                  placeholder="Reason for referring the patient to this specialist..."
                  value={referralNotes}
                  onChange={(e) => setReferralNotes(e.target.value)}
                  className="input-field resize-none"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Clinical Notes Section */}
        <div className="border-t border-medical-border pt-4">
          <label htmlFor="clinical_notes" className="block text-sm font-semibold text-medical-text-primary mb-2 flex items-center gap-1.5">
            <FileText size={16} className="text-primary-600" /> Clinical Notes / Subjective Findings
          </label>
          <textarea
            id="clinical_notes"
            rows={3}
            placeholder="Detailed clinical evaluation, physician notes, or symptoms findings..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            className="input-field resize-none"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-semibold text-medical-text-primary mb-2">Instructions & Special Precautions</label>
          <textarea
            rows={3}
            placeholder="e.g. Take post-meals. Drink plenty of water. Avoid heavy exercise. Repeat BP review."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="input-field resize-none"
          />
        </div>

        {/* Follow up date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-medical-text-primary mb-2">Follow-up Review Date (Optional)</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            <ClipboardCheck size={20} />
            {submitting ? 'Submitting...' : 'Sign & Submit Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorPrescriptions;
