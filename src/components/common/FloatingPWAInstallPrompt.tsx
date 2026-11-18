import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, CheckCircle2, Clock } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const FloatingPWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(8); // 8 seconds duration requested by user
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already installed as a PWA, do NOT show
  if (isInstalled) {
    return null;
  }

  // 8-second countdown timer
  useEffect(() => {
    if (!isOpen || showIOSGuide) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, showIOSGuide]);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 2500);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating 8-Second Window */}
      <aside
        aria-label="Aviso de instalación de la aplicación"
        className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-60 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="bg-slate-950/95 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400 backdrop-blur-md relative overflow-hidden flex flex-col gap-3">
          
          {/* Top row: App Icon, Info, Timer Badge & Close (Quitar) Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/pwa-192x192.png"
                alt="Icono Fino"
                className="w-12 h-12 rounded-xl border border-amber-400/50 shadow-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white tracking-tight leading-tight truncate">
                    Instalar App Fino
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{timeLeft}s</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug mt-0.5 line-clamp-2">
                  Agrega Fino a tu pantalla de inicio para abrirla como app nativa y usarla sin conexión.
                </p>
              </div>
            </div>

            {/* Quitar / Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title="Quitar ventana flotante"
              aria-label="Quitar ventana flotante"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row: Quitar button & Install button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Quitar
            </button>
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFCF00] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar App ahora</span>
            </button>
          </div>

          {/* 8-Second Visual Progress Indicator Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all ease-linear"
              style={{
                width: `${(timeLeft / 8) * 100}%`,
                transitionDuration: '1000ms',
              }}
            />
          </div>

        </div>
      </aside>

      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-amber-400 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">¡Fino instalada correctamente en tu dispositivo!</span>
        </div>
      )}

      {/* iOS Safari Guided Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="Icono Fino"
                  className="w-10 h-10 rounded-xl shadow-xs border border-amber-400/40 object-cover"
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

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-medium text-slate-600 leading-relaxed">
                Sigue estos pasos rápidos para instalar <strong>Fino</strong> con su icono oficial:
              </p>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 block">En iPhone / iPad (Safari):</span>
                    <span className="text-slate-600">
                      Toca el botón <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> <strong>Compartir</strong> en la barra inferior de Safari.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 block">Agregar a Inicio:</span>
                    <span className="text-slate-600">
                      Despliega el menú hacia abajo y selecciona <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" /> <strong>"Agregar a pantalla de inicio"</strong>.
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
                      Toca los tres puntos <strong>(⋮)</strong> arriba a la derecha y selecciona <strong>"Instalar aplicación"</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                setIsOpen(false);
              }}
              className="w-full py-3 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Listo, entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
