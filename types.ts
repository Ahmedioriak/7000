
export type TransactionType = 'in' | 'out';
export type TransactionCategory = 'salary' | 'materials' | 'client_payment' | 'fuel' | 'fuel_consumption' | 'admin_expenses' | 'other';

export interface Project {
  id: string;
  name: string;
  code: string;
  contractValue: number;      // القيمة الأساسية
  extraWorkValue: number;     // قيمة الأعمال الإضافية
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  status: 'active' | 'completed' | 'on-hold';
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;             // المبلغ للبنود
  stageCode?: string;         // كود المرحلة الاختياري
}

export interface Transaction {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  taxAmount?: number;         // مبلغ الضريبة (VAT)
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  supplier?: string;          // اسم المورد
  referenceCode?: string;     // كود الرصيد / المرجع
  isBankVerified?: boolean;   // التحقق البنكي - ضروري قبل الرصيد
  attachment?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  date: Date;
  isRead: boolean;
}

export interface DashboardStats {
  totalProfit: number;
  activeProjectsCount: number;
  totalSalaries: number;
  totalFuel: number;          // إجمالي المحروقات
  totalIncome: number;
  totalExpenses: number;
  totalContractValue: number; // إجمالي قيم العقود
  totalRemainingBalance: number; // إجمالي المبالغ المتبقية عند العملاء
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  date: string;
  amount: number;             // الإجمالي (مجموع البنود)
  description: string;        // وصف عام
  items: InvoiceItem[];       // بنود الفاتورة
  status: 'draft' | 'sent' | 'paid';
  stage?: string;             
  taxPercentage?: number;     
  taxAmount?: number;         
}

export interface CompanySettings {
  companyName: string;
  crNumber: string;           
  vatNumber?: string;         
  address: string;
  phone: string;
  email: string;
  logo?: string;              
  bankName?: string;
  iban?: string;
}
