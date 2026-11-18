import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ScanBarcode,
  PlusCircle,
  ArrowUpDown,
  Edit2,
  Info,
  Minus,
  Plus,
  Package,
  X,
  CreditCard,
  CheckCircle,
  Receipt,
  User,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, Product } from '../../types/finance';
import { BcvAmountDisplay } from '../common/BcvAmountDisplay';
import { CustomerSearchSelector } from '../common/CustomerSearchSelector';

export const ProductSaleSelectorModal: React.FC = () => {
  const {
    products,
    categories,
    openCreateProductModal,
    addProduct,
    adjustStock,
    addTransaction,
    createInvoice,
    selectedDate,
    profile,
    formatCurrency,
    isProductSaleSelectorOpen,
    setIsProductSaleSelectorOpen,
    setIsSaleTypeSelectorOpen,
    customers,
    bcvRates,
    isBcvModeEnabled,
    convertAmount,
    formatBcv,
  } = useFinance();

  // Cart: productId -> quantity selected
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | string>('all');
  const [saleCurrency, setSaleCurrency] = useState<'USD' | 'VES' | 'EUR'>('USD');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [autoInvoice, setAutoInvoice] = useState(false);

  if (!isProductSaleSelectorOpen) return null;

  // Compute cart summary
  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalCartAmount = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find(p => p.id === pId);
    return sum + (prod ? prod.salePrice * qty : 0);
  }, 0);

  const handleIncrement = (prodId: string) => {
    setCart(prev => ({
      ...prev,
      [prodId]: (prev[prodId] || 0) + 1,
    }));
  };

  const handleDecrement = (prodId: string) => {
    setCart(prev => {
      const current = prev[prodId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      }
      return { ...prev, [prodId]: current - 1 };
    });
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItemsCount <= 0 || totalCartAmount <= 0) return;

    // Build description
    const selectedItemsList = Object.entries(cart).map(([pId, qty]) => {
      const prod = products.find(p => p.id === pId);
      return {
        product: prod,
        quantity: qty,
        unitPrice: prod ? prod.salePrice : 0,
        total: prod ? prod.salePrice * qty : 0,
      };
    });

    const conceptSummary = selectedItemsList
      .map(it => `${it.quantity}x ${it.product?.name || 'Producto'}`)
      .join(', ');

    // 1. Add sale transaction
    addTransaction({
      type: 'sale',
      amount: totalCartAmount,
      concept: `Venta: ${conceptSummary}`,
      category: 'Venta de Productos',
      paymentMethod,
      date: selectedDate,
      customerOrSupplier: customerName.trim() || undefined,
    });

    // 2. Reduce inventory stock
    selectedItemsList.forEach(it => {
      if (it.product) {
        adjustStock(it.product.id, Math.max(0, it.product.stock - it.quantity));
      }
    });

    // 3. Optional invoice
    if (autoInvoice) {
      createInvoice({
        customerId: `cust-${Date.now()}`,
        customerName: customerName.trim() || 'Cliente de Mostrador',
        items: selectedItemsList.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          productId: it.product?.id,
          description: it.product?.name || 'Producto',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
        subtotal: totalCartAmount,
        discountPercent: 0,
        discountAmount: 0,
        taxRatePercent: 0,
        taxAmount: 0,
        total: totalCartAmount,
        issueDate: selectedDate,
        dueDate: selectedDate,
        status: paymentMethod === 'credit' ? 'pending' : 'paid',
        paymentMethod,
        notes: 'Comprobante generado por venta de productos',
      });
    }

    // Reset and close
    setCart({});
    setIsCheckoutOpen(false);
    setIsProductSaleSelectorOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matches =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches) return false;
    if (selectedCategoryFilter !== 'all' && p.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
      return false;
    }
    if (activeFilter === 'low') return p.stock > 0 && p.stock <= p.minStockAlert;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Yellow Bar - Screenshot 4: Seleccionar productos */}
      <div className="bg-[#FFCF00] text-slate-900 px-4 py-3 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsProductSaleSelectorOpen(false);
              setIsSaleTypeSelectorOpen(true);
            }}
            className="p-1.5 -ml-1 text-slate-900 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
            Seleccionar productos
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-900"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => {}}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-900"
            title="Escanear código de barras"
          >
            <ScanBarcode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 max-w-xl mx-auto w-full space-y-3 pb-24">
        {/* + Nuevo producto Button - Screenshot 4 */}
        <button
          onClick={() => openCreateProductModal((created) => handleIncrement(created.id))}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-full font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo producto</span>
        </button>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategoryFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters Row - Screenshot 4 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {}}
              className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center relative shadow-xs"
              title="Ordenar"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 text-[8px] bg-blue-600 text-white rounded-full p-0.5">
                👑
              </span>
            </button>
            <button
              onClick={() => {}}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-xs"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#FFCF00] text-slate-950 font-black shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                activeFilter === 'low'
                  ? 'bg-[#FFCF00] text-slate-950 font-black shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Unidades bajas</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          />
        </div>

        {/* Product Cards List - Screenshot 4 */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 flex flex-col items-center justify-center my-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Package className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              No hay productos que coincidan
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Crea tu producto con categoría para comenzar a venderlo inmediatamente.
            </p>
            <button
              onClick={() => openCreateProductModal((created) => handleIncrement(created.id))}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Crear producto ahora
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map(product => {
              const selectedQty = cart[product.id] || 0;
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-13 h-13 rounded-2xl ${
                        product.colorBg || 'bg-purple-100 text-purple-700'
                      } flex items-center justify-center font-bold text-lg shrink-0 select-none`}
                    >
                      <span className="font-serif italic font-bold">t.</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {product.name}
                        </h4>
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-50 text-rose-500 inline-flex items-center justify-center text-[10px]">
                          ⓘ
                        </span>
                      </div>

                      {/* Stock badge */}
                      <div className="mt-0.5">
                        {isOutOfStock ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
                            No disponible
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {product.stock} un. disponibles
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-extrabold text-slate-950 font-mono tabular-nums mt-0.5">
                        {formatCurrency(product.salePrice)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Counter Widget - Screenshot 4: [-] [ 0 ] [+] */}
                  <div className="flex items-center border border-slate-300 rounded-full bg-white px-1 py-0.5 shrink-0 shadow-2xs">
                    <button
                      onClick={() => handleDecrement(product.id)}
                      disabled={selectedQty === 0}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        selectedQty > 0
                          ? 'text-slate-800 hover:bg-slate-100 active:scale-95'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <span className="w-7 text-center font-bold text-xs text-slate-900 font-mono tabular-nums select-none">
                      {selectedQty}
                    </span>

                    <button
                      onClick={() => handleIncrement(product.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar - Screenshot 4: [ 0 ] Añadir productos    $0 > */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => {
              if (totalItemsCount > 0) setIsCheckoutOpen(true);
            }}
            disabled={totalItemsCount === 0}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between text-sm font-bold transition-all shadow-xs ${
              totalItemsCount > 0
                ? 'bg-slate-900 hover:bg-black text-white active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${
                  totalItemsCount > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 text-slate-600'
                }`}
              >
                {totalItemsCount}
              </span>
              <span>
                {totalItemsCount > 0 ? 'Cobrar venta' : 'Añadir productos'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-base font-extrabold">
              <span>{formatCurrency(totalCartAmount)}</span>
              <span>›</span>
            </div>
          </button>
        </div>
      </div>

      {/* Checkout Drawer/Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">
                  Confirmar Cobro
                </h3>
                <p className="text-xs text-slate-500">
                  {totalItemsCount} productos seleccionados
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSale} className="space-y-4 pt-3">
              {/* Total Display */}
              <div className="bg-amber-50 p-4 rounded-2xl text-center border border-amber-200/60">
                <span className="text-xs font-semibold text-slate-600 block mb-1">Total a Cobrar</span>
                <BcvAmountDisplay amount={totalCartAmount} size="2xl" align="center" />
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

              {/* Auto Invoice Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={autoInvoice}
                    onChange={e => setAutoInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Emitir Factura Automática / Recibo digital
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#00875A] hover:bg-[#007048] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalizar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
