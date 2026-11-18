import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Package,
  Plus,
  Check,
  TrendingUp,
  Tag,
  Barcode,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const BADGE_COLOR_OPTIONS = [
  { id: 'lilac', name: 'Lila Finova', bgClass: 'bg-[#EDE4F8] text-[#8444A0] border-[#E3D4F5]' },
  { id: 'emerald', name: 'Esmeralda', bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'amber', name: 'Ámbar Dorado', bgClass: 'bg-amber-100 text-amber-900 border-amber-200' },
  { id: 'blue', name: 'Azul Real', bgClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'rose', name: 'Rosa Coral', bgClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'slate', name: 'Gris Carbón', bgClass: 'bg-slate-900 text-white border-slate-700' },
];

export const CreateProductModal: React.FC = () => {
  const {
    isCreateProductModalOpen,
    setIsCreateProductModalOpen,
    categories,
    addCategory,
    deleteCategory,
    addProduct,
    formatCurrency,
    profile,
  } = useFinance();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Perfumería');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [costPrice, setCostPrice] = useState('0');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [sku, setSku] = useState(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedColor, setSelectedColor] = useState(BADGE_COLOR_OPTIONS[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isCreateProductModalOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const regenerateSku = () => {
    setSku(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Calculations
  const numSalePrice = parseFloat(salePrice) || 0;
  const numCostPrice = parseFloat(costPrice) || 0;
  const unitProfit = numSalePrice - numCostPrice;
  const marginPercent = numSalePrice > 0 ? (unitProfit / numSalePrice) * 100 : 0;
  const currentStockNum = parseInt(stock, 10) || 0;

  const handleCreateNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setCategory(capitalized);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
    showToast(`Categoría "${capitalized}" creada y guardada`);
  };

  const handleSaveProduct = (saveAndKeepOpen = false) => {
    if (!name.trim()) {
      showToast('Por favor escribe el nombre del producto');
      return;
    }
    if (numSalePrice <= 0) {
      showToast('Por favor ingresa un precio de venta mayor a 0');
      return;
    }

    const currentCat = category.trim() || 'General';

    addProduct({
      name: name.trim(),
      sku: sku.trim() || `REF-${Date.now().toString().slice(-4)}`,
      category: currentCat,
      costPrice: Math.max(0, numCostPrice),
      salePrice: numSalePrice,
      stock: Math.max(0, currentStockNum),
      minStockAlert: parseInt(minStockAlert, 10) || 3,
      isAvailable: isAvailable && currentStockNum > 0,
      colorBg: selectedColor.bgClass,
    });

    if (saveAndKeepOpen) {
      showToast(`¡"${name.trim()}" guardado! Puedes crear el siguiente.`);
      // Reset form fields for fast batch entry, keeping category
      setName('');
      setCostPrice('0');
      setSalePrice('');
      setStock('0');
      setMinStockAlert('3');
      regenerateSku();
    } else {
      setIsCreateProductModalOpen(false);
      // Reset
      setName('');
      setCostPrice('0');
      setSalePrice('');
      setStock('0');
      regenerateSku();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 md:backdrop-blur-xs flex items-center justify-center p-0 md:p-6 overflow-hidden select-none">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-slate-950 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container: Full screen on mobile, spacious elegant floating window on desktop */}
      <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] md:max-w-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border-0 md:border md:border-slate-100">
        
        {/* Sticky Header */}
        <div className="bg-[#FFCF00] px-4 sm:px-6 py-3.5 border-b border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateProductModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
              title="Cerrar y volver"
            >
              <ArrowLeft className="w-5 h-5 md:hidden" />
              <X className="w-5 h-5 hidden md:block" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                Nuevo Producto
              </h2>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {profile.name} · Catálogo & Inventario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveProduct(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]">
          
          {/* SECTION 1: NOMBRE Y CATEGORÍA */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Identificación del Producto
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Campos obligatorios (*)
              </span>
            </div>

            {/* Nombre del Producto */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Nombre del producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Camisa Oversize, Perfume 212 Party, Hamburguesa..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-semibold transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                El nombre con el que aparecerá en tus facturas, recibos y caja de ventas.
              </p>
            </div>

            {/* Categoría Dinámica */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>Categoría de venta *</span>
                </label>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Seleccionada: {category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Selecciona una categoría existente o crea una nueva (ej: Ropa, Comida, Perfumería). Quedará guardada para tus próximas ventas.
              </p>

              {/* Categorías Guardadas (Pills seleccionables) */}
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map(cat => {
                  const isSelected = category.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#111927] text-white shadow-xs scale-102 ring-2 ring-amber-400'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}

                {/* Botón para abrir creador de categoría */}
                {!isAddingNewCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-dashed border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Crear nueva categoría</span>
                  </button>
                )}
              </div>

              {/* Inline Category Creator Input */}
              {isAddingNewCategory && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex flex-col sm:flex-row gap-2 items-center animate-in fade-in">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryInput}
                      onChange={e => setNewCategoryInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateNewCategory();
                        }
                      }}
                      placeholder="Escribe el nombre (ej: Ropa, Comida, Joyería...)"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-black hover:bg-black transition-colors cursor-pointer"
                    >
                      Guardar Categoría
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryInput('');
                      }}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: PRECIOS Y RENTABILIDAD EN VIVO */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Precios y Margen de Rentabilidad
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Cálculo en vivo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio de Venta */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Precio de Venta al Público (PVP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-500 text-sm">
                    {profile.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    placeholder="14.00"
                    className="w-full pl-8 pr-4 py-3 text-base font-black font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  El precio que cobrarás a tu cliente por cada unidad.
                </p>
              </div>

              {/* Costo de Compra */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Costo de Compra o Fabricación
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-500 text-sm">
                    {profile.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 text-base font-black font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lo que te cuesta adquirir o preparar cada unidad (opcional).
                </p>
              </div>
            </div>

            {/* Live Profit & Margin Indicator */}
            <div className={`p-4 rounded-2xl border transition-all ${
              unitProfit > 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : unitProfit === 0
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Ganancia neta por unidad
                  </span>
                  <p className="text-2xl font-black font-mono tabular-nums mt-0.5">
                    {formatCurrency(unitProfit)}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Margen de ganancia bruta
                  </span>
                  <p className="text-xl font-black font-mono tabular-nums mt-0.5">
                    {numSalePrice > 0 ? `${marginPercent.toFixed(1)}%` : '0.0%'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] font-semibold mt-2 pt-2 border-t border-black/5 opacity-85">
                {unitProfit > 0 ? (
                  <span>✓ Por cada unidad vendida generarás <strong>{formatCurrency(unitProfit)}</strong> de ganancia libre.</span>
                ) : unitProfit === 0 ? (
                  <span>Nota: El precio de venta es igual al costo (punto de equilibrio).</span>
                ) : (
                  <span>Atención: El costo es mayor al precio de venta (pérdida unitaria).</span>
                )}
              </p>
            </div>
          </div>

          {/* SECTION 3: INVENTARIO, EXISTENCIAS Y REFERENCIA */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Control de Existencias & Código
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Almacén
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Inicial con botones rápidos */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Stock inicial disponible
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStock(Math.max(0, currentStockNum - 1).toString())}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="flex-1 text-center py-2.5 text-base font-black font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setStock((currentStockNum + 1).toString())}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex gap-1.5 mt-2">
                  {[5, 10, 20, 50].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setStock((currentStockNum + qty).toString())}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerta de Stock Mínimo */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Alerta de Stock Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStockAlert}
                  onChange={e => setMinStockAlert(e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-2.5 text-base font-black font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Te avisaremos con etiqueta de "Bajo stock" cuando queden {minStockAlert || '3'} unidades.
                </p>
              </div>
            </div>

            {/* Código SKU / Barcode */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Código de Barra / Referencia (SKU)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="REF-1234"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={regenerateSku}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Generar nuevo código aleatorio"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Nuevo</span>
                </button>
              </div>
            </div>

            {/* Interruptor Disponible para Venta */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Disponible para vender inmediatamente
                </p>
                <p className="text-[11px] text-slate-500">
                  Aparecerá en el selector de ventas al cobrar a tus clientes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    isAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SECTION 4: COLOR E IDENTIFICADOR VISUAL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xs">
                  4
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Estilo Visual & Vista Previa
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Tarjeta de Producto
              </span>
            </div>

            {/* Selector de Color */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">
                Color de la tarjeta / icono
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BADGE_COLOR_OPTIONS.map(opt => {
                  const isPicked = selectedColor.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedColor(opt)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isPicked
                          ? 'border-slate-900 ring-2 ring-slate-950/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${opt.bgClass} flex items-center justify-center font-serif italic font-bold text-sm border shadow-xs`}>
                        t.
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vista Previa en Vivo */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-extrabold text-slate-700 mb-2">
                Vista previa en tu inventario y caja:
              </p>
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl ${selectedColor.bgClass} flex items-center justify-center font-serif italic font-black text-2xl shrink-0 select-none border`}>
                    t.
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {name.trim() || 'Nombre de tu producto'}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {category} · {sku}
                    </p>
                    <div className="mt-1">
                      {currentStockNum === 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFEDEC] text-[#B91C1C]">
                          No disponible
                        </span>
                      ) : currentStockNum <= (parseInt(minStockAlert, 10) || 3) ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                          Bajo stock ({currentStockNum} un.)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          Disponible ({currentStockNum} un.)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-base sm:text-lg font-black text-slate-950 font-mono tabular-nums">
                    {formatCurrency(numSalePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="bg-white p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => setIsCreateProductModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSaveProduct(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors cursor-pointer text-center shadow-xs"
            >
              Guardar y crear otro
            </button>
            <button
              type="button"
              onClick={() => handleSaveProduct(false)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-xs font-black bg-slate-950 hover:bg-black text-white transition-all shadow-md active:scale-95 cursor-pointer text-center"
            >
              Guardar Producto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
