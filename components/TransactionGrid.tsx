
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Project } from '../types';
import { 
  Save, 
  Trash2, 
  Search, 
  Plus, 
  Loader2,
  Sparkles,
  Table as TableIcon,
  FileText,
  CloudUpload,
  MousePointer2
} from 'lucide-react';
import { analyzeReceiptImage } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  projects: Project[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

interface EditingCell {
  id: string;
  field: string;
}

const TransactionGrid: React.FC<Props> = ({ 
  transactions, 
  projects, 
  onAddTransaction, 
  onDeleteTransaction, 
  onUpdateTransaction 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  
  const [entryRow, setEntryRow] = useState<any>({
    type: 'out',
    category: 'materials',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    taxAmount: 0,
    description: '',
    projectId: projects[0]?.id || '',
    supplier: '',
    referenceCode: '',
    isBankVerified: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const steps = ["قراءة الرصيد...", "استخراج المبالغ...", "تصفية الضرائب...", "جاهز للعرض"];

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev + 1) % steps.length);
      }, 700);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const filteredTransactions = transactions
    .filter(t => t.type === 'out')
    .filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.referenceCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalAmount = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalWithTax = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0) + (t.taxAmount || 0), 0);

  const exportToExcel = () => {
    let csvContent = "\uFEFF"; 
    csvContent += "السايت,المبلغ الصافي,الضريبة,المبلغ الكامل (الإجمالي),رقم الرصيد,المورد,التاريخ,البيان\n";
    filteredTransactions.forEach((t) => {
      const projectName = projects.find(p => p.id === t.projectId)?.name || 'غير معروف';
      const fullAmount = (t.amount || 0) + (t.taxAmount || 0);
      csvContent += `"${projectName}",${t.amount},${t.taxAmount || 0},${fullAmount},"${t.referenceCode || ''}","${t.supplier || ''}",${t.date},"${t.description}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `سجل_مصروفات_${new Date().toLocaleDateString('ar-BH')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (typeof window === 'undefined' || !reportRef.current) return;
    setIsGeneratingPDF(true);
    const opt = {
      margin: 10,
      filename: `تقرير_المصروفات_${new Date().toLocaleDateString('ar-BH')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    try {
      await (window as any).html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      setAnalysisProgress({ current: i + 1, total: files.length });
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((res) => {
          reader.onload = () => res((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const results = await analyzeReceiptImage(base64, file.type);
        if (results && results.length > 0) {
          const r = results[0];
          const extractedTax = Number(r.tax_amount) || 0;
          if (files.length > 1) {
            onAddTransaction({
              id: Math.random().toString(36).substr(2, 9),
              projectId: entryRow.projectId || projects[0]?.id || '',
              date: r.date || new Date().toISOString().split('T')[0],
              amount: Number(r.amount) || 0,
              taxAmount: extractedTax,
              type: 'out',
              category: (r.category as any) || 'materials',
              description: r.description || 'تحليل تلقائي لرصيد',
              supplier: r.supplier || '',
              referenceCode: r.reference_code || '',
              isBankVerified: false
            });
          } else {
            setEntryRow((prev: any) => ({
              ...prev,
              amount: Number(r.amount) || 0,
              taxAmount: extractedTax,
              date: r.date || prev.date,
              description: r.description || '',
              supplier: r.supplier || '',
              referenceCode: r.reference_code || '',
              category: (r.category as any) || 'materials'
            }));
          }
        }
      } catch (error) { console.error(error); }
    }
    setIsAnalyzing(false);
  };

  const handleUpdateField = (transactionId: string, field: string, value: any) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      const updatedValue = (field === 'amount' || field === 'taxAmount') ? Number(value || 0) : value;
      onUpdateTransaction({ ...transaction, [field]: updatedValue });
    }
    setEditingCell(null);
  };

  const renderCell = (transaction: Transaction, field: string, value: any, type: 'text' | 'number' | 'date' | 'select' = 'text') => {
    const isEditing = editingCell?.id === transaction.id && editingCell?.field === field;
    if (isEditing) {
      if (type === 'select' && field === 'projectId') {
        return (
          <select autoFocus className="w-full h-full bg-blue-50 outline-none font-black text-xs px-2" value={value} onBlur={(e) => handleUpdateField(transaction.id, field, e.target.value)} onChange={(e) => handleUpdateField(transaction.id, field, e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        );
      }
      return (
        <input autoFocus type={type} step={type === 'number' ? '0.001' : undefined} className={`w-full h-full bg-blue-50 outline-none font-black text-xs px-2 ${type === 'number' ? 'text-left' : ''}`} defaultValue={value === 0 && type === 'number' ? '0' : value} onBlur={(e) => handleUpdateField(transaction.id, field, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateField(transaction.id, field, (e.target as HTMLInputElement).value)} />
      );
    }
    let displayValue = value;
    if (type === 'number') displayValue = Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 3 });
    if (field === 'projectId') displayValue = projects.find(p => p.id === value)?.name || value;
    return (
      <div className={`w-full h-full min-h-[40px] flex items-center px-4 cursor-pointer hover:bg-blue-50/50 transition-colors font-black text-[11px] ${type === 'number' ? 'justify-end text-left' : ''}`} onClick={() => setEditingCell({ id: transaction.id, field })}>
        {displayValue !== undefined && displayValue !== '' ? displayValue : (type === 'number' ? '0.000' : '-')}
      </div>
    );
  };

  return (
    <div ref={containerRef} onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}} onDragLeave={() => setIsDragging(false)} onDrop={(e) => {e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files);}} className="flex flex-col h-full bg-white shadow-2xl rounded-2xl border overflow-hidden font-sans relative" dir="rtl">
      {isDragging && <div className="absolute inset-0 bg-[#1a4a8d]/40 backdrop-blur-sm z-[250] flex items-center justify-center p-12 pointer-events-none"><div className="w-full h-full border-4 border-dashed border-white rounded-[3rem] flex flex-col items-center justify-center gap-6"><CloudUpload size={64} className="text-white animate-bounce" /><h2 className="text-4xl font-black text-white">أفلت الصور هنا</h2></div></div>}
      {isAnalyzing && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex flex-col items-center justify-center"><div className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-6 text-center"><Loader2 size={64} className="animate-spin text-blue-600" /><h3 className="text-xl font-black">{steps[analysisStep]}</h3></div></div>}
      <div className="bg-[#f8f9fa] border-b border-gray-300 p-3 flex items-center gap-4">
        <button onClick={() => { if (!entryRow.projectId || !entryRow.amount) return; onAddTransaction({...entryRow, id: Math.random().toString(36).substr(2,9)}); setEntryRow({...entryRow, amount: 0, taxAmount: 0, description: ''}); }} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg"><Save size={16} className="inline ml-2"/>حفظ القيد</button>
        <div onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 bg-[#1a4a8d] text-white rounded-xl font-black text-xs cursor-pointer shadow-md"><Sparkles size={16} className="inline ml-2" />تحليل ذكي</div>
        <input type="text" placeholder="بحث سريع..." className="flex-1 max-w-sm px-4 py-2 border rounded-xl font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={exportToExcel} className="p-2.5 bg-white border rounded-xl text-emerald-600 font-black text-[10px]"><TableIcon size={16} className="inline ml-1" /> إكسل</button>
          <button onClick={exportToPDF} disabled={isGeneratingPDF} className="p-2.5 bg-white border rounded-xl text-rose-600 font-black text-[10px]"><FileText size={16} className="inline ml-1" /> PDF</button>
          <div className="px-4 font-black text-slate-900 text-sm border-r">إجمالي: {totalWithTax.toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</div>
        </div>
      </div>
      <div className="overflow-auto flex-1" ref={reportRef}>
        <table className="min-w-[1400px] w-full border-collapse">
          <thead><tr className="bg-slate-100 h-10 text-slate-500 font-black text-[10px] uppercase border-b"><th className="w-16">#</th><th>التاريخ</th><th>المشروع</th><th>المورد</th><th>الرصيد</th><th className="text-rose-600">الضريبة</th><th className="text-emerald-600">الصافي</th><th className="text-blue-600 font-bold bg-blue-50/50">الإجمالي</th><th>البيان</th><th className="w-16">حذف</th></tr></thead>
          <tbody>
            <tr className="h-14 sticky top-0 z-20 bg-white shadow-sm border-b-2 border-blue-500">
              <td className="text-center"><MousePointer2 size={14} className="text-blue-600 inline"/></td>
              <td><input type="date" className="w-full px-2 font-bold text-xs outline-none" value={entryRow.date} onChange={e => setEntryRow({...entryRow, date: e.target.value})} /></td>
              <td><select className="w-full px-2 font-bold text-xs outline-none" value={entryRow.projectId} onChange={e => setEntryRow({...entryRow, projectId: e.target.value})}><option value="">اختر</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
              <td><input type="text" className="w-full px-2 font-bold text-xs outline-none" value={entryRow.supplier} onChange={e => setEntryRow({...entryRow, supplier: e.target.value})} placeholder="المورد" /></td>
              <td><input type="text" className="w-full px-2 font-black text-xs outline-none" value={entryRow.referenceCode} onChange={e => setEntryRow({...entryRow, referenceCode: e.target.value})} placeholder="كود" /></td>
              <td><input type="number" step="0.001" className="w-full px-4 font-black text-rose-700 text-left outline-none" value={entryRow.taxAmount} onChange={e => setEntryRow({...entryRow, taxAmount: e.target.value})} /></td>
              <td><input type="number" step="0.001" className="w-full px-4 font-black text-emerald-800 text-left outline-none" value={entryRow.amount} onChange={e => setEntryRow({...entryRow, amount: e.target.value})} /></td>
              <td className="px-4 font-black text-blue-700 text-left bg-blue-50/20" dir="ltr">{((Number(entryRow.amount) || 0) + (Number(entryRow.taxAmount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
              <td><input type="text" className="w-full px-2 font-bold text-xs outline-none" value={entryRow.description} onChange={e => setEntryRow({...entryRow, description: e.target.value})} placeholder="البيان" /></td>
              <td className="text-center"><button onClick={() => onAddTransaction({...entryRow, id: Math.random().toString(36).substr(2,9)})} className="text-emerald-600"><Plus size={20}/></button></td>
            </tr>
            {filteredTransactions.map((t, idx) => (
              <tr key={t.id} className="h-10 border-b hover:bg-slate-50 transition-all">
                <td className="text-center text-[10px] font-mono text-slate-400">{idx + 1}</td>
                <td className="p-0">{renderCell(t, 'date', t.date, 'date')}</td>
                <td className="p-0">{renderCell(t, 'projectId', t.projectId, 'select')}</td>
                <td className="p-0">{renderCell(t, 'supplier', t.supplier || '', 'text')}</td>
                <td className="p-0">{renderCell(t, 'referenceCode', t.referenceCode || '', 'text')}</td>
                <td className="p-0 text-rose-600">{renderCell(t, 'taxAmount', t.taxAmount || 0, 'number')}</td>
                <td className="p-0 text-emerald-700">{renderCell(t, 'amount', t.amount, 'number')}</td>
                <td className="p-0 bg-blue-50/20 font-black text-blue-700 text-left px-4" dir="ltr">{((t.amount || 0) + (t.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                <td className="p-0">{renderCell(t, 'description', t.description, 'text')}</td>
                <td className="text-center"><button onClick={() => onDeleteTransaction(t.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && processFiles(e.target.files)} />
    </div>
  );
};

export default TransactionGrid;
