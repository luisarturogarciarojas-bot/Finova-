import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Share2,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  Eye,
  Send,
  Sparkles,
  DollarSign,
  QrCode,
  FileText,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Invoice, InvoiceItem } from '../types/finance';

export const InvoicingView: React.FC = () => {
  const {
    invoices,
    createInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    customers,
    addCustomer,
    products,
    profile,
    selectedInvoiceForPreview,
    setSelectedInvoiceForPreview,
    formatCurrency,
  } = useFinance();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueDate, setIssueDate] = useState('2026-11-13');
  const [dueDate, setDueDate] = useState('2026-11-28');
  const [paymentTerms, setPaymentTerms] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [taxRatePercent, setTaxRatePercent] = useState('16');
  const [notes, setNotes] = useState('Gracias por su compra en Galaxy store Luis.');
  const [isRecurring, setIsRecurring] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Perfume Sauvage Elixir 100ml',
      quantity: 1,
      unitPrice: 45.0,
      total: 45.0,
    },
  ]);

  // Invoice calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountVal = (subtotal * (parseFloat(discountPercent) || 0)) / 100;
  const taxableBase = Math.max(0, subtotal - discountVal);
  const taxVal = (taxableBase * (parseFloat(taxRatePercent) || 0)) / 100;
  const totalInvoice = taxableBase + taxVal;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTabFilter === 'paid') return inv.status === 'paid';
    if (activeTabFilter === 'pending') return inv.status === 'pending';
    if (activeTabFilter === 'overdue') return inv.status === 'overdue';
    return true;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPendingInvoiced = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.total, 0);

  const handleAddItem = (productId?: string) => {
    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setItems(prev => [
          ...prev,
          {
            id: `item-${Date.now()}`,
            productId: prod.id,
            description: prod.name,
            quantity: 1,
            unitPrice: prod.salePrice,
            total: prod.salePrice,
          },
        ]);
        return;
      }
    }

    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : updated.quantity;
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : updated.unitPrice;
          updated.total = qty * price;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomerId(cust.id);
    setCustomerName(cust.name);
    setCustomerTaxId(cust.taxId || '');
    setCustomerPhone(cust.phone || '');
    setCustomerEmail(cust.email || '');
    setCustomerAddress(cust.address || '');
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0 || totalInvoice <= 0) return;

    const newInv = createInvoice({
      customerId: selectedCustomerId || `cust-${Date.now()}`,
      customerName,
      customerTaxId,
      customerPhone,
      customerEmail,
      customerAddress,
      items: items.filter(it => it.description.trim() !== ''),
      subtotal,
      discountPercent: parseFloat(discountPercent) || 0,
      discountAmount: discountVal,
      taxRatePercent: parseFloat(taxRatePercent) || 0,
      taxAmount: taxVal,
      total: totalInvoice,
      issueDate,
      dueDate,
      status: paymentTerms === 'credit' ? 'pending' : 'paid',
      paymentMethod: paymentTerms,
      notes,
      isRecurring,
      recurringFrequency: 'monthly',
    });

    setIsCreateModalOpen(false);
    setSelectedInvoiceForPreview(newInv);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = (inv: Invoice) => {
    const itemsText = inv.items.map(it => `• ${it.quantity}x ${it.description} (${formatCurrency(it.total)})`).join('\n');
    const msg = encodeURIComponent(
      `*FACTURA ELECTRÓNICA - ${profile.name}*\n` +
      `Folio: ${inv.number}\n` +
      `Cliente: ${inv.customerName}\n` +
      `Fecha de emisión: ${inv.issueDate}\n` +
      `-------------------------\n` +
      `${itemsText}\n` +
      `-------------------------\n` +
      `*Total: ${formatCurrency(inv.total)}*\n` +
      `Estado: ${inv.status === 'paid' ? '✅ PAGADA' : '⏳ PENDIENTE (Vence: ' + inv.dueDate + ')'}\n\n` +
      `¡Muchas gracias por preferirnos!`
    );
    const cleanPhone = inv.customerPhone?.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Total Facturado</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalInvoiced)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{invoices.length} facturas emitidas</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <p className="text-xs font-semibold text-slate-500">Por Cobrar en Facturas</p>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
            {formatCurrency(totalPendingInvoiced)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Siguiente: FAC-{String(invoices.length + 1).padStart(3, '0')}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-linear-to-tr from-amber-500/10 via-yellow-400/20 to-amber-100/40 rounded-2xl p-4 border border-amber-200/60 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Facturación Automática</span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Emitir Nueva Factura
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTabFilter === 'all' ? 'bg-[#FFCF00] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('paid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTabFilter === 'paid' ? 'bg-[#FFCF00] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagadas
          </button>
          <button
            onClick={() => setActiveTabFilter('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTabFilter === 'pending' ? 'bg-[#FFCF00] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendientes
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente o folio (ej: FAC-001)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Invoice Cards List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">No hay facturas con este filtro</h4>
            <p className="text-xs text-slate-500 mt-1">
              Crea tu primera factura o ticket para emitir comprobantes a tus clientes.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Crear Factura
            </button>
          </div>
        ) : (
          filteredInvoices.map(inv => {
            const isPaid = inv.status === 'paid';
            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-amber-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {inv.number}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {inv.customerName}
                      </h4>
                      {inv.isRecurring && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-sm">
                          Recurrente
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>Emitida: {inv.issueDate}</span>
                      <span>·</span>
                      <span>Vence: {inv.dueDate}</span>
                      <span>·</span>
                      <span>{inv.items.length} {inv.items.length === 1 ? 'ítem' : 'ítems'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <p className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(inv.total)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'Pagada' : 'Pendiente de cobro'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedInvoiceForPreview(inv)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Ver e Imprimir Factura"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSendWhatsApp(inv)}
                      className="p-2 text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {!isPaid && (
                      <button
                        onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                        className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        title="Marcar como cobrada"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Cobrada
                      </button>
                    )}

                    <button
                      onClick={() => deleteInvoice(inv.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Eliminar factura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Crear Factura Automática */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Emitir Factura Automática
                </h3>
                <p className="text-xs text-slate-500">
                  Folio asignado: <strong className="text-slate-800">FAC-{String(invoices.length + 1).padStart(3, '0')}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-4 pt-3">
              {/* Cliente selector o manual */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Cliente *
                  </label>
                  {customers.length > 0 && (
                    <select
                      onChange={e => {
                        const cust = customers.find(c => c.id === e.target.value);
                        if (cust) handleSelectCustomer(cust);
                      }}
                      className="text-[11px] text-blue-600 font-semibold bg-transparent border-0 cursor-pointer focus:outline-hidden"
                    >
                      <option value="">Cargar cliente guardado...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nombre completo o razón social del cliente"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIT / RFC / Documento
                  </label>
                  <input
                    type="text"
                    value={customerTaxId}
                    onChange={e => setCustomerTaxId(e.target.value)}
                    placeholder="Ej: CC 52.894.210"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Productos & Conceptos a Facturar
                  </span>
                  <div className="flex gap-1.5">
                    {products.length > 0 && (
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleAddItem(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2 py-1 rounded-lg border border-amber-200 cursor-pointer"
                      >
                        <option value="">+ Añadir desde Inventario</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.salePrice)})
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      + Ítem Libre
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-slate-50 p-2 rounded-xl text-xs">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Descripción del ítem"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="Cant."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          placeholder="Precio unit."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impuestos & Descuentos & Fechas */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Descuento %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    IVA / Impuesto %
                  </label>
                  <select
                    value={taxRatePercent}
                    onChange={e => setTaxRatePercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="0">0% (Exento)</option>
                    <option value="8">8% (Consumo)</option>
                    <option value="16">16% IVA</option>
                    <option value="19">19% IVA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Condición de Pago
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                  >
                    <option value="cash">Contado (Efectivo)</option>
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                    <option value="credit">A Crédito (Fiado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-50 p-3 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Descuento ({discountPercent}%):</span>
                    <span className="font-mono">-{formatCurrency(discountVal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>IVA ({taxRatePercent}%):</span>
                  <span className="font-mono">{formatCurrency(taxVal)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL A FACTURAR:</span>
                  <span className="font-mono">{formatCurrency(totalInvoice)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4 text-amber-300" />
                  Emitir Factura Automática
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal / Viewer */}
      {selectedInvoiceForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[95vh] overflow-y-auto">
            {/* Modal Controls (No print) */}
            <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vista Previa de Comprobante
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => handleSendWhatsApp(selectedInvoiceForPreview)}
                  className="px-3 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar WhatsApp
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* The Actual Invoice Document (#printable-invoice) */}
            <div id="printable-invoice" className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-900">
              {/* Invoice Header */}
              <div className="flex justify-between items-start gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-[#FFCF00] text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                      {profile.logoText || 'GL'}
                    </div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">
                      {profile.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">{profile.taxId}</p>
                  <p className="text-xs text-slate-500">{profile.address}</p>
                  <p className="text-xs text-slate-500">Tel: {profile.phone}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    FACTURA ELECTRÓNICA
                  </span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 block mt-0.5">
                    {selectedInvoiceForPreview.number}
                  </span>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      selectedInvoiceForPreview.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInvoiceForPreview.status === 'paid' ? 'PAGADA' : 'PENDIENTE'}
                  </span>
                </div>
              </div>

              {/* Bill To & Dates */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                    Facturar a:
                  </p>
                  <p className="font-bold text-sm text-slate-900">
                    {selectedInvoiceForPreview.customerName}
                  </p>
                  {selectedInvoiceForPreview.customerTaxId && (
                    <p className="text-slate-500">Doc: {selectedInvoiceForPreview.customerTaxId}</p>
                  )}
                  {selectedInvoiceForPreview.customerPhone && (
                    <p className="text-slate-500">Tel: {selectedInvoiceForPreview.customerPhone}</p>
                  )}
                  {selectedInvoiceForPreview.customerAddress && (
                    <p className="text-slate-500">{selectedInvoiceForPreview.customerAddress}</p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <p>
                    <span className="text-slate-400">Fecha de Emisión: </span>
                    <strong className="font-mono">{selectedInvoiceForPreview.issueDate}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Fecha de Vencimiento: </span>
                    <strong className="font-mono">{selectedInvoiceForPreview.dueDate}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Método de Pago: </span>
                    <strong className="capitalize">{selectedInvoiceForPreview.paymentMethod}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full my-4 text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left">
                    <th className="py-2 font-semibold">Cant.</th>
                    <th className="py-2 font-semibold">Descripción</th>
                    <th className="py-2 text-right font-semibold">Precio Unit.</th>
                    <th className="py-2 text-right font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceForPreview.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-mono">{it.quantity}</td>
                      <td className="py-2 font-medium">{it.description}</td>
                      <td className="py-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2 text-right font-mono font-bold">{formatCurrency(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations Box */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    <p className="font-bold text-slate-600">CUFE Digital / Validación</p>
                    <p>Comprobante fiscal automatizado</p>
                    <p>Autorizado para efectos contables</p>
                  </div>
                </div>

                <div className="w-48 space-y-1 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceForPreview.subtotal)}</span>
                  </div>
                  {selectedInvoiceForPreview.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Descuento:</span>
                      <span className="font-mono">-{formatCurrency(selectedInvoiceForPreview.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({selectedInvoiceForPreview.taxRatePercent}%):</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceForPreview.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-300">
                    <span>TOTAL:</span>
                    <span className="font-mono">{formatCurrency(selectedInvoiceForPreview.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              {selectedInvoiceForPreview.notes && (
                <p className="text-[11px] text-slate-500 mt-6 pt-3 border-t border-slate-100 text-center italic">
                  "{selectedInvoiceForPreview.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
