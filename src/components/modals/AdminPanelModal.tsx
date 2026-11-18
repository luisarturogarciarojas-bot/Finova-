import React, { useState } from 'react';
import {
  X,
  Shield,
  Crown,
  Users,
  DollarSign,
  Tag,
  CheckCircle2,
  Ban,
  UserCheck,
  Trash2,
  Search,
  Sparkles,
  Percent,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  Store,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UserPlan } from '../../types/finance';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    currentUser,
    isAdmin,
    plansConfig,
    updatePlansConfig,
    featureAccess,
    toggleFeaturePremium,
    users,
    updateUserPlan,
    toggleUserStatus,
    deleteUser,
    formatCurrency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'prices' | 'features' | 'users'>('prices');
  const [searchUser, setSearchUser] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Prices local form state
  const [monthlyPrice, setMonthlyPrice] = useState(plansConfig.monthlyPrice.toString());
  const [annualPrice, setAnnualPrice] = useState(plansConfig.annualPrice.toString());
  const [discountPercent, setDiscountPercent] = useState(plansConfig.discountPercent.toString());
  const [currencySymbol, setCurrencySymbol] = useState(plansConfig.currencySymbol || '$');

  if (!isAdminModalOpen || !isAdmin) return null;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    const mPrice = parseFloat(monthlyPrice) || 0;
    const aPrice = parseFloat(annualPrice) || 0;
    const discount = parseInt(discountPercent, 10) || 0;

    updatePlansConfig({
      monthlyPrice: mPrice,
      annualPrice: aPrice,
      discountPercent: discount,
      currencySymbol,
    });

    showNotification('¡Precios de planes actualizados exitosamente!');
  };

  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.businessName.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 shrink-0 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Panel de Super Administrador
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ADMIN MASTER
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sesión activa: <span className="font-semibold text-amber-300">{currentUser?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('prices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'prices'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Precios de Planes</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'features'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Funciones Premium / Free</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {featureAccess.filter(f => f.isPremium).length} PRO
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Usuarios y Vetos ({users.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PRECIOS DE PLANES */}
          {activeTab === 'prices' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Control de Tarifas para Finova PRO
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Modifica aquí los precios que verán todos los usuarios al intentar acceder a funciones premium o al ver la pestaña de planes.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePrices} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-slate-800">
                      Precio Mensual ({currencySymbol})
                    </label>
                    <p className="text-[11px] text-slate-500">Costo recurrente mes a mes</p>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={monthlyPrice}
                        onChange={e => setMonthlyPrice(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm font-extrabold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-slate-800">
                      Precio Anual ({currencySymbol})
                    </label>
                    <p className="text-[11px] text-slate-500">Facturación anual en un solo pago</p>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={annualPrice}
                        onChange={e => setAnnualPrice(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm font-extrabold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-slate-800">
                      Porcentaje de Descuento Promocional (%)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Banner de descuento que se mostrará en la app (ej. 80%)
                    </p>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={discountPercent}
                        onChange={e => setDiscountPercent(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 text-sm font-extrabold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-slate-800">
                      Símbolo de Moneda
                    </label>
                    <p className="text-[11px] text-slate-500">Ejemplo: $, US$, COP$, €, etc.</p>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        required
                        value={currencySymbol}
                        onChange={e => setCurrencySymbol(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-extrabold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Vista previa para usuarios
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                      -{discountPercent}% DESCUENTO
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono">
                      {currencySymbol}{monthlyPrice}
                    </span>
                    <span className="text-xs text-slate-400">/ mes</span>
                    <span className="text-slate-500 text-xs">o</span>
                    <span className="text-lg font-bold text-amber-300 font-mono">
                      {currencySymbol}{annualPrice}
                    </span>
                    <span className="text-xs text-slate-400">/ año</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Nuevos Precios</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FUNCIONES PREMIUM / GRATIS */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">
                    Configuración de Módulos Premium vs Gratuitos
                  </h4>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Activa o desactiva qué opciones requieren suscripción PRO en la sección &ldquo;Descubre todo lo que puedes hacer&rdquo; y en las acciones del inventario. Los cambios se aplican al instante.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {featureAccess.map(feat => {
                  return (
                    <div
                      key={feat.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {feat.name}
                          </h4>
                          {feat.isPremium ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1 shrink-0">
                              <Crown className="w-3 h-3 text-amber-600" />
                              PRO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              GRATIS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {feat.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          toggleFeaturePremium(feat.id);
                          showNotification(
                            `Módulo "${feat.name}" cambiado a ${
                              !feat.isPremium ? 'PREMIUM (👑 PRO)' : 'GRATUITO (🆓)'
                            }`
                          );
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          feat.isPremium
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {feat.isPremium ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Es Premium</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Es Gratis</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GESTIÓN DE USUARIOS & VETOS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Stats */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    placeholder="Buscar por nombre, email o negocio..."
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
                  <span className="px-2 py-1 rounded-lg bg-slate-100">
                    Total: <b className="text-slate-900">{users.length}</b>
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                    Activos: <b className="text-emerald-950">{users.filter(u => u.status === 'active').length}</b>
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800">
                    Vetados: <b className="text-rose-950">{users.filter(u => u.status === 'banned').length}</b>
                  </span>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold">
                      No se encontraron usuarios con ese criterio.
                    </p>
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isSelfAdmin = u.email === 'luis31garciarojas@gmail.com';
                    const isBanned = u.status === 'banned';

                    return (
                      <div
                        key={u.id}
                        className={`bg-white rounded-2xl p-4 border transition-all ${
                          isBanned
                            ? 'border-rose-200 bg-rose-50/20'
                            : 'border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* User info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-slate-900 truncate">
                                {u.fullName}
                              </h4>
                              {isSelfAdmin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                                  👑 ÚNICO ADMIN
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                                  USUARIO NORMAL
                                </span>
                              )}
                              {isBanned ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1">
                                  <Ban className="w-3 h-3 text-rose-600" />
                                  VETADO / SUSPENDIDO
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  ACTIVO
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                              <span>{u.email}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-700 flex items-center gap-1">
                                <Store className="w-3 h-3 text-slate-400" />
                                {u.businessName}
                              </span>
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Registrado: {u.createdAt} • Último acceso: {u.lastLogin}
                            </p>
                          </div>

                          {/* Controls: Plan switcher + Ban button */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {/* Plan selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-600">Plan:</span>
                              <select
                                value={u.plan}
                                onChange={e => {
                                  updateUserPlan(u.id, e.target.value as UserPlan);
                                  showNotification(`Plan de ${u.fullName} actualizado a: ${e.target.value.toUpperCase()}`);
                                }}
                                disabled={isSelfAdmin}
                                className={`text-xs font-black px-2.5 py-1.5 rounded-xl border ${
                                  u.plan === 'pro' || u.plan === 'unlimited'
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                } focus:outline-hidden cursor-pointer`}
                              >
                                <option value="free">Gratis</option>
                                <option value="pro">👑 PRO</option>
                                <option value="unlimited">⭐ Ilimitado</option>
                              </select>
                            </div>

                            {/* Ban / Unban Toggle */}
                            {!isSelfAdmin && (
                              <button
                                onClick={() => {
                                  toggleUserStatus(u.id);
                                  showNotification(
                                    isBanned
                                      ? `Usuario ${u.fullName} desvetado y reactivado.`
                                      : `Usuario ${u.fullName} ha sido vetado del sistema.`
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                  isBanned
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                }`}
                                title={isBanned ? 'Reactivar usuario' : 'Vetar / Suspender acceso'}
                              >
                                {isBanned ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Desvetar</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Vetar</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSelfAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar permanentemente a ${u.fullName}?`)) {
                                    deleteUser(u.id);
                                    showNotification(`Usuario ${u.fullName} eliminado.`);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">
            Modo: <strong className="text-slate-900">Control Maestro de Negocio</strong>
          </span>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
