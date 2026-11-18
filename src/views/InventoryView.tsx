import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowUpDown,
  Edit2,
  Info,
  Search,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Trash2,
  DollarSign,
  Layers,
  X,
  ClipboardList,
  ShoppingBag,
  Download,
  Crown,
  Check,
  TrendingUp,
  Tag,
  Barcode,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Product } from '../types/finance';
import { CategoriesManagerModal } from '../components/modals/CategoriesManagerModal';
import { BcvAmountDisplay } from '../components/common/BcvAmountDisplay';

export const InventoryView: React.FC = () => {
  const {
    products,
    categories,
    addCategory,
    openCreateProductModal,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    totalInventoryCost,
    totalInventoryCount,
    formatCurrency,
    checkFeatureAccess,
    setIsUpgradeModalOpen,
    featureAccess,
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | string>('all');
  const [isCategoriesManagerOpen, setIsCategoriesManagerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc'>('default');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [editDetailName, setEditDetailName] = useState('');
  const [editDetailCategory, setEditDetailCategory] = useState('');
  const [editDetailSalePrice, setEditDetailSalePrice] = useState('');
  const [editDetailCostPrice, setEditDetailCostPrice] = useState('');
  const [isPhysicalCountModalOpen, setIsPhysicalCountModalOpen] = useState(false);
  const [isPurchaseRegisterModalOpen, setIsPurchaseRegisterModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<string | null>(null);

  // Purchase entry form
  const [purchaseProductId, setPurchaseProductId] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('1');
  const [purchaseUnitCost, setPurchaseUnitCost] = useState('');
  const [purchaseSupplier, setPurchaseSupplier] = useState('');

  // Physical count state: map product id to counted units
  const [countedStockMap, setCountedStockMap] = useState<Record<string, number>>({});

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenDetail = (p: Product) => {
    setSelectedProductForDetail(p);
    setIsEditingInDetail(false);
    setEditDetailName(p.name);
    setEditDetailCategory(p.category);
    setEditDetailSalePrice(p.salePrice.toString());
    setEditDetailCostPrice(p.costPrice.toString());
  };

  // Filter products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategoryFilter !== 'all' && p.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }

      if (activeFilter === 'low') {
        return p.stock > 0 && p.stock <= p.minStockAlert;
      }
      if (activeFilter === 'out') {
        return p.stock === 0;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      return 0;
    });

  // Check if sort is premium
  const handleSortClick = () => {
    if (!checkFeatureAccess('ordenar_inventario')) {
      return;
    }
    setIsSortMenuOpen(!isSortMenuOpen);
  };

  // Handle FAB actions
  const handleFabAction = (action: 'create' | 'count' | 'purchase' | 'download' | 'categories') => {
    setIsFabOpen(false);

    if (action === 'create') {
      openCreateProductModal();
    } else if (action === 'categories') {
      setIsCategoriesManagerOpen(true);
    } else if (action === 'count') {
      if (!checkFeatureAccess('conteo_inventario')) return;
      // Pre-fill count map with current stock
      const initialMap: Record<string, number> = {};
      products.forEach(p => {
        initialMap[p.id] = p.stock;
      });
      setCountedStockMap(initialMap);
      setIsPhysicalCountModalOpen(true);
    } else if (action === 'purchase') {
      if (products.length > 0) {
        setPurchaseProductId(products[0].id);
        setPurchaseUnitCost(products[0].costPrice.toString());
      }
      setPurchaseQuantity('5');
      setPurchaseSupplier('Distribuidora Mayorista');
      setIsPurchaseRegisterModalOpen(true);
    } else if (action === 'download') {
      handleDownloadInventory();
    }
  };

  const handleDownloadInventory = () => {
    if (!checkFeatureAccess('exportar_reportes')) return;

    // Generate CSV content
    const headers = ['ID', 'Producto', 'SKU', 'Categoría', 'Precio Venta', 'Costo Unitario', 'Stock', 'Valor Total Venta'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      p.salePrice,
      p.costPrice,
      p.stock,
      (p.salePrice * p.stock).toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventario_Finova_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('¡Inventario descargado en formato CSV exitosamente!');
  };

  const handleSavePhysicalCount = () => {
    Object.entries(countedStockMap).forEach(([id, qty]) => {
      adjustStock(id, Math.max(0, qty));
    });
    setIsPhysicalCountModalOpen(false);
    showNotification('¡Conteo físico guardado y existencias sincronizadas!');
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseProductId) return;
    const qty = parseInt(purchaseQuantity, 10) || 0;
    const unitCost = parseFloat(purchaseUnitCost) || 0;

    const prod = products.find(p => p.id === purchaseProductId);
    if (!prod) return;

    // Adjust product stock and cost price
    updateProduct(prod.id, {
      stock: prod.stock + qty,
      costPrice: unitCost,
      isAvailable: prod.stock + qty > 0,
    });

    setIsPurchaseRegisterModalOpen(false);
    showNotification(`Compra registrada: +${qty} un. a "${prod.name}"`);
  };

  const isSortFeaturePremium = featureAccess.find(f => f.id === 'ordenar_inventario')?.isPremium;
  const isCountFeaturePremium = featureAccess.find(f => f.id === 'conteo_inventario')?.isPremium;

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4 pb-28 md:pb-12 max-w-4xl mx-auto relative min-h-screen">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Metrics Cards - Screenshot 1 & 2 */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Total de referencias
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums mt-1.5">
            {totalInventoryCount}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4.5 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Costo total
          </p>
          <div className="mt-1.5">
            <BcvAmountDisplay amount={totalInventoryCost} size="xl" />
          </div>
        </div>
      </div>

      {/* Prominent 'Nuevo producto' Action Card - Matching Screenshot 7 */}
      <button
        type="button"
        onClick={() => openCreateProductModal()}
        className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm text-slate-950 shadow-xs active:scale-98 transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </div>
        <span>Nuevo producto</span>
      </button>



      {/* Control Filter Bar - Screenshot 1 & 2 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Sort & Edit buttons */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Sort button with Crown badge */}
          <button
            onClick={handleSortClick}
            className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center relative shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Ordenar referencias"
          >
            <ArrowUpDown className="w-4.5 h-4.5" />
            {isSortFeaturePremium && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-xs">
                👑
              </span>
            )}
          </button>

          {/* Sort Dropdown Menu */}
          {isSortMenuOpen && (
            <div className="absolute top-13 left-0 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 min-w-[190px] animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black uppercase text-slate-400 px-3 py-1">
                Ordenar por
              </p>
              <button
                onClick={() => { setSortBy('default'); setIsSortMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  sortBy === 'default' ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Por defecto (Registro)
              </button>
              <button
                onClick={() => { setSortBy('name-asc'); setIsSortMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  sortBy === 'name-asc' ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Nombre: A a Z
              </button>
              <button
                onClick={() => { setSortBy('name-desc'); setIsSortMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  sortBy === 'name-desc' ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Nombre: Z a A
              </button>
              <button
                onClick={() => { setSortBy('price-asc'); setIsSortMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  sortBy === 'price-asc' ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Precio: Menor a Mayor
              </button>
              <button
                onClick={() => { setSortBy('price-desc'); setIsSortMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  sortBy === 'price-desc' ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Precio: Mayor a Menor
              </button>
            </div>
          )}

          {/* Edit icon */}
          <button
            onClick={() => {
              if (products.length > 0) {
                handleOpenDetail(products[0]);
              } else {
                showNotification('Agrega productos para editarlos');
              }
            }}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-300 text-slate-800 flex items-center justify-center hover:bg-slate-50 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Edición rápida"
          >
            <Edit2 className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#FFCF00] text-slate-950 shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setActiveFilter('low')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'low'
                ? 'bg-[#FFCF00] text-slate-950 shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-slate-700" />
            <span>Unidades bajas</span>
          </button>

          <button
            onClick={() => setActiveFilter('out')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'out'
                ? 'bg-[#FFCF00] text-slate-950 shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Sin stock</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar producto, referencia o categoría..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium"
        />
      </div>

      {/* Product List - Matching Screenshot 1 & 2 Cards */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[240px]">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Package className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              No hay referencias que coincidan
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mb-4">
              {selectedCategoryFilter !== 'all'
                ? `No tienes productos registrados en la categoría "${selectedCategoryFilter}".`
                : 'Usa el botón para crear tus primeros productos con nombre y categoría.'}
            </p>
            <button
              type="button"
              onClick={() => openCreateProductModal()}
              className="px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Producto</span>
            </button>
          </div>
        ) : (
          filteredProducts.map(p => {
            const isOutOfStock = p.stock === 0;
            const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;

            return (
              <div
                key={p.id}
                onClick={() => handleOpenDetail(p)}
                className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 hover:border-amber-300 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm group relative"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Color box with stylized 't.' logo matching Treinta Screenshot */}
                  <div className={`w-16 h-16 rounded-2xl ${p.colorBg || 'bg-[#EDE4F8] text-[#8444A0] border-[#E3D4F5]'} flex items-center justify-center shrink-0 select-none border shadow-xs`}>
                    <span className="font-serif italic font-extrabold text-2xl tracking-tighter">
                      t.
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                      {p.name}
                    </h4>

                    {/* Category & SKU */}
                    <p className="text-[11px] font-bold text-slate-500 truncate mt-0.5">
                      <span className="text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded-md font-extrabold">{p.category}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span className="font-mono text-slate-400">{p.sku}</span>
                    </p>

                    {/* Stock Status Badge - Pink/red for "No disponible" as in screenshot */}
                    <div className="mt-1.5">
                      {isOutOfStock ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFEDEC] text-[#B91C1C]">
                          No disponible
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800">
                          Bajo stock ({p.stock} un.)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800">
                          Disponible ({p.stock} un.)
                        </span>
                      )}
                    </div>

                    {/* Price in Bold Font */}
                    <div className="mt-1">
                      <BcvAmountDisplay amount={p.salePrice} size="sm" layout="inline" />
                    </div>
                  </div>
                </div>

                {/* Right Actions: Delete & Info icons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (deleteConfirmProductId === p.id) {
                        deleteProduct(p.id);
                        setDeleteConfirmProductId(null);
                        showNotification(`Producto "${p.name}" eliminado del inventario`);
                      } else {
                        setDeleteConfirmProductId(p.id);
                        setTimeout(() => setDeleteConfirmProductId(null), 3500);
                      }
                    }}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      deleteConfirmProductId === p.id
                        ? 'bg-rose-600 text-white px-2 shadow-xs animate-pulse'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteConfirmProductId === p.id && <span>¿Borrar?</span>}
                  </button>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenDetail(p);
                    }}
                    className="w-8 h-8 rounded-full bg-[#FFEDEC] text-[#B91C1C] flex items-center justify-center hover:bg-[#FEE2E2] transition-colors cursor-pointer shadow-xs"
                    title="Ver detalles y editar producto"
                  >
                    <Info className="w-4.5 h-4.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POP-OVER MENU & FLOATING ACTION BUTTON (Screenshot 2) */}
      <div className="fixed bottom-20 right-5 md:right-10 z-40 flex flex-col items-end">
        {/* Popover Action Menu */}
        {isFabOpen && (
          <div className="mb-3 bg-white rounded-3xl shadow-2xl border border-slate-200 p-2.5 w-64 animate-in fade-in slide-in-from-bottom-5">
            <div className="space-y-1">
              {/* Option 1: Crear producto (+ 👑) */}
              <button
                type="button"
                onClick={() => handleFabAction('create')}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-900 relative shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 text-[10px] bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    👑
                  </span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  Crear producto
                </span>
              </button>

              {/* Option 2: Nuevo conteo (📋 👑) */}
              <button
                type="button"
                onClick={() => handleFabAction('count')}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-900 relative shrink-0">
                  <ClipboardList className="w-5 h-5 stroke-[2]" />
                  {isCountFeaturePremium && (
                    <span className="absolute -top-1 -right-1 text-[10px] bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      👑
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  Nuevo conteo
                </span>
              </button>

              {/* Option 3: Registrar compras (🛒) */}
              <button
                type="button"
                onClick={() => handleFabAction('purchase')}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-900 shrink-0">
                  <ShoppingBag className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  Registrar compras
                </span>
              </button>

              {/* Option 4: Descargar inventario (↓) */}
              <button
                type="button"
                onClick={() => handleFabAction('download')}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-900 shrink-0">
                  <Download className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  Descargar inventario
                </span>
              </button>

              {/* Option 5: Categorías del negocio (🏷️) */}
              <button
                type="button"
                onClick={() => handleFabAction('categories')}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-900 shrink-0">
                  <Tag className="w-5 h-5 stroke-[2] text-amber-700" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                    Categorías del negocio
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Crear, editar y organizar
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* FAB Button (Toggles between (+) and (X) as seen in Screenshots 1 & 2) */}
        <button
          type="button"
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-14 h-14 rounded-full bg-[#111927] hover:bg-black text-white shadow-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer focus:outline-hidden"
          title={isFabOpen ? 'Cerrar opciones' : 'Acciones de inventario'}
        >
          {isFabOpen ? (
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>
      </div>

      {/* MODAL 1: DETALLE Y AUDITORÍA / EDICIÓN DE PRODUCTO [ⓘ] */}
      {selectedProductForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto">
            {/* Top Bar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-2xl ${selectedProductForDetail.colorBg || 'bg-[#EDE4F8] text-[#8444A0]'} flex items-center justify-center font-serif italic font-extrabold text-xl shrink-0 border shadow-xs`}>
                  t.
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 truncate">
                    {selectedProductForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    {selectedProductForDetail.category} • SKU: {selectedProductForDetail.sku}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForDetail(null);
                  setIsEditingInDetail(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isEditingInDetail ? (
              <>
                {/* Product Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-extrabold text-slate-500">Precio de Venta</span>
                    <p className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5">
                      {formatCurrency(selectedProductForDetail.salePrice)}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-extrabold text-slate-500">Costo de Compra</span>
                    <p className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5">
                      {formatCurrency(selectedProductForDetail.costPrice)}
                    </p>
                  </div>
                </div>

                {/* Profit calculation */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 mt-3 text-xs text-emerald-900 flex justify-between items-center font-bold">
                  <span>Ganancia neta estimada:</span>
                  <span className="font-mono font-black text-sm text-emerald-800">
                    {formatCurrency(selectedProductForDetail.salePrice - selectedProductForDetail.costPrice)}
                  </span>
                </div>

                {/* Current Stock Controller */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950">
                      Existencias en almacén:
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                      selectedProductForDetail.stock === 0
                        ? 'bg-[#FFEDEC] text-[#B91C1C]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedProductForDetail.stock === 0 ? 'Sin existencias' : `${selectedProductForDetail.stock} unidades`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = Math.max(0, selectedProductForDetail.stock - 1);
                        adjustStock(selectedProductForDetail.id, newQty);
                        setSelectedProductForDetail({
                          ...selectedProductForDetail,
                          stock: newQty,
                          isAvailable: newQty > 0,
                        });
                      }}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-lg flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      -
                    </button>

                    <div className="text-center font-mono font-black text-2xl text-slate-950">
                      {selectedProductForDetail.stock}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newQty = selectedProductForDetail.stock + 1;
                        adjustStock(selectedProductForDetail.id, newQty);
                        setSelectedProductForDetail({
                          ...selectedProductForDetail,
                          stock: newQty,
                          isAvailable: newQty > 0,
                        });
                      }}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-lg flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="flex items-center gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      deleteProduct(selectedProductForDetail.id);
                      setSelectedProductForDetail(null);
                      showNotification('Producto eliminado del inventario');
                    }}
                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors border border-rose-200 cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingInDetail(true)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProductForDetail(null)}
                    className="flex-1 py-3 bg-slate-950 hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow-md transition-all text-center cursor-pointer"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </>
            ) : (
              /* Inline Editing Form */
              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    value={editDetailName}
                    onChange={e => setEditDetailName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto">
                    {categories.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditDetailCategory(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editDetailCategory.toLowerCase() === c.toLowerCase()
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editDetailCategory}
                    onChange={e => setEditDetailCategory(e.target.value)}
                    placeholder="O escribe una nueva categoría..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Precio de Venta ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editDetailSalePrice}
                      onChange={e => setEditDetailSalePrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Costo Compra ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editDetailCostPrice}
                      onChange={e => setEditDetailCostPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
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
                      const newSale = parseFloat(editDetailSalePrice) || 0;
                      const newCost = parseFloat(editDetailCostPrice) || 0;
                      if (!editDetailName.trim() || newSale <= 0) {
                        showNotification('Por favor completa nombre y precio válido');
                        return;
                      }
                      const catTrim = editDetailCategory.trim() || 'General';
                      if (!categories.some(c => c.toLowerCase() === catTrim.toLowerCase())) {
                        addCategory(catTrim);
                      }
                      updateProduct(selectedProductForDetail.id, {
                        name: editDetailName.trim(),
                        category: catTrim,
                        salePrice: newSale,
                        costPrice: newCost,
                      });
                      setSelectedProductForDetail({
                        ...selectedProductForDetail,
                        name: editDetailName.trim(),
                        category: catTrim,
                        salePrice: newSale,
                        costPrice: newCost,
                      });
                      setIsEditingInDetail(false);
                      showNotification('Producto actualizado correctamente');
                    }}
                    className="flex-1 py-2.5 text-xs font-extrabold text-white bg-slate-950 hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: NUEVO CONTEO FÍSICO */}
      {isPhysicalCountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Nuevo Conteo Físico de Inventario
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ajusta las cantidades reales que tienes en tienda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhysicalCountModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-1 space-y-2.5 my-3 overflow-y-auto flex-1">
              {products.map(p => {
                const current = countedStockMap[p.id] ?? p.stock;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Registrado: {p.stock} un. | Precio: {formatCurrency(p.salePrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setCountedStockMap(prev => ({
                            ...prev,
                            [p.id]: Math.max(0, current - 1),
                          }))
                        }
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-800 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={current}
                        onChange={e =>
                          setCountedStockMap({
                            ...countedStockMap,
                            [p.id]: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-14 text-center font-bold text-xs font-mono py-1 border border-slate-300 rounded-lg bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCountedStockMap(prev => ({
                            ...prev,
                            [p.id]: current + 1,
                          }))
                        }
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-800 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setIsPhysicalCountModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePhysicalCount}
                className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs"
              >
                Confirmar Conteo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REGISTRAR COMPRAS */}
      {isPurchaseRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900">
                Registrar Compra de Mercancía
              </h3>
              <button
                onClick={() => setIsPurchaseRegisterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Producto a Reabastecer *
                </label>
                <select
                  value={purchaseProductId}
                  onChange={e => {
                    setPurchaseProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setPurchaseUnitCost(prod.costPrice.toString());
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidades Compradas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseQuantity}
                    onChange={e => setPurchaseQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Costo Unitario ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchaseUnitCost}
                    onChange={e => setPurchaseUnitCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={purchaseSupplier}
                  onChange={e => setPurchaseSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  placeholder="Distribuidora Mayorista"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between font-bold">
                <span className="text-slate-600">Total de la Compra:</span>
                <span className="text-slate-900 font-mono">
                  {formatCurrency((parseInt(purchaseQuantity, 10) || 0) * (parseFloat(purchaseUnitCost) || 0))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseRegisterModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-black rounded-xl shadow-xs"
                >
                  Añadir al Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: GESTOR DE CATEGORÍAS */}
      <CategoriesManagerModal
        isOpen={isCategoriesManagerOpen}
        onClose={() => setIsCategoriesManagerOpen(false)}
      />
    </div>
  );
};
