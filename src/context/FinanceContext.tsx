import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialBusinessAccounts,
  initialBusinessProfile,
  initialCustomers,
  initialDebts,
  initialFeatureAccess,
  initialInvoices,
  initialPlansConfig,
  initialProducts,
  initialSuppliers,
  initialTransactions,
  initialUsers,
} from '../data/initialData';
import {
  BCVRates,
  BusinessAccount,
  BusinessProfile,
  Customer,
  Debt,
  FeatureAccessItem,
  Invoice,
  MonthlyPAndL,
  PeriodType,
  PlatformPlansConfig,
  Product,
  Quote,
  Supplier,
  Transaction,
  UserAccount,
  UserPlan,
} from '../types/finance';
import {
  fetchLiveBCVRates,
  getCachedBCVRates,
  convertCurrency,
  formatBcvCurrency,
  getCurrencyBreakdown,
  CurrencyBreakdown,
} from '../services/bcvService';

interface FinanceContextType {
  profile: BusinessProfile;
  updateProfile: (updates: Partial<BusinessProfile>) => void;
  businessAccounts: BusinessAccount[];
  activeAccountId: string;
  switchBusinessAccount: (id: string) => void;
  addBusinessAccount: (name: string, role?: string, iconType?: 'grid' | 'shirt' | 'store') => void;
  updateBusinessAccount: (id: string, updates: Partial<BusinessProfile>) => void;
  
  products: Product[];
  categories: string[];
  addCategory: (categoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, newStock: number) => void;
  isCreateProductModalOpen: boolean;
  setIsCreateProductModalOpen: (open: boolean) => void;
  openCreateProductModal: (onProductCreated?: (p: Product) => void) => void;
  
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'time'> & { time?: string }) => void;
  deleteTransaction: (id: string) => void;
  
  invoices: Invoice[];
  createInvoice: (inv: Omit<Invoice, 'id' | 'number'> & { customNumber?: string }) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;

  quotes: Quote[];
  createQuote: (quote: Omit<Quote, 'id' | 'number'>) => Quote;
  deleteQuote: (id: string) => void;
  
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'history'>) => void;
  recordDebtPayment: (debtId: string, amount: number, notes?: string) => void;
  recordContactPayment: (contactName: string, type: 'receivable' | 'payable', amount: number, notes?: string) => void;
  deleteDebt: (id: string) => void;
  deleteContactDebts: (contactName: string, type: 'receivable' | 'payable') => void;
  
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'totalPurchases'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  customerCategories: string[];
  addCustomerCategory: (categoryName: string) => void;
  deleteCustomerCategory: (categoryName: string) => void;
  isCreateCustomerModalOpen: boolean;
  setIsCreateCustomerModalOpen: (open: boolean) => void;
  openCreateCustomerModal: (onCustomerCreated?: (c: Customer) => void) => void;
  suppliers: Supplier[];
  addSupplier: (supp: Omit<Supplier, 'id'>) => Supplier;
  
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedPeriod: import('../types/finance').PeriodType;
  setSelectedPeriod: (period: import('../types/finance').PeriodType) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;
  activeTab: 'inicio' | 'balance' | 'facturas' | 'deudas' | 'inventario' | 'reportes' | 'flujocaja' | 'clientes';
  setActiveTab: (tab: 'inicio' | 'balance' | 'facturas' | 'deudas' | 'inventario' | 'reportes' | 'flujocaja' | 'clientes') => void;
  isMobileFramed: boolean;
  setIsMobileFramed: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Modals state
  isSaleTypeSelectorOpen: boolean;
  setIsSaleTypeSelectorOpen: (open: boolean) => void;
  isProductSaleSelectorOpen: boolean;
  setIsProductSaleSelectorOpen: (open: boolean) => void;
  isFreeSaleModalOpen: boolean;
  setIsFreeSaleModalOpen: (open: boolean) => void;
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  isAccountsModalOpen: boolean;
  setIsAccountsModalOpen: (open: boolean) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  isPeriodModalOpen: boolean;
  setIsPeriodModalOpen: (open: boolean) => void;
  isBalanceDetailOpen: boolean;
  setIsBalanceDetailOpen: (open: boolean) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isLocalFirstBackupModalOpen: boolean;
  setIsLocalFirstBackupModalOpen: (open: boolean) => void;
  selectedInvoiceForPreview: Invoice | null;
  setSelectedInvoiceForPreview: (inv: Invoice | null) => void;

  // Old Company PDF Import & Onboarding
  isImportOldCompanyModalOpen: boolean;
  setIsImportOldCompanyModalOpen: (open: boolean) => void;
  isBusinessOnboardingOpen: boolean;
  setIsBusinessOnboardingOpen: (open: boolean) => void;
  importOldCompanyData: (payload: {
    companyName?: string;
    dateRange?: { start: string; end: string };
    customers?: Customer[];
    products?: Product[];
    debts?: Debt[];
    transactions?: Transaction[];
    replaceExisting?: boolean;
  }) => { success: boolean; imported: { customers: number; products: number; debts: number; transactions: number } };

  // Auth & Multi-user state
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  register: (fullName: string, businessName: string, email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;

  // Super Admin Controls
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  plansConfig: PlatformPlansConfig;
  updatePlansConfig: (updates: Partial<PlatformPlansConfig>) => void;
  featureAccess: FeatureAccessItem[];
  toggleFeaturePremium: (featureId: string) => void;
  updateUserPlan: (userId: string, plan: UserPlan) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Premium lock & upgrade modal
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  upgradeFeatureTarget: FeatureAccessItem | null;
  setUpgradeFeatureTarget: (f: FeatureAccessItem | null) => void;
  checkFeatureAccess: (featureId: string) => boolean;
  upgradeCurrentUserToPro: () => void;


  // Derived financial analytics
  todaySales: number;
  todayExpenses: number;
  todayBalance: number;
  yesterdaySales: number;
  vsYesterdayPercent: number;
  totalReceivables: number;
  totalPayables: number;
  totalInventoryCost: number;
  totalInventoryRetailValue: number;
  totalInventoryCount: number;
  monthlyPAndL: MonthlyPAndL;
  prevMonthPAndL: MonthlyPAndL;
  sixMonthsPAndL: MonthlyPAndL[];
  // Venezuelan BCV Currency & Conversions
  bcvRates: BCVRates;
  isBcvLoading: boolean;
  refreshBcvRates: () => Promise<void>;
  isBcvModeEnabled: boolean;
  toggleBcvMode: (enabled?: boolean) => void;
  primaryDisplayCurrency: 'USD' | 'EUR';
  setPrimaryDisplayCurrency: (curr: 'USD' | 'EUR') => void;
  convertAmount: (amount: number, from: 'USD' | 'VES' | 'EUR', to: 'USD' | 'VES' | 'EUR') => number;
  formatBcv: (amount: number, currency?: 'USD' | 'VES' | 'EUR') => string;
  getBreakdown: (amountInUSD: number) => CurrencyBreakdown;

  formatCurrency: (amount: number, forceCurrency?: 'USD' | 'VES' | 'EUR') => string;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'treinta_finance_profile_v3',
  ACCOUNTS: 'treinta_finance_accounts_v3',
  ACTIVE_ACCOUNT: 'treinta_finance_active_account_v3',
  PRODUCTS: 'treinta_finance_products_v3',
  TRANSACTIONS: 'treinta_finance_transactions_v2',
  INVOICES: 'treinta_finance_invoices_v2',
  QUOTES: 'treinta_finance_quotes_v2',
  DEBTS: 'treinta_finance_debts_v2',
  CUSTOMERS: 'treinta_finance_customers_v2',
  SUPPLIERS: 'treinta_finance_suppliers_v2',
  MOBILE_MODE: 'treinta_finance_mobile_mode_v2',
  USERS: 'treinta_finance_users_v3',
  CURRENT_USER: 'treinta_finance_current_user_v3',
  PLANS_CONFIG: 'treinta_finance_plans_config_v3',
  FEATURE_ACCESS: 'treinta_finance_feature_access_v3',
  CATEGORIES: 'treinta_finance_categories_v3',
  CUSTOMER_CATEGORIES: 'treinta_finance_customer_categories_v3',
};

// Ensure Ysbeshop / Ysbelia Rojas full historical PDF data is pre-seeded in localStorage
const YSBELIA_PDF_MIGRATION_KEY = 'fino_ysbelia_pdf_loaded_v6';
if (typeof window !== 'undefined' && localStorage.getItem(YSBELIA_PDF_MIGRATION_KEY) !== 'true') {
  try {
    localStorage.setItem(YSBELIA_PDF_MIGRATION_KEY, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialUsers[0]));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialBusinessProfile));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialBusinessAccounts));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, 'acc-ysbelia-1');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(initialDebts));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_profile', JSON.stringify(initialBusinessProfile));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_accounts', JSON.stringify(initialBusinessAccounts));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_products', JSON.stringify(initialProducts));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_transactions', JSON.stringify(initialTransactions));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_debts', JSON.stringify(initialDebts));
    localStorage.setItem('treinta_usr_usr-ysbelia-1_customers', JSON.stringify(initialCustomers));
  } catch (e) {
    // Ignore storage errors
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users and Auth State: ysbeliarojas79@gmail.com is normal user ('user'), only luis31garciarojas@gmail.com is admin
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let list: UserAccount[] = saved ? JSON.parse(saved) : initialUsers;
    list = list.map(u => {
      const email = u.email.toLowerCase().trim();
      if (email === 'ysbeliarojas79@gmail.com') {
        return { ...u, role: 'user', passwordHash: '12345678' };
      }
      if (email === 'luis31garciarojas@gmail.com') {
        return { ...u, role: 'superadmin', plan: 'unlimited', passwordHash: '12345678' };
      }
      if (u.role === 'superadmin') {
        return { ...u, role: 'user' };
      }
      return u;
    });
    if (!list.some(u => u.email.toLowerCase().trim() === 'ysbeliarojas79@gmail.com')) {
      list.push(initialUsers[0]);
    }
    if (!list.some(u => u.email.toLowerCase().trim() === 'luis31garciarojas@gmail.com')) {
      list.push(initialUsers[1]);
    }
    return list;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.email) {
          const email = u.email.toLowerCase().trim();
          if (email === 'ysbeliarojas79@gmail.com') {
            return { ...u, role: 'user', passwordHash: '12345678' };
          }
          if (email === 'luis31garciarojas@gmail.com') {
            return { ...u, role: 'superadmin', plan: 'unlimited', passwordHash: '12345678' };
          }
          if (u.role === 'superadmin') {
            return { ...u, role: 'user' };
          }
          return u;
        }
      } catch (e) {
        return null;
      }
    }
    // Default directly to Ysbelia Rojas account (usuario normal)
    return initialUsers[0];
  });

  const [plansConfig, setPlansConfig] = useState<PlatformPlansConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS_CONFIG);
    return saved ? JSON.parse(saved) : initialPlansConfig;
  });

  const [featureAccess, setFeatureAccess] = useState<FeatureAccessItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEATURE_ACCESS);
    return saved ? JSON.parse(saved) : initialFeatureAccess;
  });

  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : initialBusinessAccounts;
  });

  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT);
    return saved || 'acc-ysbelia-1';
  });

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
    const activeAcc = initialBusinessAccounts.find(a => a.id === 'acc-ysbelia-1');
    return activeAcc ? activeAcc.profile : initialBusinessProfile;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const defaultCategories = [
    'Perfumería',
    'Ropa',
    'Comida',
    'Calzado',
    'Accesorios',
    'Belleza',
    'Bebidas',
    'Tecnología',
  ];

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    const fromProds = initialProducts.map(p => p.category);
    return Array.from(new Set([...defaultCategories, ...fromProds]));
  });

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [productCreatedCallback, setProductCreatedCallback] = useState<((p: Product) => void) | null>(null);

  const openCreateProductModal = (onProductCreated?: (p: Product) => void) => {
    if (onProductCreated) {
      setProductCreatedCallback(() => onProductCreated);
    } else {
      setProductCreatedCallback(null);
    }
    setIsCreateProductModalOpen(true);
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCategories(prev => {
      if (prev.some(c => c.toLowerCase() === formatted.toLowerCase())) {
        return prev;
      }
      const next = [...prev, formatted];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      return next;
    });
  };

  const deleteCategory = (categoryName: string) => {
    const trimmed = categoryName.trim().toLowerCase();
    setCategories(prev => {
      const next = prev.filter(c => c.toLowerCase() !== trimmed);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      return next;
    });
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    const trimmedNew = newCategory.trim();
    if (!trimmedNew) return;
    const formatted = trimmedNew.charAt(0).toUpperCase() + trimmedNew.slice(1);
    
    setCategories(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== oldCategory.trim().toLowerCase());
      if (filtered.some(c => c.toLowerCase() === formatted.toLowerCase())) {
        return filtered;
      }
      return [...filtered, formatted];
    });

    setProducts(prev =>
      prev.map(p =>
        p.category.toLowerCase() === oldCategory.trim().toLowerCase()
          ? { ...p, category: formatted }
          : p
      )
    );
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : initialDebts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const defaultCustomerCategories = ['Frecuente', 'Mayorista', 'Minorista', 'VIP', 'Nuevo'];
  const [customerCategories, setCustomerCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultCustomerCategories;
  });

  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [customerCreatedCallback, setCustomerCreatedCallback] = useState<((c: Customer) => void) | null>(null);

  const openCreateCustomerModal = (onCustomerCreated?: (c: Customer) => void) => {
    if (onCustomerCreated) {
      setCustomerCreatedCallback(() => onCustomerCreated);
    } else {
      setCustomerCreatedCallback(null);
    }
    setIsCreateCustomerModalOpen(true);
  };

  const addCustomerCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCustomerCategories(prev => {
      if (prev.some(c => c.toLowerCase() === formatted.toLowerCase())) return prev;
      const next = [...prev, formatted];
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_CATEGORIES, JSON.stringify(next));
      return next;
    });
  };

  const deleteCustomerCategory = (categoryName: string) => {
    const trimmed = categoryName.trim().toLowerCase();
    setCustomerCategories(prev => {
      const next = prev.filter(c => c.toLowerCase() !== trimmed);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_CATEGORIES, JSON.stringify(next));
      return next;
    });
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  // Selected date matching PDF report generation date: '2026-11-18'
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-18');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '2026-09-12',
    end: '2026-11-18',
  });
  const [activeTab, setActiveTab] = useState<'inicio' | 'balance' | 'facturas' | 'deudas' | 'inventario' | 'reportes' | 'flujocaja' | 'clientes'>('inicio');
  const [isMobileFramed, setIsMobileFramed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOBILE_MODE);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Modals & Navigation state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureTarget, setUpgradeFeatureTarget] = useState<FeatureAccessItem | null>(null);

  const [isSaleTypeSelectorOpen, setIsSaleTypeSelectorOpen] = useState(false);
  const [isProductSaleSelectorOpen, setIsProductSaleSelectorOpen] = useState(false);
  const [isFreeSaleModalOpen, setIsFreeSaleModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isBalanceDetailOpen, setIsBalanceDetailOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLocalFirstBackupModalOpen, setIsLocalFirstBackupModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);

  // Old Company Import & Business Onboarding
  const [isImportOldCompanyModalOpen, setIsImportOldCompanyModalOpen] = useState(false);
  const [isBusinessOnboardingOpen, setIsBusinessOnboardingOpen] = useState(false);

  // BCV and Multicurrency (Venezuela) State
  const [bcvRates, setBcvRates] = useState<BCVRates>(() => getCachedBCVRates());
  const [isBcvLoading, setIsBcvLoading] = useState(false);

  const refreshBcvRates = async () => {
    setIsBcvLoading(true);
    try {
      const fresh = await fetchLiveBCVRates();
      setBcvRates(fresh);
    } catch (e) {
      console.warn('Error fetching live BCV rates:', e);
    } finally {
      setIsBcvLoading(false);
    }
  };

  useEffect(() => {
    refreshBcvRates();
  }, []);

  const isBcvModeEnabled = Boolean(profile.isBcvModeEnabled);

  const toggleBcvMode = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isBcvModeEnabled;
    updateProfile({
      isBcvModeEnabled: nextVal,
      primaryDisplayCurrency: profile.primaryDisplayCurrency || 'USD',
    });
  };

  const primaryDisplayCurrency: 'USD' | 'EUR' = profile.primaryDisplayCurrency === 'EUR' ? 'EUR' : 'USD';

  const setPrimaryDisplayCurrency = (curr: 'USD' | 'EUR') => {
    updateProfile({ primaryDisplayCurrency: curr });
  };

  const convertAmount = (amount: number, from: 'USD' | 'VES' | 'EUR', to: 'USD' | 'VES' | 'EUR') => {
    return convertCurrency(amount, from, to, bcvRates);
  };

  const formatBcv = (amount: number, currency: 'USD' | 'VES' | 'EUR' = 'USD') => {
    return formatBcvCurrency(amount, currency);
  };

  const getBreakdown = (amountInUSD: number): CurrencyBreakdown => {
    return getCurrencyBreakdown(amountInUSD, primaryDisplayCurrency, bcvRates);
  };

  // User Data Isolation Loader
  const loadUserDataForUser = (targetUser: UserAccount) => {
    const isYsbelia = targetUser.email.toLowerCase() === 'ysbeliarojas79@gmail.com' || targetUser.id === 'usr-ysbelia-1';
    const isDefaultAdmin = targetUser.id === 'usr-admin-1';

    // 1. Profile
    const savedProf = localStorage.getItem(`treinta_usr_${targetUser.id}_profile`);
    let loadedProf: BusinessProfile;
    if (savedProf) {
      loadedProf = JSON.parse(savedProf);
    } else if (isYsbelia) {
      loadedProf = initialBusinessProfile;
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.PROFILE);
      loadedProf = leg ? JSON.parse(leg) : initialBusinessProfile;
    } else {
      loadedProf = {
        name: targetUser.businessName,
        ownerName: targetUser.fullName,
        role: 'Propietario',
        taxId: '',
        phone: '',
        email: targetUser.email,
        address: '',
        currency: 'USD',
        currencySymbol: '$',
        logoText: targetUser.businessName.slice(0, 2).toUpperCase(),
        isBcvModeEnabled: true,
        primaryDisplayCurrency: 'USD',
      };
    }
    setProfile(loadedProf);

    // 2. Products
    const savedProds = localStorage.getItem(`treinta_usr_${targetUser.id}_products`);
    if (savedProds) {
      setProducts(JSON.parse(savedProds));
    } else if (isYsbelia) {
      setProducts(initialProducts);
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      setProducts(leg ? JSON.parse(leg) : initialProducts);
    } else {
      setProducts([]);
    }

    // 3. Transactions
    const savedTx = localStorage.getItem(`treinta_usr_${targetUser.id}_transactions`);
    if (savedTx) {
      setTransactions(JSON.parse(savedTx));
    } else if (isYsbelia) {
      setTransactions(initialTransactions);
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      setTransactions(leg ? JSON.parse(leg) : initialTransactions);
    } else {
      setTransactions([]);
    }

    // 4. Invoices
    const savedInv = localStorage.getItem(`treinta_usr_${targetUser.id}_invoices`);
    if (savedInv) {
      setInvoices(JSON.parse(savedInv));
    } else {
      setInvoices([]);
    }

    // 5. Debts
    const savedDebts = localStorage.getItem(`treinta_usr_${targetUser.id}_debts`);
    if (savedDebts) {
      setDebts(JSON.parse(savedDebts));
    } else if (isYsbelia) {
      setDebts(initialDebts);
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.DEBTS);
      setDebts(leg ? JSON.parse(leg) : initialDebts);
    } else {
      setDebts([]);
    }

    // 6. Customers
    const savedCust = localStorage.getItem(`treinta_usr_${targetUser.id}_customers`);
    if (savedCust) {
      setCustomers(JSON.parse(savedCust));
    } else if (isYsbelia) {
      setCustomers(initialCustomers);
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      setCustomers(leg ? JSON.parse(leg) : initialCustomers);
    } else {
      setCustomers([]);
    }

    // 7. Categories
    const savedCats = localStorage.getItem(`treinta_usr_${targetUser.id}_categories`);
    if (savedCats) {
      setCategories(JSON.parse(savedCats));
    } else if (isYsbelia) {
      setCategories(Array.from(new Set([...defaultCategories, ...initialProducts.map(p => p.category)])));
    } else {
      setCategories(defaultCategories);
    }

    // 8. Accounts
    const savedAccs = localStorage.getItem(`treinta_usr_${targetUser.id}_accounts`);
    if (savedAccs) {
      const accList = JSON.parse(savedAccs);
      setBusinessAccounts(accList);
      setActiveAccountId(accList[0]?.id || `acc-${targetUser.id}`);
    } else if (isYsbelia) {
      setBusinessAccounts(initialBusinessAccounts);
      setActiveAccountId('acc-ysbelia-1');
    } else if (isDefaultAdmin) {
      const leg = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      setBusinessAccounts(leg ? JSON.parse(leg) : initialBusinessAccounts);
      setActiveAccountId('acc-galaxy-1');
    } else {
      const freshAcc: BusinessAccount[] = [
        {
          id: `acc-${targetUser.id}`,
          name: loadedProf.name,
          role: 'Propietario',
          lastActive: 'Hoy',
          iconType: 'store',
          profile: loadedProf,
        },
      ];
      setBusinessAccounts(freshAcc);
      setActiveAccountId(`acc-${targetUser.id}`);
    }
  };

  // Sync to isolated user storage & global state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_accounts`, JSON.stringify(businessAccounts));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(businessAccounts));
    }
  }, [businessAccounts, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_active_account`, activeAccountId);
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, activeAccountId);
    }
  }, [activeAccountId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_profile`, JSON.stringify(profile));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  }, [profile, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_products`, JSON.stringify(products));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }, [products, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_transactions`, JSON.stringify(transactions));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_invoices`, JSON.stringify(invoices));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    }
  }, [invoices, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_quotes`, JSON.stringify(quotes));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    }
  }, [quotes, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_debts`, JSON.stringify(debts));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    }
  }, [debts, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_customers`, JSON.stringify(customers));
      if (currentUser.id === 'usr-1') localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  }, [customers, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`treinta_usr_${currentUser.id}_categories`, JSON.stringify(categories));
    }
  }, [categories, currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS_CONFIG, JSON.stringify(plansConfig));
  }, [plansConfig]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEATURE_ACCESS, JSON.stringify(featureAccess));
  }, [featureAccess]);

  // Auth Functions
  const login = (email: string, password: string, rememberMe = true) => {
    const trimmedEmail = email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    // Guaranteed Ysbelia Rojas credentials handling (usuario normal, clave: 12345678)
    if (trimmedEmail === 'ysbeliarojas79@gmail.com') {
      if (!user) {
        user = initialUsers[0];
        setUsers(prev => [user!, ...prev.filter(u => u.email.toLowerCase() !== trimmedEmail)]);
      } else {
        user = {
          ...user,
          fullName: 'Ysbelia Rojas',
          businessName: 'Ysbeshop',
          role: 'user',
          plan: 'free',
          status: 'active',
          passwordHash: '12345678',
        };
      }
    }

    // Guaranteed admin credentials handling (único admin: luis31garciarojas@gmail.com, clave: 12345678)
    if (trimmedEmail === 'luis31garciarojas@gmail.com') {
      if (!user) {
        user = {
          id: 'usr-admin-1',
          email: 'luis31garciarojas@gmail.com',
          passwordHash: '12345678',
          fullName: 'Luis García',
          businessName: 'Galaxy store Luis',
          role: 'superadmin',
          plan: 'unlimited',
          status: 'active',
          createdAt: selectedDate,
          lastLogin: 'Hoy',
        };
        setUsers(prev => [user!, ...prev.filter(u => u.email.toLowerCase() !== trimmedEmail)]);
      } else {
        user = {
          ...user,
          role: 'superadmin',
          plan: 'unlimited',
          status: 'active',
          passwordHash: '12345678',
        };
      }
    }

    if (!user) {
      return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    // Check passwords specifically
    if (trimmedEmail === 'ysbeliarojas79@gmail.com') {
      if (password !== '12345678') {
        return { success: false, error: 'La contraseña ingresada es incorrecta. La clave para ysbeliarojas79@gmail.com es 12345678.' };
      }
    } else if (trimmedEmail === 'luis31garciarojas@gmail.com') {
      if (password !== '12345678') {
        return { success: false, error: 'La contraseña ingresada es incorrecta. La clave para luis31garciarojas@gmail.com es 12345678.' };
      }
    } else if (user.passwordHash !== password) {
      return { success: false, error: 'La contraseña ingresada es incorrecta.' };
    }

    if (user.status === 'banned') {
      return {
        success: false,
        error: 'Esta cuenta ha sido suspendida. Contacta a soporte.',
      };
    }

    const updatedUser: UserAccount = {
      ...user,
      lastLogin: 'Hoy',
    };

    setUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));
    loadUserDataForUser(updatedUser);
    setCurrentUser(updatedUser);

    if (trimmedEmail === 'ysbeliarojas79@gmail.com') {
      setIsBusinessOnboardingOpen(false);
    } else {
      setIsBusinessOnboardingOpen(true);
    }

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    return { success: true };
  };

  const register = (
    fullName: string,
    businessName: string,
    email: string,
    password: string,
    rememberMe = true
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!fullName.trim() || !businessName.trim() || !trimmedEmail || !password) {
      return { success: false, error: 'Por favor completa todos los campos requeridos.' };
    }

    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo.' };
    }

    const isTargetAdmin = trimmedEmail === 'luis31garciarojas@gmail.com';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      passwordHash: password,
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      role: isTargetAdmin ? 'superadmin' : 'user',
      plan: isTargetAdmin ? 'unlimited' : 'free',
      status: 'active',
      createdAt: selectedDate,
      lastLogin: 'Hoy',
    };

    setUsers(prev => [...prev, newUser]);
    loadUserDataForUser(newUser);
    setCurrentUser(newUser);
    setIsBusinessOnboardingOpen(true);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // El único usuario admin es luis31garciarojas@gmail.com
  const isAdmin = currentUser?.email?.toLowerCase().trim() === 'luis31garciarojas@gmail.com';

  // Admin Controls
  const updatePlansConfig = (updates: Partial<PlatformPlansConfig>) => {
    setPlansConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleFeaturePremium = (featureId: string) => {
    setFeatureAccess(prev =>
      prev.map(f => (f.id === featureId ? { ...f, isPremium: !f.isPremium } : f))
    );
  };

  const updateUserPlan = (userId: string, plan: UserPlan) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, plan } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser(prev => (prev ? { ...prev, plan } : null));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'active' ? 'banned' : 'active';
        return { ...u, status: newStatus as UserAccount['status'] };
      })
    );
    if (currentUser?.id === userId) {
      logout();
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
  };

  const checkFeatureAccess = (featureId: string): boolean => {
    // If superadmin or has pro/unlimited plan, always authorized
    if (currentUser?.role === 'superadmin' || currentUser?.plan === 'unlimited' || currentUser?.plan === 'pro') {
      return true;
    }

    const feature = featureAccess.find(f => f.id === featureId);
    if (!feature || !feature.isPremium) {
      return true;
    }

    // Is premium and user is on free plan: open upgrade modal!
    setUpgradeFeatureTarget(feature);
    setIsUpgradeModalOpen(true);
    return false;
  };

  const upgradeCurrentUserToPro = () => {
    if (currentUser) {
      updateUserPlan(currentUser.id, 'pro');
      setIsUpgradeModalOpen(false);
    }
  };

  const importOldCompanyData = (payload: {
    companyName?: string;
    dateRange?: { start: string; end: string };
    customers?: Customer[];
    products?: Product[];
    debts?: Debt[];
    transactions?: Transaction[];
    replaceExisting?: boolean;
  }) => {
    const {
      companyName,
      dateRange,
      customers: newCust = [],
      products: newProd = [],
      debts: newDebts = [],
      transactions: newTxs = [],
      replaceExisting = false,
    } = payload;

    if (replaceExisting) {
      if (newCust.length) setCustomers(newCust);
      if (newProd.length) setProducts(newProd);
      if (newDebts.length) setDebts(newDebts);
      if (newTxs.length) setTransactions(newTxs);
    } else {
      // Merge customers
      if (newCust.length) {
        setCustomers(prev => {
          const existingNames = new Set(prev.map(c => c.name.toLowerCase().trim()));
          const toAdd = newCust.filter(c => !existingNames.has(c.name.toLowerCase().trim()));
          return [...prev, ...toAdd];
        });
      }

      // Merge products
      if (newProd.length) {
        setProducts(prev => {
          const existingNames = new Set(prev.map(p => p.name.toLowerCase().trim()));
          const toAdd = newProd.filter(p => !existingNames.has(p.name.toLowerCase().trim()));
          return [...prev, ...toAdd];
        });
      }

      // Merge debts
      if (newDebts.length) {
        setDebts(prev => {
          const existingIds = new Set(prev.map(d => d.id));
          const toAdd = newDebts.filter(d => !existingIds.has(d.id));
          return [...prev, ...toAdd];
        });
      }

      // Merge transactions
      if (newTxs.length) {
        setTransactions(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const toAdd = newTxs.filter(t => !existingIds.has(t.id));
          return [...toAdd, ...prev];
        });
      }
    }

    if (companyName && companyName.trim()) {
      updateProfile({ name: companyName.trim() });
    }

    if (dateRange?.end) {
      setSelectedDate(dateRange.end);
    }
    if (dateRange?.start && dateRange?.end) {
      setCustomDateRange({ start: dateRange.start, end: dateRange.end });
    }

    return {
      success: true,
      imported: {
        customers: newCust.length,
        products: newProd.length,
        debts: newDebts.length,
        transactions: newTxs.length,
      },
    };
  };

  const updateProfile = (updates: Partial<BusinessProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      setBusinessAccounts(accs =>
        accs.map(a => (a.id === activeAccountId ? { ...a, name: updated.name, profile: updated } : a))
      );
      return updated;
    });
  };

  const switchBusinessAccount = (id: string) => {
    const acc = businessAccounts.find(a => a.id === id);
    if (acc) {
      setActiveAccountId(acc.id);
      setProfile(acc.profile);
      // update last active
      setBusinessAccounts(prev =>
        prev.map(a => (a.id === id ? { ...a, lastActive: 'Ahora' } : a))
      );
    }
  };

  const addBusinessAccount = (name: string, role = 'Propietario', iconType: 'grid' | 'shirt' | 'store' = 'store') => {
    const newId = `acc-${Date.now()}`;
    const newProfile: BusinessProfile = {
      ...profile,
      name,
      role,
      logoText: name.slice(0, 2).toUpperCase(),
    };
    const newAccount: BusinessAccount = {
      id: newId,
      name,
      role,
      lastActive: 'Hoy',
      iconType,
      profile: newProfile,
    };
    setBusinessAccounts(prev => [...prev, newAccount]);
    setActiveAccountId(newId);
    setProfile(newProfile);
  };

  const updateBusinessAccount = (id: string, updates: Partial<BusinessProfile>) => {
    setBusinessAccounts(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const updatedProf = { ...a.profile, ...updates };
        return {
          ...a,
          name: updatedProf.name,
          role: updatedProf.role,
          profile: updatedProf,
        };
      })
    );
    if (id === activeAccountId) {
      setProfile(prev => ({ ...prev, ...updates }));
    }
  };

  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);

    if (prodData.category) {
      const cat = prodData.category.trim();
      if (cat && !categories.some(c => c.toLowerCase() === cat.toLowerCase())) {
        addCategory(cat);
      }
    }

    if (productCreatedCallback) {
      productCreatedCallback(newProduct);
      setProductCreatedCallback(null);
    }
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        updated.isAvailable = updated.stock > 0;
        return updated;
      })
    );
    if (updates.category) {
      const cat = updates.category.trim();
      if (cat && !categories.some(c => c.toLowerCase() === cat.toLowerCase())) {
        addCategory(cat);
      }
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, stock: Math.max(0, newStock), isAvailable: newStock > 0 } : p
      )
    );
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'time'> & { time?: string }) => {
    const now = new Date();
    const timeStr = txData.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      time: timeStr,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'number'> & { customNumber?: string }): Invoice => {
    const invoiceCount = invoices.length + 1;
    const invNumber = invData.customNumber || `FAC-${String(invoiceCount).padStart(3, '0')}`;
    
    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      number: invNumber,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // If invoice is created as paid, register automatic sale transaction
    if (newInvoice.status === 'paid') {
      addTransaction({
        type: 'sale',
        amount: newInvoice.total,
        concept: `Factura ${newInvoice.number} - ${newInvoice.customerName}`,
        category: 'Facturación Automática',
        paymentMethod: newInvoice.paymentMethod,
        date: newInvoice.issueDate,
        customerOrSupplier: newInvoice.customerName,
        invoiceId: newInvoice.number,
      });
    } else if (newInvoice.paymentMethod === 'credit' || newInvoice.status === 'pending') {
      // Automatically register account receivable in debts
      addDebt({
        type: 'receivable',
        contactName: newInvoice.customerName,
        contactPhone: newInvoice.customerPhone || '',
        contactEmail: newInvoice.customerEmail,
        totalAmount: newInvoice.total,
        dueDate: newInvoice.dueDate,
        createdAt: newInvoice.issueDate,
        notes: `Factura pendiente ${newInvoice.number}`,
        relatedInvoiceId: newInvoice.number,
      });
    }

    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== id) return inv;
        if (status === 'paid' && inv.status !== 'paid') {
          addTransaction({
            type: 'sale',
            amount: inv.total,
            concept: `Cobro Factura ${inv.number} - ${inv.customerName}`,
            category: 'Cobro de Facturas',
            paymentMethod: inv.paymentMethod,
            date: selectedDate,
            customerOrSupplier: inv.customerName,
            invoiceId: inv.number,
          });
        }
        return { ...inv, status };
      })
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const createQuote = (quoteData: Omit<Quote, 'id' | 'number'>): Quote => {
    const quoteCount = quotes.length + 1;
    const quoteNumber = `COT-${String(quoteCount).padStart(3, '0')}`;
    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      number: quoteNumber,
    };
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const addDebt = (debtData: Omit<Debt, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'history'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: `debt-${Date.now()}`,
      paidAmount: 0,
      remainingAmount: debtData.totalAmount,
      status: 'pending',
      history: [],
    };
    setDebts(prev => [newDebt, ...prev]);
  };

  const recordDebtPayment = (debtId: string, amount: number, notes?: string) => {
    setDebts(prev =>
      prev.map(d => {
        if (d.id !== debtId) return d;
        const newPaid = d.paidAmount + amount;
        const newRemaining = Math.max(0, d.totalAmount - newPaid);
        const newStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';
        const paymentRecord = {
          id: `pay-${Date.now()}`,
          amount,
          date: selectedDate,
          notes: notes || 'Abono registrado',
        };

        if (d.type === 'receivable') {
          addTransaction({
            type: 'sale',
            amount,
            concept: `Abono de deuda: ${d.contactName}`,
            category: 'Cobro de Deudas',
            paymentMethod: 'cash',
            date: selectedDate,
            customerOrSupplier: d.contactName,
          });
        } else {
          addTransaction({
            type: 'expense',
            amount,
            concept: `Pago de deuda proveedor: ${d.contactName}`,
            category: 'Pago de Deudas',
            paymentMethod: 'cash',
            date: selectedDate,
            customerOrSupplier: d.contactName,
          });
        }

        return {
          ...d,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          history: [paymentRecord, ...d.history],
        };
      })
    );
  };

  const recordContactPayment = (
    contactName: string,
    type: 'receivable' | 'payable',
    amount: number,
    notes?: string
  ) => {
    const normName = contactName.trim().toLowerCase();
    let remainingAbono = amount;
    const payId = `pay-${Date.now()}`;

    setDebts(prev => {
      // Find all debts for this contact with the specified type
      const contactDebts = prev.filter(
        d => d.type === type && d.contactName.trim().toLowerCase() === normName
      );

      if (contactDebts.length === 0) return prev;

      // Oldest pending debts first
      const pendingDebts = contactDebts
        .filter(d => d.remainingAmount > 0)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      const updatedMap: Record<string, Debt> = {};

      for (const debt of pendingDebts) {
        if (remainingAbono <= 0) {
          updatedMap[debt.id] = debt;
          continue;
        }

        const payPortion = Math.min(debt.remainingAmount, remainingAbono);
        remainingAbono -= payPortion;
        const newPaid = debt.paidAmount + payPortion;
        const newRemaining = Math.max(0, debt.totalAmount - newPaid);
        const newStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';

        updatedMap[debt.id] = {
          ...debt,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          history: [
            {
              id: `${payId}-${debt.id}`,
              amount: payPortion,
              date: selectedDate,
              notes: notes || 'Abono registrado a cuenta',
            },
            ...debt.history,
          ],
        };
      }

      // If overpayment remains, apply to the newest debt
      if (remainingAbono > 0 && contactDebts.length > 0) {
        const lastDebt = updatedMap[contactDebts[contactDebts.length - 1].id] || contactDebts[contactDebts.length - 1];
        const newPaid = lastDebt.paidAmount + remainingAbono;
        const newRemaining = Math.max(0, lastDebt.totalAmount - newPaid);
        updatedMap[lastDebt.id] = {
          ...lastDebt,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: 'paid',
          history: [
            {
              id: `${payId}-overpay`,
              amount: remainingAbono,
              date: selectedDate,
              notes: notes || 'Abono registrado a cuenta',
            },
            ...lastDebt.history,
          ],
        };
      }

      return prev.map(d => updatedMap[d.id] || d);
    });

    // Also register in ledger transactions
    if (type === 'receivable') {
      addTransaction({
        type: 'sale',
        amount,
        concept: `Abono recibido de cliente: ${contactName}`,
        category: 'Cobro de Deudas',
        paymentMethod: 'cash',
        date: selectedDate,
        customerOrSupplier: contactName,
      });
    } else {
      addTransaction({
        type: 'expense',
        amount,
        concept: `Pago a proveedor: ${contactName}`,
        category: 'Pago de Deudas',
        paymentMethod: 'cash',
        date: selectedDate,
        customerOrSupplier: contactName,
      });
    }
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const deleteContactDebts = (contactName: string, type: 'receivable' | 'payable') => {
    const norm = contactName.trim().toLowerCase();
    setDebts(prev => prev.filter(d => !(d.type === type && d.contactName.trim().toLowerCase() === norm)));
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'totalPurchases'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      createdAt: custData.createdAt || selectedDate,
    };
    setCustomers(prev => [newCust, ...prev]);

    if (custData.category) {
      addCustomerCategory(custData.category);
    }

    if (customerCreatedCallback) {
      customerCreatedCallback(newCust);
      setCustomerCreatedCallback(null);
    }
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        return { ...c, ...updates };
      })
    );
    if (updates.category) {
      addCustomerCategory(updates.category);
    }
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = (suppData: Omit<Supplier, 'id'>): Supplier => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp-${Date.now()}`,
    };
    setSuppliers(prev => [...prev, newSupp]);
    return newSupp;
  };

  const resetAllData = () => {
    setProfile(initialBusinessProfile);
    setProducts([]);
    setTransactions([]);
    setInvoices([]);
    setQuotes([]);
    setDebts([]);
    setCustomers([]);
    setSuppliers([]);
    setBusinessAccounts(initialBusinessAccounts);
    setActiveAccountId('acc-1');
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  };

  const formatCurrency = (amount: number, forceCurrency?: 'USD' | 'VES' | 'EUR'): string => {
    if (forceCurrency) {
      return formatBcvCurrency(amount, forceCurrency);
    }
    if (isBcvModeEnabled) {
      if (primaryDisplayCurrency === 'EUR') {
        const inEUR = convertCurrency(amount, 'USD', 'EUR', bcvRates);
        return formatBcvCurrency(inEUR, 'EUR');
      }
      return formatBcvCurrency(amount, 'USD');
    }
    return `${profile.currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Day-specific metrics
  const { todaySales, todayExpenses, todayBalance, yesterdaySales, vsYesterdayPercent } = useMemo(() => {
    const todayTx = transactions.filter(t => t.date === selectedDate);
    const sales = todayTx.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = todayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = sales - expenses;

    const currDateObj = new Date(`${selectedDate}T12:00:00Z`);
    const prevDateObj = new Date(currDateObj);
    prevDateObj.setUTCDate(prevDateObj.getUTCDate() - 1);
    const prevDateStr = prevDateObj.toISOString().split('T')[0];

    const yesterdayTx = transactions.filter(t => t.date === prevDateStr);
    const ySales = yesterdayTx.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);

    let diffPercent = 0;
    if (ySales > 0) {
      diffPercent = ((sales - ySales) / ySales) * 100;
    } else if (sales > 0) {
      diffPercent = 100;
    }

    return {
      todaySales: sales,
      todayExpenses: expenses,
      todayBalance: balance,
      yesterdaySales: ySales,
      vsYesterdayPercent: diffPercent,
    };
  }, [transactions, selectedDate]);

  const totalReceivables = useMemo(() => {
    return debts
      .filter(d => d.type === 'receivable' && d.status !== 'paid')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const totalPayables = useMemo(() => {
    return debts
      .filter(d => d.type === 'payable' && d.status !== 'paid')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const totalInventoryCost = useMemo(() => {
    return products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  }, [products]);

  const totalInventoryRetailValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.salePrice * p.stock, 0);
  }, [products]);

  const totalInventoryCount = products.length;

  const computePAndLForMonth = (yearMonth: string, monthName: string): MonthlyPAndL => {
    const monthTx = transactions.filter(t => t.date.startsWith(yearMonth));
    const sales = monthTx.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'expense');
    
    const merchExpense = expenses
      .filter(e => e.category.toLowerCase().includes('mercancía') || e.category.toLowerCase().includes('stock'))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const costOfGoodsSold = merchExpense > 0 ? merchExpense : sales * 0.45;
    const grossProfit = Math.max(0, sales - costOfGoodsSold);
    const grossMarginPercent = sales > 0 ? (grossProfit / sales) * 100 : 0;

    const operatingExpensesList = expenses.filter(
      e => !e.category.toLowerCase().includes('mercancía') && !e.category.toLowerCase().includes('stock')
    );
    const operatingExpenses = operatingExpensesList.reduce((sum, e) => sum + e.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = sales - totalExpense;
    const netMarginPercent = sales > 0 ? (netProfit / sales) * 100 : 0;

    return {
      monthKey: yearMonth,
      monthName,
      grossSales: sales,
      costOfGoodsSold,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      expensesByCategory,
      netProfit,
      netMarginPercent,
      cashFlowIn: sales,
      cashFlowOut: totalExpense,
      netCashFlow: sales - totalExpense,
      vsPrevMonthNetCashFlowPercent: 0,
    };
  };

  const sixMonthsPAndL = useMemo(() => {
    const months = [
      { key: '2026-06', name: 'Junio' },
      { key: '2026-07', name: 'Julio' },
      { key: '2026-08', name: 'Agosto' },
      { key: '2026-09', name: 'Septiembre' },
      { key: '2026-10', name: 'Octubre' },
      { key: '2026-11', name: 'Noviembre' },
    ];

    const results: MonthlyPAndL[] = [];
    for (let i = 0; i < months.length; i++) {
      const pnl = computePAndLForMonth(months[i].key, months[i].name);
      if (i > 0) {
        const prevNet = results[i - 1].netCashFlow;
        if (prevNet !== 0) {
          pnl.vsPrevMonthNetCashFlowPercent = ((pnl.netCashFlow - prevNet) / Math.abs(prevNet)) * 100;
        }
      }
      results.push(pnl);
    }
    return results;
  }, [transactions]);

  const monthlyPAndL = useMemo(() => {
    return sixMonthsPAndL.find(m => m.monthKey === '2026-11') || sixMonthsPAndL[sixMonthsPAndL.length - 1];
  }, [sixMonthsPAndL]);

  const prevMonthPAndL = useMemo(() => {
    return sixMonthsPAndL.find(m => m.monthKey === '2026-10') || sixMonthsPAndL[sixMonthsPAndL.length - 2];
  }, [sixMonthsPAndL]);

  return (
    <FinanceContext.Provider
      value={{
        profile,
        updateProfile,
        businessAccounts,
        activeAccountId,
        switchBusinessAccount,
        addBusinessAccount,
        updateBusinessAccount,
        products,
        categories,
        addCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        isCreateProductModalOpen,
        setIsCreateProductModalOpen,
        openCreateProductModal,
        transactions,
        addTransaction,
        deleteTransaction,
        invoices,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        quotes,
        createQuote,
        deleteQuote,
        debts,
        addDebt,
        recordDebtPayment,
        recordContactPayment,
        deleteDebt,
        deleteContactDebts,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        customerCategories,
        addCustomerCategory,
        deleteCustomerCategory,
        isCreateCustomerModalOpen,
        setIsCreateCustomerModalOpen,
        openCreateCustomerModal,
        suppliers,
        addSupplier,
        selectedDate,
        setSelectedDate,
        selectedPeriod,
        setSelectedPeriod,
        customDateRange,
        setCustomDateRange,
        activeTab,
        setActiveTab,
        isMobileFramed,
        setIsMobileFramed,
        isSaleTypeSelectorOpen,
        setIsSaleTypeSelectorOpen,
        isProductSaleSelectorOpen,
        setIsProductSaleSelectorOpen,
        isFreeSaleModalOpen,
        setIsFreeSaleModalOpen,
        isQuoteModalOpen,
        setIsQuoteModalOpen,
        isAccountsModalOpen,
        setIsAccountsModalOpen,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        isPeriodModalOpen,
        setIsPeriodModalOpen,
        isBalanceDetailOpen,
        setIsBalanceDetailOpen,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isLocalFirstBackupModalOpen,
        setIsLocalFirstBackupModalOpen,
        selectedInvoiceForPreview,
        setSelectedInvoiceForPreview,
        isImportOldCompanyModalOpen,
        setIsImportOldCompanyModalOpen,
        isBusinessOnboardingOpen,
        setIsBusinessOnboardingOpen,
        importOldCompanyData,
        currentUser,
        users,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isAdmin,
        isAdminModalOpen,
        setIsAdminModalOpen,
        plansConfig,
        updatePlansConfig,
        featureAccess,
        toggleFeaturePremium,
        updateUserPlan,
        toggleUserStatus,
        deleteUser,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        upgradeFeatureTarget,
        setUpgradeFeatureTarget,
        checkFeatureAccess,
        upgradeCurrentUserToPro,
        todaySales,
        todayExpenses,
        todayBalance,
        yesterdaySales,
        vsYesterdayPercent,
        totalReceivables,
        totalPayables,
        totalInventoryCost,
        totalInventoryRetailValue,
        totalInventoryCount,
        monthlyPAndL,
        prevMonthPAndL,
        sixMonthsPAndL,
        updateCategory,
        bcvRates,
        isBcvLoading,
        refreshBcvRates,
        isBcvModeEnabled,
        toggleBcvMode,
        primaryDisplayCurrency,
        setPrimaryDisplayCurrency,
        convertAmount,
        formatBcv,
        getBreakdown,
        formatCurrency,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
