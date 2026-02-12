
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  History, 
  Activity, 
  Palmtree, 
  UserX, 
  FileDown, 
  Table as TableIcon,
  ChevronRight,
  TrendingUp,
  X,
  Loader2,
  Lock
} from 'lucide-react';
import { analyzeAttendanceFile } from '../services/geminiService';

type ViewLevel = 'dashboard' | 'years' | 'months' | 'details' | 'employee-profile';
type RecordType = 'work' | 'leave' | 'absence';

interface AttendanceRecord {
  id: string; employee: string; year: string; month: string; date: string; checkIn: string; checkOut: string; status: string; type: RecordType; notes?: string;
}

const HRModule: React.FC = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('dashboard');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');

  const EMPLOYEES_LIST = [
    { id: '1', name: 'المهندس أحمد علي (حلطوم)', role: 'مدير فني', color: 'from-blue-600 to-indigo-700' },
    { id: '2', name: 'المهندس حسين مساحة', role: 'مهندس مساحة', color: 'from-emerald-500 to-teal-600' },
    { id: '3', name: 'السيلز (Sales)', role: 'تطوير الأعمال', color: 'from-amber-500 to-orange-600' },
  ];

  const MONTHS = [
    { id: '1', name: 'يناير', icon: '❄️' }, { id: '2', name: 'فبراير', icon: '🌧️' }, { id: '3', name: 'مارس', icon: '🌱' }, { id: '4', name: 'أبريل', icon: '🌸' },
    { id: '5', name: 'مايو', icon: '☀️' }, { id: '6', name: 'يونيو', icon: '⛱️' }, { id: '7', name: 'يوليو', icon: '🔥' }, { id: '8', name: 'أغسطس', icon: '🌊' },
    { id: '9', name: 'سبتمبر', icon: '🍂' }, { id: '10', name: 'أكتوبر', icon: '🎃' }, { id: '11', name: 'نوفمبر', icon: '🌩️' }, { id: '12', name: 'ديسمبر', icon: '❄️' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('binaa_hr_attendance');
    if (saved) setAttendanceData(JSON.parse(saved));
  }, []);

  const calculateWorkBalance = (record: AttendanceRecord): number => {
    if (record.type !== 'work') return 0;
    try {
      const [h1, m1] = record.checkIn.split(':').map(Number);
      const [h2, m2] = record.checkOut.split(':').map(Number);
      if (isNaN(h1) || isNaN(h2)) return 0;
      return (h2 * 60 + m2) - (h1 * 60 + m1) - 480; 
    } catch { return 0; }
  };

  const formatBalance = (totalMinutes: number) => {
    const abs = Math.abs(totalMinutes);
    return `${totalMinutes >= 0 ? '+' : '-'}${Math.floor(abs/60)}س ${abs%60}د`;
  };

  const getStats = (empName: string) => {
    const filtered = attendanceData.filter(r => r.employee === empName);
    const balance = filtered.reduce((sum, r) => sum + calculateWorkBalance(r), 0);
    return { balance, count: filtered.filter(r => r.type === 'work').length, leaves: filtered.filter(r => r.type === 'leave').length, absences: filtered.filter(r => r.type === 'absence').length };
  };

  return (
    <div className="space-y-10 font-sans pb-20" dir="rtl">
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border w-fit">
        <button onClick={() => setViewLevel('dashboard')} className={`px-8 py-3 rounded-xl font-black text-[11px] ${viewLevel === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>لوحة المراقبة</button>
        <button onClick={() => setViewLevel('years')} className={`px-8 py-3 rounded-xl font-black text-[11px] ${viewLevel !== 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>أرشيف الحضور</button>
      </div>

      {viewLevel === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EMPLOYEES_LIST.map(emp => {
            const stats = getStats(emp.name);
            return (
              <div key={emp.id} onClick={() => { setSelectedEmployeeId(emp.id); setViewLevel('employee-profile'); }} className="bg-white rounded-[3rem] border shadow-sm hover:shadow-xl transition-all p-10 cursor-pointer">
                <div className="flex items-center justify-between mb-8"><div><h4 className="font-black text-slate-900">{emp.name}</h4><p className="text-[9px] text-slate-400 font-black">{emp.role}</p></div><ChevronRight className="rotate-180 text-slate-200" /></div>
                <div className="bg-slate-50 p-6 rounded-[2rem] text-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">الرصيد</p><span className={`text-3xl font-black ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatBalance(stats.balance)}</span></div>
              </div>
            );
          })}
        </div>
      )}
      
      {viewLevel === 'employee-profile' && selectedEmployeeId && (
        <div className="space-y-8 animate-in fade-in">
          <button onClick={() => setViewLevel('dashboard')} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight className="rotate-180" /></button>
          <h2 className="text-3xl font-black">{EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId)?.name}</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm text-center font-black"><p className="text-xs text-slate-400">الرصيد</p>{formatBalance(getStats(EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId)!.name).balance)}</div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm text-center font-black"><p className="text-xs text-slate-400">أيام العمل</p>{getStats(EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId)!.name).count}</div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm text-center font-black"><p className="text-xs text-slate-400">الإجازات</p>{getStats(EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId)!.name).leaves}</div>
            <div className="bg-white p-6 rounded-3xl border shadow-sm text-center font-black"><p className="text-xs text-slate-400">الغياب</p>{getStats(EMPLOYEES_LIST.find(e => e.id === selectedEmployeeId)!.name).absences}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRModule;
