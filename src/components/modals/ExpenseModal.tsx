import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  Banknote,
  CreditCard,
  Building2,
  MessageSquare,
  Crown,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory, PaymentMethod } from '../../types/finance';
import { BcvAmountDisplay } from '../common/BcvAmountDisplay';

// Binance custom icon
const BinanceIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} bg-[#F3BA2F] rounded-md flex items-center justify-center p-1 text-black font-black shrink-0 shadow-2xs`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 3.5L7.5 8l2.12 2.12L12 7.74l2.38 2.38L16.5 8 12 3.5zm-6.12 6.12L3.5 12l2.38 2.38L8 12.26 5.88 9.62zm12.24 0L16 12.26l2.12 2.12L20.5 12l-2.38-2.38zM12 16.26l-2.38-2.38L7.5 16l4.5 4.5 4.5-4.5-2.12-2.12L12 16.26zm0-5.76l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5z" />
    </svg>
  </div>
);

// Zelle custom icon
const ZelleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} bg-[#7414CA] rounded-md flex items-center justify-center text-white font-black text-sm shrink-0 select-none shadow-2xs`}>
    Z
  </div>
);

export const ExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    addTransaction,
    addDebt,
    suppliers,
    addSupplier,
    selectedDate,
    profile,
    setActiveTab,
    formatCurrency,
  } = useFinance();

  // Mode: Pagado vs Deuda
  const [expenseMode, setExpenseMode] = useState<'pagado' | 'deuda'>('pagado');

  // Form fields
  const [expenseDate, setExpenseDate] = useState(selectedDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [isNewSupplierInput, setIsNewSupplierInput] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [concept, setConcept] = useState<string>('');

  if (!isExpenseModalOpen) return null;

  const categories: ExpenseCategory[] = [
    'Mercancía / Stock',
    'Alquiler del Local',
    'Servicios Públicos',
    'Sueldos / Nómina',
    'Publicidad & Marketing',
    'Transporte & Envíos',
    'Mantenimiento & Insumos',
    'Impuestos & Tasas',
    'Otros Gastos',
  ];

  const paymentMethodsList: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'cash',
      label: 'Efectivo',
      icon: (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800">
          <Banknote className="w-6 h-6 stroke-[1.8]" />
        </div>
      ),
    },
    {
      id: 'card',
      label: 'Tarjeta',
      icon: (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800">
          <CreditCard className="w-6 h-6 stroke-[1.8]" />
        </div>
      ),
    },
    {
      id: 'transfer',
      label: 'Transferencia bancaria',
      icon: (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800">
          <Building2 className="w-6 h-6 stroke-[1.8]" />
        </div>
      ),
    },
    {
      id: 'binance',
      label: 'Binance',
      icon: <BinanceIcon className="w-7 h-7" />,
    },
    {
      id: 'pagomovil',
      label: 'Pago Móvil',
      icon: (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-800">
          <MessageSquare className="w-6 h-6 stroke-[1.8]" />
        </div>
      ),
    },
    {
      id: 'zelle',
      label: 'Zelle',
      icon: <ZelleIcon className="w-7 h-7" />,
    },
  ];

  const parsedAmount = parseFloat(amount) || 0;
  const isFormValid =
    parsedAmount > 0 &&
    category.trim() !== '' &&
    (expenseMode === 'pagado' || supplierName.trim() !== '' || newSupplierName.trim() !== '');

  const handleClose = () => {
    setIsExpenseModalOpen(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let finalSupplier = supplierName;
    if (isNewSupplierInput && newSupplierName.trim()) {
      finalSupplier = newSupplierName.trim();
      addSupplier({
        name: finalSupplier,
        phone: '',
        category: category || 'General',
      });
    }

    const finalConcept = concept.trim() || `${category || 'Gasto operacional'}`;

    if (expenseMode === 'pagado') {
      // 1. Add Transaction
      addTransaction({
        type: 'expense',
        amount: parsedAmount,
        concept: finalConcept,
        category: category || 'Otros Gastos',
        paymentMethod,
        date: expenseDate,
        customerOrSupplier: finalSupplier || undefined,
      });

      handleClose();
    } else {
      // 2. Add Debt (payable) and redirect to 'deudas'
      addDebt({
        type: 'payable',
        contactName: finalSupplier || 'Proveedor',
        contactPhone: '',
        totalAmount: parsedAmount,
        dueDate: '2026-11-30',
        createdAt: expenseDate,
        notes: `Gasto a crédito: ${finalConcept} (${category})`,
      });

      handleClose();
      setActiveTab('deudas');
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (dateStr === '2026-11-13') return 'Hoy, 13 noviembre';
    const [, month, day] = dateStr.split('-');
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} de ${monthNames[monthIdx] || ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Yellow Header - Matches Screenshot 1 */}
      <div className="sticky top-0 z-40 bg-[#FFCF00] text-slate-900 px-4 py-3 shadow-xs flex items-center gap-3 select-none">
        <button
          type="button"
          onClick={handleClose}
          className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/60 active:scale-95 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900 stroke-[2.5]" />
        </button>
        <h2 className="text-lg font-bold text-slate-950 tracking-tight">
          Nuevo gasto
        </h2>
      </div>

      <form
        onSubmit={handleCreateExpense}
        className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4 pb-28"
      >
        {/* Top Segmented Pills: [ Pagado ] | [ Deuda ] */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 select-none">
          <button
            type="button"
            onClick={() => setExpenseMode('pagado')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              expenseMode === 'pagado'
                ? 'bg-[#00875A] text-white shadow-xs scale-101'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Pagado
          </button>
          <button
            type="button"
            onClick={() => setExpenseMode('deuda')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              expenseMode === 'deuda'
                ? 'bg-[#9B1C1C] text-white shadow-xs scale-101'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Deuda
          </button>
        </div>

        {/* Blue Info Banner on Deuda Mode */}
        {expenseMode === 'deuda' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs animate-in fade-in duration-150">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="font-medium">
              Al finalizar te llevaremos a la sección <strong className="font-bold">"Deudas"</strong> para gestionar este saldo pendiente.
            </p>
          </div>
        )}

        {/* Fecha del gasto */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Fecha del gasto <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <span>{formatDateDisplay(expenseDate)}</span>
              <CalendarIcon className="w-4 h-4 text-slate-500" />
            </button>
            {isDatePickerOpen && (
              <div className="mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-lg">
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => {
                    if (e.target.value) {
                      setExpenseDate(e.target.value);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Categoría del gasto * */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Categoría del gasto <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#FFCF00] cursor-pointer"
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-700 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Valor * Card Container - Exactly matching Screenshot 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <label className="block text-xs font-bold text-slate-900">
            Valor <span className="text-rose-600">*</span>
          </label>

          <div className="relative flex items-center">
            <span className="text-2xl font-black text-slate-400 mr-2 select-none">
              {profile.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-3xl font-black text-slate-900 focus:outline-hidden font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Valor total</span>
            <BcvAmountDisplay amount={parsedAmount} size="sm" layout="inline" />
          </div>
        </div>

        {/* Proveedor with Crown Badge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-900">
              Proveedor {expenseMode === 'deuda' && <span className="text-rose-600">*</span>}
            </label>
            <button
              type="button"
              onClick={() => setIsNewSupplierInput(!isNewSupplierInput)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>{isNewSupplierInput ? 'Elegir existente' : 'Nuevo proveedor'}</span>
            </button>
          </div>

          {isNewSupplierInput ? (
            <input
              type="text"
              value={newSupplierName}
              onChange={e => setNewSupplierName(e.target.value)}
              placeholder="Nombre del nuevo proveedor"
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#FFCF00]"
              required={expenseMode === 'deuda'}
            />
          ) : (
            <div className="relative">
              <select
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                required={expenseMode === 'deuda'}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-xs font-semibold text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#FFCF00] cursor-pointer"
              >
                <option value="">Escoge tu proveedor</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              {/* Blue Crown Badge - Screenshot 1 */}
              <div className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-700 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Método de pago * (Shown only in Pagado mode) - 6 visual buttons 3x2 grid */}
        {expenseMode === 'pagado' && (
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Método de pago <span className="text-rose-600">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {paymentMethodsList.map(item => {
                const isSelected = paymentMethod === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id)}
                    className={`h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-emerald-600 bg-white shadow-xs scale-101'
                        : 'border border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Concepto */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Concepto
          </label>
          <input
            type="text"
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="Dale un nombre a este gasto"
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFCF00]"
          />
        </div>

        {/* Submit button fixed at bottom */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 text-sm font-bold rounded-2xl transition-all shadow-md ${
              isFormValid
                ? expenseMode === 'pagado'
                  ? 'bg-[#00875A] hover:bg-[#007048] active:scale-98 text-white cursor-pointer'
                  : 'bg-[#9B1C1C] hover:bg-[#821414] active:scale-98 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Crear gasto
          </button>
        </div>
      </form>
    </div>
  );
};
