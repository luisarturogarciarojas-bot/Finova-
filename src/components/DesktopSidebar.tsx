import React from 'react';
import {
  Home,
  FileText,
  TrendingUp,
  Receipt,
  ArrowLeftRight,
  Package,
  FileSpreadsheet,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Settings,
  Sparkles,
  PieChart,
  Users,
  LogOut,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface DesktopSidebarProps {
  onOpenHelp: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onOpenHelp }) => {
  const {
    activeTab,
    setActiveTab,
    setIsSaleTypeSelectorOpen,
    setIsExpenseModalOpen,
    setIsSettingsModalOpen,
    logout,
    todayBalance,
    totalReceivables,
    formatCurrency,
  } = useFinance();

  const mainNav = [
    { id: 'inicio' as const, label: 'Inicio', icon: Home, badge: null },
    { id: 'balance' as const, label: 'Balance & Diario', icon: FileText, badge: null },
    { id: 'flujocaja' as const, label: 'Flujo de Caja Comparativo', icon: TrendingUp, badge: 'IA / Trend' },
    { id: 'facturas' as const, label: 'Facturación Automática', icon: Receipt, badge: 'Auto' },
    { id: 'reportes' as const, label: 'Reportes Mensuales P&L', icon: FileSpreadsheet, badge: 'Excel' },
    { id: 'deudas' as const, label: 'Deudas (Cobros y Pagos)', icon: ArrowLeftRight, badge: totalReceivables > 0 ? formatCurrency(totalReceivables) : null },
    { id: 'inventario' as const, label: 'Inventario & Catálogo', icon: Package, badge: null },
    { id: 'clientes' as const, label: 'Directorio de Clientes', icon: Users, badge: null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-xs">
      <div>
        {/* Quick Transaction CTAs */}
        <div className="p-4 border-b border-slate-100 space-y-2">
          <button
            onClick={() => setIsSaleTypeSelectorOpen(true)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            + Nueva Venta
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <MinusCircle className="w-4 h-4" />
            - Nuevo Gasto
          </button>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menú de Negocio
          </p>

          {mainNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-50 text-slate-950 font-bold border-l-4 border-[#FFCF00]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings and Help */}
      <div className="p-3 border-t border-slate-100 space-y-2">

        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            Ajustes
          </button>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Tutorial
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
};
