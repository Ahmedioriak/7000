
import React, { useState } from 'react';
import { Project, Transaction, Invoice } from '../types.ts';
import { 
  Plus, Search, FileText, TrendingUp, TrendingDown, 
  Edit3, Trash2, X, Phone, User, DollarSign, 
  PlusCircle, AlertTriangle, Info, AlertCircle,
  ArrowRight, LayoutGrid, Receipt, Wallet, 
  CheckCircle2, Clock, BarChart3, ChevronLeft,
  Briefcase, Hash, ExternalLink, Calendar,
  ArrowDownCircle, ArrowUpCircle,
  Pencil as PencilIcon,
  Download,
  Table as TableIcon
} from 'lucide-react';

interface Props {
  projects: Project[];
  transactions: Transaction[];
  invoices: Invoice[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

type ViewMode = 'list' | 'detail';

const ProjectGrid: React.FC<Props> = ({ 
  projects, 
  transactions, 
  invoices,
  onAddProject, 
  onUpdateProject, 
  onDeleteProject 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'active',
    contractValue: 0,
    extraWorkValue: 0
  });

  const calculateProjectFinancials = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const pTrans = transactions.filter(t => t.projectId === projectId);
    const pInvoices = invoices.filter(inv => inv.projectId === projectId);
    
    const collected = pTrans.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
    const expenses = pTrans.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
    
    const totalContract = (project?.contractValue || 0) + (project?.extraWorkValue || 0);
    const remaining = totalContract - collected;

    return { 
      collected, 
      expenses, 
      totalContract, 
      remaining, 
      profit: collected - expenses,
      invoices: pInvoices,
      expensesList: pTrans.filter(t => t.type === 'out'),
      paymentsList: pTrans.filter(t => t.type === 'in')
    };
  };

  const exportProjectToExcel = (projectId: string) => {
    const financials = calculateProjectFinancials(projectId);
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "النوع,التاريخ,البيان,المبلغ الصافي,الضريبة,المجموع\n";
    
    financials.expensesList.forEach(t => {
      csvContent += `مصروف,${t.date},${t.description},${t.amount},${t.taxAmount || 0},${t.amount + (t.taxAmount || 0)}\n`;
    });
    financials.paymentsList.forEach(t => {
      csvContent += `قبض,${t.date},${t.description},${t.amount},${t.taxAmount || 0},${t.amount + (t.taxAmount || 0)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Project_${project.code}_Report.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.code) {
      if (editingProject) {
        onUpdateProject({ ...editingProject, ...formData } as Project);
      } else {
        onAddProject({ ...formData, id: Math.random().toString(36).substr(2, 9) } as Project);
      }
      setShowModal(false);
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({ status: 'active', name: '', code: '', contractValue: 0, client: '' });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setShowModal(true);
  };

  if (viewMode === 'detail' && selectedProjectId) {
    const project = projects.find(p => p.id === selectedProjectId);
    const financials = calculateProjectFinancials(selectedProjectId);
    if (!project) return null;
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 font-['Tajawal']" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('list')} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
              <ArrowRight size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900">{project.name}</h2>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {project.status === 'active' ? 'نشط' : 'مكتمل'}
                </span>
              </div>
              <p className="text-slate-400 font-bold text-sm">كود المشروع: {project.code} | العميل: {project.client}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => exportProjectToExcel(project.id)} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-2 font-black shadow-lg hover:bg-emerald-700 transition-all">
              <TableIcon size={20} /> تصدير إكسل
            </button>
            <button onClick={() => openEditModal(project)} className="p-4 bg-slate-100 text-slate-600 rounded-2xl transition-all hover:bg-slate-200">
              <PencilIcon size={20}/>
            </button>
            <button onClick={() => setShowDeleteConfirm(project.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl transition-all hover:bg-rose-100">
              <Trash2 size={20}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <DetailStatCard title="قيمة العقد" value={financials.totalContract} icon={<Receipt size={22}/>} color="blue" />
          <DetailStatCard title="إجمالي المحصل" value={financials.collected} icon={<ArrowDownCircle size={22}/>} color="emerald" />
          <DetailStatCard title="المبالغ المتبقية" value={financials.remaining} icon={<Clock size={22}/>} color="amber" />
          <DetailStatCard title="إجمالي المصاريف" value={financials.expenses} icon={<ArrowUpCircle size={22}/>} color="rose" />
          <DetailStatCard title="الربح المحقق" value={financials.profit} icon={<TrendingUp size={22}/>} color="indigo" highlight />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><Receipt className="text-blue-600" size={20} /> سجل المطالبات</h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black border-b border-slate-50">
                    <th className="pb-4 pr-4">الرقم</th>
                    <th className="pb-4">التاريخ</th>
                    <th className="pb-4">المبلغ شامل</th>
                    <th className="pb-4 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financials.invoices.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-300 font-bold">لا توجد فواتير</td></tr>
                  ) : financials.invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 pr-4 font-black text-slate-900 text-xs">{inv.invoiceNumber}</td>
                      <td className="py-5 font-bold text-slate-400 text-xs">{inv.date}</td>
                      <td className="py-5 font-black text-[#1a4a8d] text-xs" dir="ltr">{(inv.amount + (inv.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</td>
                      <td className="py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {inv.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><Wallet className="text-rose-600" size={20} /> أحدث المصروفات</h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black border-b border-slate-50">
                    <th className="pb-4 pr-4">التاريخ</th>
                    <th className="pb-4">المورد</th>
                    <th className="pb-4">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financials.expensesList.length === 0 ? (
                    <tr><td colSpan={3} className="py-12 text-center text-slate-300 font-bold">لا توجد مصروفات</td></tr>
                  ) : financials.expensesList.slice(0, 5).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 pr-4 font-bold text-slate-400 text-xs">{t.date}</td>
                      <td className="py-5 font-black text-slate-900 text-xs truncate max-w-[120px]">{t.supplier || 'مصروف عام'}</td>
                      <td className="py-5 font-black text-rose-600 text-xs text-left" dir="ltr">{t.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })} BD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900">سجل المشاريع والعملاء</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">نظرة عامة على الأداء المالي للمشاريع</p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث في اسم المشروع، الكود، أو العميل..." 
                className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button onClick={openAddModal} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
              <PlusCircle size={18} /> مشروع جديد
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5 pr-10">المشروع والعميل</th>
                <th className="px-8 py-5">قيمة العقد</th>
                <th className="px-8 py-5">إجمالي المحصل</th>
                <th className="px-8 py-5">صافي الربح</th>
                <th className="px-8 py-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => {
                const { collected, totalContract, profit } = calculateProjectFinancials(project.id);
                return (
                  <tr key={project.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => { setSelectedProjectId(project.id); setViewMode('detail'); }}>
                    <td className="px-8 py-6 pr-10">
                      <div className="font-black text-slate-900 text-md mb-1">{project.name}</div>
                      <div className="text-[10px] text-slate-400 font-black">{project.code} • {project.client}</div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-700 text-sm" dir="ltr">{totalContract.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                    <td className="px-8 py-6 font-black text-emerald-600 text-sm" dir="ltr">{collected.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                    <td className="px-8 py-6 font-black text-[#1a4a8d] text-sm" dir="ltr">{profit.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(project); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all">
                          <PencilIcon size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(project.id); }} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 px-1 uppercase">اسم المشروع</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 px-1 uppercase">كود المشروع</label>
                  <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 px-1 uppercase">قيمة العقد</label>
                  <input type="number" step="0.001" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-blue-600" value={formData.contractValue} onChange={e => setFormData({...formData, contractValue: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 px-1 uppercase">اسم العميل</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all">
                  حفظ البيانات
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><AlertCircle size={40}/></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">تأكيد حذف المشروع؟</h3>
            <p className="text-xs text-slate-400 font-bold mb-10 leading-relaxed px-4">سيتم حذف هذا المشروع وكافة العمليات المرتبطة به من القيود المالية والفواتير. هذا الإجراء غير قابل للتراجع.</p>
            <div className="flex gap-4">
              <button onClick={() => { onDeleteProject(showDeleteConfirm!); setViewMode('list'); setShowDeleteConfirm(null); }} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all">نعم، احذف المشروع</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailStatCard = ({ title, value, icon, color, highlight }: any) => {
  const colors: Record<string, string> = { 
    blue: 'bg-blue-50 text-blue-600 border-blue-100', 
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    amber: 'bg-amber-50 text-amber-600 border-amber-100', 
    rose: 'bg-rose-50 text-rose-500 border-rose-100', 
    indigo: 'bg-slate-900 text-white border-slate-800' 
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border ${highlight ? colors.indigo : colors[color]} shadow-md transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-4 mb-6 opacity-80">
        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center ${highlight ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
          {icon}
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black" dir="ltr">{value.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
        <span className="text-[10px] font-black opacity-60">BD</span>
      </div>
    </div>
  );
};

export default ProjectGrid;
