import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  User,
  Plus,
  Check,
  Tag,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Customer } from '../../types/finance';

const CUSTOMER_COLOR_OPTIONS = [
  { id: 'lilac', name: 'Lila Finova', bgClass: 'bg-[#EDE4F8] text-[#8444A0] border-[#E3D4F5]' },
  { id: 'emerald', name: 'Esmeralda', bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'amber', name: 'Ámbar Dorado', bgClass: 'bg-amber-100 text-amber-900 border-amber-200' },
  { id: 'blue', name: 'Azul Real', bgClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'rose', name: 'Rosa Coral', bgClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'slate', name: 'Gris Carbón', bgClass: 'bg-slate-900 text-white border-slate-700' },
];

export const CreateCustomerModal: React.FC = () => {
  const {
    isCreateCustomerModalOpen,
    setIsCreateCustomerModalOpen,
    customerCategories,
    addCustomerCategory,
    addCustomer,
    addDebt,
    formatCurrency,
    profile,
    selectedDate,
  } = useFinance();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(customerCategories[0] || 'Frecuente');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [creditLimit, setCreditLimit] = useState('300');
  const [creditDays, setCreditDays] = useState('15');
  const [initialDebtAmount, setInitialDebtAmount] = useState('');
  const [initialDebtNotes, setInitialDebtNotes] = useState('Saldo pendiente inicial');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(CUSTOMER_COLOR_OPTIONS[0]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isCreateCustomerModalOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleCreateNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    addCustomerCategory(trimmed);
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCategory(capitalized);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
    showToast(`Categoría "${capitalized}" guardada`);
  };

  const handleSaveCustomer = (saveAndKeepOpen = false) => {
    if (!name.trim()) {
      showToast('Por favor escribe el nombre completo del cliente');
      return;
    }
    if (!phone.trim()) {
      showToast('Por favor ingresa un número de teléfono o WhatsApp');
      return;
    }

    const currentCat = category.trim() || 'Frecuente';
    const limitNum = parseFloat(creditLimit) || 0;
    const daysNum = parseInt(creditDays, 10) || 15;
    const initDebtNum = parseFloat(initialDebtAmount) || 0;

    const newCust = addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      taxId: taxId.trim() || undefined,
      address: address.trim() || undefined,
      category: currentCat,
      creditLimit: limitNum,
      creditDays: daysNum,
      notes: notes.trim() || undefined,
      colorBg: selectedColor.bgClass,
      createdAt: selectedDate,
    });

    // If initial debt was specified, register it automatically
    if (initDebtNum > 0) {
      addDebt({
        type: 'receivable',
        contactName: name.trim(),
        contactPhone: phone.trim(),
        contactEmail: email.trim() || undefined,
        totalAmount: initDebtNum,
        dueDate: '2026-11-30',
        createdAt: selectedDate,
        notes: initialDebtNotes.trim() || 'Saldo anterior / Deuda inicial',
      });
    }

    if (saveAndKeepOpen) {
      showToast(`¡Cliente "${name.trim()}" guardado! Puedes registrar el siguiente.`);
      // Reset form fields
      setName('');
      setPhone('');
      setEmail('');
      setTaxId('');
      setAddress('');
      setInitialDebtAmount('');
      setNotes('');
    } else {
      setIsCreateCustomerModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setTaxId('');
      setAddress('');
      setInitialDebtAmount('');
      setNotes('');
    }
  };

  const initialDebtNum = parseFloat(initialDebtAmount) || 0;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 md:backdrop-blur-xs flex items-center justify-center p-0 md:p-6 overflow-hidden select-none">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-slate-950 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container: Full screen on mobile, spacious elegant floating window on desktop */}
      <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] md:max-w-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border-0 md:border md:border-slate-100">
        
        {/* Sticky Header */}
        <div className="bg-[#FFCF00] px-4 sm:px-6 py-3.5 border-b border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateCustomerModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
              title="Cerrar y volver"
            >
              <ArrowLeft className="w-5 h-5 md:hidden" />
              <X className="w-5 h-5 hidden md:block" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                Nuevo Cliente
              </h2>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {profile.name} · Directorio y Fiados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveCustomer(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]">
          
          {/* SECTION 1: IDENTIFICACIÓN DEL CLIENTE */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Identificación del Cliente
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Campos obligatorios (*)
              </span>
            </div>

            {/* Nombre del Cliente */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Nombre completo o Razón Social *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Carolina Méndez, Comercializadora Andina..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-semibold transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Con este nombre se emitirán las notas de cobro, facturas y recordatorios por WhatsApp.
              </p>
            </div>

            {/* Cédula / DNI / NIT */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Documento de Identidad / Cédula / NIT / RFC (Opcional)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                placeholder="Ej: CC 52.894.210 o NIT 900.874.112-9"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium"
              />
            </div>

          </div>

          {/* SECTION 2: DATOS DE CONTACTO & UBICACIÓN */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Contacto & Ubicación
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Canal de Cobro
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Permite enviar estados de cuenta y cobrar con un toque vía WhatsApp.
                </p>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Correo Electrónico (Opcional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Para el envío automático de facturas y recibos electrónicos.
                </p>
              </div>
            </div>

            {/* Dirección de entrega / Local */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Dirección / Ciudad / Local comercial (Opcional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Ej: Calle 100 # 19A-40, Apto 502, Bogotá"
                  className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONDICIONES COMERCIALES, CRÉDITO Y SALDO INICIAL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Condiciones Comerciales & Crédito (Fiado)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Control Financiero
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Límite de Crédito Permitido */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Límite de Crédito permitido
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-500 text-sm">
                    {profile.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    placeholder="300"
                    className="w-full pl-8 pr-4 py-2.5 text-base font-black font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Monto máximo que le puedes fiar a este cliente.
                </p>
              </div>

              {/* Plazo de Pago Pactado */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Plazo de Pago (Días)
                </label>
                <select
                  value={creditDays}
                  onChange={e => setCreditDays(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer"
                >
                  <option value="0">Contado (Sin crédito)</option>
                  <option value="7">7 días (Semanal)</option>
                  <option value="15">15 días (Quincenal)</option>
                  <option value="30">30 días (Mensual)</option>
                  <option value="60">60 días (Bimestral)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fecha sugerida para calcular vencimiento al emitir ventas a crédito.
                </p>
              </div>
            </div>

            {/* Saldo Inicial Pendiente / Deuda anterior */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950">
                    ¿Este cliente ya tiene una deuda o fiado pendiente?
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Si te debía dinero antes de registrarlo aquí, puedes anotarlo de una vez.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Monto pendiente inicial ({profile.currencySymbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-amber-700 text-xs">
                      {profile.currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={initialDebtAmount}
                      onChange={e => setInitialDebtAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-sm font-black font-mono tabular-nums bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Concepto o nota de la deuda
                  </label>
                  <input
                    type="text"
                    value={initialDebtNotes}
                    onChange={e => setInitialDebtNotes(e.target.value)}
                    placeholder="Ej: Saldo de ropa anterior"
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Notas y preferencias */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Notas y preferencias de compra (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej: Paga puntual por transferencia Bancolombia, prefiere entregas por la tarde..."
                className="w-full px-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* SECTION 4: COLOR E IDENTIFICADOR VISUAL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xs">
                  4
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Estilo Visual & Vista Previa
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Tarjeta de Cliente
              </span>
            </div>

            {/* Selector de Color */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">
                Color de la tarjeta / avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CUSTOMER_COLOR_OPTIONS.map(opt => {
                  const isPicked = selectedColor.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedColor(opt)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isPicked
                          ? 'border-slate-900 ring-2 ring-slate-950/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${opt.bgClass} flex items-center justify-center font-black text-xs border shadow-xs`}>
                        {name.trim() ? name.trim().charAt(0).toUpperCase() : 'C'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vista Previa en Vivo */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-extrabold text-slate-700 mb-2">
                Vista previa de la ficha del cliente:
              </p>
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl ${selectedColor.bgClass} flex items-center justify-center font-black text-xl shrink-0 select-none border shadow-xs`}>
                    {name.trim() ? name.trim().charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {name.trim() || 'Nombre del Cliente'}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 truncate">
                      {category} · {phone.trim() || '+57 ...'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        Límite: {formatCurrency(parseFloat(creditLimit) || 0)}
                      </span>
                      {initialDebtNum > 0 && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800">
                          Deuda: {formatCurrency(initialDebtNum)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Plazo
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {creditDays} días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="bg-white p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => setIsCreateCustomerModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSaveCustomer(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors cursor-pointer text-center shadow-xs"
            >
              Guardar y crear otro
            </button>
            <button
              type="button"
              onClick={() => handleSaveCustomer(false)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs font-black bg-slate-950 hover:bg-black text-white transition-all shadow-md active:scale-95 cursor-pointer text-center"
            >
              Guardar Cliente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
