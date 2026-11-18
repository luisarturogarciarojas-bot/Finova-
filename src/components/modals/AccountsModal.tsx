import React, { useState } from 'react';
import {
  LayoutGrid,
  Shirt,
  Store,
  X,
  Plus,
  ChevronRight,
  Check,
  Shield,
  Crown,
  User,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const AccountsModal: React.FC = () => {
  const {
    businessAccounts,
    activeAccountId,
    switchBusinessAccount,
    addBusinessAccount,
    isAccountsModalOpen,
    setIsAccountsModalOpen,
    setIsSettingsModalOpen,
    setIsImportOldCompanyModalOpen,
    currentUser,
    isAdmin,
    setIsAdminModalOpen,
    setIsUpgradeModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    bcvRates,
    isBcvLoading,
    refreshBcvRates,
    isBcvModeEnabled,
    toggleBcvMode,
    primaryDisplayCurrency,
    setPrimaryDisplayCurrency,
  } = useFinance();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreRole, setNewStoreRole] = useState('Propietario');
  const [newStoreType, setNewStoreType] = useState<'grid' | 'shirt' | 'store'>('store');

  if (!isAccountsModalOpen) return null;

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    addBusinessAccount(newStoreName.trim(), newStoreRole, newStoreType);
    setNewStoreName('');
    setIsAddingNew(false);
  };

  const getAccountIcon = (iconType: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`;
    if (iconType === 'grid') return <LayoutGrid className={iconClass} />;
    if (iconType === 'shirt') return <Shirt className={iconClass} />;
    return <Store className={iconClass} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header - Screenshot 1: Cuentas */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Perfil & Cuentas
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Administración de usuario y sucursales
            </p>
          </div>
          <button
            onClick={() => {
              setIsAddingNew(false);
              setIsAccountsModalOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar cuentas"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* User Session Profile Card */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                {currentUser ? currentUser.fullName.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-white truncate">
                    {currentUser?.fullName || 'Invitado'}
                  </h4>
                  {isAdmin ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                      ADMIN ÚNICO
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      USUARIO NORMAL
                    </span>
                  )}
                  {currentUser?.plan === 'pro' && !isAdmin && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {currentUser?.email || 'Sin sesión iniciada'}
                </p>
                <p className="text-[10px] text-amber-300 font-bold mt-1">
                  {isAdmin ? 'Acceso: Administrador Master' : 'Acceso: Usuario Normal'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {currentUser ? (
                <button
                  onClick={() => {
                    logout();
                    setIsAccountsModalOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAccountsModalOpen(false);
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ingresar</span>
                </button>
              )}
            </div>
          </div>

          {/* Special Quick Action Buttons */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
            {isAdmin ? (
              <button
                onClick={() => {
                  setIsAccountsModalOpen(false);
                  setIsAdminModalOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Panel Super Administrador</span>
              </button>
            ) : currentUser?.plan !== 'pro' ? (
              <button
                onClick={() => {
                  setIsAccountsModalOpen(false);
                  setIsUpgradeModalOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Actualizar a Finova PRO</span>
              </button>
            ) : null}

            {!currentUser && (
              <button
                onClick={() => {
                  setIsAccountsModalOpen(false);
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Crear Cuenta Nueva</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsAccountsModalOpen(false);
                setIsSettingsModalOpen(true);
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Configuración de tienda"
            >
              <Settings className="w-4 h-4" />
              <span>Tienda</span>
            </button>
          </div>
        </div>

        {/* Opción requerida: Cargar datos de empresa antigua */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-500/10 border border-amber-400/40 hover:border-amber-400 transition-all shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
              <FileUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-950">
                  Cargar datos de empresa antigua
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.2 bg-amber-400 text-slate-950 rounded-full">
                  PDF
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Carga un documento PDF con clientes, balances, inventario y deudas de tu anterior negocio para importarlos automáticamente a la aplicación.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsAccountsModalOpen(false);
                  setIsImportOldCompanyModalOpen(true);
                }}
                className="mt-2.5 px-3.5 py-2 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Cargar Documento PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Moneda venezolana (Tasa Oficial BCV) - Sleek Black Bar as requested */}
        <div className="mb-4 rounded-2xl bg-[#111927] text-white p-3.5 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇻🇪</span>
              <div>
                <p className="text-xs font-black text-white leading-tight">
                  Moneda venezolana (Tasa Oficial BCV)
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isBcvModeEnabled
                    ? `1 USD = Bs. ${bcvRates.usdRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 1 EUR = Bs. ${bcvRates.eurRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'Desactivada (Toca para activar conversiones)'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleBcvMode()}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isBcvModeEnabled
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isBcvModeEnabled ? 'Activada' : 'Activar'}
            </button>
          </div>

          {isBcvModeEnabled && (
            <div className="pt-2 border-t border-slate-800 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-300">
                  Elige cambio para ver tus saldos:
                </span>
                <button
                  type="button"
                  onClick={() => refreshBcvRates()}
                  disabled={isBcvLoading}
                  className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[10px] flex items-center gap-1 font-semibold"
                  title="Actualizar tasas"
                >
                  <span className={`inline-block ${isBcvLoading ? 'animate-spin' : ''}`}>↻</span>
                  <span>{isBcvLoading ? '...' : 'Tasas'}</span>
                </button>
              </div>

              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPrimaryDisplayCurrency('USD')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    primaryDisplayCurrency === 'USD'
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-101'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono font-black">$ USD</span>
                  <span className="text-[10px] font-semibold opacity-90">(Dólares)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrimaryDisplayCurrency('EUR')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    primaryDisplayCurrency === 'EUR'
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-101'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono font-black">€ EUR</span>
                  <span className="text-[10px] font-semibold opacity-90">(Euros)</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                {primaryDisplayCurrency === 'USD'
                  ? 'Activo: $ USD. Tus saldos se muestran en Dólares con contrapartes en Euros y Bolívares en blanco.'
                  : 'Activo: € EUR. Tus saldos se muestran en Euros con contrapartes en Dólares y Bolívares en blanco.'}
              </p>
            </div>
          )}
        </div>

        {/* Business Accounts Section Heading */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Tus Negocios y Sucursales
            </h4>
          </div>

          {!isAddingNew ? (
            <div className="space-y-2.5">
              {businessAccounts.map(account => {
                const isSelected = account.id === activeAccountId;

                return (
                  <div
                    key={account.id}
                    onClick={() => {
                      switchBusinessAccount(account.id);
                      setIsAccountsModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FFF3B3] border border-amber-300/80 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/80 border border-black/5">
                        {getAccountIcon(account.iconType, isSelected)}
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="font-extrabold text-sm text-slate-950 truncate">
                          {account.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {account.role} · Activo
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected ? (
                        <span className="text-[10px] font-black tracking-wider text-amber-950 uppercase bg-amber-400/40 px-2.5 py-1 rounded-lg">
                          ACTIVO
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Añadir otro negocio */}
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3.5 px-3 flex items-center gap-3 text-xs font-extrabold text-slate-900 hover:bg-slate-50 rounded-2xl border border-dashed border-slate-300 transition-colors mt-2 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Añadir otro negocio o sucursal</span>
              </button>
            </div>
          ) : (
            /* Form to Add New Business */
            <form onSubmit={handleCreateBusiness} className="space-y-3.5 pt-2">
              <h4 className="text-sm font-extrabold text-slate-900">
                Nuevo Negocio o Sucursal
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  placeholder="Ej: Galaxy Store - Sucursal Centro"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tu Rol
                  </label>
                  <input
                    type="text"
                    value={newStoreRole}
                    onChange={e => setNewStoreRole(e.target.value)}
                    placeholder="Propietario"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Comercio
                  </label>
                  <select
                    value={newStoreType}
                    onChange={e => setNewStoreType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white"
                  >
                    <option value="grid">Tienda General</option>
                    <option value="shirt">Moda / Ropa</option>
                    <option value="store">Comercio / Perfumería</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black text-slate-950 bg-[#FFCF00] hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Crear Negocio
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
