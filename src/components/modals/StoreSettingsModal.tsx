import React, { useState } from 'react';
import { Store, X, Save, RotateCcw, ShieldCheck, Check, Smartphone } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const StoreSettingsModal: React.FC = () => {
  const {
    profile,
    updateProfile,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    resetAllData,
    bcvRates,
    isBcvLoading,
    refreshBcvRates,
    primaryDisplayCurrency,
    setPrimaryDisplayCurrency,
    toggleBcvMode,
  } = useFinance();

  const [name, setName] = useState(profile.name);
  const [businessCategory, setBusinessCategory] = useState(profile.businessCategory || 'Comercio General');
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [role, setRole] = useState(profile.role);
  const [taxId, setTaxId] = useState(profile.taxId);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [description, setDescription] = useState(profile.description || '');
  const [currency, setCurrency] = useState(profile.currency);
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol);
  const [logoText, setLogoText] = useState(profile.logoText || profile.name.slice(0, 2).toUpperCase());
  const [isBcvEnabled, setIsBcvEnabled] = useState(Boolean(profile.isBcvModeEnabled));
  const [selectedDisplayCurr, setSelectedDisplayCurr] = useState<'USD' | 'EUR'>(primaryDisplayCurrency || (profile.primaryDisplayCurrency === 'EUR' ? 'EUR' : 'USD'));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectDisplayCurrency = (curr: 'USD' | 'EUR') => {
    setSelectedDisplayCurr(curr);
    setPrimaryDisplayCurrency(curr);
    updateProfile({ primaryDisplayCurrency: curr });
  };

  const handleToggleBcv = (enabled: boolean) => {
    setIsBcvEnabled(enabled);
    toggleBcvMode(enabled);
    updateProfile({ isBcvModeEnabled: enabled });
  };

  if (!isSettingsModalOpen) return null;

  const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'Dólares ($ USD)' },
    { code: 'COP', symbol: '$', name: 'Pesos Colombianos ($ COP)' },
    { code: 'MXN', symbol: '$', name: 'Pesos Mexicanos ($ MXN)' },
    { code: 'EUR', symbol: '€', name: 'Euros (€ EUR)' },
    { code: 'PEN', symbol: 'S/', name: 'Soles Peruanos (S/ PEN)' },
    { code: 'ARS', symbol: '$', name: 'Pesos Argentinos ($ ARS)' },
    { code: 'CLP', symbol: '$', name: 'Pesos Chilenos ($ CLP)' },
  ];

  const handleCurrencyChange = (code: string) => {
    const opt = currencyOptions.find(o => o.code === code);
    if (opt) {
      setCurrency(opt.code);
      setCurrencySymbol(opt.symbol);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      businessCategory,
      ownerName,
      role,
      taxId,
      phone,
      email,
      address,
      description,
      currency,
      currencySymbol,
      logoText: logoText || name.slice(0, 2).toUpperCase(),
      isBcvModeEnabled: isBcvEnabled,
      primaryDisplayCurrency: selectedDisplayCurr,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 600);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todos los datos de tu negocio y empezar de 0? Esta acción borrará todas las ventas, productos, clientes y deudas para dejar el sistema limpio.')) {
      resetAllData();
      setIsSettingsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFCF00] text-slate-950 font-black flex items-center justify-center text-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Perfil de Negocio & Sucursales
              </h3>
              <p className="text-[11px] text-slate-500">Datos para comprobantes y facturación</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Comercial del Negocio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold"
              placeholder="Ej: Galaxy store Luis"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ¿A qué se dedica tu empresa? (Rubro)
            </label>
            <select
              value={businessCategory}
              onChange={e => setBusinessCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium bg-white cursor-pointer"
            >
              {[
                'Comercio General / Minimarket',
                'Víveres, Alimentos & Restaurante',
                'Boutique, Ropa & Calzado',
                'Tecnología, Celulares & Computación',
                'Servicios Profesionales & Talleres',
                'Farmacia, Salud & Cosmética',
                'Ferretería & Construcción',
                'Mayorista, Distribuidora & Logística',
                'Emprendimiento Personal / Otro',
              ].map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Propietario / Administrador
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                placeholder="Luis García"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Rol
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                placeholder="Propietario"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIT / RFC / RUT
              </label>
              <input
                type="text"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                placeholder="NIT 901.458.293-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moneda de Operación
              </label>
              <select
                value={currency}
                onChange={e => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-white font-semibold"
              >
                {currencyOptions.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp / Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                placeholder="+57 312 458 9920"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Siglas Logotipo
              </label>
              <input
                type="text"
                maxLength={4}
                value={logoText}
                onChange={e => setLogoText(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-center font-bold"
                placeholder="GL"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dirección del Establecimiento
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              placeholder="Cra 15 # 85-32, Local 104"
            />
          </div>

          {/* Venezuelan Currency / BCV Official Mode - Sleek Black Bar exactly as requested */}
          <div className="rounded-3xl bg-[#111927] text-white p-4 sm:p-5 shadow-lg border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇻🇪</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    Moneda venezolana (Tasa Oficial BCV)
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Dólares y Euros a tasa oficial del Banco Central de Venezuela
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBcvEnabled}
                  onChange={e => handleToggleBcv(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {isBcvEnabled && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in">
                {/* Live rates ticker display inside black bar */}
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-amber-400 font-black">BCV:</span>
                      <span className="font-mono text-slate-100">
                        USD Bs. {bcvRates.usdRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-slate-100">
                        EUR Bs. {bcvRates.eurRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => refreshBcvRates()}
                      disabled={isBcvLoading}
                      className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-semibold"
                      title="Actualizar tasas en vivo"
                    >
                      <RotateCcw className={`w-3 h-3 ${isBcvLoading ? 'animate-spin' : ''}`} />
                      <span>{isBcvLoading ? 'Cargando...' : 'Actualizar tasas'}</span>
                    </button>
                  </div>
                </div>

                {/* Currency selector buttons inside black bar: $ USD / € EUR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Elige cambio para ver tus saldos:
                    </span>
                    <span className="text-[10px] text-amber-400 font-black">
                      Activo: {selectedDisplayCurr === 'USD' ? '$ USD (Dólares)' : '€ EUR (Euros)'}
                    </span>
                  </div>

                  <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectDisplayCurrency('USD')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        selectedDisplayCurr === 'USD'
                          ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-101'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono text-sm">$ USD</span>
                      <span className="text-[10px] font-semibold opacity-90">(Dólares)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDisplayCurrency('EUR')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        selectedDisplayCurr === 'EUR'
                          ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-101'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono text-sm">€ EUR</span>
                      <span className="text-[10px] font-semibold opacity-90">(Euros)</span>
                    </button>
                  </div>

                  {/* Informative explanation */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    {selectedDisplayCurr === 'USD' ? (
                      <p>
                        💡 <strong>Configurada en Dólares ($ USD):</strong> Al salir verás tu balance, ventas, gastos y deudas en <strong>USD ($)</strong> con contraparte en <strong>Euros (€)</strong> y en <strong>Bolívares (Bs. BCV)</strong> en blanco.
                      </p>
                    ) : (
                      <p>
                        💡 <strong>Configurada en Euros (€ EUR):</strong> Al salir verás tu balance, ventas, gastos y deudas en <strong>EUR (€)</strong> (numéricamente menor por la tasa cambiaria del euro) con contraparte en <strong>Dólares ($)</strong> y en <strong>Bolívares (Bs. BCV)</strong> en blanco.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* App Installation on Mobile & Desktop */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/pwa-192x192.png"
                  alt="Fino Logo"
                  className="w-7 h-7 rounded-lg border border-amber-400/40 object-cover shadow-2xs"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Instalar App Fino</h4>
                  <p className="text-[10px] text-slate-500">Agrega el icono directo a tu pantalla de inicio</p>
                </div>
              </div>
              <PWAInstallButton variant="compact" />
            </div>
          </div>

          {/* Reset All Data to 0 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Vaciar registros y empezar de 0
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-[#FFCF00] hover:bg-amber-400 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Guardado' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
