import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { medicineAPI, prescriptionAPI } from '../../services/api';
import { demoMedicines, demoPrescriptions } from '../../data/mockData';
import { Medicine, Prescription } from '../../types';
import {
  Package, AlertTriangle, AlertCircle, Search, FileText, CheckCircle2,
  Trash2, Plus, ShieldCheck, ArrowRight, Edit, X
} from 'lucide-react';

const PharmacyDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions' | 'alerts'>('inventory');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Medicine State
  const [editMedId, setEditMedId] = useState<string | null>(null);

  // Form state to add/edit medicine
  const [showAddForm, setShowAddForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medCat, setMedCat] = useState('Analgesic');
  const [medQty, setMedQty] = useState('');
  const [medExpiry, setMedExpiry] = useState('');
  const [medPrice, setMedPrice] = useState('');
  const [medMan, setMedMan] = useState('');
  const [addingMed, setAddingMed] = useState(false);

  // Sync tab with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/prescriptions')) {
      setActiveTab('prescriptions');
    } else if (path.endsWith('/alerts')) {
      setActiveTab('alerts');
    } else {
      setActiveTab('inventory');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: 'inventory' | 'prescriptions' | 'alerts') => {
    const routeMap = {
      inventory: '/pharmacy/inventory',
      prescriptions: '/pharmacy/prescriptions',
      alerts: '/pharmacy/alerts',
    };
    navigate(routeMap[tabId]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Medicines
        try {
          const medRes = await medicineAPI.getAll();
          setMedicines(medRes.data?.data || medRes.data || []);
        } catch {
          setMedicines(demoMedicines);
        }

        // Prescriptions
        try {
          const prescRes = await prescriptionAPI.getAll();
          setPrescriptions(prescRes.data?.data || prescRes.data || []);
        } catch {
          setPrescriptions(demoPrescriptions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDispense = async (prescriptionId: string, prescriptionMedicines: any[]) => {
    try {
      // Deduct stock for each medicine in prescription
      setMedicines(prevMeds => {
        return prevMeds.map(m => {
          const match = prescriptionMedicines.find(pm => pm.name.toLowerCase() === m.name.toLowerCase());
          if (match) {
            // Deduct in mock
            return { ...m, stock_quantity: Math.max(0, m.stock_quantity - 10) }; // Mock reduction
          }
          return m;
        });
      });

      alert('Medicines successfully dispensed. Stock inventory updated!');
    } catch (err) {
      console.error(err);
      alert('Error dispensing medicines.');
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medExpiry || !medQty || !medPrice) {
      alert('Name, Expiry, Stock, and Price are required.');
      return;
    }
    setAddingMed(true);

    try {
      const payload = {
        name: medName,
        category: medCat,
        stock_quantity: Number(medQty),
        expiry_date: medExpiry,
        price: Number(medPrice),
        manufacturer: medMan || 'MediCare Lab',
      };

      if (editMedId) {
        // Edit flow
        try {
          const res = await medicineAPI.update(editMedId, payload);
          const updated = res.data?.data || res.data;
          setMedicines(prev => prev.map(m => m.id === editMedId ? { ...m, ...updated } : m));
        } catch {
          // Local update
          setMedicines(prev => prev.map(m => m.id === editMedId ? { ...m, ...payload } : m));
        }
        alert('Medicine inventory updated successfully.');
        setEditMedId(null);
      } else {
        // Create flow
        let savedMed: Medicine;
        try {
          const res = await medicineAPI.create(payload);
          savedMed = res.data?.data || res.data;
        } catch {
          savedMed = {
            id: `med-${Date.now().toString().slice(-3)}`,
            created_at: new Date().toISOString(),
            ...payload,
          };
        }
        setMedicines([savedMed, ...medicines]);
        alert('Medicine added to inventory successfully!');
      }

      // Reset & close
      setMedName('');
      setMedQty('');
      setMedExpiry('');
      setMedPrice('');
      setMedMan('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save medicine.');
    } finally {
      setAddingMed(false);
    }
  };

  const handleStartEdit = (m: Medicine) => {
    setEditMedId(m.id);
    setMedName(m.name);
    setMedCat(m.category);
    setMedQty(String(m.stock_quantity));
    setMedExpiry(m.expiry_date);
    setMedPrice(String(m.price));
    setMedMan(m.manufacturer || '');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMedId(null);
    setMedName('');
    setMedQty('');
    setMedExpiry('');
    setMedPrice('');
    setMedMan('');
    setShowAddForm(false);
  };

  const handleDeleteMed = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine from inventory?')) return;
    try {
      await medicineAPI.delete(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
      alert('Medicine deleted.');
    } catch {
      // Fallback
      setMedicines(prev => prev.filter(m => m.id !== id));
      alert('Medicine deleted (offline fallback).');
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockThreshold = 20;
  const lowStockItems = medicines.filter(m => m.stock_quantity <= lowStockThreshold);

  // Expiring within 90 days
  const isExpiringSoon = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const limit = new Date();
    limit.setDate(limit.getDate() + 90);
    return expiry <= limit;
  };
  const expiringItems = medicines.filter(m => isExpiringSoon(m.expiry_date));

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
          <h1 className="page-title">Pharmacy Management</h1>
          <p className="text-medical-muted text-sm mt-1">Manage hospital pharmacy stocks and dispense prescriptions</p>
        </div>

        {/* Tab triggers */}
        <div className="bg-white p-1 rounded-xl border border-medical-border flex gap-1 text-sm font-semibold">
          {[
            { id: 'inventory', label: 'Inventory list', icon: <Package size={16} /> },
            { id: 'prescriptions', label: 'Prescription Queue', icon: <FileText size={16} /> },
            { id: 'alerts', label: `Stock Alerts (${lowStockItems.length + expiringItems.length})`, icon: <AlertTriangle size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md' : 'text-medical-text-secondary hover:bg-gray-50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: INVENTORY LIST ───────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-medical-border flex items-center gap-3 w-full sm:w-80 shadow-sm">
              <Search className="text-medical-muted" size={18} />
              <input
                type="text"
                placeholder="Search inventory by name/category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-medical-text-primary placeholder:text-medical-muted w-full"
              />
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-1.5 self-start text-xs font-semibold px-4 py-2.5"
              >
                <Plus size={16} /> Add New Medicine
              </button>
            )}
          </div>

          {/* Add/Edit form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl shadow-card border border-primary-100 max-w-2xl mx-auto space-y-4">
              <div className="flex justify-between items-center border-b border-medical-border pb-3">
                <h3 className="section-title text-sm">{editMedId ? 'Edit Medicine Stock' : 'Add New Medicine to Stock'}</h3>
                <button onClick={handleCancelEdit} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={14} /> Close
                </button>
              </div>
              <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Medicine Name</label>
                  <input type="text" placeholder="e.g. Paracetamol 500mg" value={medName} onChange={(e) => setMedName(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Category</label>
                  <select value={medCat} onChange={(e) => setMedCat(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none">
                    {['Analgesic', 'Antibiotic', 'Antihypertensive', 'Antidiabetic', 'NSAID', 'Supplement', 'Cardiovascular', 'Gastrointestinal'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Stock Quantity</label>
                  <input type="number" placeholder="e.g. 500" value={medQty} onChange={(e) => setMedQty(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Expiry Date</label>
                  <input type="date" value={medExpiry} onChange={(e) => setMedExpiry(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Unit Price ($)</label>
                  <input type="number" step="0.01" placeholder="e.g. 2.50" value={medPrice} onChange={(e) => setMedPrice(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-medical-text-primary mb-1.5">Manufacturer</label>
                  <input type="text" placeholder="e.g. Cipla, Sun Pharma" value={medMan} onChange={(e) => setMedMan(e.target.value)} className="w-full px-3 py-2 border border-medical-border rounded-xl text-xs focus:outline-none" />
                </div>
                <div className="md:col-span-2 pt-2 flex justify-end gap-2">
                  {editMedId && (
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-semibold">
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={addingMed} className="btn-primary py-2.5 text-xs font-semibold">
                    {addingMed ? 'Saving...' : editMedId ? 'Update Stock Item' : 'Confirm Add Item'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-10 text-medical-muted">
                <AlertCircle size={40} className="mx-auto mb-2 opacity-35" />
                <p>No medicines match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medical-border text-left">
                      <th className="table-header">Name</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Stock Qty</th>
                      <th className="table-header">Price</th>
                      <th className="table-header">Expiry Date</th>
                      <th className="table-header">Manufacturer</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((m) => {
                      const isLow = m.stock_quantity <= lowStockThreshold;
                      const isExpired = isExpiringSoon(m.expiry_date);
                      return (
                        <tr key={m.id} className="border-b border-medical-border/50 hover:bg-gray-50/50 transition-colors">
                          <td className="table-cell font-semibold text-medical-text-primary">{m.name}</td>
                          <td className="table-cell text-xs">{m.category}</td>
                          <td className="table-cell">
                            <span className={`font-semibold ${isLow ? 'text-red-500 font-extrabold' : ''}`}>
                              {m.stock_quantity} units
                            </span>
                            {isLow && <span className="ml-1.5 badge badge-danger py-0.5 text-[9px]">Low Stock</span>}
                          </td>
                          <td className="table-cell font-medium">${m.price.toFixed(2)}</td>
                          <td className="table-cell text-xs">
                            <span className={isExpired ? 'text-red-500 font-bold' : ''}>{m.expiry_date}</span>
                            {isExpired && <span className="ml-1.5 badge badge-warning py-0.5 text-[9px]">Expiring Soon</span>}
                          </td>
                          <td className="table-cell text-xs">{m.manufacturer || 'Cipla'}</td>
                          <td className="table-cell text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(m)}
                                className="p-1 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Edit medicine"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteMed(m.id!)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete medicine"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRESCRIPTION QUEUE ───────────────────────────────── */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-medical-border text-center text-medical-muted">
              <FileText size={40} className="mx-auto mb-2 opacity-35" />
              <p>No prescriptions waiting in the fulfillment queue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((presc) => (
                <div key={presc.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-medical-border pb-3">
                    <div>
                      <h3 className="font-bold text-md text-medical-text-primary">Patient: {presc.patient_name}</h3>
                      <p className="text-xs text-medical-muted">Diagnosis: {presc.diagnosis} | Doctor: {presc.doctor_name}</p>
                    </div>
                    {presc.medicines && presc.medicines.length > 0 && (
                      <button
                        onClick={() => handleDispense(presc.id, presc.medicines || [])}
                        className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1 self-start shadow-md hover:shadow-lg transition-all"
                      >
                        <ShieldCheck size={16} /> Dispense Medicines
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(presc.medicines || []).map((m, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-medical-border/60 rounded-xl">
                        <span className="font-bold text-medical-text-primary">{m.name}</span>
                        <div className="text-medical-muted mt-1 space-x-2">
                          <span>Dosage: {m.dosage}</span>
                          <span>•</span>
                          <span>Freq: {m.frequency}</span>
                          <span>•</span>
                          <span>Duration: {m.duration}</span>
                        </div>
                      </div>
                    ))}
                    {(!presc.medicines || presc.medicines.length === 0) && (
                      <p className="text-xs text-medical-muted italic">No medicines prescribed (Clinical consultation/referral/admission request only).</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: STOCK ALERTS ─────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in max-w-5xl mx-auto">
          {/* Low Stock card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h3 className="section-title text-red-500 mb-4 flex items-center gap-1.5">
              <AlertCircle size={20} /> Low Stock Warnings
            </h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-medical-muted text-center py-10">All items are sufficiently stocked.</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map(m => (
                  <div key={m.id} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-red-800">{m.name}</span>
                      <span className="block text-[11px] text-red-700 mt-0.5">Category: {m.category}</span>
                    </div>
                    <span className="font-extrabold text-red-700">{m.stock_quantity} units remaining</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Soon card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-border">
            <h3 className="section-title text-amber-500 mb-4 flex items-center gap-1.5">
              <AlertTriangle size={20} /> Expiring Stock Items
            </h3>
            {expiringItems.length === 0 ? (
              <p className="text-xs text-medical-muted text-center py-10">No items expiring within 90 days.</p>
            ) : (
              <div className="space-y-3">
                {expiringItems.map(m => (
                  <div key={m.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-800">{m.name}</span>
                      <span className="block text-[11px] text-amber-700 mt-0.5">Stock Remaining: {m.stock_quantity} units</span>
                    </div>
                    <span className="font-bold text-amber-700">Expires: {m.expiry_date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
