import React, { useState, useRef } from 'react';
import {
  X,
  FileUp,
  FileText,
  Upload,
  CheckCircle2,
  Users,
  Package,
  Scale,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Customer, Product, Debt, Transaction } from '../../types/finance';

interface ExtractedOldCompanyData {
  companyName: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalSales: number;
    totalExpenses: number;
    totalReceivable: number;
    totalPayable: number;
  };
  customers: Customer[];
  products: Product[];
  debts: Debt[];
  transactions: Transaction[];
}

export const ImportOldCompanyModal: React.FC = () => {
  const {
    isImportOldCompanyModalOpen,
    setIsImportOldCompanyModalOpen,
    importOldCompanyData,
    formatCurrency,
    setActiveTab,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'analyzing' | 'preview' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedOldCompanyData | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'customers' | 'products' | 'debts' | 'transactions'>('customers');
  const [mergeMode, setMergeMode] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [importSummary, setImportSummary] = useState<{ customers: number; products: number; debts: number; transactions: number } | null>(null);

  if (!isImportOldCompanyModalOpen) return null;

  const handleClose = () => {
    setIsImportOldCompanyModalOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setStep('upload');
      setSelectedFile(null);
      setExtractedData(null);
      setErrorMessage('');
      setImportSummary(null);
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleProcessFile = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || selectedFile;
    if (!targetFile) {
      setErrorMessage('Por favor selecciona un archivo PDF primero.');
      return;
    }

    setStep('analyzing');
    setErrorMessage('');

    try {
      // Read file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Strip prefix "data:application/pdf;base64,"
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(targetFile);
      });

      const pdfBase64 = await base64Promise;

      const res = await fetch('/api/import-old-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          filename: targetFile.name,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'No se pudo procesar el archivo PDF');
      }

      setExtractedData(json.data);
      setStep('preview');
    } catch (err: any) {
      console.error('Error processing PDF:', err);
      setErrorMessage(err.message || 'No se pudieron extraer registros válidos del archivo PDF. Asegúrate de que el documento tenga información contable legible.');
      setStep('upload');
    }
  };

  const handleConfirmImport = () => {
    if (!extractedData) return;

    const res = importOldCompanyData({
      companyName: extractedData.companyName,
      dateRange: extractedData.dateRange,
      customers: extractedData.customers,
      products: extractedData.products,
      debts: extractedData.debts,
      transactions: extractedData.transactions,
      replaceExisting: !mergeMode,
    });

    setImportSummary(res.imported);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-6 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                Cargar datos de empresa antigua
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Importa clientes, productos, deudas y balances históricos desde un PDF
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD DOCUMENT */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-3xl p-6 sm:p-8 text-center bg-slate-50/60 hover:bg-amber-50/40 transition-all cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-amber-400 text-slate-700 group-hover:text-slate-950 flex items-center justify-center mx-auto shadow-sm border border-slate-200 transition-colors mb-3">
                  <Upload className="w-6 h-6 stroke-[2]" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>{selectedFile.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Documento listo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900">
                      Toca o arrastra aquí tu documento PDF
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Acepta estados de cuenta, reportes contables, listas de clientes, inventarios o balances de tu sistema anterior.
                    </p>
                  </div>
                )}
              </div>

              {selectedFile ? (
                <button
                  type="button"
                  onClick={() => handleProcessFile()}
                  className="w-full py-3.5 px-4 bg-slate-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Procesar y Extraer Datos de {selectedFile.name}</span>
                </button>
              ) : null}

              {/* Safe real extraction guide */}

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-extrabold text-slate-800">
                  ¿Qué información extraerá automáticamente la app?
                </p>
                <ul className="grid grid-cols-2 gap-1 text-[11px] list-disc list-inside text-slate-600">
                  <li>Todos los clientes con teléfonos y cédulas</li>
                  <li>Inventario y artículos con costos y stock</li>
                  <li>Deudas por cobrar a clientes</li>
                  <li>Deudas por pagar a proveedores</li>
                  <li>Ventas y gastos en el rango de fechas del PDF</li>
                  <li>Balance consolidado de la empresa</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING STATE */}
          {step === 'analyzing' && (
            <div className="py-14 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-900" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Analizando documento y extrayendo registros...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Leyendo clientes, lista de inventario, deudas pendientes y transacciones históricas. Esto toma unos segundos.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRMATION */}
          {step === 'preview' && extractedData && (
            <div className="space-y-4">
              {/* Header summary of extracted company */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">
                    Empresa Detectada en el PDF
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-slate-950 truncate">
                    {extractedData.companyName}
                  </h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Periodo: <strong>{extractedData.dateRange.start}</strong> al <strong>{extractedData.dateRange.end}</strong></span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">Total en Ventas</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {formatCurrency(extractedData.summary.totalSales)}
                  </span>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('customers')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activePreviewTab === 'customers'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase">Clientes</span>
                  </div>
                  <p className="font-mono font-black text-base">{extractedData.customers.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreviewTab('products')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activePreviewTab === 'products'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase">Inventario</span>
                  </div>
                  <p className="font-mono font-black text-base">{extractedData.products.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreviewTab('debts')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activePreviewTab === 'debts'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase">Deudas</span>
                  </div>
                  <p className="font-mono font-black text-base">{extractedData.debts.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreviewTab('transactions')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activePreviewTab === 'transactions'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase">Balance / Reg.</span>
                  </div>
                  <p className="font-mono font-black text-base">{extractedData.transactions.length}</p>
                </button>
              </div>

              {/* Tab Details Box */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 max-h-52 overflow-y-auto space-y-1.5">
                {activePreviewTab === 'customers' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block px-1">
                      Clientes listos para importar ({extractedData.customers.length})
                    </span>
                    {extractedData.customers.map(c => (
                      <div key={c.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {c.phone} {c.taxId ? `· ${c.taxId}` : ''} {c.category ? `· ${c.category}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-700 shrink-0">
                          {formatCurrency(c.totalPurchases || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activePreviewTab === 'products' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block px-1">
                      Artículos de inventario ({extractedData.products.length})
                    </span>
                    {extractedData.products.map(p => (
                      <div key={p.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {p.category} · Costo: {formatCurrency(p.costPrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-slate-900 block">{formatCurrency(p.salePrice)}</span>
                          <span className="text-[10px] text-emerald-700 font-bold font-mono">Stock: {p.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activePreviewTab === 'debts' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block px-1">
                      Deudas por cobrar y por pagar ({extractedData.debts.length})
                    </span>
                    {extractedData.debts.map(d => (
                      <div key={d.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${d.type === 'receivable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {d.type === 'receivable' ? 'POR COBRAR' : 'POR PAGAR'}
                            </span>
                            <p className="font-extrabold text-slate-900 truncate">{d.contactName}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{d.notes || 'Sin nota'}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className={`font-mono font-black ${d.type === 'receivable' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatCurrency(d.remainingAmount || d.totalAmount)}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-mono">Vence: {d.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activePreviewTab === 'transactions' && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block px-1">
                      Registros de balance ({extractedData.transactions.length})
                    </span>
                    {extractedData.transactions.map(t => (
                      <div key={t.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {t.type === 'sale' ? (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <p className="font-extrabold text-slate-900 truncate">{t.concept}</p>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {t.date} · {t.category} {t.customerOrSupplier ? `· ${t.customerOrSupplier}` : ''}
                          </p>
                        </div>
                        <span className={`font-mono font-black shrink-0 ${t.type === 'sale' ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {t.type === 'sale' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Merge mode option */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={mergeMode}
                  onChange={e => setMergeMode(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
                <span>Fusionar con datos actuales (Recomendado: conserva lo que ya tienes registrado)</span>
              </label>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                >
                  Volver a cargar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex-2 py-3 px-4 bg-slate-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Confirmar e Importar a Fino</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATE */}
          {step === 'success' && importSummary && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">
                  ¡Datos de empresa antigua cargados exitosamente!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Se integraron todos los registros a tu negocio en Fino.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Clientes</span>
                  <span className="font-mono font-black text-slate-900 text-lg">+{importSummary.customers}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Productos</span>
                  <span className="font-mono font-black text-slate-900 text-lg">+{importSummary.products}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Deudas</span>
                  <span className="font-mono font-black text-slate-900 text-lg">+{importSummary.debts}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Balance</span>
                  <span className="font-mono font-black text-slate-900 text-lg">+{importSummary.transactions}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setActiveTab('balance');
                  }}
                  className="py-3 px-6 bg-slate-950 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <span>Ver Mi Balance e Inventario Actualizados</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
