
import React from 'react';
import { 
  Calculator, 
  Users, 
  Truck, 
  Settings, 
  LayoutGrid, 
  LineChart, 
  FileCheck,
  Building2,
  Calendar
} from 'lucide-react';

interface AppConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isActive: boolean;
}

interface Props {
  onLaunchApp: (appId: string) => void;
}

const APPS: AppConfig[] = [
  { 
    id: 'accounting', 
    name: 'المحاسبة', 
    icon: <Calculator size={48} />, 
    color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    description: 'إدارة المالية والعملاء والمشاريع',
    isActive: true 
  },
  { 
    id: 'hr', 
    name: 'الموارد البشرية', 
    icon: <Users size={48} />, 
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    description: 'الإجازات، الغياب، وبصمة 🫆 الذكية',
    isActive: true 
  },
  { 
    id: 'fleet', 
    name: 'الأسطول', 
    icon: <Truck size={48} />, 
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    description: 'تتبع الشاحنات والمعدات والوقود',
    isActive: false 
  },
  { 
    id: 'crm', 
    name: 'إدارة العلاقات', 
    icon: <LineChart size={48} />, 
    color: 'bg-gradient-to-br from-rose-500 to-pink-600',
    description: 'متابعة العملاء والفرص البيعية',
    isActive: false 
  },
  { 
    id: 'inventory', 
    name: 'المخازن', 
    icon: <FileCheck size={48} />, 
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    description: 'المواد والمخزون والمستودعات',
    isActive: false 
  },
  { 
    id: 'settings', 
    name: 'الإعدادات', 
    icon: <Settings size={48} />, 
    color: 'bg-gradient-to-br from-slate-600 to-slate-800',
    description: 'تخصيص النظام وصلاحيات الوصول',
    isActive: false 
  }
];

const AppLauncher: React.FC<Props> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen w-full bg-[#f1f4f9] flex flex-col items-center justify-center p-10 font-['Tajawal'] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4 border border-white/50 backdrop-blur-sm">
              <Building2 size={40} className="text-slate-800" />
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">نظام إدارة المؤسسة الذكي</h1>
           <p className="text-slate-500 font-bold text-lg">اختر التطبيق للبدء في إدارة أعمالك</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => app.isActive && onLaunchApp(app.id)}
              className={`group flex flex-col items-center gap-4 transition-all duration-300 ${app.isActive ? 'cursor-pointer hover:scale-110' : 'opacity-40 cursor-not-allowed grayscale'}`}
            >
              <div className={`${app.color} w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 group-hover:shadow-blue-500/20 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {app.icon}
                {!app.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <span className="bg-black/60 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">قريباً</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-slate-800 mb-1">{app.name}</span>
                <span className="block text-[10px] text-slate-400 font-bold max-w-[120px] leading-tight opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-center">
                  {app.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Quick Actions */}
        <div className="mt-24 pt-10 border-t border-slate-200 flex justify-between items-center text-slate-400">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-black"><Calendar size={16}/> {new Date().toLocaleDateString('ar-BH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="text-xs font-black">الإصدار 3.0 Enterprise</div>
           </div>
           <div className="text-xs font-black hover:text-blue-600 transition-colors cursor-pointer">المساعدة والدعم التقني</div>
        </div>
      </div>
    </div>
  );
};

export default AppLauncher;
