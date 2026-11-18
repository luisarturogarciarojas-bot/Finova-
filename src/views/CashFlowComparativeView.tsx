import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MonthlyPAndL } from '../types/finance';

export const CashFlowComparativeView: React.FC = () => {
  const {
    monthlyPAndL,
    prevMonthPAndL,
    sixMonthsPAndL,
    transactions,
    formatCurrency,
  } = useFinance();

  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-11');

  const selectedMonthData =
    sixMonthsPAndL.find(m => m.monthKey === selectedMonthKey) || monthlyPAndL;

  // Calculate day-by-day cash flow for the selected month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonthKey));
  
  // Group by day of month
  const dailyFlowMap: Record<string, { income: number; expense: number; net: number }> = {};
  monthTransactions.forEach(t => {
    const day = t.date.slice(8); // '01', '02', ...
    if (!dailyFlowMap[day]) {
      dailyFlowMap[day] = { income: 0, expense: 0, net: 0 };
    }
    if (t.type === 'sale') {
      dailyFlowMap[day].income += t.amount;
      dailyFlowMap[day].net += t.amount;
    } else {
      dailyFlowMap[day].expense += t.amount;
      dailyFlowMap[day].net -= t.amount;
    }
  });

  const dailyFlowList = Object.entries(dailyFlowMap).sort(([a], [b]) => a.localeCompare(b));

  // Max value for SVG scale
  const maxMonthlyVal = Math.max(
    ...sixMonthsPAndL.map(m => Math.max(m.cashFlowIn, m.cashFlowOut)),
    100
  );

  const netGrowthPercent = prevMonthPAndL.netCashFlow > 0
    ? ((monthlyPAndL.netCashFlow - prevMonthPAndL.netCashFlow) / prevMonthPAndL.netCashFlow) * 100
    : 100;

  const handleDownloadCashFlowCSV = () => {
    const csvRows = [
      ['Mes', 'Ingresos de Caja', 'Egresos de Caja', 'Flujo Neto de Caja', 'Margen Neto %'].join(','),
      ...sixMonthsPAndL.map(m =>
        [m.monthName, m.cashFlowIn, m.cashFlowOut, m.netCashFlow, m.netMarginPercent.toFixed(1)].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flujo_de_caja_comparativo_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-950">
              Análisis Comparativo del Flujo de Caja
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa las entradas y salidas reales de dinero para garantizar la solvencia de tu negocio.
          </p>
        </div>

        <button
          onClick={handleDownloadCashFlowCSV}
          className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors self-end sm:self-center"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Comparative Cards: Noviembre vs Octubre */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Net Flow */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Flujo Neto Noviembre</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {formatCurrency(monthlyPAndL.netCashFlow)}
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                netGrowthPercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {netGrowthPercent >= 0 ? '+' : ''}{netGrowthPercent.toFixed(1)}% vs Oct
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Octubre cerró en {formatCurrency(prevMonthPAndL.netCashFlow)}
          </p>
        </div>

        {/* Total Inflow */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Ingresos Acumulados</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Entradas
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(monthlyPAndL.cashFlowIn)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            vs {formatCurrency(prevMonthPAndL.cashFlowIn)} en Octubre
          </p>
        </div>

        {/* Total Outflow */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Egresos Totales</span>
            <span className="text-rose-600 font-bold flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> Salidas
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(monthlyPAndL.cashFlowOut)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            vs {formatCurrency(prevMonthPAndL.cashFlowOut)} en Octubre
          </p>
        </div>
      </div>

      {/* 6-Month Interactive Cash Flow Bar Chart */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Evolución Comparativa Mensual (Últimos 6 Meses)
            </h3>
            <p className="text-xs text-slate-500">
              Comportamiento de entradas (verde), salidas (rojo) y resultado neto mensual.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Ingresos
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Egresos
            </span>
          </div>
        </div>

        {/* Pure CSS/SVG Responsive Chart */}
        <div className="pt-4 pb-2 border-b border-slate-100">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 h-52 items-end">
            {sixMonthsPAndL.map(m => {
              const inHeight = Math.max(8, (m.cashFlowIn / maxMonthlyVal) * 100);
              const outHeight = Math.max(8, (m.cashFlowOut / maxMonthlyVal) * 100);
              const isSelected = selectedMonthKey === m.monthKey;

              return (
                <div
                  key={m.monthKey}
                  onClick={() => setSelectedMonthKey(m.monthKey)}
                  className={`flex flex-col items-center h-full justify-end cursor-pointer group p-1 rounded-xl transition-all ${
                    isSelected ? 'bg-amber-50/70 border border-amber-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-36">
                    {/* Inflow Bar */}
                    <div
                      className="w-1/2 max-w-[18px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${inHeight}%` }}
                      title={`Ingresos: ${formatCurrency(m.cashFlowIn)}`}
                    />
                    {/* Outflow Bar */}
                    <div
                      className="w-1/2 max-w-[18px] bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all relative group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${outHeight}%` }}
                      title={`Egresos: ${formatCurrency(m.cashFlowOut)}`}
                    />
                  </div>

                  <div className="text-center mt-2 w-full">
                    <span className="block text-[11px] font-bold text-slate-800 truncate">
                      {m.monthName.slice(0, 3)}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 tabular-nums">
                      {formatCurrency(m.netCashFlow)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Month Detail Strip */}
        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-900">
              Detalle de {selectedMonthData.monthName} ({selectedMonthData.monthKey}):
            </p>
            <p className="text-slate-600 mt-0.5">
              Margen de liquidez del <strong className="text-emerald-700">{selectedMonthData.netMarginPercent.toFixed(1)}%</strong>. 
              {selectedMonthData.netCashFlow >= 0
                ? ' Tu negocio genera flujo de caja positivo.'
                : ' Precaución: los egresos superaron los ingresos.'}
            </p>
          </div>

          <div className="flex gap-4 font-mono font-bold text-xs shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px]">INGRESOS</span>
              <span className="text-emerald-700">{formatCurrency(selectedMonthData.cashFlowIn)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EGRESOS</span>
              <span className="text-rose-600">{formatCurrency(selectedMonthData.cashFlowOut)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">NETO</span>
              <span className="text-slate-900">{formatCurrency(selectedMonthData.netCashFlow)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories Breakdown & Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Distribución de Gastos ({monthlyPAndL.monthName})
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {formatCurrency(monthlyPAndL.cashFlowOut)}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(monthlyPAndL.expensesByCategory).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay gastos categorizados este mes.</p>
            ) : (
              Object.entries(monthlyPAndL.expensesByCategory).map(([cat, amount]) => {
                const percent = monthlyPAndL.cashFlowOut > 0 ? (amount / monthlyPAndL.cashFlowOut) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate">{cat}</span>
                      <span className="font-mono tabular-nums font-bold">
                        {formatCurrency(amount)} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cash Health & Insights */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Diagnóstico Financiero de Caja
          </h3>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">Cobertura de Gastos Positiva</p>
                <p className="text-emerald-800 mt-0.5 leading-snug">
                  Tus ingresos cubren el 100% de los costos operativos y de inventario con un remanente neto de {formatCurrency(monthlyPAndL.netCashFlow)}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-950">Consejo de Liquidez</p>
                <p className="text-blue-800 mt-0.5 leading-snug">
                  Para maximizar tu flujo libre, cobra las cuentas pendientes registradas en el módulo de Deudas antes de fin de mes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <DollarSign className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Proyección Próximo Mes</p>
                <p className="text-amber-800 mt-0.5 leading-snug">
                  Manteniendo este ritmo promedio de ventas de {(monthlyPAndL.grossSales / 13).toFixed(1)}/día, estimamos ingresos de {formatCurrency((monthlyPAndL.grossSales / 13) * 30)} para Diciembre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
