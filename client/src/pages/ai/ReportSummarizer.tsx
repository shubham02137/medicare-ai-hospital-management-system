import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import { ReportSummary } from '../../types';
import {
  ClipboardCheck, ArrowLeft, Loader2, Sparkles, AlertCircle,
  FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_REPORT = `Patient Name: John Doe
Date: June 1, 2025
Test: Lipid Panel (Fasting)
--------------------------------------
Total Cholesterol: 265 mg/dL (Reference Range: <200 mg/dL) [HIGH]
Triglycerides: 210 mg/dL (Reference Range: <150 mg/dL) [HIGH]
HDL Cholesterol: 38 mg/dL (Reference Range: >40 mg/dL) [LOW]
LDL Cholesterol: 175 mg/dL (Reference Range: <100 mg/dL) [VERY HIGH]
--------------------------------------
Clinical Impression: Moderate dyslipidemia. Cardiovascular risk indices are elevated.`;

const ReportSummarizer = () => {
  const navigate = useNavigate();
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string>('');

  const handleAISummarize = async () => {
    if (!reportText.trim()) {
      alert('Please paste some report text to summarize.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await aiAPI.summarizeReport(reportText);
      const data = res.data?.data || res.data;
      
      const summaryData: ReportSummary = {
        key_findings: data.keyFindings || data.key_findings || [],
        abnormal_values: (data.abnormalValues || data.abnormal_values || []).map((v: any) => {
          if (typeof v === 'string') {
            return { parameter: v, value: 'Abnormal', normal_range: 'Review range', status: 'High' };
          }
          return v;
        }),
        summary: data.summary || '',
        follow_up_recommendation: data.followUpRecommendations?.join('. ') || data.follow_up_recommendation || '',
      };
      setResult(summaryData);
    } catch (err: any) {
      console.error("Report Summarizer error details:", err);
      const status = err.response?.status;
      const errMsg = (err.response?.data?.error || err.message || '').toLowerCase();
      const isQuota = status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit reached') || errMsg.includes('rate limit');
      
      const userFriendlyMsg = isQuota
        ? "AI service is temporarily unavailable because the daily AI usage limit has been reached. Please try again tomorrow."
        : "Unable to process your request right now. Please try again later.";
      
      setError(userFriendlyMsg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setReportText(SAMPLE_REPORT);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ai')}
          className="p-2 bg-white rounded-xl border border-medical-border hover:bg-gray-50 text-medical-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">AI Medical Report Summarizer</h1>
          <p className="text-medical-muted text-sm mt-1">Translate technical lab test documents into simple terms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paste Box column */}
        <div className="bg-white rounded-2xl p-6 border border-medical-border shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-sm">Paste Medical Document</h3>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[11px] font-bold text-primary-600 hover:underline"
            >
              Load Sample Lipid Panel
            </button>
          </div>

          <textarea
            rows={10}
            placeholder="Paste clinical report parameters, lab values, or doctor summaries here..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            className="input-field resize-none text-xs font-mono"
            required
          />

          <button
            type="button"
            onClick={handleAISummarize}
            disabled={!reportText.trim() || loading}
            className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-primary-600/15"
          >
            <Sparkles size={16} /> Analyze Report with AI
          </button>
        </div>

        {/* Results column */}
        <div className="bg-white rounded-2xl p-6 border border-medical-border shadow-card h-fit min-h-[300px] flex flex-col justify-center">
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2 animate-slide-up">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">AI Service Error</h4>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-medical-muted">
              <Loader2 className="animate-spin text-primary-600" size={36} />
              <p className="text-xs font-semibold text-center">Gemini AI is parsing diagnostic logs and translating metrics...</p>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Summary Paragraph */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-medical-text-primary">Clinical Summary</h4>
                <p className="text-medical-text-secondary leading-relaxed bg-primary-50/40 p-4 border border-primary-100/30 rounded-xl">
                  {result.summary}
                </p>
              </div>

              {/* Key findings */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-medical-text-primary flex items-center gap-1">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Key Insights
                </h4>
                <ul className="space-y-1.5 text-medical-text-secondary">
                  {result.key_findings.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <ChevronRight size={14} className="text-primary-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings / Abnormal values */}
              {result.abnormal_values && result.abnormal_values.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} /> Flagged Parameters
                  </h4>
                  <div className="border border-red-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-red-50/50 border-b border-red-100">
                          <th className="px-3 py-1.5 font-bold text-red-800">Parameter</th>
                          <th className="px-3 py-1.5 font-bold text-red-800 text-right">Value (Reference)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.abnormal_values.map((item, idx) => (
                          <tr key={idx} className="border-b border-red-100/50 bg-red-50/20">
                            <td className="px-3 py-2 font-semibold text-red-900">{item.parameter}</td>
                            <td className="px-3 py-2 text-right font-extrabold text-red-600">
                              {item.value} (Normal: {item.normal_range})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="border-t border-medical-border pt-4">
                <h4 className="font-bold text-sm text-teal-700 flex items-center gap-1.5">
                  <Sparkles size={16} /> Recommended Action Steps
                </h4>
                <p className="text-teal-800 bg-teal-50/50 p-4 border border-teal-100 rounded-xl mt-1.5">
                  {result.follow_up_recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-medical-muted space-y-2">
              <ClipboardCheck size={40} className="mx-auto opacity-35 text-primary-600 animate-pulse" />
              <h3 className="font-semibold text-medical-text-primary">Awaiting Report Document</h3>
              <p className="text-xs">Paste or load sample report metrics on the left to begin analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSummarizer;
