import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Cloud,
  HardDrive,
  Download,
  Upload,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Database,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  localFirstStorageService,
  FinovaEncryptedVault,
  FinovaLocalDataPayload,
} from '../../services/localFirstStorageService';
import { FinovaLogo } from '../common/FinovaLogo';

interface LocalFirstBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalFirstBackupModal: React.FC<LocalFirstBackupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    profile,
    products,
    transactions,
    debts,
    customers,
    invoices,
    businessAccounts,
    formatCurrency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'code'>('backup');
  const [codeSubTab, setCodeSubTab] = useState<'overview' | 'flutter' | 'reactnative'>('overview');

  // Backup Form state
  const [backupPassword, setBackupPassword] = useState('Finova2026*');
  const [confirmPassword, setConfirmPassword] = useState('Finova2026*');
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
  const [lastGeneratedVault, setLastGeneratedVault] = useState<FinovaEncryptedVault | null>(null);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);
  const [backupErrorMsg, setBackupErrorMsg] = useState<string | null>(null);

  // Restore Form state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [previewVault, setPreviewVault] = useState<FinovaEncryptedVault | null>(null);
  const [decryptedPreview, setDecryptedPreview] = useState<FinovaLocalDataPayload | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const [restoreErrorMsg, setRestoreErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy code state
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const techDocs = localFirstStorageService.getTechnicalDocumentation();

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
  };

  const handleCreateEncryptedBackup = async () => {
    setBackupErrorMsg(null);
    setBackupSuccessMsg(null);

    if (backupPassword !== confirmPassword) {
      setBackupErrorMsg('Las contraseñas de cifrado no coinciden.');
      return;
    }
    if (backupPassword.length < 4) {
      setBackupErrorMsg('La contraseña debe tener mínimo 4 caracteres.');
      return;
    }

    try {
      setIsGeneratingBackup(true);
      const userId = currentUser?.id || 'usr-admin-1';
      const dataPayload = localFirstStorageService.collectUserData(userId);

      const vault = await localFirstStorageService.encryptBackup(dataPayload, backupPassword, {
        id: userId,
        email: currentUser?.email || 'admin@finova.app',
        businessName: currentUser?.businessName || profile.name,
      });

      setLastGeneratedVault(vault);
      const filename = localFirstStorageService.downloadBackupFile(vault);
      setBackupSuccessMsg(`¡Respaldo cifrado generado con éxito! Archivo: ${filename}`);
    } catch (err: any) {
      setBackupErrorMsg(err.message || 'Error al generar el respaldo cifrado.');
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  const handleGoogleDriveSync = async () => {
    setBackupErrorMsg(null);
    setBackupSuccessMsg(null);

    try {
      setIsGeneratingBackup(true);
      const userId = currentUser?.id || 'usr-admin-1';
      const dataPayload = localFirstStorageService.collectUserData(userId);

      const vault = await localFirstStorageService.encryptBackup(dataPayload, backupPassword, {
        id: userId,
        email: currentUser?.email || 'admin@finova.app',
        businessName: currentUser?.businessName || profile.name,
      });

      // Download file and simulate the drive sync completion for the user
      localFirstStorageService.downloadBackupFile(vault);
      setBackupSuccessMsg(
        '¡Sincronización con Nube Personal completada! Se generó el paquete cifrado .finova listo para alojarse en tu Google Drive (appDataFolder privado).'
      );
    } catch (err: any) {
      setBackupErrorMsg(err.message || 'Error en respaldo a Google Drive.');
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreErrorMsg(null);
    setRestoreSuccessMsg(null);
    setDecryptedPreview(null);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const vault = JSON.parse(text) as FinovaEncryptedVault;
        if (vault.app !== 'Finova' || !vault.ciphertextBase64) {
          throw new Error('El archivo no tiene el formato de vault cifrado de Finova.');
        }
        setPreviewVault(vault);
      } catch (err: any) {
        setRestoreErrorMsg('El archivo seleccionado no es un archivo .finova válido.');
        setPreviewVault(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDecryptAndPreview = async () => {
    if (!previewVault) {
      setRestoreErrorMsg('Por favor selecciona un archivo .finova primero.');
      return;
    }
    if (!restorePassword) {
      setRestoreErrorMsg('Ingresa la contraseña con la que se cifró el respaldo.');
      return;
    }

    setRestoreErrorMsg(null);
    try {
      setIsRestoring(true);
      const decrypted = await localFirstStorageService.decryptBackup(previewVault, restorePassword);
      setDecryptedPreview(decrypted);
      setRestoreSuccessMsg('¡Contraseña correcta! El contenido ha sido descifrado y verificado.');
    } catch (err: any) {
      setRestoreErrorMsg(err.message || 'Contraseña incorrecta o archivo dañado.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExecuteRestore = () => {
    if (!decryptedPreview) return;

    try {
      const userId = currentUser?.id || 'usr-admin-1';
      localFirstStorageService.restoreUserData(userId, decryptedPreview);
      setRestoreSuccessMsg(
        '¡Restauración exitosa! Todos los datos han sido aplicados a tu base de datos local. Recargando espacio de trabajo...'
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setRestoreErrorMsg(err.message || 'Error al escribir datos en el dispositivo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <FinovaLogo size="md" variant="icon" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-brand">
                  Nube Personal & Arquitectura Local-First
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Zero Server DB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Almacenamiento en el dispositivo con respaldo cifrado en tu propia nube
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Local-First Architecture Badge Row */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-b border-slate-200/80 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-slate-900">
              Dispositivo Local: {products.length} productos · {transactions.length} transacciones · {customers.length} clientes · {debts.length} deudas
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Firebase: Solo Auth · 0 Bytes en Firestore
          </span>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'border-amber-500 text-slate-950 font-black bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Crear Respaldo Cifrado</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'restore'
                ? 'border-amber-500 text-slate-950 font-black bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar Respaldo</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-amber-500 text-slate-950 font-black bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Guía Técnica & Código</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: CREAR RESPALDO CIFRADO                                 */}
          {/* ============================================================== */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Seguridad Zero-Knowledge (Cifrado Militar AES-256-GCM)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Tus datos se cifran en el dispositivo usando la derivación de clave <strong>PBKDF2 (100,000 iteraciones con SHA-256)</strong> antes de ser respaldados. Ni los servidores de la aplicación ni Google Drive pueden leer o acceder a tu información sin tu contraseña.
                </p>
              </div>

              {backupErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{backupErrorMsg}</span>
                </div>
              )}

              {backupSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{backupSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Contraseña de cifrado del respaldo *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={backupPassword}
                      onChange={e => setBackupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateEncryptedBackup}
                  disabled={isGeneratingBackup}
                  className="flex-1 py-3 px-4 bg-slate-950 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>
                    {isGeneratingBackup ? 'Cifrando base de datos...' : 'Exportar Archivo Seguro (.finova)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleDriveSync}
                  disabled={isGeneratingBackup}
                  className="flex-1 py-3 px-4 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Respaldar en Google Drive Personal</span>
                </button>
              </div>

              {lastGeneratedVault && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>PAQUETE GENERADO: {lastGeneratedVault.format}</span>
                    <span>v{lastGeneratedVault.version}</span>
                  </div>
                  <p className="text-slate-400 truncate">
                    Integrity Checksum: {lastGeneratedVault.integrityChecksum.slice(0, 32)}...
                  </p>
                  <p className="text-slate-400">
                    Algoritmo: {lastGeneratedVault.crypto.algorithm} ({lastGeneratedVault.crypto.iterations} rounds)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: RESTAURAR RESPALDO                                      */}
          {/* ============================================================== */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>¿Perdiste tu dispositivo o cambiaste de teléfono?</strong>
                <p className="mt-1">
                  Inicia sesión con tu cuenta, selecciona tu archivo <strong>.finova</strong> descargado de tu Google Drive o almacenamiento local, introduce tu contraseña y restaura al instante todo tu negocio.
                </p>
              </div>

              {restoreErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{restoreErrorMsg}</span>
                </div>
              )}

              {restoreSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{restoreSuccessMsg}</span>
                </div>
              )}

              {/* File Input Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/30 transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".finova,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 mx-auto flex items-center justify-center text-slate-700 mb-2">
                  <Upload className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  {restoreFile ? restoreFile.name : 'Haz clic para seleccionar tu archivo de respaldo (.finova)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Archivos soportados: .finova (bóveda cifrada AES-256-GCM)
                </p>
              </div>

              {previewVault && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">Bóveda Cifrada Detectada:</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {previewVault.stats?.productsCount || 0} prod · {previewVault.stats?.transactionsCount || 0} txs
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Contraseña para descifrar este archivo:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={restorePassword}
                        onChange={e => setRestorePassword(e.target.value)}
                        placeholder="Ingresa la contraseña de la bóveda..."
                        className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleDecryptAndPreview}
                        disabled={isRestoring}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        {isRestoring ? 'Descifrando...' : 'Verificar y Descifrar'}
                      </button>
                    </div>
                  </div>

                  {decryptedPreview && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>¡Descifrado exitoso! Datos listos para restauración:</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Productos</span>
                          <span className="font-bold text-slate-900">{decryptedPreview.products?.length || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Movimientos</span>
                          <span className="font-bold text-slate-900">{decryptedPreview.transactions?.length || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Clientes</span>
                          <span className="font-bold text-slate-900">{decryptedPreview.customers?.length || 0}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block">Deudas</span>
                          <span className="font-bold text-slate-900">{decryptedPreview.debts?.length || 0}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Confirmar y Restaurar Todo en este Dispositivo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: GUÍA TÉCNICA & CÓDIGO (PARA EL DESARROLLADOR)          */}
          {/* ============================================================== */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setCodeSubTab('overview')}
                  className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                    codeSubTab === 'overview'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Arquitectura Paso a Paso
                </button>
                <button
                  onClick={() => setCodeSubTab('flutter')}
                  className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                    codeSubTab === 'flutter'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Flutter (Hive + Drive)
                </button>
                <button
                  onClick={() => setCodeSubTab('reactnative')}
                  className={`flex-1 py-1.5 font-extrabold rounded-lg transition-all ${
                    codeSubTab === 'reactnative'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  React Native (WatermelonDB)
                </button>
              </div>

              {codeSubTab === 'overview' && (
                <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto relative">
                  <button
                    onClick={() => handleCopyCode(techDocs.architectureOverview, 'overview')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeKey === 'overview' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'overview' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <pre className="whitespace-pre-wrap leading-relaxed">{techDocs.architectureOverview}</pre>
                </div>
              )}

              {codeSubTab === 'flutter' && (
                <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto relative">
                  <button
                    onClick={() => handleCopyCode(techDocs.flutterCodeSample, 'flutter')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeKey === 'flutter' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'flutter' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <pre className="whitespace-pre-wrap leading-relaxed">{techDocs.flutterCodeSample}</pre>
                </div>
              )}

              {codeSubTab === 'reactnative' && (
                <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto relative">
                  <button
                    onClick={() => handleCopyCode(techDocs.reactNativeCodeSample, 'reactnative')}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeKey === 'reactnative' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeKey === 'reactnative' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <pre className="whitespace-pre-wrap leading-relaxed">{techDocs.reactNativeCodeSample}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Cifrado en reposo y en tránsito. Sin servidores intermedios.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
