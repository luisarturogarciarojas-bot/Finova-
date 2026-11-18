import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    currentUser,
  } = useFinance();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status/Error feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = login(loginEmail, loginPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al iniciar sesión.');
    } else {
      setSuccessMessage('¡Sesión iniciada con éxito!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMessage('');
      }, 700);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const res = register(regFullName, regBusinessName, regEmail, regPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al registrar la cuenta.');
    } else {
      setSuccessMessage('¡Cuenta creada e iniciada con éxito!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMessage('');
      }, 800);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFCF00] flex items-center justify-center text-slate-900 font-black text-sm">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-950">
                {authModalMode === 'login' ? 'Iniciar Sesión' : 'Crear tu Cuenta'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {authModalMode === 'login'
                  ? 'Accede a tu negocio y sincroniza tus datos'
                  : 'Comienza a gestionar tus finanzas y ventas'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-3">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'register'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {authModalMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@negocio.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember password checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-amber-400"
                />
                <span>Guardar contraseña y recordar sesión</span>
              </label>
            </div>

            {/* Quick pre-configured access */}
            <div className="space-y-1.5 pt-1">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-amber-950 truncate">Ysbelia Rojas</p>
                    <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded-sm">USUARIO</span>
                  </div>
                  <p className="text-[10px] text-amber-700 truncate font-mono">ysbeliarojas79@gmail.com · 12345678</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('ysbeliarojas79@gmail.com');
                    setLoginPassword('12345678');
                  }}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg shrink-0 cursor-pointer shadow-xs"
                >
                  Usar
                </button>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs text-white">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white truncate">Luis García</p>
                    <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded-sm">ADMIN ÚNICO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-mono">luis31garciarojas@gmail.com · 12345678</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('luis31garciarojas@gmail.com');
                    setLoginPassword('12345678');
                  }}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg shrink-0 cursor-pointer shadow-xs"
                >
                  Usar
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer mt-2"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          /* TAB 2: REGISTER */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="Ej: Luis García"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Empresa o Negocio *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regBusinessName}
                  onChange={e => setRegBusinessName(e.target.value)}
                  placeholder="Ej: Galaxy store Luis"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Repite clave"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-amber-400"
                />
                <span>Guardar contraseña en este dispositivo</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00875A] hover:bg-[#007048] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer mt-2"
            >
              Registrar Negocio
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
