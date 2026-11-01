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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl violet-gradient flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>AI Business Intelligence & Copilot</span>
        </h2>
        <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-1">
          Ask questions in Gujarati, Hindi, or English about your sales, stock, metal rates, or generate approved promotional campaigns
        </p>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] bg-[#FFFFFF] dark:bg-[#181A22] hover:bg-[#8B7CF6]/10 text-[#5A5E6B] dark:text-[#A6AAB6] hover:text-[#8B7CF6] dark:hover:text-[#A79BF8] px-3.5 py-1.5 rounded-full border border-[#E3DFD7] dark:border-white/10 hover:border-[#8B7CF6]/40 shadow-sm transition-all"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm p-4 overflow-y-auto space-y-4">
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
                  ? 'gold-gradient text-[#111318] font-bold text-xs shadow'
                  : 'violet-gradient text-white shadow'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4 text-[#111318]" /> : <Bot className="w-4 h-4 text-white" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs whitespace-pre-wrap leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-[#111318] dark:bg-[#21242E] text-[#F6F5F1] font-medium border border-[#E3DFD7]/20 dark:border-white/10'
                  : 'bg-[#ECEAE4]/50 dark:bg-[#111318] border border-[#8B7CF6]/25 text-[#111318] dark:text-[#F6F5F1]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#8B7CF6] italic p-2">
            <Sparkles className="w-4 h-4 animate-spin text-[#8B7CF6]" />
            <span>Analyzing jewellery business records with Gemini AI...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#181A22] p-2 rounded-2xl border border-[#8B7CF6]/40 dark:border-[#8B7CF6]/30 shadow-sm"
      >
        <input
          type="text"
          placeholder="Ask anything about sales, gold stock, rates, or campaigns..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 px-3 py-2 text-xs focus:outline-none bg-transparent text-[#111318] dark:text-[#F6F5F1] placeholder-[#8E929E]"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 violet-gradient hover:brightness-105 text-white font-semibold text-xs rounded-xl shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send Query
        </button>
      </form>
    </div>
  );
};
