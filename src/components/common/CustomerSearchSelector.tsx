import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  Users,
  ChevronDown,
  Search,
  X,
  Plus,
  Check,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Customer } from '../../types/finance';

interface CustomerSearchSelectorProps {
  customerName: string;
  onSelectCustomer: (name: string, customer?: Customer) => void;
  label?: string;
  placeholder?: string;
  showFrequentPills?: boolean;
}

export const CustomerSearchSelector: React.FC<CustomerSearchSelectorProps> = ({
  customerName,
  onSelectCustomer,
  label = 'Cliente (Opcional)',
  placeholder = 'Escribe el nombre o busca en el directorio...',
  showFrequentPills = true,
}) => {
  const {
    customers,
    debts,
    formatCurrency,
    openCreateCustomerModal,
    customerCategories,
  } = useFinance();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCategoryFilter('all');
    }
  }, [isPanelOpen]);

  // Find if currently entered name corresponds to a registered customer
  const matchedCustomer = useMemo(() => {
    if (!customerName.trim()) return null;
    return customers.find(
      c => c.name.trim().toLowerCase() === customerName.trim().toLowerCase()
    );
  }, [customers, customerName]);

  // Calculate customer debt if any
  const getCustomerDebt = (custName: string): number => {
    return debts
      .filter(
        d =>
          d.type === 'receivable' &&
          d.status !== 'paid' &&
          d.contactName.trim().toLowerCase() === custName.trim().toLowerCase()
      )
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  };

  // Filter customers for the panel
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return customers.filter(c => {
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (c.taxId && c.taxId.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.category && c.category.toLowerCase().includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedCategoryFilter !== 'all') {
        return (c.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase();
      }

      return true;
    });
  }, [customers, searchQuery, selectedCategoryFilter]);

  // Frequent customers (first 4 or those with purchases)
  const frequentCustomers = useMemo(() => {
    return customers.slice(0, 5);
  }, [customers]);

  const handleSelect = (name: string, cust?: Customer) => {
    onSelectCustomer(name, cust);
    setIsPanelOpen(false);
  };

  const handleClear = () => {
    onSelectCustomer('');
  };

  const handleCreateNewCustomer = (prefillName?: string) => {
    openCreateCustomerModal((newCust: Customer) => {
      onSelectCustomer(newCust.name, newCust);
      setIsPanelOpen(false);
    });
  };

  const matchedDebt = matchedCustomer ? getCustomerDebt(matchedCustomer.name) : 0;

  return (
    <div className="space-y-2">
      {/* Header with Title and Clear Action */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-extrabold text-slate-800 tracking-tight">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {customerName && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer transition-colors"
            >
              Quitar cliente
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Directorio ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Enlarged, Legible Quick Customers ("pequeñas letras" made comfortable and clear) */}
      {showFrequentPills && customers.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 select-none">
            Frecuentes:
          </span>
          {frequentCustomers.map(c => {
            const isSelected =
              customerName.trim().toLowerCase() === c.name.trim().toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.name, c)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200 shadow-2xs'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate max-w-[120px]">{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Expanded Customer Input Panel */}
      <div
        className={`relative flex items-center bg-white border-2 rounded-2xl transition-all shadow-xs ${
          isPanelOpen
            ? 'border-amber-400 ring-3 ring-amber-400/20'
            : matchedCustomer
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Left Customer Avatar / Icon */}
        <div className="pl-3.5 pr-2 py-3 flex items-center justify-center shrink-0">
          {matchedCustomer ? (
            <div
              className={`w-8 h-8 rounded-xl ${
                matchedCustomer.colorBg || 'bg-emerald-100 text-emerald-800'
              } flex items-center justify-center font-black text-xs border shadow-2xs`}
              title={`Cliente registrado: ${matchedCustomer.name}`}
            >
              {matchedCustomer.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Text Input (Wide, roomy, comfortably legible) */}
        <input
          type="text"
          value={customerName}
          onChange={e => onSelectCustomer(e.target.value)}
          placeholder={placeholder}
          className="flex-1 py-3 pr-2 text-sm font-bold text-slate-900 bg-transparent placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden"
        />

        {/* Right Action Icons: Clear & Dropdown Chevron Arrow */}
        <div className="flex items-center gap-1 pr-2 shrink-0">
          {customerName && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Borrar nombre"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Prominent Down Arrow to trigger the Wide Customer Search Panel */}
          <button
            type="button"
            onClick={() => setIsPanelOpen(prev => !prev)}
            className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1 border border-slate-200"
            title="Desplegar directorio amplio de clientes"
          >
            <ChevronDown
              className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                isPanelOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Matched Customer Info Badge */}
      {matchedCustomer && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-extrabold text-emerald-950">
                {matchedCustomer.name}
              </span>
              <span className="text-emerald-700 font-medium ml-1.5">
                · {matchedCustomer.phone || 'Sin teléfono'}
              </span>
              {matchedCustomer.taxId && (
                <span className="text-emerald-700 font-medium ml-1.5">
                  · {matchedCustomer.taxId}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {matchedDebt > 0 ? (
              <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
                Debe: {formatCurrency(matchedDebt)}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-200/60 text-emerald-900">
                Al día
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              className="text-[11px] font-extrabold text-emerald-800 hover:underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WIDE CUSTOMER SELECTION PANEL (Roomy, complete directory with search)    */}
      {/* ========================================================================= */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            
            {/* Panel Top Yellow / Amber Header */}
            <div className="bg-[#FFCF00] px-5 py-3.5 border-b border-amber-300 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-slate-950 shadow-2xs">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                    Buscar y Seleccionar Cliente
                  </h3>
                  <p className="text-xs font-bold text-slate-800">
                    {customers.length} cliente{customers.length !== 1 ? 's' : ''} en el directorio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateNewCustomer(searchQuery)}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Roomy Search Input Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, documento (CC / NIT), categoría..."
                  className="w-full pl-11 pr-10 py-3 text-sm font-semibold bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-hidden shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todos ({customers.length})
                </button>
                {customerCategories.map(cat => {
                  const count = customers.filter(
                    c => (c.category || '').toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategoryFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer List: Wide, roomy, rich card displays */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FAF8F5]">
              {/* Option: Cliente de Mostrador (Venta Ocasional) */}
              <div
                onClick={() => handleSelect('Cliente de Mostrador')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  customerName === 'Cliente de Mostrador' || customerName === ''
                    ? 'bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Cliente de Mostrador
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Venta anónima sin asociar a una persona específica
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Seleccionar
                </button>
              </div>

              {/* Registered Customers List */}
              {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 flex flex-col items-center justify-center my-4 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {searchQuery
                        ? `No se encontró ningún cliente con "${searchQuery}"`
                        : 'No hay clientes en esta categoría'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                      Puedes registrar este cliente ahora mismo y se guardará en tu directorio con sus datos de contacto y crédito.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateNewCustomer(searchQuery)}
                    className="mt-2 px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar a "{searchQuery.trim() || 'Nuevo Cliente'}"</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredCustomers.map(customer => {
                    const isSelected =
                      customerName.trim().toLowerCase() === customer.name.trim().toLowerCase();
                    const pendingDebt = getCustomerDebt(customer.name);

                    return (
                      <div
                        key={customer.id}
                        onClick={() => handleSelect(customer.name, customer)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Color Avatar */}
                            <div
                              className={`w-11 h-11 rounded-2xl ${
                                customer.colorBg || 'bg-[#EDE4F8] text-[#8444A0]'
                              } flex items-center justify-center font-black text-base shrink-0 border shadow-2xs`}
                            >
                              {customer.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-slate-900 truncate leading-tight">
                                {customer.name}
                              </h4>
                              <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{customer.phone}</span>
                              </p>
                            </div>
                          </div>

                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Customer Tags & Debt Status */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                              {customer.category || 'General'}
                            </span>
                            {customer.taxId && (
                              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 truncate max-w-[100px]">
                                {customer.taxId}
                              </span>
                            )}
                          </div>

                          {pendingDebt > 0 ? (
                            <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                              Debe: {formatCurrency(pendingDebt)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 shrink-0">
                              Al día
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Roomy Bottom Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                {customerName ? (
                  <span>
                    Seleccionado:{' '}
                    <strong className="text-slate-900 font-black">
                      {customerName}
                    </strong>
                  </span>
                ) : (
                  <span>Sin cliente seleccionado</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-950 hover:bg-black text-white transition-colors cursor-pointer shadow-xs"
                >
                  Aceptar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
