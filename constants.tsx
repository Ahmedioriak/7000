
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  ArrowUpRight, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Fuel,
  BrainCircuit,
  Receipt,
  Settings,
  Droplets
} from 'lucide-react';

export const COLORS = {
  primary: '#0f172a',
  secondary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const NAVIGATION = [
  { id: 'dashboard', label: 'لوحة القيادة', icon: <LayoutDashboard size={20} /> },
  { id: 'projects', label: 'العملاء والمشاريع', icon: <Briefcase size={20} /> },
  { id: 'transactions', label: 'المعاملات والوقود', icon: <ArrowUpRight size={20} /> },
  { id: 'invoices', label: 'الفواتير والمطالبات', icon: <Receipt size={20} /> },
  { id: 'analysis', label: 'الذكاء الاصطناعي', icon: <BrainCircuit size={20} /> },
];

export const CATEGORIES = {
  client_payment: { label: 'دفعة عميل', color: 'text-green-600 bg-green-50', icon: <TrendingUp size={14}/> },
  salary: { label: 'رواتب', color: 'text-blue-600 bg-blue-50', icon: <Users size={14}/> },
  materials: { label: 'مواد', color: 'text-orange-600 bg-orange-50', icon: <FileText size={14}/> },
  fuel: { label: 'وقود ومحروقات', color: 'text-purple-600 bg-purple-50', icon: <Fuel size={14}/> },
  fuel_consumption: { label: 'استهلاك وقود', color: 'text-rose-600 bg-rose-50', icon: <Droplets size={14}/> },
  admin_expenses: { label: 'مصاريف إدارية', color: 'text-indigo-600 bg-indigo-50', icon: <Settings size={14}/> },
  other: { label: 'أخرى', color: 'text-gray-600 bg-gray-50', icon: <Plus size={14}/> },
};
