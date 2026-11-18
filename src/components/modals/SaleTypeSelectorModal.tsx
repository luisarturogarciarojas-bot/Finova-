import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const SaleTypeSelectorModal: React.FC = () => {
  const {
    isSaleTypeSelectorOpen,
    setIsSaleTypeSelectorOpen,
    setIsProductSaleSelectorOpen,
    setIsFreeSaleModalOpen,
    setIsQuoteModalOpen,
  } = useFinance();

  if (!isSaleTypeSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200">
        {/* Header - Matching screenshot */}
        <div className="flex items-start justify-between pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Nueva venta
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Selecciona el tipo de venta que quieres hacer.
            </p>
          </div>

          <button
            onClick={() => setIsSaleTypeSelectorOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-500 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar selección de venta"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 3 Options */}
        <div className="py-2 space-y-3">
          {/* 1. Venta de productos */}
          <div
            onClick={() => {
              setIsSaleTypeSelectorOpen(false);
              setIsProductSaleSelectorOpen(true);
            }}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img
                  src="/src/assets/images/icon_basket_3d_1794619925231.jpg"
                  alt="Venta de productos"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-950 group-hover:text-amber-800 transition-colors">
                  Venta de productos
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Registra una venta seleccionando los productos de tu inventario.
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 2. Venta libre */}
          <div
            onClick={() => {
              setIsSaleTypeSelectorOpen(false);
              setIsFreeSaleModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img
                  src="/src/assets/images/icon_cash_stack_3d_1794619925729.jpg"
                  alt="Venta libre"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-950 group-hover:text-emerald-800 transition-colors">
                  Venta libre
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Registra un ingreso <strong className="text-slate-700">sin seleccionar productos</strong> de tu inventario.
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

          {/* 3. Cotizaciones (with green "Nuevo" badge) */}
          <div
            onClick={() => {
              setIsSaleTypeSelectorOpen(false);
              setIsQuoteModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border-2 border-emerald-500 flex items-center justify-between cursor-pointer transition-all shadow-xs relative group"
          >
            {/* Green "Nuevo" pill on top right */}
            <div className="absolute -top-2.5 right-6 bg-[#00875A] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Nuevo
            </div>

            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-50/70 flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img
                  src="/src/assets/images/icon_notes_quote_3d_1794619925471.jpg"
                  alt="Cotizaciones"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0">
                <h4 className="font-extrabold text-sm text-slate-950 group-hover:text-emerald-800 transition-colors">
                  Cotizaciones
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Crea cotizaciones para tus clientes y compártelas con ellos.
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
