import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Send, Bot, User, MessageSquare, Flame, Check } from 'lucide-react';

export const AiCopilotView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "Namaste! I am your Chandarkant Jewellers AI Business Copilot. How can I assist you with sales analysis, showroom stock audit, or festival WhatsApp campaign generation today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "What are today's sales and billed invoices?",
    "How much fine gold stock is currently in showroom?",
    "What are today's live bullion retail board rates?",
    "Generate Dhanteras & Diwali WhatsApp promotional message in Gujarati",
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || prompt;
    if (!q.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', text: q }];
    setMessages(newMsgs);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { prompt: q });
      if (res.data.success) {
        setMessages([...newMsgs, { role: 'assistant', text: res.data.data.reply }]);
      }
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        { role: 'assistant', text: 'Error contacting AI Copilot. Please check network connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#380810] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" /> AI Business Intelligence & Copilot
        </h2>
        <p className="text-xs text-gray-600">
          Ask questions in Gujarati, Hindi, or English about your sales, stock, metal rates, or generate approved promotional campaigns
        </p>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] bg-white hover:bg-amber-50 text-gray-700 px-3 py-1.5 rounded-full border border-amber-200/80 shadow-sm transition-all"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-[#56111C] text-amber-100'
                  : 'gold-gradient text-[#380810] shadow'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#56111C] text-amber-100 font-medium'
                  : 'bg-[#FAF8F5] border border-amber-200/60 text-gray-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-700 italic p-2">
            <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
            <span>Analyzing jewellery business records...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-300 shadow-sm"
      >
        <input
          type="text"
          placeholder="Ask anything about sales, gold stock, rates, or campaigns..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 px-3 py-2 text-xs focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 bg-[#56111C] hover:bg-[#380810] text-amber-100 font-semibold text-xs rounded-lg shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send Query
        </button>
      </form>
    </div>
  );
};
