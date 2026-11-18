import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { useBcv } from '../../../hooks/useBcv';
import { adminApi } from '../../../api/admin';
import { AdminHeader } from '../components/AdminHeader';
import { AdminOrderDetailModal } from '../components/AdminOrderDetailModal';
import {
  ShoppingBag,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertTriangle,
  RotateCw,
  Eye,
  TrendingUp,
  DollarSign,
  User,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const AdminOrdersPage = () => {
  const { formatUSD } = useBcv();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // '' = Todos
  const [selectedEnvio, setSelectedEnvio] = useState('');   // '' = Todos

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // Modal de Detalle
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast / Notificación rápida
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cargar estadísticas globales
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await adminApi.getOrderStats();
      setStats(res);
    } catch (err) {
      console.warn('Error al cargar métricas de órdenes:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Cargar listado con filtros
  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 15,
      };

      if (selectedStatus) params.status = selectedStatus;
      if (selectedEnvio) params.envio_type = selectedEnvio;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getOrders(params);
      const list = res.data || (Array.isArray(res) ? res : []);
      setOrders(list);

      if (res.meta) {
        setCurrentPage(res.meta.current_page || 1);
        setTotalPages(res.meta.last_page || 1);
        setTotalOrdersCount(res.meta.total || list.length);
      } else {
        setCurrentPage(1);
        setTotalPages(1);
        setTotalOrdersCount(list.length);
      }
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedEnvio, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Actualizar estado de una orden desde el modal
  const handleStatusUpdated = async (orderId, newStatus) => {
    const res = await adminApi.updateOrderStatus(orderId, { status: newStatus });
    if (res.success) {
      showToast(res.message);
      setIsModalOpen(false);
      fetchOrders(currentPage);
      fetchStats();
    }
  };

  const statusPills = [
    { id: '', label: 'Todas', count: stats?.total_orders },
    { id: '1', label: 'Pendientes', count: stats?.counts?.pending, color: 'text-amber-500' },
    { id: '2', label: 'Pagadas BDV', count: stats?.counts?.paid, color: 'text-emerald-500' },
    { id: '3', label: 'Enviadas', count: stats?.counts?.shipped, color: 'text-blue-500' },
    { id: '4', label: 'Entregadas', count: stats?.counts?.delivered, color: 'text-purple-500' },
    { id: '5', label: 'Canceladas', count: stats?.counts?.cancelled, color: 'text-rose-500' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case '1':
        return <Badge variant="warning" withDot>Pendiente de Pago</Badge>;
      case '2':
        return <Badge variant="success" withDot>Pagado / En Prep.</Badge>;
      case '3':
        return <Badge variant="blue" withDot>Enviado</Badge>;
      case '4':
        return <Badge variant="indigo" withDot>Entregado</Badge>;
      case '5':
        return <Badge variant="danger" withDot>Cancelado</Badge>;
      default:
        return <Badge variant="slate">Desconocido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notificación */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-medium text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Encabezado y Navegación Tabular */}
        <AdminHeader />

        {/* Título de la Sección */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión de Órdenes & Conciliación
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supervisión de compras en bolívares, verificación de Pago Móvil BDV y control de despachos.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              fetchOrders(currentPage);
              fetchStats();
            }}
            className="rounded-2xl"
            title="Refrescar órdenes"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Tarjetas KPI Fintech en Tiempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Ingresos Totales */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Facturación Pagada</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {formatUSD(stats?.financials?.revenue_usd || 0)}
              </h3>
              <span className="block text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                Bs. {stats?.financials?.revenue_bs ? stats.financials.revenue_bs.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '0,00'}
              </span>
            </div>
          </Card>

          {/* KPI 2: Pendientes por Cobrar */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">En Espera de Pago</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {stats?.counts?.pending || 0} órdenes
              </h3>
              <span className="block text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                {formatUSD(stats?.financials?.pending_usd || 0)}
              </span>
            </div>
          </Card>

          {/* KPI 3: En Preparación y Tránsito */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">En Preparación / Tránsito</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {(stats?.counts?.paid || 0) + (stats?.counts?.shipped || 0)} pedidos
              </h3>
              <span className="block text-[11px] font-mono text-blue-600 dark:text-blue-400">
                {stats?.counts?.paid || 0} listos · {stats?.counts?.shipped || 0} en ruta
              </span>
            </div>
          </Card>

          {/* KPI 4: Entregadas / Exitosas */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Entregadas con Éxito</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {stats?.counts?.delivered || 0} órdenes
              </h3>
              <span className="block text-[11px] font-mono text-purple-600 dark:text-purple-400">
                Garantía técnica activa
              </span>
            </div>
          </Card>
        </div>

        {/* Filtros Inteligentes & Búsqueda */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Input de Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por #ID, cliente, cédula, teléfono, ciudad o ref BDV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de Modalidad de Envío */}
            <div className="flex items-center gap-2">
              <select
                value={selectedEnvio}
                onChange={(e) => setSelectedEnvio(e.target.value)}
                className="px-3 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="">Todas las modalidades</option>
                <option value="1">Retiro en Tienda</option>
                <option value="2">Envío Nacional</option>
              </select>
            </div>
          </div>

          {/* Píldoras de Estado */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            {statusPills.map((pill) => {
              const isSelected = selectedStatus === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedStatus(pill.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{pill.label}</span>
                  {pill.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tabla Fintech de Órdenes */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Orden #</th>
                  <th className="py-3.5 px-4 font-bold">Cliente & Contacto</th>
                  <th className="py-3.5 px-4 font-bold">Laptops Reservadas</th>
                  <th className="py-3.5 px-4 font-bold text-right">Monto ($ / Bs.)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Modalidad</th>
                  <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="font-mono text-slate-400 text-xs">Consultando órdenes y conciliaciones BDV...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        No se encontraron órdenes registradas
                      </p>
                      <p className="text-slate-400 text-xs font-mono max-w-sm mx-auto">
                        Intenta cambiando los filtros o borrando el término de búsqueda.
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => {
                    const fallbackImg =
                      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
                    const firstItem = ord.items?.[0];
                    const firstImg = firstItem?.variant?.image_url || fallbackImg;
                    const itemsCount = ord.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* ID de Orden */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <span className="text-blue-600 dark:text-blue-400">#{ord.id}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString('es-VE') : ''}
                          </span>
                        </td>

                        {/* Cliente & Contacto */}
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {ord.contact_name || ord.user?.name || 'Cliente'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                            <span>{ord.phone || 'Sin tlf'}</span>
                            <span>·</span>
                            <span className="line-clamp-1">{ord.city}</span>
                          </div>
                        </td>

                        {/* Equipos Reservados */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                              <img
                                src={firstImg}
                                alt="Laptop"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = fallbackImg;
                                }}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {firstItem?.product_name || 'Laptop RinnovoTech'}
                              </p>
                              <span className="text-[11px] font-mono text-slate-400">
                                {itemsCount} {itemsCount === 1 ? 'equipo' : 'equipos'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Montos Duales */}
                        <td className="py-4 px-4 text-right font-mono">
                          <span className="block font-black text-slate-900 dark:text-white text-sm">
                            {formatUSD(ord.total_usd || 0)}
                          </span>
                          <span className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            Bs. {ord.total_bs ? parseFloat(ord.total_bs).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '0,00'}
                          </span>
                        </td>

                        {/* Modalidad de Envío */}
                        <td className="py-4 px-4 text-center">
                          <Badge variant={ord.envio_type === '1' ? 'blue' : 'slate'} className="text-[10px]">
                            {ord.envio_type === '1' ? 'Tienda' : 'Nacional'}
                          </Badge>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(ord.status)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsModalOpen(true);
                            }}
                            className="h-8 px-2.5 rounded-xl text-xs gap-1 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalOrdersCount} órdenes registradas)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => fetchOrders(currentPage - 1)}
                  className="rounded-xl h-8 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => fetchOrders(currentPage + 1)}
                  className="rounded-xl h-8 px-2.5"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal de Detalle y Auditoría */}
        <AdminOrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onStatusUpdated={handleStatusUpdated}
        />
      </div>
    </div>
  );
};
