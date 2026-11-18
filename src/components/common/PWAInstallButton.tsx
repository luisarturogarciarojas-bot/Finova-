import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'sidebar' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // If already installed in standalone mode on the phone/desktop, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions fallback
      setShowIOSGuide(true);
    }
  };

  const renderButtonContent = () => {
    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all active:scale-98 cursor-pointer ${className}`}
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="text-left leading-tight truncate">
            <div className="font-black text-xs">Instalar Fino</div>
            <div className="text-[10px] font-semibold text-slate-900/80">En tu teléfono móvil</div>
          </div>
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer ${className}`}
          title="Instalar Fino en tu teléfono"
        >
          <Download className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          <span>Instalar App</span>
        </button>
      );
    }

    // Default 'header'
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`px-2.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-black text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer border border-amber-400/40 ${className}`}
        title="Instalar Fino en tu teléfono móvil"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>
    );
  };

  return (
    <>
      {renderButtonContent()}

      {/* Success notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-amber-400/50 animate-in fade-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">¡Fino se instaló correctamente en tu dispositivo!</span>
        </div>
      )}

      {/* iOS & Manual Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            {/* Header with Fino Icon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="Icono de Fino"
                  className="w-10 h-10 rounded-xl shadow-xs border border-amber-400/30 object-cover"
                />
                <div>
                  <h3 className="text-base font-black text-slate-950">Instalar Fino</h3>
                  <p className="text-xs font-semibold text-slate-500">En la pantalla de inicio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-medium text-slate-600 leading-relaxed">
                Puedes instalar <strong>Fino</strong> como una aplicación nativa con su icono oficial en la pantalla de inicio:
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 block">En iPhone / iPad (Safari):</span>
                    <span className="text-slate-600">
                      Toca el botón <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> <strong>Compartir</strong> en la barra inferior.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 block">Agregar a pantalla de inicio:</span>
                    <span className="text-slate-600">
                      Baja en el menú y selecciona <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" /> <strong>"Agregar a Inicio"</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 block">En Android (Chrome / Edge):</span>
                    <span className="text-slate-600">
                      Toca los tres puntos <strong>(⋮)</strong> arriba a la derecha y pulsa <strong>"Instalar aplicación"</strong> o "Agregar a pantalla principal".
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
