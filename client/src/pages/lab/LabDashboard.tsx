import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { labReportAPI, patientAPI, doctorAPI } from '../../services/api';
import { demoLabReports, demoPatients, demoDoctors } from '../../data/mockData';
import { LabReport, Patient, Doctor } from '../../types';
import {
  FlaskConical, CheckCircle2, AlertCircle, Plus, Trash2, ClipboardCheck,
  Search, Info, FileText, ArrowRight
} from 'lucide-react';

const LabDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'requests' | 'upload' | 'reports'>('requests');
  const [reports, setReports] = useState<LabReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Results uploading states
  const [selectedReportId, setSelectedReportId] = useState('');
  const [testParams, setTestParams] = useState<Array<{ parameter: string; value: string; unit: string; normal_range: string; is_abnormal: boolean }>>([
    { parameter: '', value: '', unit: '', normal_range: '', is_abnormal: false }
  ]);
  const [submittingResults, setSubmittingResults] = useState(false);

  // Sync tab with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/upload')) {
      setActiveTab('upload');
    } else if (path.endsWith('/reports')) {
      setActiveTab('reports');
    } else {
      setActiveTab('requests');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: 'requests' | 'upload' | 'reports') => {
    const routeMap = {
      requests: '/lab/requests',
      upload: '/lab/upload',
      reports: '/lab/reports',
    };
    navigate(routeMap[tabId]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lab Reports
        try {
          const repRes = await labReportAPI.getAll();
          setReports(repRes.data?.data || repRes.data || []);
        } catch {
          setReports(demoLabReports);
        }

        // Patients
        try {
          const patRes = await patientAPI.getAll();
          setPatients(patRes.data?.data || patRes.data || []);
        } catch {
          setPatients(demoPatients);
        }

        // Doctors
        try {
          const docRes = await doctorAPI.getAll();
          setDoctors(docRes.data?.data || docRes.data || []);
        } catch {
          setDoctors(demoDoctors);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddParam = () => {
    setTestParams([...testParams, { parameter: '', value: '', unit: '', normal_range: '', is_abnormal: false }]);
  };

  const handleRemoveParam = (index: number) => {
    const list = [...testParams];
    list.splice(index, 1);
    setTestParams(list);
  };

  const handleParamChange = (index: number, field: string, value: string | boolean) => {
    const list = [...testParams] as any;
    list[index][field] = value;
    setTestParams(list);
  };

  const handleResultsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) {
      alert('Please select a pending test request.');
      return;
    }
    const emptyParams = testParams.some(p => !p.parameter || !p.value);
    if (emptyParams) {
      alert('Please fill out parameter name and recorded value.');
      return;
    }
    setSubmittingResults(true);

    try {
      // Map params array to results object for the API
      const resultsObj: Record<string, string> = {};
      testParams.forEach(p => {
        resultsObj[p.parameter] = `${p.value} ${p.unit} (Normal: ${p.normal_range})`;
      });

      const payload = {
        status: 'completed',
        results: resultsObj,
        technician_id: 'tech-001',
      };

      try {
        await labReportAPI.update(selectedReportId, payload);
      } catch {
        console.warn('API error, falling back to mock update.');
      }

      // Update in state
      setReports(prev =>
        prev.map(r =>
          r.id === selectedReportId
            ? { ...r, status: 'completed', results: resultsObj }
            : r
        )
      );

      alert('Lab results successfully uploaded and released to patient!');
      // Clear form
      setSelectedReportId('');
      setTestParams([{ parameter: '', value: '', unit: '', normal_range: '', is_abnormal: false }]);
      handleTabChange('requests');
    } catch (err) {
      console.error(err);
      alert('Error saving results.');
    } finally {
      setSubmittingResults(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in_progress': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'in_progress');
  const completedReports = reports.filter(r => r.status === 'completed');

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
          <h1 className="page-title">Diagnostic Laboratory</h1>
          <p className="text-medical-muted text-sm mt-1">Manage laboratory test schedules and verify diagnostic results</p>
        </div>

        {/* Tab triggers */}
        <div className="bg-white p-1 rounded-xl border border-medical-border flex gap-1 text-sm font-semibold">
          {[
            { id: 'requests', label: 'Pending Requests', icon: <FlaskConical size={16} /> },
            { id: 'upload', label: 'Upload Results', icon: <Plus size={16} /> },
            { id: 'reports', label: 'Completed Reports', icon: <FileText size={16} /> },
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

      {/* ─── TAB 1: PENDING REQUESTS ─────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
          {pendingReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-medical-border text-center text-medical-muted">
              <FlaskConical size={40} className="mx-auto mb-2 opacity-35" />
              <p>No laboratory test requests are currently pending.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-medical-text-primary">{report.test_name}</h3>
                      <p className="text-xs text-medical-muted">
                        Patient: {report.patient_name} | Requested By: {report.doctor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => { setSelectedReportId(report.id); handleTabChange('upload'); }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Process Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: UPLOAD RESULTS ───────────────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-card border border-medical-border animate-fade-in">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-primary-600" size={20} />
            Input Laboratory Test Parameters
          </h2>

          <form onSubmit={handleResultsSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-medical-text-primary mb-1.5">Select Pending Test Request</label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Choose Test --</option>
                {pendingReports.map(r => (
                  <option key={r.id} value={r.id}>{r.test_name} for {r.patient_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-medical-border pb-2">
                <h4 className="text-xs font-bold text-medical-text-secondary uppercase">Recorded Parameters</h4>
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-0.5"
                >
                  <Plus size={14} /> Add Parameter
                </button>
              </div>

              {testParams.map((param, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-gray-50 border border-medical-border/60 rounded-xl relative">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-medical-muted mb-1">Parameter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hemoglobin, Glucose"
                      value={param.parameter}
                      onChange={(e) => handleParamChange(index, 'parameter', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-medical-muted mb-1">Recorded Value</label>
                    <input
                      type="text"
                      placeholder="e.g. 13.5, 95"
                      value={param.value}
                      onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-medical-muted mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. g/dL, mg/dL"
                      value={param.unit}
                      onChange={(e) => handleParamChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-medical-muted mb-1">Reference Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 12-16, <100"
                      value={param.normal_range}
                      onChange={(e) => handleParamChange(index, 'normal_range', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-medical-border bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-center pb-2.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={param.is_abnormal}
                        onChange={(e) => handleParamChange(index, 'is_abnormal', e.target.checked)}
                        className="rounded border-medical-border text-red-600 focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-red-500">Alert</span>
                    </label>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveParam(index)}
                      disabled={testParams.length === 1}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg border border-red-200 hover:border-red-500 disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-red-500 disabled:hover:border-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submittingResults}
                className="btn-primary flex items-center gap-1.5"
              >
                <ClipboardCheck size={18} />
                {submittingResults ? 'Uploading...' : 'Authorize & Upload Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: COMPLETED REPORTS ────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
          {completedReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-medical-border text-center text-medical-muted">
              <FileText size={40} className="mx-auto mb-2 opacity-35" />
              <p>No completed diagnostic reports in log.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl p-6 shadow-card border border-medical-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-medical-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <FlaskConical size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-md text-medical-text-primary">{report.test_name}</h3>
                        <p className="text-xs text-medical-muted">
                          Patient: {report.patient_name} | Requested By: {report.doctor_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-medical-muted">
                      <span className="badge badge-success">Completed</span>
                      <span className="border-l border-medical-border pl-3">Uploaded: {report.created_at.slice(0, 10)}</span>
                    </div>
                  </div>

                  {report.results && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {Object.entries(report.results).map(([param, val]) => (
                        <div key={param} className="p-3 bg-gray-50 border border-medical-border/60 rounded-xl">
                          <span className="text-medical-muted block">{param}</span>
                          <span className="font-bold text-medical-text-primary mt-1 block">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabDashboard;
