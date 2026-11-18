import React, { useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Phone,
  Trash2,
  DollarSign,
  Search,
  ChevronRight,
  X,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileText,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Debt, DebtPayment } from '../types/finance';
import { BcvAmountDisplay } from '../components/common/BcvAmountDisplay';

interface ContactDebtGroup {
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  type: 'receivable' | 'payable';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  debtsCount: number;
  pendingDebtsCount: number;
  status: 'pending' | 'partially_paid' | 'paid';
  latestDate: string;
  earliestDueDate: string;
  debts: Debt[];
  allPayments: (DebtPayment & { debtConcept?: string; debtId: string })[];
}

export const DebtsView: React.FC = () => {
  const {
    debts,
    addDebt,
    recordContactPayment,
    deleteDebt,
    deleteContactDebts,
    customers,
    suppliers,
    setIsSaleTypeSelectorOpen,
    setIsExpenseModalOpen,
    profile,
    formatCurrency,
    selectedDate,
  } = useFinance();

  // Subtabs: 'receivable' (Por cobrar) | 'payable' (Por pagar)
  const [debtType, setDebtType] = useState<'receivable' | 'payable'>('receivable');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Modals & Panels
  const [selectedContactForDetail, setSelectedContactForDetail] = useState<ContactDebtGroup | null>(null);
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [contactForNewDebt, setContactForNewDebt] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [contactForPayment, setContactForPayment] = useState<ContactDebtGroup | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('Efectivo');
  const [confirmDeleteContactName, setConfirmDeleteContactName] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // New debt form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // 1. Group all debts by contact name for the current debtType
  const contactGroups = useMemo<ContactDebtGroup[]>(() => {
    const map: Record<string, ContactDebtGroup> = {};
    const filteredDebts = debts.filter(d => d.type === debtType);

    filteredDebts.forEach(debt => {
      const key = debt.contactName.trim().toLowerCase();
      if (!map[key]) {
        map[key] = {
          contactName: debt.contactName.trim(),
          contactPhone: debt.contactPhone || '',
          contactEmail: debt.contactEmail,
          type: debt.type,
          totalAmount: 0,
          paidAmount: 0,
          remainingAmount: 0,
          debtsCount: 0,
          pendingDebtsCount: 0,
          status: 'pending',
          latestDate: debt.createdAt,
          earliestDueDate: debt.dueDate,
          debts: [],
          allPayments: [],
        };
      }

      const group = map[key];
      group.totalAmount += debt.totalAmount;
      group.paidAmount += debt.paidAmount;
      group.remainingAmount += debt.remainingAmount;
      group.debtsCount += 1;
      if (debt.remainingAmount > 0) {
        group.pendingDebtsCount += 1;
      }
      if (debt.createdAt > group.latestDate) {
        group.latestDate = debt.createdAt;
      }
      if (!group.earliestDueDate || debt.dueDate < group.earliestDueDate) {
        group.earliestDueDate = debt.dueDate;
      }
      if (!group.contactPhone && debt.contactPhone) {
        group.contactPhone = debt.contactPhone;
      }

      group.debts.push(debt);

      if (debt.history && debt.history.length > 0) {
        debt.history.forEach(p => {
          group.allPayments.push({
            ...p,
            debtConcept: debt.notes || 'Compra a crédito / Fiado',
            debtId: debt.id,
          });
        });
      }
    });

    // Compute status and sort debts per group
    return Object.values(map).map(group => {
      let status: 'pending' | 'partially_paid' | 'paid' = 'pending';
      if (group.remainingAmount <= 0) {
        status = 'paid';
      } else if (group.paidAmount > 0) {
        status = 'partially_paid';
      }

      // Sort debts newest first
      group.debts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      // Sort payments newest first
      group.allPayments.sort((a, b) => b.date.localeCompare(a.date));

      return {
        ...group,
        status,
      };
    });
  }, [debts, debtType]);

  // Global summary metrics
  const { totalPending, totalCollected, totalOriginal } = useMemo(() => {
    let pending = 0;
    let collected = 0;
    let original = 0;

    contactGroups.forEach(g => {
      pending += g.remainingAmount;
      collected += g.paidAmount;
      original += g.totalAmount;
    });

    return {
      totalPending: pending,
      totalCollected: collected,
      totalOriginal: original,
    };
  }, [contactGroups]);

  // Filtered contacts based on search & status filter
  const displayedContacts = useMemo(() => {
    return contactGroups.filter(g => {
      const matchesSearch =
        g.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.contactPhone.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (statusFilter === 'pending') return g.remainingAmount > 0;
      if (statusFilter === 'paid') return g.remainingAmount === 0;
      return true;
    });
  }, [contactGroups, searchQuery, statusFilter]);

  // Keep selectedContactForDetail fresh when debts update
  const currentDetailContact = useMemo(() => {
    if (!selectedContactForDetail) return null;
    return (
      contactGroups.find(
        g => g.contactName.toLowerCase() === selectedContactForDetail.contactName.toLowerCase()
      ) || null
    );
  }, [contactGroups, selectedContactForDetail]);

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(totalAmount);
    if (!contactName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addDebt({
      type: debtType,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      totalAmount: amountNum,
      dueDate: dueDate || '2026-11-30',
      createdAt: selectedDate || '2026-11-13',
      notes: notes.trim() || (debtType === 'receivable' ? 'Venta a crédito / Fiado' : 'Compra a crédito'),
    });

    setContactName('');
    setContactPhone('');
    setTotalAmount('');
    setDueDate('');
    setNotes('');
    setIsNewDebtModalOpen(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForPayment) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    recordContactPayment(contactForPayment.contactName, debtType, amountNum, paymentNote);
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNote('Efectivo');
    setContactForPayment(null);
  };

  const openAbonoModal = (group: ContactDebtGroup) => {
    setContactForPayment(group);
    setPaymentAmount(group.remainingAmount > 0 ? group.remainingAmount.toString() : '');
    setIsPaymentModalOpen(true);
  };

  const openNewDebtForContact = (contactNamePreset: string, phonePreset = '') => {
    setContactName(contactNamePreset);
    setContactPhone(phonePreset);
    setTotalAmount('');
    setDueDate('2026-11-30');
    setNotes('');
    setIsNewDebtModalOpen(true);
  };

  const handleSendWhatsAppReminder = (group: ContactDebtGroup) => {
    const pendingItemsSummary = group.debts
      .filter(d => d.remainingAmount > 0)
      .map(d => `• ${d.notes || 'Compra'} (${d.createdAt}): ${formatCurrency(d.remainingAmount)}`)
      .join('\n');

    const messageText =
      `Hola ${group.contactName}, cordial saludo de parte de ${profile.name}.\n\n` +
      `Te escribimos para recordarte que tienes un saldo pendiente en tu cuenta por valor de *${formatCurrency(
        group.remainingAmount
      )}*.\n\n` +
      (pendingItemsSummary ? `Detalle de compras pendientes:\n${pendingItemsSummary}\n\n` : '') +
      `Quedamos a tu disposición para coordinar el pago. ¡Muchas gracias por tu preferencia!`;

    const cleanPhone = group.contactPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  const handleExportContactStatement = (group: ContactDebtGroup) => {
    const rows = [
      [`ESTADO DE CUENTA: ${group.contactName.toUpperCase()}`],
      [`Teléfono: ${group.contactPhone || 'N/A'}`],
      [`Fecha de emisión: ${selectedDate}`],
      [`Total Fiado: ${group.totalAmount}`],
      [`Total Abonado: ${group.paidAmount}`],
      [`Saldo Pendiente: ${group.remainingAmount}`],
      [''],
      ['Tipo', 'Fecha', 'Concepto / Detalle', 'Monto', 'Estado', 'Vence'],
    ];

    group.debts.forEach(d => {
      rows.push([
        'COMPRA A CRÉDITO',
        d.createdAt,
        `"${d.notes || 'Fiado'}"`,
        `+${d.totalAmount}`,
        d.status === 'paid' ? 'PAGADA' : d.status === 'partially_paid' ? 'ABONO PARCIAL' : 'PENDIENTE',
        d.dueDate,
      ]);
    });

    group.allPayments.forEach(p => {
      rows.push([
        'ABONO RECIBIDO',
        p.date,
        `"${p.notes || 'Abono registrado'}"`,
        `-${p.amount}`,
        'APLICADO',
        '-',
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `estado_cuenta_${group.contactName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDebtsReport = () => {
    const reportTitle = debtType === 'receivable' ? 'REPORTE_CLIENTES_FIADOS' : 'REPORTE_PROVEEDORES_DEUDAS';
    const rows = [
      [`${debtType === 'receivable' ? 'REPORTE GENERAL DE CUENTAS POR COBRAR (CLIENTES)' : 'REPORTE GENERAL DE CUENTAS POR PAGAR (PROVEEDORES)'}`],
      [`Negocio: ${profile.name}`],
      [`Fecha: ${selectedDate}`],
      [`Total ${debtType === 'receivable' ? 'a Cobrar' : 'a Pagar'}: ${totalPending}`],
      [`Total ${debtType === 'receivable' ? 'Cobrado' : 'Pagado'}: ${totalCollected}`],
      [`Total ${debtType === 'receivable' ? 'Fiado Histórico' : 'a Crédito'}: ${totalOriginal}`],
      [''],
      ['Contacto', 'Teléfono', 'Total Fiado', 'Total Abonado', 'Saldo Pendiente', 'Estado', 'Última Fecha'],
      ...contactGroups.map(g => [
        `"${g.contactName.replace(/"/g, '""')}"`,
        `"${g.contactPhone}"`,
        g.totalAmount,
        g.paidAmount,
        g.remainingAmount,
        g.remainingAmount === 0 ? 'Al día' : 'Pendiente',
        g.latestDate,
      ]),
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportTitle.toLowerCase()}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Reporte descargado correctamente en CSV');
  };

  return (
    <div className="flex flex-col">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Subtabs: [Por cobrar] | [Por pagar] - Directly connected to Header with zero white space */}
      <div className="bg-[#FFCF00] px-4 sm:px-6 pt-1 pb-0 shadow-xs border-b border-black/10 select-none">
        <div className="max-w-md mx-auto grid grid-cols-2 text-center">
          <button
            onClick={() => {
              setDebtType('receivable');
              setSelectedContactForDetail(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              debtType === 'receivable'
                ? 'text-slate-950 border-b-3 border-slate-900 font-extrabold'
                : 'text-slate-700 hover:text-black font-semibold'
            }`}
          >
            Por cobrar (Clientes)
          </button>
          <button
            onClick={() => {
              setDebtType('payable');
              setSelectedContactForDetail(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              debtType === 'payable'
                ? 'text-slate-950 border-b-3 border-slate-900 font-extrabold'
                : 'text-slate-700 hover:text-black font-semibold'
            }`}
          >
            Por pagar (Proveedores)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12">
        {/* Burbuja Balance General - Idéntica a la burbuja de BalanceView según lo solicitado */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
          {/* Header de la burbuja */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700">
              {debtType === 'receivable' ? 'Balance General de Clientes' : 'Balance General de Proveedores'}
            </span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {debtType === 'receivable' ? 'Cuentas por cobrar' : 'Cuentas por pagar'}
            </span>
          </div>

          {/* Grid de dos columnas: Total a cobrar al lado de Total cobrado */}
          <div className="grid grid-cols-2 gap-4 py-1">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                <span>{debtType === 'receivable' ? 'Total a cobrar' : 'Total a pagar'}</span>
              </div>
              <div className="mt-1">
                <BcvAmountDisplay amount={totalPending} size="2xl" colorClass="text-slate-950" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Saldo pendiente actual</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{debtType === 'receivable' ? 'Total cobrado' : 'Total pagado'}</span>
              </div>
              <div className="mt-1">
                <BcvAmountDisplay amount={totalCollected} size="2xl" colorClass="text-emerald-700" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Abonos recibidos</p>
            </div>
          </div>

          {/* Abajo: Total fiado y enlace de Descarga de Reporte */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">
                {debtType === 'receivable' ? 'Total fiado:' : 'Total compras a crédito:'}
              </span>
              <BcvAmountDisplay amount={totalOriginal} size="sm" layout="inline" />
            </div>

            <button
              type="button"
              onClick={handleDownloadDebtsReport}
              className="text-slate-700 hover:text-black underline underline-offset-4 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Reporte</span>
            </button>
          </div>

          {/* Abajo de eso: Botón "+ Nuevo fiado" o "+ Nuevo por cobrar" */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setContactName('');
                setContactPhone('');
                setTotalAmount('');
                setDueDate('2026-11-30');
                setNotes('');
                setIsNewDebtModalOpen(true);
              }}
              className="w-full py-3.5 px-4 bg-slate-950 hover:bg-black text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] text-amber-300" />
              <span>{debtType === 'receivable' ? '+ Nuevo fiado (por cobrar)' : '+ Nueva deuda (por pagar)'}</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                debtType === 'receivable'
                  ? 'Buscar cliente por nombre o teléfono...'
                  : 'Buscar proveedor por nombre o teléfono...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos ({contactGroups.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Con saldo ({contactGroups.filter(g => g.remainingAmount > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Al día ({contactGroups.filter(g => g.remainingAmount === 0).length})
            </button>
          </div>
        </div>

        {/* Contact Group List or Empty State (Faithful to Screenshots 22-26-44 & 22-26-57) */}
        {displayedContacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 flex flex-col items-center justify-center min-h-[340px]">
            <div className="w-36 h-36 mb-4 relative">
              <img
                src="/src/assets/images/illustration_empty_debts_1794618917038.jpg"
                alt="No tienes deudas"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={e => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <h4 className="text-base font-bold text-slate-900">
              {debtType === 'payable' ? 'No tienes deudas por pagar' : 'No tienes deudas por cobrar'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {debtType === 'payable'
                ? 'Créalas en "Nuevo gasto" con modo Deuda o añade deudas a proveedores aquí.'
                : 'Créalas en "Nueva venta" cuando des productos fiados o añade un cliente aquí.'}
            </p>

            <button
              onClick={() => {
                setContactName('');
                setContactPhone('');
                setTotalAmount('');
                setDueDate('2026-11-30');
                setNotes('');
                setIsNewDebtModalOpen(true);
              }}
              className="mt-5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              + Registrar {debtType === 'payable' ? 'Deuda' : 'Cuenta por cobrar'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedContacts.map(group => {
              const isSettled = group.remainingAmount === 0;
              const hasPartial = group.paidAmount > 0 && group.remainingAmount > 0;
              const percentPaid =
                group.totalAmount > 0 ? Math.min(100, (group.paidAmount / group.totalAmount) * 100) : 100;

              return (
                <div
                  key={group.contactName}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-amber-300 transition-all space-y-3 group cursor-pointer"
                  onClick={() => setSelectedContactForDetail(group)}
                >
                  {/* Card Header: Contact Info & Balance */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200/50">
                        {group.contactName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-950 truncate">
                            {group.contactName}
                          </h4>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                          {group.contactPhone && (
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {group.contactPhone}
                            </span>
                          )}
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {group.debtsCount} {group.debtsCount === 1 ? 'operación' : 'operaciones'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Balance Right */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-400 block">Saldo</span>
                      <BcvAmountDisplay
                        amount={group.remainingAmount}
                        size="sm"
                        colorClass={isSettled ? 'text-emerald-700' : 'text-slate-900'}
                        layout="subtle"
                        align="right"
                      />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          isSettled
                            ? 'bg-emerald-50 text-emerald-700'
                            : hasPartial
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isSettled ? 'Al día' : hasPartial ? `Abonó ${formatCurrency(group.paidAmount)}` : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Abonado: {formatCurrency(group.paidAmount)}</span>
                      <span>Total: {formatCurrency(group.totalAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSettled ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>

                  {/* Action buttons on card */}
                  <div
                    className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isSettled && (
                        <button
                          onClick={() => openAbonoModal(group)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Abonar
                        </button>
                      )}

                      <button
                        onClick={() => openNewDebtForContact(group.contactName, group.contactPhone)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer text-xs"
                        title="Agregar otra compra a crédito a este contacto"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Otra deuda</span>
                      </button>

                      {group.type === 'receivable' && !isSettled && (
                        <button
                          onClick={() => handleSendWhatsAppReminder(group)}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          title="Enviar cobro por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Cobrar WhatsApp
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (confirmDeleteContactName === group.contactName) {
                            deleteContactDebts(group.contactName, group.type);
                            setConfirmDeleteContactName(null);
                            showNotification(`Cuenta de ${group.contactName} eliminada correctamente`);
                          } else {
                            setConfirmDeleteContactName(group.contactName);
                            setTimeout(() => setConfirmDeleteContactName(null), 4000);
                          }
                        }}
                        className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          confirmDeleteContactName === group.contactName
                            ? 'bg-rose-600 text-white px-2.5 animate-pulse'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Eliminar si hubo una equivocación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {confirmDeleteContactName === group.contactName && <span>¿Borrar?</span>}
                      </button>

                      <button
                        onClick={() => setSelectedContactForDetail(group)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Historial</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Action Buttons - Exactly reproducing Screenshot 2 & 3 */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsSaleTypeSelectorOpen(true)}
            className="flex-1 py-3 px-4 bg-[#00875A] hover:bg-[#007048] active:scale-95 text-white font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva venta</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 py-3 px-4 bg-[#9B1C1C] hover:bg-[#821414] active:scale-95 text-white font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo gasto</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER / PANEL: DETALLE DE CUENTA E HISTORIAL UNIFICADO POR CLIENTE      */}
      {/* ========================================================================= */}
      {currentDetailContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="bg-[#FFCF00] px-5 py-4 rounded-t-3xl text-slate-900 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white text-slate-900 font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                  {currentDetailContact.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-950 truncate">
                    {currentDetailContact.contactName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>
                      {currentDetailContact.type === 'receivable' ? 'Cuenta de Cliente' : 'Cuenta de Proveedor'}
                    </span>
                    {currentDetailContact.contactPhone && (
                      <>
                        <span>·</span>
                        <span>{currentDetailContact.contactPhone}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedContactForDetail(null)}
                className="w-9 h-9 rounded-full bg-white/40 hover:bg-white text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar panel de cuenta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Main Balance Box for this client */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {currentDetailContact.type === 'receivable'
                      ? 'Saldo Total por Cobrar'
                      : 'Saldo Total por Pagar'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentDetailContact.remainingAmount === 0
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {currentDetailContact.remainingAmount === 0 ? 'Cuenta al Día' : 'Saldo Pendiente'}
                  </span>
                </div>

                <div className="mt-2">
                  <BcvAmountDisplay
                    amount={currentDetailContact.remainingAmount}
                    size="2xl"
                    colorClass="text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Abonado:</span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(currentDetailContact.paidAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Fiado Acumulado:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(currentDetailContact.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar for this contact */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentDetailContact.remainingAmount > 0 && (
                  <button
                    onClick={() => openAbonoModal(currentDetailContact)}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Abonar</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    openNewDebtForContact(currentDetailContact.contactName, currentDetailContact.contactPhone)
                  }
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Fiado</span>
                </button>

                {currentDetailContact.type === 'receivable' && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(currentDetailContact)}
                    className="py-2.5 px-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={() => handleExportContactStatement(currentDetailContact)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Descargar estado de cuenta en CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>

              {/* Historial Unificado de Operaciones del Cliente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Historial de Compras a Crédito y Abonos ({currentDetailContact.debts.length} registros)
                  </h4>
                  <span className="text-[11px] text-slate-500">Cronología completa</span>
                </div>

                <div className="space-y-2.5">
                  {currentDetailContact.debts.map((debtItem, idx) => {
                    const isItemPaid = debtItem.status === 'paid';
                    const isItemPartial = debtItem.status === 'partially_paid';

                    return (
                      <div
                        key={debtItem.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-900">
                                {debtItem.notes || `Compra a crédito #${idx + 1}`}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Fecha: {debtItem.createdAt}
                                </span>
                                <span>·</span>
                                <span>Vence: {debtItem.dueDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black font-mono tabular-nums text-slate-900">
                              +{formatCurrency(debtItem.totalAmount)}
                            </span>
                            <div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                                  isItemPaid
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : isItemPartial
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {isItemPaid ? 'Pagada' : isItemPartial ? 'Abono parcial' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Breakdown per item if remaining */}
                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-xl">
                          <span>Abonado a esta deuda: {formatCurrency(debtItem.paidAmount)}</span>
                          <span className="font-bold">
                            Resta: {formatCurrency(debtItem.remainingAmount)}
                          </span>
                        </div>

                        {/* Individual debt payments history if any */}
                        {debtItem.history && debtItem.history.length > 0 && (
                          <div className="pl-3 border-l-2 border-emerald-400 space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Abonos realizados:
                            </span>
                            {debtItem.history.map(p => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between text-[11px] text-slate-700"
                              >
                                <span className="text-slate-500">
                                  {p.date} · {p.notes || 'Abono'}
                                </span>
                                <span className="font-bold text-emerald-700 font-mono">
                                  -{formatCurrency(p.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delete single debt button */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => deleteDebt(debtItem.id)}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                            title="Eliminar este registro específico"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar este registro</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Estás seguro de eliminar todo el historial y cuenta de ${currentDetailContact.contactName}?`
                    )
                  ) {
                    deleteContactDebts(currentDetailContact.contactName, currentDetailContact.type);
                    setSelectedContactForDetail(null);
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar toda la cuenta</span>
              </button>

              <button
                onClick={() => setSelectedContactForDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR ABONO (APLICA A LA CUENTA DEL CLIENTE / PROVEEDOR)       */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && contactForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-950">
                Registrar Abono
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Cliente / Proveedor: <strong className="text-slate-900">{contactForPayment.contactName}</strong>
              <br />
              Saldo pendiente total:{' '}
              <strong className="text-rose-600 font-mono">
                {formatCurrency(contactForPayment.remainingAmount)}
              </strong>
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monto del Abono ({profile.currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                    {profile.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-2xl font-black text-emerald-700 font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Método de pago / Nota
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  placeholder="Ej: Efectivo, Nequi, Transferencia bancaria"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR DEUDA / FIADO (NUEVO O EXISTENTE)                            */}
      {/* ========================================================================= */}
      {isNewDebtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-950">
                {debtType === 'receivable' ? 'Nuevo Fiado (Por cobrar)' : 'Nueva Deuda (Por pagar)'}
              </h3>
              <button
                onClick={() => setIsNewDebtModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-1 mb-3">
              Si eliges un cliente existente, se sumará a su cuenta unificada automáticamente.
            </p>

            <form onSubmit={handleCreateDebt} className="space-y-3">
              {/* Existing contact selector or input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del {debtType === 'receivable' ? 'Cliente' : 'Proveedor'} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  placeholder="Nombre completo o razón social"
                  list="existing-contacts-list"
                />
                <datalist id="existing-contacts-list">
                  {debtType === 'receivable'
                    ? customers.map(c => <option key={c.id} value={c.name} />)
                    : suppliers.map(s => <option key={s.id} value={s.name} />)}
                  {contactGroups.map(g => (
                    <option key={g.contactName} value={g.contactName} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    placeholder="+57 300 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto Total *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Límite de Pago
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Concepto o Productos
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  placeholder="Ej: Perfumes entregados a crédito 15 días"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDebtModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
