import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../api/auth';
import { ThemeToggle } from '../../../components/layout/ThemeToggle';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Laptop,
  Fingerprint,
  AlertCircle,
  KeyRound,
  User,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [securityStatus, setSecurityStatus] = useState('STANDBY'); // STANDBY | VERIFYING | GRANTED | DENIED

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSecurityStatus('VERIFYING');

    try {
      if (mode === 'register') {
        if (password !== passwordConfirmation) {
          setError('Las contraseñas no coinciden.');
          setSecurityStatus('DENIED');
          setLoading(false);
          return;
        }

        // Registro de nuevo cliente
        const res = await authApi.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });

        // Autenticar automáticamente
        const loginRes = await login({ email, password });
        if (loginRes.success) {
          setSecurityStatus('GRANTED');
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.65 },
          });
          setTimeout(() => {
            const redirectPath = location.state?.from?.pathname || '/cuenta';
            navigate(redirectPath, { replace: true });
          }, 1000);
          return;
        }
      } else {
        // Inicio de sesión universal (Customer o Admin)
        const res = await login({ email, password });

        if (res.success) {
          setSecurityStatus('GRANTED');

          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#2563EB', '#10B981', '#38BDF8'],
          });

          setTimeout(() => {
            // Si venía de una ruta protegida
            if (location.state?.from?.pathname) {
              navigate(location.state.from.pathname, { replace: true });
              return;
            }

            // Si es Admin va al panel, si es Customer va a su cuenta
            if (res.isAdmin) {
              navigate('/admin', { replace: true });
            } else {
              navigate('/cuenta', { replace: true });
            }
          }, 1100);
        } else {
          setSecurityStatus('DENIED');
          setError(res.message || 'Credenciales no autorizadas.');
          setLoading(false);
        }
      }
    } catch (err) {
      setSecurityStatus('DENIED');
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors?.email?.[0]) ||
          'Error al conectar con el servidor de autenticación.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Switch Flotante de Tema */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle showLabel />
      </div>

      {/* Luces y Efectos de Fondo Modern Fintech */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 dark:from-blue-600/20 to-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabecera de Marca */}
        <div className="text-center mb-6 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
              <Laptop className="w-6 h-6" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              Rinnovo<span className="text-blue-600 dark:text-blue-500">Tech</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-mono font-semibold ml-1">
                PORTAL
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {mode === 'login'
                ? 'Accede a tus pedidos, facturas y panel'
                : 'Crea tu cuenta para comprar y verificar pagos'}
            </p>
          </div>
        </div>

        {/* Tarjeta Bento */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 shadow-xl dark:shadow-2xl dark:shadow-black/80 backdrop-blur-xl p-8 transition-all">
          {/* Banner si el usuario fue redirigido desde el Checkout */}
          {location.state?.from?.pathname === '/checkout' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold block">Completa tu pedido</span>
                <span className="text-[11px] text-blue-600/90 dark:text-blue-300/90 leading-tight block mt-0.5">
                  Inicia sesión o regístrate. Tu carrito se conserva intacto para pagar de inmediato.
                </span>
              </div>
            </div>
          )}

          {/* Alternador de Modo: Ingresar vs Registrarse */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Si es registro: Nombre */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Daniel Morales"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="tu-correo@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Contraseña *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmación si es registro */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs animate-in zoom-in-95">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || securityStatus === 'GRANTED'}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 p-[1px] font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer pt-2"
            >
              <div className="w-full h-full bg-blue-600 hover:bg-blue-600/90 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all">
                {securityStatus === 'VERIFYING' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Conectando con Bóveda...</span>
                  </>
                ) : securityStatus === 'GRANTED' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-200 animate-bounce" />
                    <span>¡Identidad Confirmada! Entrando...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span>{mode === 'login' ? 'Entrar a Mi Cuenta' : 'Registrar Cuenta'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Enlace rápido */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">Cifrado Sanctum API</span>
            <Link
              to="/"
              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              Volver a la Tienda →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
