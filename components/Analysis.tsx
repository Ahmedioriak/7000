
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, Transaction, Invoice } from '../types';
import { getAIChatResponse } from '../services/geminiService';
import { 
  Loader2, 
  Send, 
  User, 
  Bot, 
  Trash2, 
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string; role: 'user' | 'model'; text: string; timestamp: Date;
}

interface Props {
  projects: Project[]; transactions: Transaction[]; invoices: Invoice[];
}

const Analysis: React.FC<Props> = ({ projects, transactions, invoices }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'أهلاً بك. أنا مساعدك المالي الذكي. كيف يمكنني مساعدتك اليوم؟', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const aiResponse = await getAIChatResponse(input, projects, transactions, invoices, history);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponse, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'عذراً، حدث خطأ.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-4 font-sans" dir="rtl">
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3"><MessageSquare size={20} className="text-blue-600"/><h2 className="text-md font-black">المساعد المالي المباشر</h2></div>
        <button onClick={() => setMessages([messages[0]])} className="text-slate-300 hover:text-rose-500"><Trash2 size={18} /></button>
      </div>
      <div ref={scrollRef} className="flex-1 bg-slate-50 rounded-[2rem] border overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-4 rounded-2xl font-bold text-sm shadow-sm ${msg.role === 'user' ? 'bg-white text-slate-700' : 'bg-slate-900 text-white'}`}>{msg.text}</div>
          </div>
        ))}
        {loading && <div className="flex justify-end"><Loader2 className="animate-spin text-slate-400" /></div>}
      </div>
      <form onSubmit={handleSend} className="bg-white p-2 rounded-2xl border shadow-xl flex items-center gap-2">
        <input type="text" placeholder="اكتب سؤالك هنا..." className="flex-1 px-4 py-3 outline-none font-bold text-sm" value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit" disabled={!input.trim() || loading} className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-30"><Send size={18} className="rotate-180" /></button>
      </form>
    </div>
  );
};

export default Analysis;
