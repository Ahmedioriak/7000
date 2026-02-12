
import React, { useState, useEffect, useRef } from 'react';
import { Project, Transaction, Invoice, CompanySettings, Notification } from './types.ts';
import { NAVIGATION, COLORS } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProjectGrid from './components/ProjectGrid.tsx';
import TransactionGrid from './components/TransactionGrid.tsx';
import Analysis from './components/Analysis.tsx';
import InvoiceSection from './components/InvoiceSection.tsx';
import HRModule from './components/HRModule.tsx';
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  ChevronLeft,
  Camera,
  Save,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  Bell,
  Search,
  Calculator,
  Users,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Clock,
  Info,
  Banknote,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Pencil,
  UserPlus,
  Shield
} from 'lucide-react';

const MASTER_ADMIN = {
  email: '1',
  password: '1',
  name: 'أحمد الكنجوني'
};

const HR_PASSWORD = '1';

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'عباس-اشبيليا القديم', code: 'PRJ-001', contractValue: 1000, extraWorkValue: 0, client: 'عباس', status: 'active' },
  { id: 'p2', name: 'اسامة-اشبيليا الجديد', code: 'PRJ-002', contractValue: 1000, extraWorkValue: 0, client: 'اسامة', status: 'active' },
  { id: 'p3', name: 'محمد الفردان -دمستان', code: 'PRJ-003', contractValue: 1000, extraWorkValue: 0, client: 'محمد الفردان', status: 'active' },
  { id: 'p4', name: 'مهيمن-صدد', code: 'PRJ-004', contractValue: 1000, extraWorkValue: 0, client: 'مهيمن', status: 'active' },
  { id: 'p5', name: 'ابتسام-المنامة', code: 'PRJ-005', contractValue: 1000, extraWorkValue: 0, client: 'ابتسام', status: 'active' },
  { id: 'p6', name: 'حسين عباس-مدينة حمد', code: 'PRJ-006', contractValue: 1000, extraWorkValue: 0, client: 'حسين عباس', status: 'active' },
  { id: 'p7', name: 'المكتب', code: 'OFFICE', contractValue: 1000, extraWorkValue: 0, client: 'الشركة', status: 'active' },
  { id: 'p8', name: 'البترول', code: 'FUEL', contractValue: 1000, extraWorkValue: 0, client: 'عام', status: 'active' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'STRUCTON MAINTENANCE AND CONTRACTING',
  crNumber: '138307-3',
  vatNumber: '220018453900002',
  address: 'Office 107 | Building 58 | Road 3803 | Block 738, A\'ali - Kingdom of Bahrain',
  phone: '+973 1744 1700',
  email: 'structonbh@gmail.com',
  bankName: 'Bahrain Islamic Bank (BisB)',
  iban: 'BH24BIBB00100000621965'
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); 
  const [loginError, setLoginError] = useState('');
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{name: string, email: string} | null>(null);

  const [isHRAuthorized, setIsHRAuthorized] = useState(false);
  const [hrPassInput, setHrPassInput] = useState('');
  const [hrError, setHrError] = useState(false);

  const [allowedUsers, setAllowedUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  
  const [currentModule, setCurrentModule] = useState<'accounting' | 'hr'>('accounting');
  const [activeTab, setActiveTab] = useState('transactions');
  const [showSettings, setShowSettings] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_SETTINGS);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const savedProjects = localStorage.getItem('binaa_projects');
    const savedTransactions = localStorage.getItem('binaa_transactions');
    const savedInvoices = localStorage.getItem('binaa_invoices');
    const savedSettings = localStorage.getItem('binaa_settings');
    const savedAllowedUsers = localStorage.getItem('binaa_allowed_users');
    const authStatus = localStorage.getItem('binaa_auth_status');
    const savedUserData = localStorage.getItem('binaa_logged_user');
    const savedNotifs = localStorage.getItem('binaa_notifications');
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(INITIAL_PROJECTS);
    }

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedSettings) setCompanySettings(JSON.parse(savedSettings));
    if (savedAllowedUsers) setAllowedUsers(JSON.parse(savedAllowedUsers));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    
    if (authStatus === 'true' && savedUserData) {
      setIsLoggedIn(true);
      setLoggedInUser(JSON.parse(savedUserData));
    }
  }, []);

  const pushNotification = (title: string, message: string, type: 'success' | 'warning' | 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      date: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); 
  };

  useEffect(() => {
    localStorage.setItem('binaa_projects', JSON.stringify(projects));
    localStorage.setItem('binaa_transactions', JSON.stringify(transactions));
    localStorage.setItem('binaa_invoices', JSON.stringify(invoices));
    localStorage.setItem('binaa_settings', JSON.stringify(companySettings));
    localStorage.setItem('binaa_allowed_users', JSON.stringify(allowedUsers));
    localStorage.setItem('binaa_notifications', JSON.stringify(notifications));
  }, [projects, transactions, invoices, companySettings, allowedUsers, notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let userData: {name: string, email: string} | null = null;
    
    if (loginEmail === MASTER_ADMIN.email && loginPassword === MASTER_ADMIN.password) {
      userData = { name: MASTER_ADMIN.name, email: MASTER_ADMIN.email };
    } 
    else {
      const foundUser = allowedUsers.find(u => u.email === loginEmail && u.password === loginPassword);
      if (foundUser) userData = { name: foundUser.name || 'موظف مصرح له', email: foundUser.email };
    }

    if (userData) {
      setIsLoggedIn(true);
      setLoggedInUser(userData);
      if (rememberMe) {
        localStorage.setItem('binaa_auth_status', 'true');
        localStorage.setItem('binaa_logged_user', JSON.stringify(userData));
      }
      setShowWelcomeToast(true);
      setTimeout(() => setShowWelcomeToast(false), 5000);
      pushNotification('دخول النظام', `تم تسجيل دخول المستخدم: ${userData.name}`, 'info');
      return;
    }
    setLoginError('بيانات الدخول غير صحيحة');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setIsHRAuthorized(false);
    localStorage.removeItem('binaa_auth_status');
    localStorage.removeItem('binaa_logged_user');
  };

  const handleAddAllowedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    
    if (allowedUsers.some(u => u.email === newUser.email) || newUser.email === MASTER_ADMIN.email) {
      alert('هذا البريد الإلكتروني مسجل مسبقاً');
      return;
    }

    const updatedUsers = [...allowedUsers, { ...newUser, id: Date.now().toString() }];
    setAllowedUsers(updatedUsers);
    setNewUser({ name: '', email: '', password: '' });
    pushNotification('إضافة مستخدم', `تم إنشاء حساب جديد لـ: ${newUser.name}`, 'success');
  };

  const handleRemoveAllowedUser = (id: string) => {
    const updatedUsers = allowedUsers.filter(u => u.id !== id);
    setAllowedUsers(updatedUsers);
    pushNotification('حذف مستخدم', `تم سحب صلاحيات الوصول للمستخدم`, 'warning');
  };

  const addProject = (p: Project) => {
    setProjects(prev => [p, ...prev]);
    pushNotification('مشروع جديد', `تمت إضافة المشروع: ${p.name}`, 'success');
  };
  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    pushNotification('تحديث مشروع', `تم تعديل بيانات المشروع: ${updated.name}`, 'info');
  };
  const deleteProject = (id: string) => {
    const p = projects.find(item => item.id === id);
    setProjects(prev => prev.filter(item => item.id !== id));
    pushNotification('حذف مشروع', `تم حذف المشروع: ${p?.name || id}`, 'warning');
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    const pName = projects.find(p => p.id === t.projectId)?.name || 'غير معروف';
    pushNotification('قيد جديد', `تم تسجيل مبلغ ${t.amount} BD لمشروع ${pName}`, 'success');
  };
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    pushNotification('حذف قيد', `تم حذف عملية مالية من السجلات`, 'warning');
  };
  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    pushNotification('تحديث قيد', `تم تعديل قيد مالي بنجاح`, 'info');
  };

  const addInvoice = (inv: Invoice) => {
    setInvoices(prev => [inv, ...prev]);
    pushNotification('فاتورة جديدة', `تم إصدار المطالبة رقم: ${inv.invoiceNumber}`, 'success');
  };
  const deleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    pushNotification('حذف فاتورة', `تم حذف الفاتورة رقم: ${inv?.invoiceNumber}`, 'warning');
  };
  const updateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
    pushNotification('تحديث فاتورة', `تم تعديل الفاتورة رقم: ${updated.invoiceNumber}`, 'info');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySettings({ ...companySettings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModuleContent = () => {
    if (showSettings) return renderSettings();
    if (currentModule === 'hr') {
      if (!isHRAuthorized) return (
        <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in text-center font-['Tajawal']">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">قسم محمي بكلمة مرور</h2>
          <p className="text-slate-400 text-xs font-bold mb-8">يحتوي هذا القسم على بيانات حساسة. يرجى إدخال الرمز للمتابعة.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (hrPassInput === HR_PASSWORD) { setIsHRAuthorized(true); pushNotification('نظام الموظفين', 'تم الدخول لقسم الموارد البشرية', 'info'); }
            else { setHrError(true); setHrPassInput(''); }
          }} className="space-y-4">
            <input 
              type="password" 
              placeholder="••••••" 
              autoFocus
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none transition-all ${hrError ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-100 focus:border-emerald-500'}`}
              value={hrPassInput}
              onChange={e => {setHrPassInput(e.target.value); setHrError(false);}}
            />
            {hrError && <p className="text-rose-500 text-[10px] font-black animate-pulse">كلمة المرور غير صحيحة!</p>}
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-700 transition-all">فتح القسم</button>
          </form>
        </div>
      );
      return <HRModule />;
    }
    switch (activeTab) {
      case 'dashboard': return <Dashboard projects={projects} transactions={transactions} />;
      case 'projects': return <ProjectGrid projects={projects} transactions={transactions} invoices={invoices} onAddProject={addProject} onUpdateProject={updateProject} onDeleteProject={deleteProject} />;
      case 'transactions': return <TransactionGrid transactions={transactions} projects={projects} onAddTransaction={addTransaction} onDeleteTransaction={deleteTransaction} onUpdateTransaction={updateTransaction} />;
      case 'invoices': return <InvoiceSection projects={projects} transactions={transactions} invoices={invoices} companySettings={companySettings} onAddInvoice={addInvoice} onDeleteInvoice={deleteInvoice} onUpdateInvoice={updateInvoice} onAddTransaction={addTransaction} onDeleteTransaction={deleteTransaction} onUpdateTransaction={updateTransaction} />;
      case 'analysis': return <Analysis projects={projects} transactions={transactions} invoices={invoices} />;
      default: return <Dashboard projects={projects} transactions={transactions} />;
    }
  };

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-top-4 font-['Tajawal']" dir="rtl">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-[#1a4a8d] text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-1">إعدادات المنشأة</h3>
            <p className="text-blue-100 text-[11px] font-bold">إدارة الهوية الرسمية والبيانات البنكية للنظام</p>
          </div>
          <div className="relative z-10 group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
            <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-2xl border-4 border-white group-hover:scale-105 transition-all">
              {companySettings.logo ? (
                <img src={companySettings.logo} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <Camera size={32} />
                  <span className="text-[8px] font-black mt-1 uppercase">رفع شعار</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white group-hover:bg-blue-700">
              <Upload size={14} />
            </div>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
        </div>

        <div className="p-10 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 size={18} className="text-[#1a4a8d]" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">البيانات العامة والعنوان</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">اسم المنشأة بالإنجليزية</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500" value={companySettings.companyName} onChange={e => setCompanySettings({...companySettings, companyName: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">رقم السجل التجاري (CR)</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={companySettings.crNumber} onChange={e => setCompanySettings({...companySettings, crNumber: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الرقم الضريبي (VAT)</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={companySettings.vatNumber} onChange={e => setCompanySettings({...companySettings, vatNumber: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">رقم الهاتف</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={companySettings.phone} onChange={e => setCompanySettings({...companySettings, phone: e.target.value})} /></div>
              <div className="col-span-1 md:col-span-2 space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العنوان الكامل</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={companySettings.address} onChange={e => setCompanySettings({...companySettings, address: e.target.value})} /></div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users size={18} className="text-indigo-600" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">إدارة المستخدمين والصلاحيات</h4>
            </div>
            
            <form onSubmit={handleAddAllowedUser} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={16} className="text-indigo-500" />
                <span className="text-[11px] font-black text-slate-700">إضافة مستخدم جديد للنظام</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required placeholder="الاسم" className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input required type="email" placeholder="البريد الإلكتروني" className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <input required type="text" placeholder="كلمة المرور" className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg hover:bg-indigo-700 transition-all">إضافة وتفعيل الحساب</button>
            </form>

            <div className="space-y-3">
               <div className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Shield size={18}/></div>
                   <div>
                     <p className="text-xs font-black">{MASTER_ADMIN.name}</p>
                     <p className="text-[9px] text-slate-400 font-bold">المشرف العام (المالك)</p>
                   </div>
                 </div>
                 <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase">وصول كامل</div>
               </div>

               {allowedUsers.map(user => (
                 <div key={user.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><Users size={18}/></div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{user.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveAllowedUser(user.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6 font-['Tajawal']" dir="rtl">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-[#1a4a8d] rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl relative">
              <Calculator size={48} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-4 border-[#f8f9fc]"></div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Binaa Accountant</h1>
            <p className="text-slate-400 font-bold text-sm">نظام ستراكتون للصيانة والمقاولات الذكي</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[80px] rounded-full -mr-10 -mt-10"></div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required type="text" className="w-full pr-14 pl-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-[#1a4a8d] focus:bg-white transition-all" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required type={showPassword ? 'text' : 'password'} className="w-full pr-14 pl-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-[#1a4a8d] focus:bg-white transition-all" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a4a8d]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-[#1a4a8d] border-[#1a4a8d]' : 'bg-white border-slate-200'}`}>
                      {rememberMe && <CheckSquare className="text-white" size={14} />}
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-500 group-hover:text-slate-900 transition-colors">تذكرني في المرات القادمة</span>
                </label>
              </div>
              {loginError && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-black animate-shake"><AlertCircle size={18} /> {loginError}</div>}
              <button type="submit" className="w-full py-5 bg-[#1a4a8d] text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">دخول النظام <ChevronLeft size={20} /></button>
            </div>
          </form>
          <p className="mt-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">جميع الحقوق محفوظة - Binaa v3.0 Enterprise</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-['Tajawal']" dir="rtl">
      {/* Welcome Toast */}
      {showWelcomeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 duration-500">
           <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center"><Sparkles size={20} className="animate-pulse" /></div>
           <div><p className="text-sm font-black">مرحباً بعودتك، {loggedInUser?.name}</p><p className="text-[9px] font-bold text-slate-400">تم تسجيل دخولك بنجاح للنظام المالي</p></div>
           <button onClick={() => setShowWelcomeToast(false)} className="mr-4 text-slate-500 hover:text-white"><X size={18}/></button>
        </div>
      )}

      {/* Modern Sidebar */}
      <aside className={`bg-white border-l border-slate-100 flex flex-col transition-all duration-500 ease-in-out shadow-2xl relative z-50 ${isSidebarCollapsed ? 'w-24' : 'w-80'}`}>
        <div className="p-8 flex flex-col items-center border-b border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[#1a4a8d]/5 -rotate-12 translate-x-1/2"></div>
          <div className={`bg-[#1a4a8d] text-white rounded-[2rem] flex items-center justify-center shadow-xl transition-all ${isSidebarCollapsed ? 'w-14 h-14' : 'w-20 h-20 mb-6'}`}>
            <Calculator size={isSidebarCollapsed ? 28 : 40} />
          </div>
          {!isSidebarCollapsed && (
            <div className="text-center relative z-10">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Binaa Accountant</h2>
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise v3.0</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <div className={`mb-4 px-4 ${isSidebarCollapsed ? 'text-center' : ''}`}>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{isSidebarCollapsed ? 'Apps' : 'الأنظمة المفعلة'}</span>
          </div>
          <button onClick={() => { setCurrentModule('accounting'); setShowSettings(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs ${currentModule === 'accounting' && !showSettings ? 'bg-[#1a4a8d] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Banknote size={20} />
            {!isSidebarCollapsed && <span>نظام المحاسبة</span>}
          </button>
          <button onClick={() => { setCurrentModule('hr'); setShowSettings(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs ${currentModule === 'hr' && !showSettings ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Users size={20} />
            {!isSidebarCollapsed && <span>الموارد البشرية</span>}
          </button>
          
          <div className={`my-8 h-px bg-slate-50 ${isSidebarCollapsed ? 'mx-2' : 'mx-4'}`}></div>

          {!isSidebarCollapsed && currentModule === 'accounting' && !showSettings && (
             <div className="mb-4 px-4">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">المحاسبة والمالية</span>
             </div>
          )}

          {currentModule === 'accounting' && !showSettings && NAVIGATION.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <div className={`transition-colors ${activeTab === item.id ? 'text-blue-700' : 'text-slate-400'}`}>{item.icon}</div>
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-2">
          <button onClick={() => { setShowSettings(true); setCurrentModule('accounting'); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs ${showSettings ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Settings size={20} />
            {!isSidebarCollapsed && <span>إعدادات النظام</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black text-xs">
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>

        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-slate-100 rounded-xl shadow-xl flex items-center justify-center text-slate-400 hover:text-[#1a4a8d] z-[60]">
          {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 h-20 flex items-center justify-between px-10 shadow-sm relative z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-slate-900">
              {showSettings ? 'الإعدادات والوصول' : 
               currentModule === 'hr' ? 'بصمة وإدارة الموظفين' : 
               NAVIGATION.find(n => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Actions */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button onClick={() => setActiveTab('transactions')} className={`p-2 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="تسجيل مصروف">
                 <ArrowRight size={20} className="-rotate-45" />
               </button>
               <button onClick={() => setActiveTab('analysis')} className={`p-2 rounded-xl transition-all ${activeTab === 'analysis' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="المساعد الذكي">
                 <Sparkles size={20} />
               </button>
            </div>

            <div className="h-8 w-px bg-slate-100"></div>

            <div className="relative" ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>}
              </button>
              {showNotifications && (
                <div className="absolute left-0 top-16 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="text-sm font-black text-slate-900">التنبيهات والنشاط</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase">سجل النظام</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-300 font-bold">لا توجد تنبيهات حالياً</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-black text-slate-800 mb-1">{n.title}</p>
                          <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{n.message}</p>
                          <p className="text-[8px] text-slate-300 font-bold mt-2 uppercase">{n.date.toLocaleTimeString('ar-BH')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
               <div className="text-left">
                  <p className="text-xs font-black text-slate-900 leading-none mb-1">{loggedInUser?.name}</p>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">متصل الآن</p>
               </div>
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm font-black border border-slate-100">{loggedInUser?.name.charAt(0)}</div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-10">
          {renderModuleContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
