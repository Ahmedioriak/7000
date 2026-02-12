
import React from 'react';
import { Project, Transaction, DashboardStats } from '../types.ts';
import { 
  TrendingUp, 
  DollarSign,
  PieChart as PieChartIcon,
  Target,
  ShieldCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  CheckCircle2,
  Construction,
  Wallet,
  ArrowRightLeft,
  Info,
  Scale
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Props {
  projects: Project[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ projects, transactions }) => {
  const totalContractValue = projects.reduce((sum, p) => sum + (p.contractValue || 0) + (p.extraWorkValue || 0), 0);
  const totalIncomeNet = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const totalExpensesNet = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const totalTaxCollected = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  const totalTaxPaid = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  const totalFuel = transactions.filter(t => t.category === 'fuel').reduce((sum, t) => sum + t.amount, 0);
  const totalSalaries = transactions.filter(t => t.category === 'salary').reduce((sum, t) => sum + t.amount, 0);

  const stats: DashboardStats = {
    totalIncome: totalIncomeNet,
    totalExpenses: totalExpensesNet,
    activeProjectsCount: projects.filter(p => p.status === 'active').length,
    totalSalaries,
    totalFuel,
    totalProfit: totalIncomeNet - totalExpensesNet,
    totalContractValue,
    totalRemainingBalance: totalContractValue - totalIncomeNet
  };

  const projectPerformance = projects.map(p => {
    const pTrans = transactions.filter(t => t.projectId === p.id);
    const income = pTrans.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
    const expenses = pTrans.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expenses;
    let profitPercentage = income > 0 ? (profit / income) * 100 : (expenses > 0 ? -100 : 0);
    return { ...p, income, expenses, profit, profitPercentage: Math.round(profitPercentage) };
  });

  const categoryData = [
    { name: 'رواتب', value: totalSalaries },
    { name: 'مواد', value: transactions.filter(t => t.category === 'materials').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'وقود', value: totalFuel },
    { name: 'أخرى', value: transactions.filter(t => t.category === 'other').reduce((sum, t) => sum + t.amount, 0) },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981'];

  return (
    <div className="space-y-6 pb-16 font-['Tajawal']">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">الأداء المالي (الصافي)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="إجمالي العقود" value={stats.totalContractValue} subtext="بدون ضريبة" icon={<DollarSign size={18} />} gradient="from-slate-800 to-slate-950" /><StatCard title="الدخل الصافي" value={stats.totalIncome} subtext="صافي المحصل" icon={<TrendingUp size={18} />} gradient="from-emerald-600 to-emerald-800" /><StatCard title="المصاريف" value={stats.totalExpenses} subtext="صافي التكاليف" icon={<Wallet size={18} />} gradient="from-rose-600 to-rose-800" /><StatCard title="صافي الأرباح" value={stats.totalProfit} subtext="السيولة الفعلية" icon={<Target size={18} />} gradient="from-blue-600 to-blue-800" /></div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon, gradient }: any) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"><div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-full`}></div><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-4`}>{icon}</div><p className="text-slate-400 text-[9px] font-black uppercase mb-1">{title}</p><h4 className="text-xl font-black text-slate-900" dir="ltr">{value.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ب</h4><p className="text-[9px] font-bold text-slate-400 mt-1 italic">{subtext}</p></div>
);

export default Dashboard;
