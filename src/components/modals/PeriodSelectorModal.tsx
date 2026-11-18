import React, { useState } from 'react';
import { X, Check, Calendar, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PeriodType } from '../../types/finance';

export const PeriodSelectorModal: React.FC = () => {
  const {
    isPeriodModalOpen,
    setIsPeriodModalOpen,
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setCustomDateRange,
  } = useFinance();

  const [isEditingCustomRange, setIsEditingCustomRange] = useState(false);
  const [tempStart, setTempStart] = useState(customDateRange.start);
  const [tempEnd, setTempEnd] = useState(customDateRange.end);

  if (!isPeriodModalOpen) return null;

  const handleSelect = (period: PeriodType) => {
    if (period === 'custom') {
      setIsEditingCustomRange(true);
      return;
    }
    setSelectedPeriod(period);
    setIsPeriodModalOpen(false);
    setIsEditingCustomRange(false);
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDateRange({ start: tempStart, end: tempEnd });
    setSelectedPeriod('custom');
    setIsPeriodModalOpen(false);
    setIsEditingCustomRange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Matches Screenshot 2 */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Elige el periodo que quieres ver:
          </h3>
          <button
            onClick={() => {
              setIsPeriodModalOpen(false);
              setIsEditingCustomRange(false);
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Custom Range Picker Form */}
        {isEditingCustomRange ? (
          <form onSubmit={handleApplyCustomRange} className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-[#FFCF00]" />
              <span>Selecciona el rango de fechas</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={e => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFCF00] focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={e => setTempEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFCF00] focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCustomRange(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-xs font-bold text-slate-900 bg-[#FFCF00] hover:bg-[#ebd03f] rounded-xl transition-colors shadow-xs"
              >
                Aplicar Rango
              </button>
            </div>
          </form>
        ) : (
          /* Period Options List - Exactly matching Screenshot 2 */
          <div className="py-2 divide-y divide-slate-100">
            {[
              { id: 'all' as const, label: 'Histórico Completo (12 Sep - 18 Nov)' },
              { id: 'daily' as const, label: 'Diario' },
              { id: 'weekly' as const, label: 'Semanal' },
              { id: 'monthly' as const, label: 'Mensual' },
              { id: 'yearly' as const, label: 'Anual' },
              { id: 'custom' as const, label: 'Rango personalizado' },
            ].map(option => {
              const isSelected = selectedPeriod === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors group cursor-pointer"
                >
                  <span
                    className={`text-base tracking-tight ${
                      isSelected
                        ? 'font-bold text-slate-950'
                        : 'font-normal text-slate-800 group-hover:text-slate-950'
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : option.id === 'custom' ? (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom home indicator line */}
        <div className="py-3 flex justify-center bg-white">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
