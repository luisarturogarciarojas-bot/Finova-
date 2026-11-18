import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const PlanUpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeFeatureTarget,
    plansConfig,
    upgradeCurrentUserToPro,
    currentUser,
    setIsAuthModalOpen,
    featureAccess,
  } = useFinance();

  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      upgradeCurrentUserToPro();
      setIsUpgrading(false);
      setUpgradeComplete(true);
      setTimeout(() => {
        setUpgradeComplete(false);
        setIsUpgradeModalOpen(false);
      }, 1800);
    }, 600);
  };

  const premiumFeatures = featureAccess.filter(f => f.isPremium);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Top Gradient Banner with Crown */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 text-slate-950 p-6 relative overflow-hidden shrink-0">
          {/* Subtle background decoration */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/20 blur-xl pointer-events-none" />
          <div className="absolute top-3 right-12 text-amber-600/30 select-none pointer-events-none">
            <Crown className="w-24 h-24 rotate-12" />
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 shadow-xs flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Finova PRO
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
              -{plansConfig.discountPercent}% OFF
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
            Lleva tu negocio al siguiente nivel
          </h2>
          <p className="text-xs font-semibold text-slate-800 mt-1 max-w-sm">
            {upgradeFeatureTarget ? (
              <span>
                Para usar <strong className="text-slate-950 underline">{upgradeFeatureTarget.title || upgradeFeatureTarget.name}</strong> y todas las herramientas exclusivas, actualiza a PRO.
              </span>
            ) : (
              'Desbloquea facturación electrónica, catálogo digital, conteos de inventario y estadísticas avanzadas.'
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {upgradeComplete ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                ¡Felicidades! Ya eres Finova PRO
              </h3>
              <p className="text-xs text-slate-600">
                Tu cuenta ha sido activada con éxito. Ya tienes acceso a todos los módulos y herramientas ilimitadas.
              </p>
            </div>
          ) : (
            <>
              {/* Billing Cycle Switcher */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Anual</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-md font-extrabold">
                    Ahorras {plansConfig.discountPercent}%
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Mensual</span>
                </button>
              </div>

              {/* Price card */}
              <div className="border-2 border-amber-400 bg-amber-50/50 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                    {billingCycle === 'annual' ? 'Facturación Anual' : 'Facturación Mensual'}
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black font-mono text-slate-950">
                      {plansConfig.currencySymbol || '$'}
                      {billingCycle === 'annual' ? plansConfig.annualPrice : plansConfig.monthlyPrice}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {billingCycle === 'annual' ? '/ año' : '/ mes'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                      Equivalente a solo {plansConfig.currencySymbol || '$'}
                      {(plansConfig.annualPrice / 12).toFixed(2)}/mes
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
                    PLAN COMPLETO
                  </span>
                </div>
              </div>

              {/* Feature list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Beneficios incluidos con PRO:
                </p>
                <div className="space-y-2 text-xs">
                  {premiumFeatures.map(feat => (
                    <div key={feat.id} className="flex items-center gap-2.5 text-slate-700 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="truncate">{feat.title || feat.name}</span>
                    </div>
                  ))}

                  <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Soporte prioritario WhatsApp 24/7</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!upgradeComplete && (
          <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>{isUpgrading ? 'Activando suscripción...' : 'Activar Plan PRO Ahora'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500 font-medium">
              Cancela cuando quieras • Sin contratos forzosos • Garantía de satisfacción
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
