import React, { useState } from 'react';
import { ChevronDown, Crown, Shield, User, LogIn, Sparkles, LogOut } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Header: React.FC = () => {
  const {
    profile,
    setIsSettingsModalOpen,
    setIsAccountsModalOpen,
    currentUser,
    isAdmin,
    setIsAdminModalOpen,
    setIsUpgradeModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
  } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-[#FFCF00] text-slate-900 shadow-xs transition-all select-none border-b border-amber-300/60">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: User Avatar & Business Selector (Matching Screenshot 1 & 2) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setIsAccountsModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white text-slate-900 border border-black/10 flex items-center justify-center shrink-0 shadow-xs hover:bg-slate-50 active:scale-95 transition-all focus:outline-hidden cursor-pointer relative"
            title="Abrir menú de usuario y cuentas"
            aria-label="Abrir menú de usuario y cuentas"
          >
            <User className="w-5 h-5 text-slate-800" />
            {isAdmin && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-950 text-amber-300 rounded-full flex items-center justify-center text-[9px] font-black border border-amber-400">
                ★
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsAccountsModalOpen(true)}
              className="flex items-center gap-1.5 text-left group hover:opacity-90 transition-opacity focus:outline-hidden cursor-pointer"
              title="Cambiar o gestionar cuentas de negocio"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h1 className="font-extrabold text-base sm:text-lg text-slate-950 truncate max-w-[170px] sm:max-w-[280px] leading-tight">
                    {currentUser?.businessName || profile.name}
                  </h1>
                  <ChevronDown className="w-4 h-4 text-slate-800 shrink-0" />
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-tight flex items-center gap-1">
                  <span>{isAdmin ? 'Administrador' : (profile.role || 'Usuario')}</span>
                  {isAdmin && (
                    <span className="text-[10px] font-black bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-md">
                      ADMIN ÚNICO
                    </span>
                  )}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Right: Admin Shortcut, Crown and Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Admin shortcut if logged in as Master Admin */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-black text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Abrir Panel de Super Administrador"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>
          )}

          {/* Crown Icon Button (Finova PRO) */}
          <button
            onClick={() => {
              if (isAdmin) {
                setIsAdminModalOpen(true);
              } else {
                setIsUpgradeModalOpen(true);
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/90 hover:bg-white text-blue-600 flex items-center justify-center relative shadow-xs active:scale-95 transition-all cursor-pointer border border-amber-300/80"
            title={isAdmin ? 'Panel de Administrador' : 'Finova PRO'}
            aria-label="Planes y Beneficios PRO"
          >
            <div className="relative">
              <Crown className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-blue-600 text-blue-600" />
              <span className="absolute -top-1 -right-1 text-[8px] text-amber-400">✨</span>
            </div>
          </button>

          {/* LogOut Quick Action */}
          <button
            onClick={() => logout()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs border border-black/10"
            title="Cerrar Sesión / Salir"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
