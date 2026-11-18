import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ordersApi } from '../../../api/orders';
import { useBcv } from '../../../hooks/useBcv';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  User,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Mail,
  Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerAccountPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const { formatUSD, formatBs } = useBcv();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersApi.getMyOrders();
        const list = res.data || (Array.isArray(res) ? res : []);
        setOrders(list);
      } catch (err) {
        console.warn('Error al cargar órdenes de cliente:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header del Perfil del Cliente */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name}</h1>
                <Badge variant={isAdmin ? 'warning' : 'blue'}>
                  {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE VERIFICADO'}
                </Badge>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-2 mt-1 font-mono">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  Panel de Control Admin →
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="rounded-2xl"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Resplandor sutil */}
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Historial de Compras */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Mis Compras y Pedidos BDV
            </h2>
            <p className="text-xs text-slate-500">
              Historial de órdenes y seguimiento del estado de verificación de Pago Móvil.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Consultando tus órdenes con Laravel...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Aún no tienes pedidos registrados
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Cuando realices una compra de laptops o componentes con Pago Móvil, tus comprobantes aparecerán aquí.
              </p>
            </div>
            <Link to="/">
              <Button variant="primary" size="sm">
                Explorar Catálogo
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isPaid = ord.status === '2' || ord.status === 'Pagado';
              return (
                <Card
                  key={ord.id}
                  className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-500/30 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        Orden #{ord.id}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-VE') : 'Reciente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.status === '1' && (
                        <Link to="/checkout">
                          <Button variant="primary" size="sm" className="h-7 text-[11px] px-2.5 rounded-xl">
                            Completar Pago →
                          </Button>
                        </Link>
                      )}
                      <Badge
                        variant={
                          ord.status === '2'
                            ? 'success'
                            : ord.status === '1'
                            ? 'blue'
                            : ord.status === '5'
                            ? 'slate'
                            : 'warning'
                        }
                        withDot
                      >
                        {ord.status_label ||
                          (ord.status === '1'
                            ? 'Pendiente de Pago'
                            : ord.status === '2'
                            ? 'Pagado BDV'
                            : ord.status === '5'
                            ? 'Cancelada / Expirada'
                            : 'En Proceso')}
                      </Badge>
                    </div>
                  </div>

                  {/* Resumen de Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs">
                    <div className="sm:col-span-8 space-y-1">
                      {(ord.items || ord.order_items)?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {item.product_name || item.product?.name || 'Equipo RinnovoTech'}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({item.variant_sku || item.variant?.sku || 'Configuración'} x{item.quantity})
                          </span>
                        </div>
                      )) || (
                        <p className="text-slate-500">Equipos de computación asegurados.</p>
                      )}
                    </div>

                    <div className="sm:col-span-4 text-left sm:text-right font-mono">
                      <span className="block text-base font-black text-slate-900 dark:text-white">
                        {formatUSD(ord.total_usd || ord.total || 0)}
                      </span>
                      <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Bs. {ord.total_bs ? parseFloat(ord.total_bs).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : formatBs(ord.total_usd || ord.total || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
