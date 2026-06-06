import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { billingAPI, patientAPI } from '../../services/api';
import { demoBillings, demoPatients } from '../../data/mockData';
import { Billing, Patient } from '../../types';
import {
  CreditCard, Plus, FileText, CheckCircle2, AlertCircle,
  TrendingUp, Calculator, DollarSign, Wallet
} from 'lucide-react';
import { generateBillingInvoicePDF } from '../../utils/pdfGenerator';

const BillingPage = () => {
  const { user } = useAuth();
  const [billings, setBillings] = useState<Billing[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (receptionist/admin only)
  const [showGenForm, setShowGenForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [consultFee, setConsultFee] = useState('250');
  const [labFee, setLabFee] = useState('0');
  const [medicineFee, setMedicineFee] = useState('0');
  const [payStatus, setPayStatus] = useState<'pending' | 'paid' | 'partial'>('pending');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let patId = '';
        let matchedPat: Patient | undefined;

        // Fetch patients list
        try {
          const patRes = await patientAPI.getAll();
          setPatients(patRes.data?.data || patRes.data || []);
          
          if (user?.role === 'patient') {
            matchedPat = patRes.data?.data?.find((p: Patient) => p.user_id === user?.id) ||
                         patRes.data?.find((p: Patient) => p.user_id === user?.id);
          }
        } catch {
          setPatients(demoPatients);
          if (user?.role === 'patient') {
            matchedPat = demoPatients.find(p => p.user_id === user?.id);
          }
        }

        if (matchedPat) {
          patId = matchedPat.id;
        }

        // Fetch bills
        try {
          if (user?.role === 'patient' && patId) {
            const billRes = await billingAPI.getByPatient(patId);
            setBillings(billRes.data?.data || billRes.data || []);
          } else {
            const billRes = await billingAPI.getAll();
            setBillings(billRes.data?.data || billRes.data || []);
          }
        } catch {
          if (user?.role === 'patient' && patId) {
            setBillings(demoBillings.filter(b => b.patient_id === patId));
          } else {
            setBillings(demoBillings);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient.');
      return;
    }
    setGenerating(true);

    try {
      const patientObj = patients.find(p => p.id === selectedPatientId);
      const feeC = Number(consultFee) || 0;
      const feeL = Number(labFee) || 0;
      const feeM = Number(medicineFee) || 0;
      const total = feeC + feeL + feeM;

      const payload = {
        patient_id: selectedPatientId,
        patient_name: patientObj?.full_name || '',
        consultation_fee: feeC,
        lab_charges: feeL,
        medicine_charges: feeM,
        total_amount: total,
        payment_status: payStatus,
      };

      let savedBill: Billing;

      try {
        const res = await billingAPI.create(payload);
        savedBill = res.data?.data || res.data;
      } catch {
        // Mock fallback
        savedBill = {
          id: `bill-${Date.now().toString().slice(-3)}`,
          created_at: new Date().toISOString().slice(0, 10),
          ...payload,
        };
      }

      setBillings([savedBill, ...billings]);
      alert('Invoice generated successfully!');
      
      // Reset & close
      setSelectedPatientId('');
      setConsultFee('250');
      setLabFee('0');
      setMedicineFee('0');
      setPayStatus('pending');
      setShowGenForm(false);
    } catch (err) {
      console.error(err);
      alert('Error generating invoice.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulatePayment = async (id: string) => {
    try {
      alert('Simulating secure gateway checkout...');
      setBillings(prev =>
        prev.map(b => b.id === id ? { ...b, payment_status: 'paid' } : b)
      );
      alert('Payment received! Invoice status updated to PAID.');
    } catch {
      alert('Error simulating payment.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'partial': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  const totalCalculatedRevenue = billings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const pendingDues = billings
    .filter(b => b.payment_status === 'pending')
    .reduce((sum, b) => sum + b.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Billing & Accounts</h1>
          <p className="text-medical-muted text-sm mt-1">Invoice generation, patient checkout ledger, and online payments portal</p>
        </div>
        {user?.role !== 'patient' && !showGenForm && (
          <button
            onClick={() => setShowGenForm(true)}
            className="btn-primary flex items-center gap-1.5 self-start text-xs font-semibold"
          >
            <Plus size={18} /> Generate Invoice
          </button>
        )}
      </div>

      {/* Stats summaries for Admin/Receptionist */}
      {user?.role !== 'patient' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
          <div className="stat-card flex items-center justify-between">
            <div>
              <p className="text-xs text-medical-muted">Settled Revenue</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">${totalCalculatedRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-card flex items-center justify-between">
            <div>
              <p className="text-xs text-medical-muted">Outstanding Dues</p>
              <p className="text-xl font-bold text-red-500 mt-1">${pendingDues.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="stat-card flex items-center justify-between">
            <div>
              <p className="text-xs text-medical-muted">Total Invoiced</p>
              <p className="text-xl font-bold text-primary-600 mt-1">
                ${billings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Generate invoice form */}
      {showGenForm && (
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-card max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-medical-border pb-3">
            <h3 className="section-title text-sm flex items-center gap-1"><Calculator size={18} /> Generate Invoice Form</h3>
            <button onClick={() => setShowGenForm(false)} className="text-xs font-bold text-red-500 hover:text-red-600">✕ Close</button>
          </div>
          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="input-field text-xs"
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Consultation Fee ($)</label>
                <input type="number" value={consultFee} onChange={(e) => setConsultFee(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Lab Charges ($)</label>
                <input type="number" value={labFee} onChange={(e) => setLabFee(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Pharmacy Meds ($)</label>
                <input type="number" value={medicineFee} onChange={(e) => setMedicineFee(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Payment Status</label>
                <select value={payStatus} onChange={(e: any) => setPayStatus(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <span className="text-xs text-medical-muted">Total Sum:</span>
                <span className="text-lg font-extrabold text-medical-text-primary mt-1">
                  ${(Number(consultFee) || 0) + (Number(labFee) || 0) + (Number(medicineFee) || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={generating} className="btn-primary py-2.5 text-xs font-semibold">
                {generating ? 'Generating...' : 'Issue Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Billings Ledger */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
        <h2 className="section-title mb-4">Invoices & Checkout Ledger</h2>
        {billings.length === 0 ? (
          <div className="text-center py-10 text-medical-muted">
            <AlertCircle size={40} className="mx-auto mb-2 opacity-35" />
            <p>No billing records logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-border text-left">
                  <th className="table-header">Invoice ID</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Consult Fee</th>
                  <th className="table-header">Lab Fees</th>
                  <th className="table-header">Meds Fees</th>
                  <th className="table-header">Total Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody>
                {billings.map((bill) => (
                  <tr key={bill.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors text-xs">
                    <td className="table-cell font-mono font-bold text-medical-text-primary">{bill.id}</td>
                    <td className="table-cell font-semibold">{bill.patient_name}</td>
                    <td className="table-cell">${bill.consultation_fee}</td>
                    <td className="table-cell">${bill.lab_charges}</td>
                    <td className="table-cell">${bill.medicine_charges}</td>
                    <td className="table-cell font-bold text-medical-text-primary">${bill.total_amount}</td>
                    <td className="table-cell capitalize">
                      <span className={`badge ${getStatusBadge(bill.payment_status)}`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => generateBillingInvoicePDF(bill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-lg text-[10px] font-bold transition-all active:scale-[0.98]"
                          title="Download Invoice PDF"
                        >
                          <FileText size={12} /> PDF
                        </button>
                        {bill.payment_status === 'pending' && user?.role === 'patient' ? (
                          <button
                            onClick={() => handleSimulatePayment(bill.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-md hover:bg-emerald-700 transition-colors"
                          >
                            <Wallet size={12} /> Pay Now
                          </button>
                        ) : bill.payment_status === 'paid' ? (
                          <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5 justify-end">
                            <CheckCircle2 size={12} /> Settled
                          </span>
                        ) : (
                          <span className="text-medical-muted">No Action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
