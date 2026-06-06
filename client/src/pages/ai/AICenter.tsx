import React from 'react';
import { BrainCircuit, Sparkles, MessageSquare, ClipboardCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AICenter = () => {
  const aiTools = [
    {
      title: 'AI Symptom Checker',
      desc: 'Analyze symptoms and evaluate risk levels using medical modeling. Identifies probable conditions and directs you to the appropriate specialist.',
      icon: <BrainCircuit size={28} className="text-teal-600" />,
      link: '/ai/symptoms',
      color: 'from-teal-500/10 to-emerald-500/10 border-teal-200/50 hover:border-teal-400',
      action: 'Check Symptoms',
    },
    {
      title: 'AI Lab Report Summarizer',
      desc: 'Translate complex lab reports, blood work, or imaging files into plain, easy-to-understand language. Instantly flags abnormal indicators and highlights action steps.',
      icon: <ClipboardCheck size={28} className="text-primary-600" />,
      link: '/ai/summarize',
      color: 'from-primary-500/10 to-indigo-500/10 border-primary-200/50 hover:border-primary-400',
      action: 'Summarize Report',
    },
    {
      title: 'AI Conversational Assistant',
      desc: 'Ask general healthcare questions or explore dietary, wellness, and preventive care suggestions with our digital medical assistant.',
      icon: <MessageSquare size={28} className="text-violet-600" />,
      link: '/ai/chat',
      color: 'from-violet-500/10 to-pink-500/10 border-violet-200/50 hover:border-violet-400',
      action: 'Chat with AI Doctor',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-8 text-center text-white shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-xs font-bold text-primary-400">
            <Sparkles size={14} className="animate-pulse" /> Advanced Health AI Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI-Powered Hospital Assistance</h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Harness the power of generative intelligence to understand symptoms, analyze clinical reports, and receive general medical support instantly.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aiTools.map((tool, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${tool.color} border rounded-3xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                {tool.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{tool.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{tool.desc}</p>
            </div>

            <div className="pt-6">
              <Link
                to={tool.link}
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1"
              >
                {tool.action}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AICenter;
