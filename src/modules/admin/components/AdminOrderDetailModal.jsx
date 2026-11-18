import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useBcv } from '../../../hooks/useBcv';
import {
  X,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  HardDrive,
  Loader2,
  Copy,
} from 'lucide-react';

export const AdminOrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { formatUSD } = useBcv();
  const [selectedStatus, setSelectedStatus] = useState(order?.status || '1');
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const statusConfig = {
    '1': { label: 'Pendiente de Pago', variant: 'warning', icon: Clock, color: 'text-amber-500' },
    '2': { label: 'Pagado / En Preparación', variant: 'success', icon: CheckCircle2, color: 'text-emerald-500' },
    '3': { label: 'Enviado / En Tránsito', variant: 'blue', icon: Truck, color: 'text-blue-500' },
    '4': { label: 'Entregado / Completado', variant: 'indigo', icon: Package, color: 'text-purple-500' },
    '5': { label: 'Cancelado / Expirado', variant: 'danger', icon: AlertTriangle, color: 'text-rose-500' },
  };

  const currentCfg = statusConfig[order.status] || statusConfig['1'];
  const CurrentIcon = currentCfg.icon;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) return;

    if (
      selectedStatus === '5' &&
      !window.confirm(
        '¿Confirmas que deseas cancelar esta orden? El stock de los equipos reservados será devuelto automáticamente al inventario.'
      )
    ) {
      return;
    }

    setUpdating(true);
    setErrorMsg(null);
    try {
      await onStatusUpdated(order.id, selectedStatus);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al actualizar el estado de la orden.');
    } finally {
      setUpdating(false);
    }
  };

  const cleanPhone = (order.phone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `58${cleanPhone.slice(1)}` : cleanPhone;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hola ${order.contact_name}, te escribimos de RinnovoTech con respecto a tu orden #${order.id}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-mono tracking-tight">
                  Orden #{order.id}
                </h3>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Copiar ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <Badge variant={currentCfg.variant} withDot>
                  {currentCfg.label}
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Registrada el {order.created_at ? new Date(order.created_at).toLocaleString('es-VE') : 'Reciente'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Grid de 2 Columnas: Cliente & Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta de Cliente y Despacho */}
            <Card className="p-5 bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Datos de Despacho
                </span>
                <Badge variant="blue" className="text-[10px]">
                  {order.envio_type === '1' ? 'Retiro en Tienda' : 'Envío Nacional'}
                </Badge>
              </div>

              <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Destinatario:</span>
                  <strong className="text-slate-900 dark:text-white font-medium">{order.contact_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{order.phone}</span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ciudad:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{order.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dirección / Agencia:</span>
                  <p className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </Card>

            {/* Tarjeta Financiera y BCV */}
            <Card className="p-5 bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Liquidación en Bolívares
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                  Tasa: Bs. {order.bcv_rate ? parseFloat(order.bcv_rate).toFixed(4) : 'N/A'}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total en Divisas:</span>
                  <strong className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {formatUSD(order.total_usd || 0)}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total en Bolívares:</span>
                  <strong className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                    Bs. {order.total_bs ? parseFloat(order.total_bs).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '0,00'}
                  </strong>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400">Método Registrado:</span>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {order.payment_method || 'Pago Móvil BDV'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Desglose de Laptops & Variantes Físicas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Equipos de Computación en esta Orden ({order.items?.length || 0})
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden">
              {order.items?.map((item, idx) => {
                const fallbackImg =
                  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
                const img = item.variant?.image_url || fallbackImg;
                const features = item.variant?.features || [];

                return (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={img}
                          alt={item.product_name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImg;
                          }}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.product_name || 'Laptop RinnovoTech'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          SKU: {item.variant_sku || 'Configuración Estándar'}
                        </p>
                        {features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {features.map((f, fidx) => (
                              <span
                                key={fidx}
                                className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {f.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="block font-bold text-slate-900 dark:text-white">
                        {item.quantity} x {formatUSD(item.price)}
                      </span>
                      <span className="block text-blue-600 dark:text-blue-400 font-semibold">
                        {formatUSD(item.subtotal || item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección de Conciliación BDV & Pagos Reclamados */}
          {order.payments && order.payments.length > 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pago Bancario BDV Conciliado
              </span>
              {order.payments.map((p, pidx) => (
                <div key={pidx} className="flex flex-col sm:flex-row justify-between text-xs font-mono text-emerald-900 dark:text-emerald-200 gap-1">
                  <span><strong>Referencia:</strong> {p.reference}</span>
                  <span><strong>Titular:</strong> {p.sender_name || 'N/A'}</span>
                  <span><strong>Monto:</strong> Bs. {parseFloat(p.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                  <span><strong>Fecha:</strong> {p.payment_date ? new Date(p.payment_date).toLocaleTimeString('es-VE') : 'Hoy'}</span>
                </div>
              ))}
            </div>
          ) : (
            order.status === '1' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Esperando Conciliación de Pago Móvil BDV</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    El cliente tiene hasta 20 minutos para ingresar su referencia. Si el cliente pagó por taquilla o efectivo, puedes marcar la orden como "Pagado / En Preparación" directamente en el selector de abajo.
                  </p>
                </div>
              </div>
            )
          )}

          {/* Centro de Mando: Cambio de Estado de la Orden */}
          <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Control de Estado Operativo
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Actual: <strong>{currentCfg.label}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(statusConfig).map(([code, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = selectedStatus === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedStatus(code)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : cfg.color}`} />
                    <span className={`font-bold line-clamp-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {cfg.label.split('/')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Status {code}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={updating}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={updating}
                disabled={selectedStatus === order.status || updating}
                onClick={handleUpdateStatus}
              >
                Actualizar Estado
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
