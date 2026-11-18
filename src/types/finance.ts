export type TransactionType = 'sale' | 'expense';

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'transfer' 
  | 'credit' 
  | 'binance' 
  | 'pagomovil' 
  | 'zelle';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all';

export type ExpenseCategory = 
  | 'Mercancía / Stock'
  | 'Alquiler del Local'
  | 'Servicios Públicos'
  | 'Sueldos / Nómina'
  | 'Publicidad & Marketing'
  | 'Transporte & Envíos'
  | 'Mantenimiento & Insumos'
  | 'Impuestos & Tasas'
  | 'Otros Gastos';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  concept: string;
  category: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerOrSupplier?: string;
  invoiceId?: string;
  notes?: string;
  receiptNumber?: string;
  originalCurrency?: 'USD' | 'VES' | 'EUR';
  originalAmount?: number;
  bcvUsdRateAtTx?: number;
  bcvEurRateAtTx?: number;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export interface Invoice {
  id: string;
  number: string; // e.g. FAC-001
  customerId: string;
  customerName: string;
  customerTaxId?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRatePercent: number; // e.g. 16 or 0
  taxAmount: number;
  total: number;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStockAlert: number;
  isAvailable: boolean;
  colorBg?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Debt {
  id: string;
  type: 'receivable' | 'payable'; // receivable = por cobrar (clientes), payable = por pagar (proveedores)
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  createdAt: string;
  notes?: string;
  status: 'pending' | 'partially_paid' | 'paid';
  history: DebtPayment[];
  relatedInvoiceId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  taxId?: string;
  address?: string;
  category?: string; // e.g. 'Frecuente', 'Mayorista', 'Minorista', 'VIP'
  creditLimit?: number;
  creditDays?: number;
  notes?: string;
  colorBg?: string;
  totalPurchases: number;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  taxId?: string;
}

export interface BCVRates {
  usdRate: number;        // Bolívares por USD (BCV oficial)
  eurRate: number;        // Bolívares por EUR (BCV oficial)
  paraleloRate?: number;  // Bolívares por USD (Paralelo / DolarToday)
  lastUpdated: string;    // Fecha y hora formateada
  source: string;
  isLive: boolean;
}

export interface BusinessProfile {
  name: string;
  ownerName: string;
  role: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  logoText: string;
  isBcvModeEnabled?: boolean;
  primaryDisplayCurrency?: 'USD' | 'VES' | 'EUR';
  businessCategory?: string;
  description?: string;
}

export interface MonthlyPAndL {
  monthKey: string; // YYYY-MM
  monthName: string;
  grossSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  expensesByCategory: Record<string, number>;
  netProfit: number;
  netMarginPercent: number;
  cashFlowIn: number;
  cashFlowOut: number;
  netCashFlow: number;
  vsPrevMonthNetCashFlowPercent: number;
}

export interface BusinessAccount {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  iconType: 'grid' | 'shirt' | 'store';
  profile: BusinessProfile;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  customerName: string;
  customerPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  date: string;
  validUntil: string;
  notes?: string;
}

export type UserRole = 'superadmin' | 'owner' | 'employee' | 'user';
export type UserPlan = 'free' | 'pro' | 'unlimited';
export type UserStatus = 'active' | 'banned';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  businessName: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
}

export interface PlatformPlansConfig {
  monthlyPrice: number;
  annualPrice: number;
  discountPercent: number;
  currencySymbol?: string;
}

export interface FeatureAccessItem {
  id: string;
  name: string;
  title: string;
  description: string;
  isPremium: boolean;
  category: 'operaciones' | 'ventas' | 'inventario' | 'contabilidad';
}


