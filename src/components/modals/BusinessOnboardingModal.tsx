import React, { useState } from 'react';
import { Building2, X, Check, ArrowRight, Store, Phone, MapPin, FileText, DollarSign, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const BusinessOnboardingModal: React.FC = () => {
  const {
    isBusinessOnboardingOpen,
    setIsBusinessOnboardingOpen,
    profile,
    updateProfile,
    currentUser,
  } = useFinance();

  const [name, setName] = useState(profile.name || currentUser?.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(profile.businessCategory || 'Comercio General');
  const [ownerName, setOwnerName] = useState(profile.ownerName || currentUser?.fullName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [taxId, setTaxId] = useState(profile.taxId || '');
  const [currency, setCurrency] = useState(profile.currency || 'USD');
  const [description, setDescription] = useState(profile.description || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isBusinessOnboardingOpen) return null;

  const categoryOptions = [
    'Comercio General / Minimarket',
    'Víveres, Alimentos & Restaurante',
    'Boutique, Ropa & Calzado',
    'Tecnología, Celulares & Computación',
    'Servicios Profesionales & Talleres',
    'Farmacia, Salud & Cosmética',
    'Ferretería & Construcción',
    'Mayorista, Distribuidora & Logística',
    'Emprendimiento Personal / Otro',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      ownerName: ownerName.trim() || profile.ownerName,
      businessCategory,
      phone: phone.trim(),
      address: address.trim(),
      taxId: taxId.trim(),
      currency,
      currencySymbol: currency === 'EUR' ? '€' : '$',
      description: description.trim(),
      logoText: (name.trim() || profile.name).slice(0, 2).toUpperCase(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsBusinessOnboardingOpen(false);
    }, 700);
  };

  const handleSkip = () => {
    setIsBusinessOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFCF00] text-slate-950 font-black flex items-center justify-center shadow-xs shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  ¿De qué trata tu empresa?
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cuéntanos sobre tu negocio para personalizar tu experiencia y comprobantes.
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-base font-black text-slate-900">
              ¡Información guardada exitosamente!
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Los datos de tu empresa han sido actualizados y vinculados a tus recibos e inventario.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Nombre de la Empresa o Negocio *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Galaxy Store, Distribuidora Central..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category / Rubro */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                ¿A qué se dedica tu empresa? (Rubro Principal)
              </label>
              <select
                value={businessCategory}
                onChange={e => setBusinessCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner & Tax ID Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Propietario o Encargado
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Cédula / RIF / Identificación Fiscal
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    placeholder="Ej: J-12345678-9 o V-12345678"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ej: +58 412 1234567"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Dirección o Ciudad
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej: Av. Bolívar, Valencia"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Main Currency */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Moneda de Operación Principal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'USD', label: '$ USD (Dólares)' },
                  { code: 'VES', label: 'Bs. VES (Bolívares)' },
                  { code: 'EUR', label: '€ EUR (Euros)' },
                ].map(curr => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      currency === curr.code
                        ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Descripción de Productos o Servicios (Opcional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Breve reseña de lo que vendes u ofreces para adaptar tus reportes..."
                className="w-full p-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden resize-none"
              />
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed font-medium">
              💡 <strong>Nota:</strong> Este paso es opcional. Puedes guardar ahora o cambiar estos datos cuando desees tocando el ícono de tu usuario y seleccionando <strong>Tienda en configuración</strong>.
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                Omitir por ahora
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-slate-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Guardar Información</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
