import React, { useState } from 'react';
import {
  Tag,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface CategoriesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoriesManagerModal: React.FC<CategoriesManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    addCategory,
    deleteCategory,
    products,
    updateProduct,
  } = useFinance();

  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Esa categoría ya existe');
      return;
    }
    addCategory(trimmed);
    setNewCatName('');
    showToast(`Categoría "${trimmed}" creada correctamente`);
  };

  const handleStartEdit = (cat: string) => {
    setEditingCatName(cat);
    setEditingValue(cat);
  };

  const handleSaveEdit = (oldCat: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed.toLowerCase() === oldCat.toLowerCase()) {
      setEditingCatName(null);
      return;
    }

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    // Add new and delete old
    addCategory(formatted);
    deleteCategory(oldCat);

    // Update any products that used the old category
    products.forEach(p => {
      if (p.category.toLowerCase() === oldCat.toLowerCase()) {
        updateProduct(p.id, { category: formatted });
      }
    });

    setEditingCatName(null);
    showToast(`Categoría actualizada a "${formatted}"`);
  };

  const handleDelete = (cat: string) => {
    if (deleteConfirmCat === cat) {
      deleteCategory(cat);
      setDeleteConfirmCat(null);
      showToast(`Categoría "${cat}" eliminada`);
    } else {
      setDeleteConfirmCat(cat);
      setTimeout(() => setDeleteConfirmCat(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#FFCF00] px-5 py-4 border-b border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Tag className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-950 leading-tight">
                Categorías del Negocio
              </h3>
              <p className="text-xs font-semibold text-slate-800">
                Organiza tu catálogo e inventario
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Create new category input */}
          <form onSubmit={handleCreate} className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800">
              Crear nueva categoría
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Ej: Ropa, Comida, Perfumería, Accesorios..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Agregar</span>
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Categorías activas ({categories.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Productos asociados
              </span>
            </div>

            <div className="space-y-2">
              {categories.map(cat => {
                const prodCount = products.filter(
                  p => p.category.toLowerCase() === cat.toLowerCase()
                ).length;
                const isEditing = editingCatName === cat;

                return (
                  <div
                    key={cat}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 transition-all hover:bg-white"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingValue}
                          onChange={e => setEditingValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(cat);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-amber-400 rounded-lg font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                            {cat.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-900 truncate">
                              {cat}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Package className="w-3 h-3 text-slate-400" />
                              <span>{prodCount} {prodCount === 1 ? 'producto' : 'productos'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Editar nombre"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              deleteConfirmCat === cat
                                ? 'bg-rose-600 text-white px-2 animate-pulse'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleteConfirmCat === cat && <span>¿Borrar?</span>}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
