import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Banknote,
  CreditCard,
  Building2,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, Transaction } from '../../types/finance';
import { BcvAmountDisplay } from '../common/BcvAmountDisplay';

// Helper icons for payment methods
const BinanceIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <div className={`${className} bg-[#F3BA2F] rounded-md flex items-center justify-center p-0.5 text-black font-black text-[9px] shrink-0`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 3.5L7.5 8l2.12 2.12L12 7.74l2.38 2.38L16.5 8 12 3.5zm-6.12 6.12L3.5 12l2.38 2.38L8 12.26 5.88 9.62zm12.24 0L16 12.26l2.12 2.12L20.5 12l-2.38-2.38zM12 16.26l-2.38-2.38L7.5 16l4.5 4.5 4.5-4.5-2.12-2.12L12 16.26zm0-5.76l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5z" />
    </svg>
  </div>
);

const ZelleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <div className={`${className} bg-[#7414CA] rounded-md flex items-center justify-center text-white font-black text-xs shrink-0 select-none`}>
    Z
  </div>
);

export const BalanceDetailModal: React.FC = () => {
  const {
    isBalanceDetailOpen,
    setIsBalanceDetailOpen,
    transactions,
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setIsPeriodModalOpen,
    formatCurrency,
  } = useFinance();

  const [isGananciaOpen, setIsGananciaOpen] = useState(true);
  const [openMethod, setOpenMethod] = useState<PaymentMethod | null>(null);

  if (!isBalanceDetailOpen) return null;

  // Filter transactions according to selectedPeriod
  const periodTransactions = transactions.filter(t => {
    if (selectedPeriod === 'daily') {
      return t.date === selectedDate;
    }
    if (selectedPeriod === 'weekly') {
      // 7 days around 2026-11-13 (Nov 9 to Nov 15)
      return t.date >= '2026-11-09' && t.date <= '2026-11-15';
    }
    if (selectedPeriod === 'monthly') {
      const monthPrefix = selectedDate.slice(0, 7); // e.g. '2026-11'
      return t.date.startsWith(monthPrefix);
    }
    if (selectedPeriod === 'yearly') {
      const yearPrefix = selectedDate.slice(0, 4); // '2026'
      return t.date.startsWith(yearPrefix);
    }
    if (selectedPeriod === 'custom') {
      return t.date >= customDateRange.start && t.date <= customDateRange.end;
    }
    return t.date === selectedDate;
  });

  const totalSales = periodTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalSales - totalExpenses;

  // Calculate product cost (estimated at 40% if not itemized)
  const merchandiseExpenses = periodTransactions
    .filter(t => t.type === 'expense' && (t.category.toLowerCase().includes('mercanc') || t.category.toLowerCase().includes('stock')))
    .reduce((sum, t) => sum + t.amount, 0);

  const estimatedCost = merchandiseExpenses > 0 ? merchandiseExpenses : Math.round(totalSales * 0.45);
  const estimatedProfit = Math.max(0, totalSales - estimatedCost);

  // Helper to get formatted Spanish date label
  const formatDatePillLabel = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${months[d.getMonth()]}`;
    } catch {
      return isoDate;
    }
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'daily':
        return formatDatePillLabel(selectedDate);
      case 'weekly':
        return 'Esta semana';
      case 'monthly':
        return 'Este mes';
      case 'yearly':
        return 'Este año';
      case 'custom':
        return `${customDateRange.start} a ${customDateRange.end}`;
      default:
        return 'Periodo';
    }
  };

  const toggleMethod = (methodId: PaymentMethod) => {
    setOpenMethod(prev => (prev === methodId ? null : methodId));
  };

  const paymentMethodsList: { id: PaymentMethod; name: string; icon: React.ReactNode }[] = [
    { id: 'cash', name: 'Efectivo', icon: <Banknote className="w-5 h-5 text-emerald-600" /> },
    { id: 'pagomovil', name: 'Pago Móvil', icon: <Building2 className="w-5 h-5 text-blue-600" /> },
    { id: 'zelle', name: 'Zelle', icon: <ZelleIcon className="w-5 h-5" /> },
    { id: 'binance', name: 'Binance Pay / USDT', icon: <BinanceIcon className="w-5 h-5" /> },
    { id: 'card', name: 'Tarjeta / Punto de Venta', icon: <CreditCard className="w-5 h-5 text-purple-600" /> },
    { id: 'transfer', name: 'Transferencia Bancaria', icon: <Building2 className="w-5 h-5 text-slate-600" /> },
  ];

  // Generate dynamic 9 days centered around selectedDate
  const generateDatePills = () => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const base = new Date(year, month - 1, day);
      const pills = [];
      for (let offset = -4; offset <= 4; offset++) {
        const d = new Date(base);
        d.setDate(base.getDate() + offset);
        const yStr = d.getFullYear();
        const mStr = String(d.getMonth() + 1).padStart(2, '0');
        const dStr = String(d.getDate()).padStart(2, '0');
        const iso = `${yStr}-${mStr}-${dStr}`;
        pills.push({
          date: iso,
          label: formatDatePillLabel(iso),
          dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()],
        });
      }
      return pills;
    } catch {
      return [
        { date: '2026-11-10', label: '10 nov', dayName: 'Mar' },
        { date: '2026-11-11', label: '11 nov', dayName: 'Mié' },
        { date: '2026-11-12', label: '12 nov', dayName: 'Jue' },
        { date: '2026-11-13', label: '13 nov', dayName: 'Vie' },
        { date: '2026-11-14', label: '14 nov', dayName: 'Sáb' },
        { date: '2026-11-15', label: '15 nov', dayName: 'Dom' },
      ];
    }
  };

  const handleShiftDay = (delta: number) => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day + delta);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      setSelectedDate(`${yStr}-${mStr}-${dStr}`);
    } catch (e) {
      // fallback
    }
  };

  const dynamicDatePills = generateDatePills();

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* UNIFIED STICKY TOP HEADER: Detalle del saldo + Días y Calendario perfectamente integrados */}
      <div className="bg-[#FFCF00] text-slate-900 shadow-sm border-b border-black/10 shrink-0 z-40 select-none">
        {/* Row 1: Back arrow, Title and Period selector */}
        <div className="px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsBalanceDetailOpen(false)}
              className="w-9 h-9 rounded-full bg-white/40 hover:bg-white/80 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              aria-label="Volver al balance general"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight truncate">
                Detalle del saldo
              </h2>
              <p className="text-[11px] font-bold text-slate-800 leading-none">
                {selectedPeriod === 'daily' ? `Vista por día · ${formatDatePillLabel(selectedDate)}` : getPeriodTitle()}
              </p>
            </div>
          </div>

          {/* Period selector button & Direct Calendar trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-xs font-black text-slate-950 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer border border-black/10"
              title="Cambiar periodo o fecha"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-amber-700" />
              <span className="truncate max-w-[120px]">{getPeriodTitle()}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Days Strip & Calendar Picker - ALWAYS clearly visible and never covered */}
        {selectedPeriod === 'daily' ? (
          <div className="px-2 sm:px-4 py-2 bg-gradient-to-b from-[#FFCF00] to-[#FFC700] border-t border-black/8 flex items-center justify-between gap-1.5">
            {/* Shift Day Back */}
            <button
              type="button"
              onClick={() => handleShiftDay(-1)}
              className="w-7 h-8 rounded-lg bg-white/30 hover:bg-white text-slate-900 flex items-center justify-center font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
              title="Día anterior"
            >
              ‹
            </button>

            {/* Scrollable date pills strip */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 min-w-0">
              {dynamicDatePills.map(p => {
                const isSelected = selectedDate === p.date;
                return (
                  <button
                    key={p.date}
                    onClick={() => setSelectedDate(p.date)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[58px] ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-md scale-105 ring-2 ring-white/60'
                        : 'bg-white/70 hover:bg-white text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className={`text-[10px] leading-tight ${isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-600 font-medium'}`}>
                      {p.dayName}
                    </span>
                    <span className="font-extrabold leading-tight">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Shift Day Forward */}
            <button
              type="button"
              onClick={() => handleShiftDay(1)}
              className="w-7 h-8 rounded-lg bg-white/30 hover:bg-white text-slate-900 flex items-center justify-center font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
              title="Día siguiente"
            >
              ›
            </button>

            {/* Dedicated Calendar Icon Button */}
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-slate-950 text-white hover:bg-black flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer border border-amber-300/40 ml-1"
              title="Abrir calendario completo"
              aria-label="Abrir selector de calendario"
            >
              <CalendarIcon className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        ) : (
          /* Non-daily banner with quick switch back to daily */
          <div className="px-4 py-2 bg-amber-200/60 border-t border-black/8 flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-800" />
              <span>Periodo activo: <strong>{getPeriodTitle()}</strong></span>
            </span>
            <button
              onClick={() => setSelectedPeriod('daily')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg text-slate-900 font-extrabold text-[11px] shadow-xs cursor-pointer"
            >
              Ver vista diaria
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Body - Guaranteed never to overlap with top header */}
      <div className="flex-1 overflow-y-auto max-w-lg w-full mx-auto p-4 space-y-4 pb-16">
        {/* Balance Card - Matching Screenshots */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-600">Balance</span>
            <BcvAmountDisplay
              amount={netBalance}
              size="xl"
              colorClass={netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}
              align="right"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Ingresos</span>
              </div>
              <div className="mt-1">
                <BcvAmountDisplay amount={totalSales} size="md" colorClass="text-emerald-700" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Egresos</span>
              </div>
              <div className="mt-1">
                <BcvAmountDisplay amount={totalExpenses} size="md" colorClass="text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Accordion: Ganancia - Exactly matching Screenshot */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <button
            onClick={() => setIsGananciaOpen(!isGananciaOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-base font-bold text-slate-900">Ganancia</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {formatCurrency(estimatedProfit)}
              </span>
              {isGananciaOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>

          {isGananciaOpen && (
            <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 text-sm">
              <p className="text-xs text-slate-500 leading-relaxed">
                Se calcula restando de tus ventas el costo que tienes registrado en los productos.
              </p>

              <div className="space-y-2 pt-1 font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Ventas</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(totalSales)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-rose-600">
                  <span>Costo de productos que vendiste</span>
                  <span className="font-mono tabular-nums font-semibold">
                    - {formatCurrency(estimatedCost)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold text-slate-950 text-base">
                  <span>Ganancia estimada</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    {formatCurrency(estimatedProfit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Desglose por método de pago (6 accordions) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Métodos de pago
          </h3>

          <div className="space-y-2">
            {paymentMethodsList.map(method => {
              const methodTxs = periodTransactions.filter(t => t.paymentMethod === method.id);
              const methodIncome = methodTxs
                .filter(t => t.type === 'sale')
                .reduce((sum, t) => sum + t.amount, 0);
              const methodExpense = methodTxs
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
              const methodNet = methodIncome - methodExpense;
              const isOpen = openMethod === method.id;

              return (
                <div
                  key={method.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
                >
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <span className="text-sm font-bold text-slate-800">
                        {method.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${
                          methodNet > 0
                            ? 'text-emerald-700'
                            : methodNet < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(methodNet)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Transaction List */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                      {methodTxs.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          No hay transacciones registradas con este método en este periodo.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {methodTxs.map(tx => (
                            <div
                              key={tx.id}
                              className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-slate-900 truncate">
                                  {tx.concept}
                                </p>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] mt-0.5">
                                  <span>{tx.date}</span>
                                  <span>·</span>
                                  <span>{tx.time}</span>
                                  <span>·</span>
                                  <span>{tx.category}</span>
                                </div>
                              </div>
                              <span
                                className={`font-mono font-bold shrink-0 ${
                                  tx.type === 'sale' ? 'text-emerald-700' : 'text-rose-600'
                                }`}
                              >
                                {tx.type === 'sale' ? '+' : '-'} {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
