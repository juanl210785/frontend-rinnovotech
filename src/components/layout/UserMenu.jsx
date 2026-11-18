import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  ShoppingBag,
  LogOut,
  ChevronDown,
  LogIn,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

export const UserMenu = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  // CASO 1: NO AUTENTICADO -> Botón elegante de Acceso de Clientes / Admin
  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-95 cursor-pointer shadow-xs"
        title="Acceder a tu cuenta"
      >
        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Mi Cuenta</span>
      </Link>
    );
  }

  // CASO 2: AUTENTICADO -> Cápsula con Dropdown
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer select-none"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[100px]">
            {user?.name?.split(' ')[0]}
          </span>
          <span className="block text-[9px] font-mono text-slate-400 -mt-0.5">
            {isAdmin ? 'ADMIN' : 'CLIENTE'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Identificación de usuario */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {user?.name}
            </p>
            <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
              {user?.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-[10px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {isAdmin ? 'Acceso Administrador' : 'Cliente Verificado'}
            </div>
          </div>

          <div className="p-1 space-y-0.5 text-xs font-medium">
            {/* Si es cliente o admin: Mis Pedidos */}
            <Link
              to="/cuenta"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>Mis Pedidos & Compras</span>
            </Link>

            {/* Si es ADMIN: Acceso directo al Panel */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Inventario & Laptops</span>
                </Link>
                <Link
                  to="/admin/ordenes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Órdenes & Pagos BDV</span>
                </Link>
              </>
            )}
          </div>

          <div className="p-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
