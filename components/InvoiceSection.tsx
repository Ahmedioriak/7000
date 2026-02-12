
import React, { useState, useRef } from 'react';
import { Project, Transaction, Invoice, InvoiceItem, CompanySettings } from '../types.ts';
import { 
  Plus, X, Trash2, Receipt, Edit3, ArrowRight, 
  FileDown, Loader2, CheckCircle2, Coins, Pencil, 
  AlertCircle, PlusCircle, FileText, Table as TableIcon
} from 'lucide-react';

interface Props {
  projects: Project[];
  transactions: Transaction[];
  invoices: Invoice[];
  companySettings: CompanySettings;
  onAddInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

type TabMode = 'invoices' | 'incomes';
type ViewMode = 'list' | 'invoice-detail' | 'income-receipt';

const InvoiceSection: React.FC<Props> = ({ 
  projects, 
  transactions, 
  invoices, 
  companySettings, 
  onAddInvoice, 
  onDeleteInvoice, 
  onUpdateInvoice, 
  onAddTransaction, 
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('invoices');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    taxPercentage: 10,
    status: 'sent'
  });

  const invoiceRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const getProject = (id: string) => projects.find(p => p.id === id);

  const handleOpenCreate = () => {
    setEditingInvoice(null);
    setInvoiceItems([{ id: '1', description: 'أعمال صيانة', amount: 0, stageCode: '' }]);
    setFormData({
      invoiceNumber: `INV/${new Date().getFullYear()}/${(invoices.length + 1).toString().padStart(5, '0')}`,
      date: new Date().toISOString().split('T')[0],
      taxPercentage: 10,
      projectId: projects[0]?.id || ''
    });
    setShowModal(true);
  };

  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceItems(inv.items || [{ id: '1', description: inv.description, amount: inv.amount, stageCode: '' }]);
    setFormData({ ...inv });
    setShowModal(true);
  };

  const updateItemRow = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateFinancials = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * 0.1; 
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const exportInvoicesToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "الرقم,المشروع,التاريخ,الصافي,الضريبة,الإجمالي,الحالة\n";
    
    invoices.forEach(inv => {
      const proj = getProject(inv.projectId);
      csvContent += `${inv.invoiceNumber},${proj?.name || 'غير معروف'},${inv.date},${inv.amount},${inv.taxAmount || 0},${inv.amount + (inv.taxAmount || 0)},${inv.status === 'paid' ? 'تم التحصيل' : 'انتظار'}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Invoices_Report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, taxAmount } = calculateFinancials();
    if (formData.projectId && subtotal > 0) {
      const data: Invoice = {
        ...formData as Invoice,
        id: editingInvoice ? editingInvoice.id : Math.random().toString(36).substr(2, 9),
        amount: Number(subtotal.toFixed(3)),
        taxAmount: Number(taxAmount.toFixed(3)),
        items: invoiceItems,
        description: invoiceItems[0]?.description || 'مطالبة مالية'
      };
      if (editingInvoice) onUpdateInvoice(data);
      else onAddInvoice(data);
      setShowModal(false);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (showPaymentModal && receivedAmount > 0) {
      const netAmount = receivedAmount / 1.1;
      const taxAmount = receivedAmount - netAmount;
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        projectId: showPaymentModal.projectId,
        date: receivedDate,
        amount: Number(netAmount.toFixed(3)),
        taxAmount: Number(taxAmount.toFixed(3)),
        type: 'in',
        category: 'client_payment',
        description: `تحصيل فاتورة #${showPaymentModal.invoiceNumber}`,
        referenceCode: `PAY-${Math.floor(Math.random() * 99999).toString().padStart(6, '0')}`,
        isBankVerified: true
      };
      onAddTransaction(newTransaction);
      onUpdateInvoice({ ...showPaymentModal, status: 'paid' });
      setShowPaymentModal(null);
      setReceivedAmount(0);
      setActiveTab('incomes');
    }
  };

  const handleDownloadPDF = async (type: 'invoice' | 'receipt') => {
    const element = type === 'invoice' ? invoiceRef.current : receiptRef.current;
    if (!element) return;
    setIsGeneratingPDF(true);
    const opt = { 
      margin: 0, 
      filename: `${type}_${Date.now()}.pdf`, 
      image: { type: 'jpeg', quality: 1 }, 
      html2canvas: { scale: 3, useCORS: true }, 
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    try { await (window as any).html2pdf().set(opt).from(element).save(); } finally { setIsGeneratingPDF(false); }
  };

  const StructonHeader = () => (
    <div className="flex justify-between items-start mb-6 text-left">
      <div className="flex flex-col items-start gap-0.5">
        <div className="flex items-center gap-1">
          <div className="text-[#1a4a8d] text-[26px] font-black leading-none">STRUCTON</div>
          <div className="w-4 h-4 rounded-full bg-orange-500 mt-1"></div>
        </div>
        <div className="text-[#1a4a8d] text-[10px] font-bold">ستراكتون للصيانة والمقاولات</div>
      </div>
      <div className="text-right text-[#1a4a8d]">
        <h2 className="text-[12px] font-black uppercase mb-1">{companySettings.companyName}</h2>
        <div className="text-[10px] space-y-0.5 font-bold text-slate-500">
          <p>Office 107 | Building 58 | Road 3803 | Block 738</p>
          <p>A'ali - Kingdom of Bahrain</p>
          <p className="text-[#1a4a8d]">CR No. {companySettings.crNumber} | VAT No. {companySettings.vatNumber}</p>
        </div>
      </div>
    </div>
  );

  const StructonFooter = () => (
    <div className="mt-auto text-left">
      <div className="border-t border-slate-900/20 mb-4"></div>
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-6">
        <div>Bank Account: {companySettings.companyName} | IBAN: {companySettings.iban}</div>
        <div className="text-[#1a4a8d]">Page 1 / 1</div>
      </div>
      <div className="flex gap-10 text-[10px] font-black text-slate-500">
        <p>TEL: {companySettings.phone}</p>
        <p>E-MAIL: {companySettings.email}</p>
      </div>
    </div>
  );

  if (viewMode === 'invoice-detail' && activeInvoice) {
    const proj = getProject(activeInvoice.projectId);
    const totalDue = activeInvoice.amount + (activeInvoice.taxAmount || 0);
    return (
      <div className="space-y-6 pb-10" dir="ltr">
        <div className="flex items-center justify-between print:hidden bg-white p-4 rounded-2xl shadow-sm" dir="rtl">
          <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-blue-600 font-bold px-4 flex items-center gap-2 transition-all"><ArrowRight size={20} /> العودة</button>
          <button onClick={() => handleDownloadPDF('invoice')} disabled={isGeneratingPDF} className="bg-slate-900 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-black shadow-lg">
            {isGeneratingPDF ? <Loader2 className="animate-spin" size={16}/> : <FileDown size={16}/>} تحميل PDF
          </button>
        </div>
        <div ref={invoiceRef} className="bg-white mx-auto print-document flex flex-col shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
          <StructonHeader />
          <div className="relative mb-10 mt-4 h-14 w-full">
            <div className="absolute left-1/3 right-0 h-full bg-[#eef6ff] transform -skew-x-[25deg] rounded-l-2xl"></div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2"><h1 className="text-3xl font-black text-[#1a4a8d]">Invoice {activeInvoice.invoiceNumber}</h1></div>
          </div>
          <div className="grid grid-cols-2 gap-10 mb-12 px-2 text-left">
            <div className="space-y-1"><p className="text-md font-black text-slate-900">{proj?.client}</p><p className="text-[12px] text-slate-500 font-bold">Kingdom of Bahrain</p></div>
            <div className="grid grid-cols-2 gap-x-8 text-[12px] font-bold">
              <div><p className="text-[#1a4a8d]">Invoice Date</p><p>{activeInvoice.date}</p></div>
              <div><p className="text-[#1a4a8d]">Due Date</p><p>{activeInvoice.date}</p></div>
            </div>
          </div>
          <table className="w-full text-left border-collapse mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900/10 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Total (BD)</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold text-slate-800">
              {(activeInvoice.items || []).map(item => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2 text-center">1.00</td>
                  <td className="py-4 px-2 text-right font-black">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end pr-2 text-left">
            <div className="w-[250px] text-[12px]">
               <div className="flex justify-between py-2 border-b border-slate-100"><span className="font-bold text-slate-500">Subtotal</span><span className="font-black text-slate-900">{activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span></div>
               <div className="flex justify-between py-2 border-b border-slate-100"><span className="font-bold text-slate-500">VAT (10%)</span><span className="font-black text-slate-900">{(activeInvoice.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })}</span></div>
               <div className="flex justify-between py-4 bg-[#eef6ff] px-4 mt-2 rounded-xl"><span className="font-black text-[#1a4a8d]">Total Due</span><span className="font-black text-[#1a4a8d] text-xl">{totalDue.toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</span></div>
            </div>
          </div>
          <StructonFooter />
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateFinancials();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button onClick={() => setActiveTab('invoices')} className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === 'invoices' ? 'bg-[#1a4a8d] text-white shadow-lg' : 'text-slate-500'}`}>المطالبات المالية</button>
          <button onClick={() => setActiveTab('incomes')} className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all ${activeTab === 'incomes' ? 'bg-[#1a4a8d] text-white shadow-lg' : 'text-slate-500'}`}>الإيرادات والتحصيل</button>
        </div>
        <div className="flex gap-3">
          <button onClick={exportInvoicesToExcel} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black shadow-xl hover:bg-emerald-700 transition-all">
            <TableIcon size={20} /> تصدير السجل
          </button>
          {activeTab === 'invoices' && <button onClick={handleOpenCreate} className="bg-[#1a4a8d] text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl hover:scale-105 transition-all"><Plus size={22} /> فاتورة جديدة</button>}
        </div>
      </div>

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm border-slate-100 overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">رقم الفاتورة</th>
                <th className="px-8 py-6">العميل والمشروع</th>
                <th className="px-8 py-6">المبلغ الإجمالي</th>
                <th className="px-8 py-6">الحالة</th>
                <th className="px-8 py-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-300 font-bold">لا توجد مطالبات مسجلة</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-900">{inv.invoiceNumber}</td>
                  <td className="px-8 py-6 font-black text-slate-700">
                    <div className="text-sm">{getProject(inv.projectId)?.client}</div>
                    <div className="text-[10px] text-slate-400">{getProject(inv.projectId)?.name}</div>
                  </td>
                  <td className="px-8 py-6 font-black text-[#1a4a8d]" dir="ltr">{(inv.amount + (inv.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {inv.status === 'paid' ? 'تم التحصيل' : 'انتظار الدفع'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      {inv.status !== 'paid' && <button onClick={() => { setReceivedAmount(inv.amount + (inv.taxAmount || 0)); setShowPaymentModal(inv); }} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Coins size={18} /></button>}
                      <button onClick={() => { setActiveInvoice(inv); setViewMode('invoice-detail'); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FileText size={18} /></button>
                      <button onClick={() => handleOpenEditInvoice(inv)} className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><Pencil size={18} /></button>
                      <button onClick={() => onDeleteInvoice(inv.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'incomes' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm border-slate-100 overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">التاريخ</th>
                <th className="px-8 py-6">العميل</th>
                <th className="px-8 py-6">المبلغ المحصل</th>
                <th className="px-8 py-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.filter(t => t.type === 'in').sort((a,b) => b.date.localeCompare(a.date)).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-500">{t.date}</td>
                  <td className="px-8 py-6 font-black text-slate-900">{getProject(t.projectId)?.client}</td>
                  <td className="px-8 py-6 font-black text-emerald-600" dir="ltr">{(t.amount + (t.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => onDeleteTransaction(t.id)} className="p-3 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{editingInvoice ? 'تعديل المطالبة المالية' : 'إنشاء مطالبة مالية جديدة'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 px-1 uppercase">المشروع المستهدف</label><select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>{projects.map(p => <option key={p.id} value={p.id}>{p.client} - {p.name}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 px-1 uppercase">رقم المطالبة</label><input required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} /></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><h4 className="text-sm font-black text-slate-800">تفاصيل البنود والأعمال</h4><button type="button" onClick={() => setInvoiceItems([...invoiceItems, { id: Math.random().toString(36).substr(2, 9), description: '', amount: 0, stageCode: '' }])} className="text-blue-600 text-[10px] font-black flex items-center gap-1 hover:underline"><PlusCircle size={14} /> إضافة بند جديد</button></div>
                {invoiceItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="col-span-8"><input required placeholder="وصف الأعمال أو المرحلة..." className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[11px] font-black outline-none focus:border-blue-500 transition-all" value={item.description} onChange={e => updateItemRow(item.id, 'description', e.target.value)} /></div>
                    <div className="col-span-3"><input required type="number" step="0.001" className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[11px] font-black text-blue-600 text-left outline-none focus:border-blue-500 transition-all" value={item.amount || ''} onChange={e => updateItemRow(item.id, 'amount', Number(e.target.value))} /></div>
                    <div className="col-span-1 text-center"><button type="button" onClick={() => invoiceItems.length > 1 && setInvoiceItems(invoiceItems.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16}/></button></div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-[#eef6ff] rounded-[2.5rem] border border-blue-100 grid grid-cols-2 gap-8 shadow-inner">
                <div><p className="text-[10px] text-slate-500 font-black uppercase mb-1">المجموع الصافي</p><h5 className="text-2xl font-black text-slate-700" dir="ltr">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-xs">BD</span></h5></div>
                <div className="text-left"><p className="text-[10px] text-[#1a4a8d] font-black uppercase mb-1">المبلغ المطلوب (شامل الضريبة 10%)</p><h5 className="text-3xl font-black text-[#1a4a8d]" dir="ltr">{total.toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-sm">BD</span></h5></div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-[#1a4a8d] text-white rounded-3xl font-black shadow-xl hover:bg-blue-900 transition-all">حفظ المطالبة</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in">
            <h3 className="text-2xl font-black mb-8 text-slate-900">تسجيل تحصيل الفاتورة</h3>
            <form onSubmit={handleRecordPayment} className="space-y-6">
              <div className="bg-[#eef6ff] p-8 rounded-[2.5rem] border border-blue-100 shadow-inner text-center">
                <p className="text-[10px] text-[#1a4a8d] font-black uppercase mb-2">المبلغ المجدول للتحصيل</p>
                <p className="text-4xl font-black text-[#1a4a8d]" dir="ltr">{(showPaymentModal.amount + (showPaymentModal.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })}</p>
              </div>
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase">المبلغ المستلم فعلياً</label>
                <input type="number" step="0.001" required className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-3xl text-emerald-600 text-center outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={receivedAmount} onChange={e => setReceivedAmount(Number(e.target.value))} />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-[#1a4a8d] text-white rounded-3xl font-black shadow-xl hover:bg-blue-900 transition-all">تأكيد الاستلام</button>
                <button type="button" onClick={() => setShowPaymentModal(null)} className="px-6 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceSection;
