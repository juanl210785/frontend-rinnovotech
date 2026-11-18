import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Laptop, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  const { totalItemsCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:bg-blue-700 transition-all">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
              Rinnovo<span className="text-blue-600">Tech</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Pagos en Tiempo Real
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Catálogo
          </Link>
          <a
            href="#garantia"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Garantía BDV
          </a>
        </nav>

        {/* Acciones: Menú de Usuario + Theme Toggle + Carrito */}
        <div className="flex items-center gap-3">
          {/* Componente Universal de Autenticación (Admin / Customer) */}
          <UserMenu />

          <ThemeToggle />

          <Link
            to="/checkout"
            className="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            {totalItemsCount > 0 && (
              <span className="ml-1 bg-blue-500 dark:bg-white dark:text-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in-50">
                {totalItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
