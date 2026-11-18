import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Banknote,
  CreditCard,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PaymentMethod, Transaction } from '../types/finance';
import { BcvAmountDisplay } from '../components/common/BcvAmountDisplay';

// Helper payment method badges
const PaymentBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  switch (method) {
    case 'cash':
      return <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">Efectivo</span>;
    case 'card':
      return <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">Tarjeta</span>;
    case 'transfer':
      return <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md">Transferencia</span>;
    case 'binance':
      return <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">Binance</span>;
    case 'pagomovil':
      return <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">Pago Móvil</span>;
    case 'zelle':
      return <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-1.5 py-0.5 rounded-md">Zelle</span>;
    case 'credit':
      return <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md">A Crédito</span>;
    default:
      return null;
  }
};

export const BalanceView: React.FC = () => {
  const {
    transactions,
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setIsSaleTypeSelectorOpen,
    setIsExpenseModalOpen,
    setIsPeriodModalOpen,
    setIsBalanceDetailOpen,
    deleteTransaction,
    formatCurrency,
  } = useFinance();

  // Tabs: 'ingresos' | 'egresos' (matches Screenshot 2)
  const [activeTab, setActiveTab] = useState<'ingresos' | 'egresos'>('ingresos');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirmTxId, setDeleteConfirmTxId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setDeleteToast(msg);
    setTimeout(() => setDeleteToast(null), 3000);
  };

  // Date pills around 18 nov 2026: 14 nov, 15 nov, 16 nov, 17 nov, 18 nov
  const datePills = [
    { date: '2026-11-14', label: '14 nov' },
    { date: '2026-11-15', label: '15 nov' },
    { date: '2026-11-16', label: '16 nov' },
    { date: '2026-11-17', label: '17 nov' },
    { date: '2026-11-18', label: '18 nov' },
  ];

  // Filter transactions based on selectedPeriod
  const periodTransactions = transactions.filter(t => {
    if (selectedPeriod === 'all') {
      return true;
    }
    if (selectedPeriod === 'daily') {
      return t.date === selectedDate;
    }
    if (selectedPeriod === 'weekly') {
      return t.date >= '2026-11-09' && t.date <= '2026-11-18';
    }
    if (selectedPeriod === 'monthly') {
      return t.date.startsWith(selectedDate.slice(0, 7));
    }
    if (selectedPeriod === 'yearly') {
      return t.date.startsWith(selectedDate.slice(0, 4));
    }
    if (selectedPeriod === 'custom') {
      return t.date >= customDateRange.start && t.date <= customDateRange.end;
    }
    return t.date === selectedDate;
  });

  const periodSales = periodTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodBalance = periodSales - periodExpenses;

  // Filter by activeTab (Ingresos vs Egresos)
  const displayedTransactions = periodTransactions
    .filter(t => (activeTab === 'ingresos' ? t.type === 'sale' : t.type === 'expense'))
    .filter(t => (filterCategory === 'all' ? true : t.category === filterCategory));

  const availableCategories = Array.from(
    new Set(periodTransactions.map(t => t.category))
  );

  const handleDownloadDayReport = () => {
    const csvRows = [
      ['Fecha', 'Hora', 'Tipo', 'Concepto', 'Categoría', 'Método de Pago', 'Contacto', 'Monto'].join(','),
      ...periodTransactions.map(t =>
        [
          t.date,
          t.time,
          t.type === 'sale' ? 'Ingreso' : 'Egreso',
          `"${t.concept.replace(/"/g, '""')}"`,
          `"${t.category}"`,
          t.paymentMethod,
          `"${t.customerOrSupplier || ''}"`,
          t.amount,
        ].join(',')
      ),
      ['', '', '', '', '', '', 'TOTAL INGRESOS', periodSales].join(','),
      ['', '', '', '', '', '', 'TOTAL EGRESOS', periodExpenses].join(','),
      ['', '', '', '', '', '', 'BALANCE NETO', periodBalance].join(','),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `balance_reporte_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'all':
        return 'Histórico Completo (12 Sep - 18 Nov)';
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal (12 al 18 Nov)';
      case 'monthly':
        return 'Noviembre 2026';
      case 'yearly':
        return 'Año 2026';
      case 'custom':
        return `${customDateRange.start} a ${customDateRange.end}`;
      default:
        return 'Histórico Completo';
    }
  };

  return (
    <div className="flex flex-col">
      {/* Toast Notification */}
      {deleteToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* Date Picker Bar & Filter - Seamlessly attached to Header (zero white gap) */}
      <div className="bg-[#FFCF00] px-4 sm:px-6 py-2 border-b border-black/10 select-none shadow-xs">
        <div className="flex items-center justify-between gap-2 max-w-full">
          {selectedPeriod === 'daily' ? (
            /* Horizontally scrollable date pills container only */
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {datePills.map(p => {
                const isSelected = selectedDate === p.date;
                return (
                  <button
                    key={p.date}
                    onClick={() => setSelectedDate(p.date)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs scale-102'
                        : 'text-slate-800 hover:bg-black/5'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-xs truncate">
                {getPeriodLabel()}
              </span>
              <button
                onClick={() => setSelectedPeriod('daily')}
                className="text-xs font-semibold text-slate-800 hover:underline cursor-pointer shrink-0"
              >
                Volver a Diario
              </button>
            </div>
          )}

          {/* Right pinned controls - ALWAYS inside the recuadro box, with vertical separator */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-black/15">
            {/* Filter slider toggle */}
            <button
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                showCategoryFilter ? 'bg-slate-900 text-white' : 'bg-white/80 hover:bg-white text-slate-800'
              }`}
              title="Filtrar por categoría"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Calendar trigger - ALWAYS visible in recuadro */}
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white flex items-center justify-center text-slate-900 transition-colors shadow-xs cursor-pointer"
              title="Elegir periodo en calendario"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12">

      {/* Filter by Category bar if toggled */}
      {showCategoryFilter && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-600 shrink-0">Categoría:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Balance Summary Card - Exactly matching Screenshot 2 */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-600">Balance</span>
          <BcvAmountDisplay
            amount={periodBalance}
            size="xl"
            colorClass={periodBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}
            align="right"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ingresos</span>
            </div>
            <div className="mt-1">
              <BcvAmountDisplay amount={periodSales} size="lg" colorClass="text-emerald-700" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Egresos</span>
            </div>
            <div className="mt-1">
              <BcvAmountDisplay amount={periodExpenses} size="lg" colorClass="text-rose-600" />
            </div>
          </div>
        </div>

        {/* Action Links - Screenshot 2: "Descargar Reportes" & "Ver Balance >" */}
        <div className="flex items-center justify-between pt-3 text-xs font-semibold">
          <button
            onClick={handleDownloadDayReport}
            className="text-slate-700 hover:text-black underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Reportes
          </button>
          <button
            onClick={() => setIsBalanceDetailOpen(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors font-bold cursor-pointer"
          >
            Ver Balance <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtabs: [ Ingresos ] | [ Egresos ] - Exactly matching Screenshot 2 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ingresos')}
          className={`flex-1 pb-3 text-sm font-bold transition-all relative text-center cursor-pointer ${
            activeTab === 'ingresos'
              ? 'text-slate-950 border-b-2 border-slate-950'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => setActiveTab('egresos')}
          className={`flex-1 pb-3 text-sm font-bold transition-all relative text-center cursor-pointer ${
            activeTab === 'egresos'
              ? 'text-slate-950 border-b-2 border-slate-950'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Egresos
        </button>
      </div>

      {/* Transaction List or Empty State */}
      {displayedTransactions.length === 0 ? (
        /* Empty State reproducing Screenshot 2 */
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-32 h-32 mb-4 relative">
            <img
              src="/src/assets/images/illustration_empty_balance_1794618916352.jpg"
              alt="Sin registros en esta fecha"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            No tienes registros creados en esta fecha.
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Registra una venta o un gasto para comenzar a ver tu balance diario y análisis de caja.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setIsSaleTypeSelectorOpen(true)}
              className="px-4 py-2.5 bg-[#00875A] hover:bg-[#007048] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + Nueva venta
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 bg-[#9B1C1C] hover:bg-[#821414] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              - Nuevo gasto
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedTransactions.map(tx => {
            const isSale = tx.type === 'sale';
            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSale ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isSale ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {tx.concept}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-medium text-slate-700">{tx.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {tx.time}
                      </span>
                      {tx.customerOrSupplier && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px] text-slate-700 font-medium">
                            {tx.customerOrSupplier}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <PaymentBadge method={tx.paymentMethod} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <BcvAmountDisplay
                      amount={tx.amount}
                      size="sm"
                      colorClass={isSale ? 'text-emerald-700' : 'text-rose-600'}
                      layout="subtle"
                      align="right"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteConfirmTxId === tx.id) {
                        deleteTransaction(tx.id);
                        setDeleteConfirmTxId(null);
                        showToast(`Registro "${tx.concept}" eliminado`);
                      } else {
                        setDeleteConfirmTxId(tx.id);
                        setTimeout(() => setDeleteConfirmTxId(null), 3500);
                      }
                    }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      deleteConfirmTxId === tx.id
                        ? 'bg-rose-600 text-white px-2 animate-pulse'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Eliminar registro si hubo un error"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteConfirmTxId === tx.id && <span>¿Borrar?</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Quick Action Buttons - Exactly reproducing Screenshot 2 & Home View */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsSaleTypeSelectorOpen(true)}
            className="flex-1 py-3 px-4 bg-[#00875A] hover:bg-[#007048] active:scale-95 text-white font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva venta</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 py-3 px-4 bg-[#9B1C1C] hover:bg-[#821414] active:scale-95 text-white font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo gasto</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
