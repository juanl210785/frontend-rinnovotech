import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ThemeToggle } from '../../../components/layout/ThemeToggle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { adminApi } from '../../../api/admin';
import {
  Laptop,
  Package,
  ArrowLeft,
  LogOut,
  Layers,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const res = await adminApi.getOrderStats();
        if (isMounted && res?.counts?.pending !== undefined) {
          setPendingCount(res.counts.pending);
        }
      } catch (err) {
        // Silencioso
      }
    };
    fetchPending();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/');
  };

  const isProductsActive = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/ordenes');
  const isOrdersActive = location.pathname.startsWith('/admin/ordenes');

  return (
    <div className="space-y-4">
      {/* Barra Ejecutiva Superior */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Volver a la Tienda Pública"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Rinnovo<span className="text-blue-600 dark:text-blue-500">Tech</span>
              </span>
              <Badge variant="blue">ADMIN CORE</Badge>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Panel Central de Operaciones & Conciliación Bancaria BDV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <ThemeToggle />

          {/* Perfil del Admin */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div>
              <span className="block font-semibold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">
                {user?.name || 'Administrador'}
              </span>
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            isLoading={loggingOut}
            onClick={handleLogout}
            className="rounded-2xl"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>

      {/* Pestañas de Navegación del Panel de Control */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 w-fit">
        <Link
          to="/admin"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isProductsActive
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Laptops & Inventario</span>
        </Link>

        <Link
          to="/admin/ordenes"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            isOrdersActive
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Órdenes & Pagos BDV</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};
