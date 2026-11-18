import React, { useState } from 'react';
import { X, DollarSign, CheckCircle, Receipt, ArrowLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod } from '../../types/finance';
import { CustomerSearchSelector } from '../common/CustomerSearchSelector';

export const FreeSaleModal: React.FC = () => {
  const {
    isFreeSaleModalOpen,
    setIsFreeSaleModalOpen,
    setIsSaleTypeSelectorOpen,
    addTransaction,
    createInvoice,
    selectedDate,
    profile,
  } = useFinance();

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Venta Libre / Servicios');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [autoInvoice, setAutoInvoice] = useState(false);

  if (!isFreeSaleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const saleConcept = concept.trim() || 'Ingreso / Venta libre';

    addTransaction({
      type: 'sale',
      amount: parsedAmount,
      concept: saleConcept,
      category,
      paymentMethod,
      date: selectedDate,
      customerOrSupplier: customerName.trim() || undefined,
    });

    if (autoInvoice) {
      createInvoice({
        customerId: `cust-${Date.now()}`,
        customerName: customerName.trim() || 'Cliente de Mostrador',
        items: [
          {
            id: `item-${Date.now()}`,
            description: saleConcept,
            quantity: 1,
            unitPrice: parsedAmount,
            total: parsedAmount,
          },
        ],
        subtotal: parsedAmount,
        discountPercent: 0,
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        total: parsedAmount,
        issueDate: selectedDate,
        dueDate: selectedDate,
        status: paymentMethod === 'credit' ? 'pending' : 'paid',
        paymentMethod,
        notes: 'Generado desde venta libre',
      });
    }

    setConcept('');
    setAmount('');
    setCustomerName('');
    setAutoInvoice(false);
    setIsFreeSaleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsFreeSaleModalOpen(false);
                setIsSaleTypeSelectorOpen(true);
              }}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Venta libre
              </h3>
              <p className="text-xs text-slate-500">Sin seleccionar productos del catálogo</p>
            </div>
          </div>

          <button
            onClick={() => setIsFreeSaleModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto a Registrar ({profile.currencySymbol}) *
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
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-2xl font-black text-emerald-700 font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Concept */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concepto / Detalle del ingreso *
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Ej: Servicio de asesoría / Pedido especial"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              {[
                { id: 'cash' as const, label: 'Efectivo' },
                { id: 'transfer' as const, label: 'Transferencia' },
                { id: 'card' as const, label: 'Tarjeta' },
                { id: 'binance' as const, label: 'Binance' },
                { id: 'pagomovil' as const, label: 'Pago Móvil' },
                { id: 'zelle' as const, label: 'Zelle' },
                { id: 'credit' as const, label: 'A Crédito (Fiado)' },
              ].map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 px-2.5 rounded-xl border transition-all text-center ${
                    paymentMethod === m.id
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selector */}
          <CustomerSearchSelector
            customerName={customerName}
            onSelectCustomer={(name) => setCustomerName(name)}
            label="Cliente (Opcional)"
            placeholder="Escribe el nombre o busca en el directorio..."
            showFrequentPills={true}
          />

          {/* Auto invoice */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                checked={autoInvoice}
                onChange={e => setAutoInvoice(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900"
              />
              <span className="text-xs font-semibold text-slate-800">
                Emitir comprobante / Factura automática
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFreeSaleModalOpen(false)}
              className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              Registrar Venta Libre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
