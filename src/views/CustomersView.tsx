import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Tag,
  CreditCard,
  DollarSign,
  Trash2,
  Edit2,
  Info,
  Download,
  ChevronRight,
  X,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Customer } from '../types/finance';

export const CustomersView: React.FC = () => {
  const {
    customers,
    customerCategories,
    addCustomerCategory,
    openCreateCustomerModal,
    updateCustomer,
    deleteCustomer,
    debts,
    formatCurrency,
    selectedDate,
    profile,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'debt' | 'settled'>('all');
  const [deleteConfirmCustomerId, setDeleteConfirmCustomerId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail & Edit Modal
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [editCreditDays, setEditCreditDays] = useState('15');
  const [editNotes, setEditNotes] = useState('');

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenDetail = (c: Customer) => {
    setSelectedCustomerForDetail(c);
    setIsEditingInDetail(false);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditEmail(c.email || '');
    setEditTaxId(c.taxId || '');
    setEditAddress(c.address || '');
    setEditCategory(c.category || 'Frecuente');
    setEditCreditLimit(c.creditLimit ? c.creditLimit.toString() : '300');
    setEditCreditDays(c.creditDays ? c.creditDays.toString() : '15');
    setEditNotes(c.notes || '');
  };

  // Helper to calculate total pending debt for a customer
  const getCustomerDebtInfo = (custName: string) => {
    const norm = custName.trim().toLowerCase();
    const custDebts = debts.filter(
      d => d.type === 'receivable' && d.contactName.trim().toLowerCase() === norm
    );
    const totalOriginal = custDebts.reduce((sum, d) => sum + d.totalAmount, 0);
    const remaining = custDebts.reduce((sum, d) => sum + d.remainingAmount, 0);
    const paid = custDebts.reduce((sum, d) => sum + d.paidAmount, 0);
    return {
      hasDebt: remaining > 0,
      remaining,
      paid,
      totalOriginal,
      count: custDebts.length,
    };
  };

  // Filter customers with wide search
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.taxId && c.taxId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const debtInfo = getCustomerDebtInfo(c.name);
    if (activeStatusFilter === 'debt' && !debtInfo.hasDebt) return false;
    if (activeStatusFilter === 'settled' && debtInfo.hasDebt) return false;

    return true;
  });

  // Calculate summary metrics
  const totalCustomersCount = customers.length;
  const customersWithDebtCount = customers.filter(c => getCustomerDebtInfo(c.name).hasDebt).length;
  const totalPendingFromCustomers = customers.reduce(
    (sum, c) => sum + getCustomerDebtInfo(c.name).remaining,
    0
  );

  const handleSendWhatsApp = (c: Customer) => {
    const debtInfo = getCustomerDebtInfo(c.name);
    const message = debtInfo.hasDebt
      ? `Hola ${c.name}, cordial saludo de ${profile.name}. Te recordamos que tienes un saldo pendiente de ${formatCurrency(debtInfo.remaining)}. ¿Deseas coordinar tu pago hoy? ¡Muchas gracias!`
      : `Hola ${c.name}, cordial saludo de ${profile.name}. ¡Esperamos que te encuentres muy bien! Queremos saludarte y presentarte las novedades en nuestro catálogo.`;

    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDownloadCustomersReport = () => {
    const rows = [
      [`DIRECTORIO GENERAL DE CLIENTES - ${profile.name.toUpperCase()}`],
      [`Fecha: ${selectedDate}`],
      [`Total Clientes: ${totalCustomersCount}`],
      [`Clientes con saldo pendiente: ${customersWithDebtCount}`],
      [`Monto total por cobrar: ${totalPendingFromCustomers}`],
      [''],
      ['Nombre Completo', 'Categoría', 'Teléfono', 'Email', 'Cédula/NIT', 'Dirección', 'Límite Crédito', 'Deuda Actual', 'Total Histórico Comprado'],
      ...customers.map(c => {
        const debt = getCustomerDebtInfo(c.name);
        return [
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.category || 'Frecuente'}"`,
          `"${c.phone}"`,
          `"${c.email || ''}"`,
          `"${c.taxId || ''}"`,
          `"${c.address || ''}"`,
          c.creditLimit || 0,
          debt.remaining,
          c.totalPurchases || 0,
        ];
      }),
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `directorio_clientes_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Directorio de clientes descargado en CSV');
  };

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12 max-w-4xl mx-auto relative min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metrics Cards - Matching Inventory style */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Total de clientes
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums mt-1.5">
            {totalCustomersCount}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4.5 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Con saldo pendiente
          </p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tabular-nums mt-1.5">
            {customersWithDebtCount}
            <span className="text-xs font-bold text-slate-400 ml-2">
              ({formatCurrency(totalPendingFromCustomers)})
            </span>
          </p>
        </div>
      </div>

      {/* Prominent 'Nuevo cliente' Action Card - Matching 'Nuevo producto' card in Inventory */}
      <button
        type="button"
        onClick={() => openCreateCustomerModal()}
        className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm text-slate-950 shadow-xs active:scale-98 transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <span>Nuevo cliente</span>
      </button>

      {/* Search Input & Status Filter - Expanded, comfortable and prominent */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 space-y-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes por nombre, teléfono, documento o dirección..."
            className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium text-slate-900 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 py-0.5">
            <button
              onClick={() => setActiveStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({customers.length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('debt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'debt'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Con Deuda ({customers.filter(c => getCustomerDebtInfo(c.name).hasDebt).length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'settled'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Al día
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadCustomersReport}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Exportar directorio en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[240px]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Users className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              No se encontraron clientes
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mb-4">
              {searchQuery
                ? `No hay coincidencias para "${searchQuery}".`
                : 'Comienza agregando los clientes de tu negocio para organizar sus datos y compras.'}
            </p>
            <button
              type="button"
              onClick={() => openCreateCustomerModal()}
              className="px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Primer Cliente</span>
            </button>
          </div>
        ) : (
          filteredCustomers.map(c => {
            const debtInfo = getCustomerDebtInfo(c.name);

            return (
              <div
                key={c.id}
                onClick={() => handleOpenDetail(c)}
                className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/90 hover:border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-sm group relative"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Stylized Avatar with initials and color */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${
                      c.colorBg || 'bg-[#EDE4F8] text-[#8444A0] border-[#E3D4F5]'
                    } flex items-center justify-center font-black text-xl shrink-0 select-none border shadow-xs`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                        {c.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </span>
                      {c.taxId && (
                        <>
                          <span>·</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {c.taxId}
                          </span>
                        </>
                      )}
                      {c.address && (
                        <>
                          <span>·</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {c.address}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Financial status badges */}
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {debtInfo.hasDebt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFEDEC] text-[#B91C1C]">
                          <AlertCircle className="w-3 h-3" />
                          Debe {formatCurrency(debtInfo.remaining)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Cuenta al día
                        </span>
                      )}

                      {c.creditLimit && c.creditLimit > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 font-mono">
                          Límite: {formatCurrency(c.creditLimit)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div
                  className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100"
                  onClick={e => e.stopPropagation()}
                >
                  {/* WhatsApp button */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(c)}
                    className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer shadow-xs"
                    title="Enviar mensaje de WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Direct Phone button */}
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                    title="Llamar al cliente"
                  >
                    <Phone className="w-4 h-4 stroke-[2.2]" />
                  </a>

                  {/* Delete button (with 2-tap confirmation) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (deleteConfirmCustomerId === c.id) {
                        deleteCustomer(c.id);
                        setDeleteConfirmCustomerId(null);
                        showNotification(`Cliente "${c.name}" eliminado`);
                      } else {
                        setDeleteConfirmCustomerId(c.id);
                        setTimeout(() => setDeleteConfirmCustomerId(null), 3500);
                      }
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      deleteConfirmCustomerId === c.id
                        ? 'bg-rose-600 text-white px-2.5 animate-pulse shadow-xs'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Eliminar si hubo una equivocación"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteConfirmCustomerId === c.id && <span>¿Borrar?</span>}
                  </button>

                  {/* Detail Info button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(c)}
                    className="w-8 h-8 rounded-full bg-[#FFEDEC] text-[#B91C1C] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors cursor-pointer shadow-xs"
                    title="Ver detalle y editar cliente"
                  >
                    <Info className="w-4.5 h-4.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: DETALLE Y EDICIÓN DEL CLIENTE                            */}
      {/* ========================================================================= */}
      {selectedCustomerForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="bg-[#FFCF00] px-5 py-4 rounded-t-3xl text-slate-900 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl ${
                    selectedCustomerForDetail.colorBg || 'bg-white text-slate-900'
                  } font-black text-lg flex items-center justify-center shrink-0 shadow-xs border`}
                >
                  {selectedCustomerForDetail.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-950 truncate">
                    {selectedCustomerForDetail.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedCustomerForDetail.category || 'Cliente'} · {selectedCustomerForDetail.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerForDetail(null)}
                className="w-9 h-9 rounded-full bg-white/40 hover:bg-white text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {!isEditingInDetail ? (
                <>
                  {/* Debt Summary Box for this customer */}
                  {(() => {
                    const debtInfo = getCustomerDebtInfo(selectedCustomerForDetail.name);
                    return (
                      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            Estado Financiero del Cliente
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              !debtInfo.hasDebt
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {!debtInfo.hasDebt ? 'Cuenta al Día' : 'Saldo Pendiente'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-slate-400 block text-[11px]">
                              Saldo por Cobrar
                            </span>
                            <p className="text-2xl font-black font-mono tabular-nums text-white mt-0.5">
                              {formatCurrency(debtInfo.remaining)}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">
                              Límite de Crédito
                            </span>
                            <p className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                              {formatCurrency(selectedCustomerForDetail.creditLimit || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-xs font-mono flex justify-between text-slate-400">
                          <span>Total Fiado Histórico: {formatCurrency(debtInfo.totalOriginal)}</span>
                          <span>Total Abonado: {formatCurrency(debtInfo.paid)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Customer Information Cards */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Teléfono / WhatsApp:</span>
                      <span className="font-bold text-slate-900">{selectedCustomerForDetail.phone}</span>
                    </div>
                    {selectedCustomerForDetail.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Correo:</span>
                        <span className="font-bold text-slate-900">{selectedCustomerForDetail.email}</span>
                      </div>
                    )}
                    {selectedCustomerForDetail.taxId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Cédula / Documento:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCustomerForDetail.taxId}</span>
                      </div>
                    )}
                    {selectedCustomerForDetail.address && (
                      <div className="flex items-start justify-between">
                        <span className="text-slate-500 font-semibold">Dirección:</span>
                        <span className="font-medium text-slate-900 text-right max-w-[200px]">
                          {selectedCustomerForDetail.address}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Plazo acordado:</span>
                      <span className="font-bold text-slate-900">
                        {selectedCustomerForDetail.creditDays || 15} días
                      </span>
                    </div>
                    {selectedCustomerForDetail.notes && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 font-semibold block mb-0.5">Notas especiales:</span>
                        <p className="text-slate-700 italic">{selectedCustomerForDetail.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action row in detail */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        deleteCustomer(selectedCustomerForDetail.id);
                        setSelectedCustomerForDetail(null);
                        showNotification('Cliente eliminado');
                      }}
                      className="p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors border border-rose-200 cursor-pointer"
                      title="Eliminar este cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingInDetail(true)}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Datos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(selectedCustomerForDetail)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Inline Edit Form */
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Cédula / Documento
                      </label>
                      <input
                        type="text"
                        value={editTaxId}
                        onChange={e => setEditTaxId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customerCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            editCategory.toLowerCase() === cat.toLowerCase()
                              ? 'bg-slate-950 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      placeholder="O escribe nueva categoría..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Límite de crédito ({profile.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editCreditLimit}
                        onChange={e => setEditCreditLimit(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Plazo (días)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editCreditDays}
                        onChange={e => setEditCreditDays(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={e => setEditAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Notas especiales
                    </label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInDetail(false)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editName.trim() || !editPhone.trim()) {
                          showNotification('Nombre y teléfono son obligatorios');
                          return;
                        }
                        const catTrim = editCategory.trim() || 'Frecuente';
                        if (!customerCategories.some(c => c.toLowerCase() === catTrim.toLowerCase())) {
                          addCustomerCategory(catTrim);
                        }

                        updateCustomer(selectedCustomerForDetail.id, {
                          name: editName.trim(),
                          phone: editPhone.trim(),
                          email: editEmail.trim() || undefined,
                          taxId: editTaxId.trim() || undefined,
                          address: editAddress.trim() || undefined,
                          category: catTrim,
                          creditLimit: parseFloat(editCreditLimit) || 0,
                          creditDays: parseInt(editCreditDays, 10) || 15,
                          notes: editNotes.trim() || undefined,
                        });

                        setSelectedCustomerForDetail({
                          ...selectedCustomerForDetail,
                          name: editName.trim(),
                          phone: editPhone.trim(),
                          email: editEmail.trim() || undefined,
                          taxId: editTaxId.trim() || undefined,
                          address: editAddress.trim() || undefined,
                          category: catTrim,
                          creditLimit: parseFloat(editCreditLimit) || 0,
                          creditDays: parseInt(editCreditDays, 10) || 15,
                          notes: editNotes.trim() || undefined,
                        });

                        setIsEditingInDetail(false);
                        showNotification('Datos del cliente actualizados');
                      }}
                      className="flex-1 py-2.5 text-xs font-extrabold text-white bg-slate-950 hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerForDetail(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
