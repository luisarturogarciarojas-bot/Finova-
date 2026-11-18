import React, { useState } from 'react';
import { Search, X, Receipt, ShoppingBag, MinusCircle, Package, ArrowLeftRight, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    invoices,
    products,
    debts,
    setSelectedDate,
    setActiveTab,
    setSelectedInvoiceForPreview,
    formatCurrency,
  } = useFinance();

  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTransactions = q
    ? transactions.filter(
        t =>
          t.concept.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.customerOrSupplier && t.customerOrSupplier.toLowerCase().includes(q))
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        i =>
          i.number.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.items.some(it => it.description.toLowerCase().includes(q))
      )
    : [];

  const matchedProducts = q
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
    : [];

  const matchedDebts = q
    ? debts.filter(
        d =>
          d.contactName.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q))
      )
    : [];

  const totalResults =
    matchedTransactions.length + matchedInvoices.length + matchedProducts.length + matchedDebts.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-12 sm:pt-20">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="relative flex items-center pb-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 absolute left-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por venta, gasto, cliente, perfume o factura..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto flex-1 py-3 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Escribe el nombre de un producto, cliente, concepto o folio de factura para buscar.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No se encontraron coincidencias para "{query}".
            </div>
          ) : (
            <>
              {/* Facturas */}
              {matchedInvoices.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Facturas Encontradas ({matchedInvoices.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setSelectedInvoiceForPreview(inv);
                          setActiveTab('facturas');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-bold text-slate-900">
                              {inv.number} - {inv.customerName}
                            </p>
                            <p className="text-[10px] text-slate-400">{inv.issueDate}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          {formatCurrency(inv.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transacciones */}
              {matchedTransactions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Ventas & Gastos ({matchedTransactions.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedTransactions.map(tx => {
                      const isSale = tx.type === 'sale';
                      return (
                        <div
                          key={tx.id}
                          onClick={() => {
                            setSelectedDate(tx.date);
                            setActiveTab('balance');
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isSale ? (
                              <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <MinusCircle className="w-4 h-4 text-rose-600" />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{tx.concept}</p>
                              <p className="text-[10px] text-slate-400">
                                {tx.date} · {tx.category}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              isSale ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isSale ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Productos */}
              {matchedProducts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Inventario & Catálogo ({matchedProducts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab('inventario');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Stock: {p.stock} un. · Costo: {formatCurrency(p.costPrice)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(p.salePrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deudas */}
              {matchedDebts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Deudas & Cobros ({matchedDebts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedDebts.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setActiveTab('deudas');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-bold text-slate-900">
                              {d.contactName} ({d.type === 'receivable' ? 'Por cobrar' : 'Por pagar'})
                            </p>
                            <p className="text-[10px] text-slate-400">Vence: {d.dueDate}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(d.remainingAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
