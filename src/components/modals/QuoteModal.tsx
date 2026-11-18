import React, { useState } from 'react';
import { X, ArrowLeft, Plus, Share2, Printer, CheckCircle, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { QuoteItem, Customer } from '../../types/finance';
import { CustomerSearchSelector } from '../common/CustomerSearchSelector';

export const QuoteModal: React.FC = () => {
  const {
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    setIsSaleTypeSelectorOpen,
    createQuote,
    products,
    selectedDate,
    profile,
    formatCurrency,
  } = useFinance();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [validDays, setValidDays] = useState('15');
  const [notes, setNotes] = useState('Cotización válida por 15 días calendario. Precios sujetos a disponibilidad.');
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: 'it-1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  if (!isQuoteModalOpen) return null;

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const handleAddItem = (productId?: string) => {
    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setItems(prev => [
          ...prev,
          {
            id: `it-${Date.now()}`,
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
        id: `it-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
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

  const handleSaveAndShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || subtotal <= 0) return;

    const validDateObj = new Date();
    validDateObj.setDate(validDateObj.getDate() + (parseInt(validDays, 10) || 15));
    const validUntilStr = validDateObj.toISOString().split('T')[0];

    const created = createQuote({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: items.filter(it => it.description.trim() !== ''),
      subtotal,
      discountAmount: 0,
      total: subtotal,
      date: selectedDate,
      validUntil: validUntilStr,
      notes,
    });

    // Generate WhatsApp quote link
    const itemsLines = created.items.map(it => `• ${it.quantity}x ${it.description}: ${formatCurrency(it.total)}`).join('\n');
    const msg = encodeURIComponent(
      `*COTIZACIÓN ${created.number} - ${profile.name}*\n` +
      `Cliente: ${created.customerName}\n` +
      `Fecha: ${created.date}\n` +
      `Válido hasta: ${created.validUntil}\n` +
      `-------------------------\n` +
      `${itemsLines}\n` +
      `-------------------------\n` +
      `*TOTAL COTIZADO: ${formatCurrency(created.total)}*\n\n` +
      `Quedamos a su disposición para confirmar su pedido. ¡Muchas gracias!`
    );

    const cleanPhone = created.customerPhone?.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');

    setIsQuoteModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQuoteModalOpen(false);
                setIsSaleTypeSelectorOpen(true);
              }}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Nueva Cotización
              </h3>
              <p className="text-xs text-slate-500">Envía propuestas de precios a tus clientes</p>
            </div>
          </div>

          <button
            onClick={() => setIsQuoteModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveAndShare} className="space-y-4 pt-3">
          <div className="space-y-2">
            <CustomerSearchSelector
              customerName={customerName}
              onSelectCustomer={(name, cust) => {
                setCustomerName(name);
                if (cust && cust.phone) {
                  setCustomerPhone(cust.phone);
                }
              }}
              label="Cliente *"
              placeholder="Escribe el nombre o busca en el directorio..."
              showFrequentPills={true}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp / Teléfono para cotización
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

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Productos / Conceptos Cotizados
              </span>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
              >
                + Añadir Ítem
              </button>
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
                      placeholder="Descripción"
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
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      placeholder="Precio"
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

          {/* Total Display */}
          <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Total Cotizado:</span>
            <span className="text-base font-black text-slate-950 font-mono">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-bold text-white bg-[#00875A] hover:bg-[#007048] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Guardar y Enviar WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
