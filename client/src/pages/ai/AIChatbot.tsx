import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import { ChatMessage } from '../../types';
import {
  MessageSquare, ArrowLeft, Send, Sparkles, Loader2,
  Stethoscope, RefreshCw, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_PROMPTS = [
  'How to lower blood pressure?',
  'What are common symptoms of migraine?',
  'How do I schedule an appointment?',
  'Tips for a heart-healthy diet'
];

const AIChatbot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your MediCare AI virtual health assistant. I can help answer general medical questions, explain health terms, or guide you through hospital resources. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Filter history to fit API expectations (just role and content)
    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await aiAPI.chat(textToSend, historyPayload);
      const reply = res.data?.data || res.data;

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("AI Chatbot error details:", err);
      const status = err.response?.status;
      const errMsg = (err.response?.data?.error || err.message || '').toLowerCase();
      const isQuota = status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit reached') || errMsg.includes('rate limit');
      
      const userFriendlyMsg = isQuota
        ? "AI service is temporarily unavailable because the daily AI usage limit has been reached. Please try again tomorrow."
        : "Unable to process your request right now. Please try again later.";

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: userFriendlyMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your MediCare AI virtual health assistant. I can help answer general medical questions, explain health terms, or guide you through hospital resources. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between border-b border-medical-border pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ai')}
            className="p-2 bg-white rounded-xl border border-medical-border hover:bg-gray-50 text-medical-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title text-lg">AI Healthcare Chatbot</h1>
            <p className="text-medical-muted text-xs">Conversational wellness and medical guidance desk</p>
          </div>
        </div>
        <button
          onClick={handleResetChat}
          className="p-2 bg-white rounded-xl border border-medical-border hover:bg-gray-50 text-medical-muted flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Main chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-medical-border shadow-card overflow-hidden flex flex-col min-h-0">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Stethoscope size={16} />
                  </div>
                )}
                <div className="flex flex-col space-y-1 max-w-[70%]">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${isUser ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-gray-50 border border-medical-border rounded-tl-none text-medical-text-secondary'}`}>
                    {m.content}
                  </div>
                  <span className={`text-[9px] text-medical-muted ${isUser ? 'text-right' : ''}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Stethoscope size={16} />
              </div>
              <div className="bg-gray-50 border border-medical-border rounded-2xl rounded-tl-none p-3.5 text-xs text-medical-muted flex items-center gap-1.5 shadow-sm">
                <Loader2 className="animate-spin text-teal-600" size={14} />
                <span>Assistant is drafting advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-medical-border shrink-0">
            <span className="text-[10px] font-bold text-medical-muted uppercase block mb-2">Suggested Prompts</span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 bg-white border border-medical-border rounded-xl text-xs text-medical-text-secondary hover:border-teal-400 hover:text-teal-700 transition-all font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-medical-border bg-gray-50 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about symptoms, drugs, treatments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-medical-border bg-white text-xs focus:outline-none focus:border-teal-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex items-center gap-1 mt-2 text-[9px] text-medical-muted justify-center">
            <Info size={10} />
            <span>AI suggestions are for general information only and do not constitute a medical diagnosis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
