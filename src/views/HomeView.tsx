import React from 'react';
import {
  TrendingUp,
  Receipt,
  FileCheck,
  UserCheck,
  Truck,
  Coins,
  ChevronRight,
  PieChart,
  Crown,
  Sparkles,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BcvAmountDisplay } from '../components/common/BcvAmountDisplay';

export const HomeView: React.FC = () => {
  const {
    todaySales,
    todayExpenses,
    todayBalance,
    vsYesterdayPercent,
    setIsSaleTypeSelectorOpen,
    setIsExpenseModalOpen,
    setActiveTab,
    monthlyPAndL,
    formatCurrency,
    featureAccess,
    checkFeatureAccess,
    plansConfig,
    setIsUpgradeModalOpen,
  } = useFinance();

  const isPositiveGrowth = vsYesterdayPercent >= 0;

  // Features dynamically connected to admin-controlled featureAccess
  const featureItems = [
    {
      id: 'estadisticas_flujo',
      title: 'Estadísticas & Flujo',
      icon: PieChart,
      iconBg: 'bg-emerald-50 text-emerald-600',
      action: () => {
        if (checkFeatureAccess('estadisticas_flujo')) {
          setActiveTab('flujocaja');
        }
      },
    },
    {
      id: 'facturas_auto',
      title: 'Facturación Auto',
      icon: Receipt,
      iconBg: 'bg-blue-50 text-blue-600',
      action: () => {
        if (checkFeatureAccess('facturas_auto')) {
          setActiveTab('facturas');
        }
      },
    },
    {
      id: 'exportar_reportes',
      title: 'Reportes P&L',
      icon: TrendingUp,
      iconBg: 'bg-purple-50 text-purple-600',
      action: () => {
        if (checkFeatureAccess('exportar_reportes')) {
          setActiveTab('reportes');
        }
      },
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600',
      action: () => {
        setActiveTab('clientes');
      },
    },
    {
      id: 'deudas_historial',
      title: 'Deudas & Cobros',
      icon: FileCheck,
      iconBg: 'bg-amber-50 text-amber-600',
      action: () => {
        if (checkFeatureAccess('deudas_historial')) {
          setActiveTab('deudas');
        }
      },
    },
    {
      id: 'conteo_inventario',
      title: 'Inventario & Stock',
      icon: UserCheck,
      iconBg: 'bg-yellow-50 text-amber-700',
      action: () => {
        setActiveTab('inventario');
      },
    },
    {
      id: 'catalogo_virtual',
      title: 'Catálogo & Tienda',
      icon: ShoppingBag,
      iconBg: 'bg-rose-50 text-rose-600',
      action: () => {
        if (checkFeatureAccess('catalogo_virtual')) {
          setActiveTab('inventario');
        }
      },
    },
  ];

  const facturasFeature = featureAccess.find(f => f.id === 'facturas_auto');

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-24 md:pb-8">
      {/* "Tu negocio hoy" Main Card - Faithful to Treinta styling */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 tracking-tight">
              Tu negocio hoy
            </h2>
            <div className="mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <BcvAmountDisplay amount={todaySales} size="3xl" />
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPositiveGrowth
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span>vs ayer</span>
                  <span className="font-mono">
                    {isPositiveGrowth ? '↑' : '↓'} {Math.abs(vsYesterdayPercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Ventas hoy</p>
          </div>
        </div>

        {/* Balance vs Expenses split */}
        <div className="grid grid-cols-2 gap-4 my-5 pt-3 border-t border-slate-100">
          <div>
            <BcvAmountDisplay amount={todayBalance} size="xl" colorClass="text-emerald-700" />
            <p className="text-xs font-medium text-slate-600 mt-0.5">Balance neto</p>
          </div>
          <div>
            <BcvAmountDisplay amount={todayExpenses} size="xl" colorClass="text-rose-600" />
            <p className="text-xs font-medium text-slate-600 mt-0.5">Gastos hoy</p>
          </div>
        </div>

        {/* Action Button: Registrar venta (Dark Slate) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsSaleTypeSelectorOpen(true)}
            className="w-full py-3 px-4 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>Registrar venta</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-rose-600" />
            <span>Registrar gasto</span>
          </button>
        </div>
      </div>

      {/* "Descubre todo lo que puedes hacer" Section */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 px-1 mb-2.5">
          Descubre todo lo que puedes hacer
        </h3>

        {/* Hero virtual catalog & automated invoicing banner */}
        <div
          onClick={() => {
            if (checkFeatureAccess('facturas_auto')) {
              setActiveTab('facturas');
            }
          }}
          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-amber-200 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs mb-3 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-yellow-50 flex items-center justify-center text-amber-600 border border-amber-200/60 shrink-0">
              <Receipt className="w-6 h-6 text-amber-600" />
              {facturasFeature?.isPremium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  👑
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                  Facturación Automática
                </h4>
                {facturasFeature?.isPremium && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-100 text-amber-900">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Emite comprobantes con folios secuenciales y comparte por WhatsApp
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all shrink-0" />
        </div>

        {/* 6 Icons Grid - Dynamically hooked to featureAccess */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {featureItems.map(item => {
            const Icon = item.icon;
            const feat = featureAccess.find(f => f.id === item.id);
            const isPremium = feat?.isPremium ?? false;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-100/90 hover:border-amber-200 flex flex-col items-center justify-center text-center group transition-all hover:shadow-xs active:scale-95 cursor-pointer relative"
              >
                <div className="relative mb-2">
                  <div
                    className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isPremium && (
                    <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                      👑
                    </div>
                  )}
                </div>
                <span className="text-[12px] font-bold text-slate-800 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cash Flow Highlights Quick Banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 rounded-3xl p-4 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-xs shrink-0 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Flujo de Caja Noviembre: <span className="font-bold text-emerald-700 font-mono">{formatCurrency(monthlyPAndL.netCashFlow)}</span>
            </p>
            <p className="text-[11px] text-slate-600">
              Margen neto del {monthlyPAndL.netMarginPercent.toFixed(1)}% en lo corrido del mes.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (checkFeatureAccess('estadisticas_flujo')) {
              setActiveTab('flujocaja');
            }
          }}
          className="text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
        >
          Ver Análisis Comparativo →
        </button>
      </div>

      {/* Promo Banner with Dynamic Admin Discount */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 rounded-3xl p-4 shadow-xs border border-rose-100 flex items-center justify-between overflow-hidden relative">
        <div className="max-w-[70%] z-10">
          <span className="text-xs font-black text-rose-700 tracking-tight flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
            ¡{plansConfig.discountPercent}% de descuento en tu plan PRO!
          </span>
          <p className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">
            Desde solo {plansConfig.currencySymbol || '$'}{plansConfig.monthlyPrice}/mes o {plansConfig.currencySymbol || '$'}{plansConfig.annualPrice}/año. Desbloquea facturación, reportes y conteos sin límites.
          </p>
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="mt-2.5 text-xs font-extrabold text-slate-950 bg-[#FFCF00] hover:bg-amber-400 px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Activar Beneficios PRO</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Decorative graphic */}
        <div className="shrink-0 pl-2">
          <div className="w-16 h-16 rounded-2xl bg-white/80 border border-rose-200/60 shadow-xs flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
