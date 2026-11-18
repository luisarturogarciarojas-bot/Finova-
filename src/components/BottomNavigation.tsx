import React from 'react';
import { Home, FileText, ArrowLeftRight, Package, ReceiptText, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, setIsSaleTypeSelectorOpen } = useFinance();

  const navItems = [
    {
      id: 'inicio' as const,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'balance' as const,
      label: 'Balance',
      icon: FileText,
    },
    {
      id: 'center' as const,
      label: 'Vender',
      isCenter: true,
    },
    {
      id: 'deudas' as const,
      label: 'Deudas',
      icon: ArrowLeftRight,
    },
    {
      id: 'inventario' as const,
      label: 'Inventario',
      icon: Package,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg transition-all">
      <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center h-16">
        {navItems.map(item => {
          if (item.isCenter) {
            return (
              <div key="center" className="relative -top-3 flex flex-col items-center">
                <button
                  onClick={() => setIsSaleTypeSelectorOpen(true)}
                  className="w-13 h-13 rounded-full bg-linear-to-tr from-[#FFB800] via-[#FFCF00] to-yellow-300 p-0.5 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white focus:outline-hidden group"
                  aria-label="Registrar Venta Rápida"
                >
                  <img
                    src="/src/assets/images/illustration_mascot_crown_1794618918419.jpg"
                    alt="Finova Mascot"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback icon if image fails
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const parent = (e.currentTarget as HTMLElement).parentElement;
                      if (parent) {
                        const icon = document.createElement('div');
                        icon.innerHTML = '👑';
                        icon.className = 'text-2xl';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </button>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5 tracking-tight">
                  + Vender
                </span>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'center') {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors relative focus:outline-hidden ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFCF00] rounded-full" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight leading-none ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
