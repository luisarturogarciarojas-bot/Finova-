import React from 'react';
import { HelpCircle, X, CheckCircle2, TrendingUp, Receipt, ArrowLeftRight, Package, Smartphone } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Guía de Uso de Finova
              </h3>
              <p className="text-[11px] text-slate-500">Aprende a sacar el máximo provecho</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>1. Facturación Automática</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Emite comprobantes con folios secuenciales (<strong className="font-mono">FAC-001</strong>). Puedes imprimir en PDF o compartir al instante por WhatsApp con un solo clic. Si es a crédito, se enviará directo a Deudas por Cobrar.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>2. Análisis de Flujo de Caja Comparativo</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Consulta en tiempo real la comparativa de este mes vs el mes anterior. Observa gráficas de 6 meses con entradas, salidas y flujo neto de caja para evitar baches de liquidez.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ArrowLeftRight className="w-4 h-4 text-purple-600" />
              <span>3. Control de Deudas & Recordatorios</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Gestiona fiados a clientes (por cobrar) y deudas a proveedores (por pagar). Envía mensajes recordatorios cordiales a WhatsApp y registra abonos parciales que alimentan tu balance.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Package className="w-4 h-4 text-amber-600" />
              <span>4. Inventario con Costos & Márgenes</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Monitorea el costo total de tu inventario, fija precios de venta con alerta de stock bajo y enlaza directamente los productos con el módulo de ventas y facturas.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl space-y-1 border border-amber-200/60">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>Vista Móvil & Escritorio</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Usa el selector en la esquina superior para alternar entre la <strong>Vista Móvil</strong> idéntica a la aplicación Treinta o la <strong>Vista Escritorio</strong> con barra lateral para computadores.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-slate-950 bg-[#FFCF00] hover:bg-amber-400 rounded-xl transition-all shadow-xs"
          >
            ¡Entendido, Empezar!
          </button>
        </div>
      </div>
    </div>
  );
};
