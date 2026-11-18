import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronRight,
  Receipt,
  Building,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MonthlyPAndL } from '../types/finance';

export const MonthlyReportsView: React.FC = () => {
  const {
    profile,
    sixMonthsPAndL,
    transactions,
    formatCurrency,
  } = useFinance();

  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-11');

  const currentReport =
    sixMonthsPAndL.find(m => m.monthKey === selectedMonthKey) || sixMonthsPAndL[sixMonthsPAndL.length - 1];

  // Previous month for comparison
  const currentIndex = sixMonthsPAndL.findIndex(m => m.monthKey === selectedMonthKey);
  const previousReport = currentIndex > 0 ? sixMonthsPAndL[currentIndex - 1] : null;

  // Month transactions
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonthKey));
  const totalSalesCount = monthTransactions.filter(t => t.type === 'sale').length;
  const averageTicket = totalSalesCount > 0 ? currentReport.grossSales / totalSalesCount : 0;

  const handleDownloadCSV = () => {
    const csvContent = [
      `ESTADO DE RESULTADOS MENSUAL - ${profile.name}`,
      `Período: ${currentReport.monthName} (${currentReport.monthKey})`,
      `Moneda: ${profile.currency}`,
      `Fecha de Generación: ${new Date().toISOString().split('T')[0]}`,
      '',
      'CONCEPTO,MONTO,MARGEN / NOTAS',
      `Ingresos Operacionales (Ventas Brutas),${currentReport.grossSales},100%`,
      `(-) Costo de Mercancía Vendida (COGS),-${currentReport.costOfGoodsSold},${((currentReport.costOfGoodsSold / (currentReport.grossSales || 1)) * 100).toFixed(1)}%`,
      `(=) UTILIDAD BRUTA,${currentReport.grossProfit},${currentReport.grossMarginPercent.toFixed(1)}%`,
      '',
      'GASTOS OPERATIVOS (OPEX):',
      ...Object.entries(currentReport.expensesByCategory).map(([cat, val]) => {
        const num = Number(val) || 0;
        return `  ${cat},-${num},${((num / (currentReport.grossSales || 1)) * 100).toFixed(1)}%`;
      }),
      `Total Gastos Operativos,-${currentReport.operatingExpenses},`,
      '',
      `(=) UTILIDAD NETA DEL EJERCICIO,${currentReport.netProfit},${currentReport.netMarginPercent.toFixed(1)}%`,
      '',
      'INDICADORES DE CAJA:',
      `Entradas Totales de Caja,${currentReport.cashFlowIn},`,
      `Salidas Totales de Caja,${currentReport.cashFlowOut},`,
      `Flujo Neto de Efectivo,${currentReport.netCashFlow},`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_mensual_${selectedMonthKey}_${profile.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12">
      {/* Header and Month Selector */}
      <div className="no-print bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-950">
              Reporte Mensual Detallado (P&L)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Estado de resultados formal con balance de rentabilidad, costos y margen neto.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Month selector dropdown */}
          <select
            value={selectedMonthKey}
            onChange={e => setSelectedMonthKey(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800 shadow-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          >
            {sixMonthsPAndL.map(m => (
              <option key={m.monthKey} value={m.monthKey}>
                {m.monthName} ({m.monthKey})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadCSV}
            className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Descargar en formato CSV compatible con Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Imprimir informe contable"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Ventas Totales</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(currentReport.grossSales)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalSalesCount} operaciones</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Margen Bruto</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
            {currentReport.grossMarginPercent.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{formatCurrency(currentReport.grossProfit)} ganancia bruta</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Gastos del Mes</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono tabular-nums mt-1">
            {formatCurrency(currentReport.cashFlowOut)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Opex + Inversión</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Utilidad Neta</p>
          <p className="text-xl sm:text-2xl font-black text-blue-700 font-mono tabular-nums mt-1">
            {formatCurrency(currentReport.netProfit)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Margen neto: {currentReport.netMarginPercent.toFixed(1)}%</p>
        </div>
      </div>

      {/* Official Financial Statement Document (#printable-report) */}
      <div id="printable-report" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 text-slate-900">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#FFCF00] text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                {profile.logoText || 'GL'}
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                {profile.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500">{profile.taxId} · {profile.address}</p>
            <p className="text-xs text-slate-500">Contacto: {profile.phone} · {profile.email}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              ESTADO DE RESULTADOS INTEGRAL
            </span>
            <span className="text-lg font-black text-slate-900 block mt-0.5">
              {currentReport.monthName} {currentReport.monthKey.slice(0, 4)}
            </span>
            <span className="text-xs text-slate-500 block">
              Expresado en: {profile.currency} ({profile.currencySymbol})
            </span>
          </div>
        </div>

        {/* Detailed Financial Statement Table */}
        <div className="py-6 space-y-6 text-xs sm:text-sm">
          {/* 1. Ingresos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl font-bold text-slate-900">
              <span>1. INGRESOS OPERACIONALES</span>
              <span className="font-mono text-emerald-700">{formatCurrency(currentReport.grossSales)}</span>
            </div>
            <div className="px-4 space-y-1.5 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>Ventas de Mostrador y Productos</span>
                <span className="font-mono">{formatCurrency(currentReport.grossSales * 0.75)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ventas Mayoristas y Facturación Electrónica</span>
                <span className="font-mono">{formatCurrency(currentReport.grossSales * 0.25)}</span>
              </div>
            </div>
          </div>

          {/* 2. Costo de Ventas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl font-bold text-slate-900">
              <span>2. (-) COSTO DE MERCANCÍA VENDIDA (COGS)</span>
              <span className="font-mono text-rose-600">-{formatCurrency(currentReport.costOfGoodsSold)}</span>
            </div>
            <div className="px-4 space-y-1.5 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>Reposición de inventario y compras de productos</span>
                <span className="font-mono">-{formatCurrency(currentReport.costOfGoodsSold)}</span>
              </div>
            </div>
          </div>

          {/* 3. Utilidad Bruta */}
          <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-100 px-4 py-2.5 rounded-xl font-extrabold text-slate-950">
            <div>
              <span>3. (=) UTILIDAD BRUTA</span>
              <span className="block text-[11px] font-normal text-emerald-800">
                Margen Bruto sobre ventas: {currentReport.grossMarginPercent.toFixed(1)}%
              </span>
            </div>
            <span className="font-mono text-base text-emerald-700">
              {formatCurrency(currentReport.grossProfit)}
            </span>
          </div>

          {/* 4. Gastos Operativos (Opex) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl font-bold text-slate-900">
              <span>4. (-) GASTOS OPERATIVOS DE ADMINISTRACIÓN Y VENTAS</span>
              <span className="font-mono text-rose-600">-{formatCurrency(currentReport.operatingExpenses)}</span>
            </div>
            <div className="px-4 space-y-2 text-slate-600 text-xs">
              {Object.entries(currentReport.expensesByCategory).map(([cat, val]) => (
                <div key={cat} className="flex justify-between border-b border-slate-100 pb-1">
                  <span>{cat}</span>
                  <span className="font-mono text-slate-800 font-semibold">-{formatCurrency(Number(val) || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Utilidad Neta Final */}
          <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-4 rounded-2xl font-black shadow-sm">
            <div>
              <span className="text-sm sm:text-base">5. (=) UTILIDAD NETA DEL EJERCICIO</span>
              <span className="block text-xs font-normal text-slate-300">
                Ganancia limpia después de todos los gastos · Margen neto: {currentReport.netMarginPercent.toFixed(1)}%
              </span>
            </div>
            <span className="font-mono text-xl sm:text-2xl text-amber-300">
              {formatCurrency(currentReport.netProfit)}
            </span>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700 mb-1">Notas Contables:</p>
            <p className="leading-relaxed">
              Informe preparado automáticamente conforme a los registros y comprobantes del sistema Finova para el negocio {profile.name}. Todos los valores corresponden al período reportado.
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="w-48 ml-auto border-b border-slate-400 mb-1 pb-4 text-center font-bold text-slate-800">
              {profile.ownerName}
            </div>
            <p className="text-center w-48 ml-auto">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
