import React, { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useActiveOrder } from '../../../context/ActiveOrderContext';
import { useBcv } from '../../../hooks/useBcv';
import { BankDetailsCard } from '../components/BankDetailsCard';
import { PaymentVerifier } from '../components/PaymentVerifier';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ordersApi } from '../../../api/orders';
import {
  Clock,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Truck,
  Building,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, totalAmountUSD, removeItem, clearCart } = useCart();
  const { formatUSD, formatBs, toBs, rate } = useBcv();
  const {
    activeOrder,
    saveActiveOrder,
    clearActiveOrder,
    cancelActiveOrder,
    removeItemFromActiveOrder,
  } = useActiveOrder();

  const orderCreated = activeOrder;
  const paymentInstructions = activeOrder?.payment_instructions || null;

  // Formulario de despacho alineado con StoreOrderRequest de Laravel
  const [shipping, setShipping] = useState(() => ({
    contact_name: activeOrder?.shipping?.contact_name || user?.name || '',
    phone: activeOrder?.shipping?.phone || '',
    city: activeOrder?.shipping?.city || '',
    shipping_address: activeOrder?.shipping?.shipping_address || '',
    envio_type: activeOrder?.shipping?.envio_type || '2', // '1' = Retiro en tienda, '2' = Envío nacional/domicilio
  }));

  useEffect(() => {
    if (activeOrder?.shipping) {
      setShipping((prev) => ({
        ...prev,
        ...activeOrder.shipping,
      }));
    } else if (user?.name && !shipping.contact_name) {
      setShipping((prev) => ({ ...prev, contact_name: user.name }));
    }
  }, [user, activeOrder]);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState(null);

  // Si existe orden activa, los productos y totales vienen directamente de Laravel
  const itemsToShow =
    orderCreated?.items && orderCreated.items.length > 0
      ? orderCreated.items.map((oi) => ({
          orderItemId: oi.id,
          cartItemId: `${oi.product_id}-${oi.variant_id || oi.id}`,
          name: oi.product_name || 'Laptop RinnovoTech',
          price: parseFloat(oi.price || 0),
          quantity: oi.quantity || 1,
          selectedVariant: {
            id: oi.variant_id,
            sku: oi.variant_sku || oi.variant?.sku,
            image_url: oi.variant?.image_url,
            label:
              oi.variant?.features?.map((f) => f.value).join(' / ') ||
              oi.variant_sku ||
              'Configuración estándar',
          },
          image: oi.variant?.image_url,
        }))
      : items;

  const totalBs = orderCreated?.total_bs
    ? parseFloat(orderCreated.total_bs).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : formatBs(totalAmountUSD);

  const totalUsdStr = orderCreated?.total
    ? formatUSD(orderCreated.total)
    : formatUSD(totalAmountUSD);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingOrder(true);

    try {
      const payload = {
        contact_name: shipping.contact_name,
        phone: shipping.phone,
        city: shipping.city,
        shipping_address: shipping.shipping_address,
        envio_type: shipping.envio_type,
        shipping_cost: 0,
        payment_method: 'Pago Móvil BDV',
        items: items.map((i) => ({
          variant_id: i.selectedVariant?.id || i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await ordersApi.create(payload);

      // Laravel devuelve { order, payment_instructions }
      const ord = res.order || res.data || res;
      saveActiveOrder(ord, res.payment_instructions, shipping, rate);
    } catch (err) {
      if (err.response?.status === 401) {
        setFormError('Tu sesión ha expirado. Por favor inicia sesión nuevamente para completar tu compra.');
      } else {
        const msg =
          err.response?.data?.message ||
          (err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0]) ||
          'Error al registrar el pedido. Verifique los datos ingresados.';
        setFormError(msg);
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Carrito vacío y sin orden activa
  if (itemsToShow.length === 0 && !orderCreated) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tu carrito está vacío</h2>
        <p className="text-xs text-slate-500">
          Explora nuestro catálogo y agrega los equipos o componentes que necesitas comprar.
        </p>
        <Link to="/">
          <Button variant="primary">Ir al Catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Despacho o Datos Bancarios Activos */}
        <div className="lg:col-span-7 space-y-6">
          {!orderCreated ? (
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  1. Datos de Despacho y Entrega
                </h3>
                <div className="flex items-center gap-2">
                  {user && (
                    <span className="hidden sm:inline-flex text-[11px] text-slate-500 font-medium">
                      Cliente: <strong className="text-blue-600 dark:text-blue-400 ml-1">{user.name}</strong>
                    </span>
                  )}
                  <Badge variant="blue">Paso 1 de 2</Badge>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrder} className="space-y-4">
                {/* Tipo de Envío */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Modalidad de Entrega *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShipping({ ...shipping, envio_type: '2' })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        shipping.envio_type === '2'
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="block text-xs font-bold">Envío Nacional</span>
                        <span className="block text-[10px] text-slate-400">MRW / Zoom / Tealca</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShipping({ ...shipping, envio_type: '1' })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        shipping.envio_type === '1'
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="block text-xs font-bold">Retiro en Tienda</span>
                        <span className="block text-[10px] text-slate-400">Sin costo de envío</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Nombre y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Nombre y Apellido *
                    </label>
                    <Input
                      required
                      placeholder="Ej: Carlos Mendoza"
                      value={shipping.contact_name}
                      onChange={(e) => setShipping({ ...shipping, contact_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Teléfono WhatsApp *
                    </label>
                    <Input
                      required
                      mono
                      placeholder="0412-1234567"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Ciudad y Dirección */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ciudad y Estado *
                    </label>
                    <Input
                      required
                      placeholder="Ej: Caracas, Dto. Capital"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Dirección de Destino o Agencia *
                    </label>
                    <Input
                      required
                      placeholder="Ej: Calle 3, Edif. Cristal o Agencia Zoom"
                      value={shipping.shipping_address}
                      onChange={(e) => setShipping({ ...shipping, shipping_address: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 shadow-lg shadow-blue-500/25"
                  isLoading={submittingOrder}
                >
                  Continuar a Datos de Pago Móvil BDV <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-sm">
                    Orden #{orderCreated.id} Generada Exitosamente
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Esperando Pago Móvil</Badge>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`¿Deseas descartar la orden #${orderCreated.id} para modificar el despacho o el carrito? Se liberará el stock reservado.`)) {
                        await cancelActiveOrder(orderCreated.id);
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-500 underline ml-2 cursor-pointer transition-colors"
                  >
                    Modificar despacho
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 text-xs space-y-1.5 font-mono text-slate-600 dark:text-slate-300">
                <div>
                  <strong>Destinatario:</strong> {shipping.contact_name} ({shipping.phone})
                </div>
                <div>
                  <strong>Destino:</strong> {shipping.city} · {shipping.shipping_address}
                </div>
                <div>
                  <strong>Modalidad:</strong>{' '}
                  {shipping.envio_type === '1' ? 'Retiro en Tienda' : 'Envío Nacional'}
                </div>
              </div>
            </Card>
          )}

          {/* Tarjeta con los datos de Pago Móvil BDV y botones de 1 clic */}
          <BankDetailsCard
            bank={paymentInstructions?.bank || '0102 - Banco de Venezuela'}
            phone={paymentInstructions?.phone || '0412-1234567'}
            idNumber={paymentInstructions?.id_number || 'J-501234567'}
            accountName={paymentInstructions?.account_name || 'RinnovoTech C.A.'}
            amountBs={totalBs}
          />
        </div>

        {/* Columna Derecha: Resumen de Compra y Verificador de Pago BDV */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resumen del Carrito */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen del Pedido
              </h4>
              <span className="text-xs font-mono text-slate-500">
                {itemsToShow.length} {itemsToShow.length === 1 ? 'equipo' : 'equipos'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {itemsToShow.map((item) => {
                const fallbackImg =
                  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
                const displayImage =
                  item.image && item.image !== '/placeholder.png'
                    ? item.image
                    : item.selectedVariant?.image_url || fallbackImg;

                return (
                  <div
                    key={item.cartItemId}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <img
                          src={displayImage}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImg;
                          }}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </p>
                        {item.selectedVariant && (
                          <p className="text-slate-400 text-[11px] font-mono">
                            {item.selectedVariant.label || item.selectedVariant.sku}
                          </p>
                        )}
                        <span className="text-slate-500 font-mono">Cantidad: {item.quantity}</span>
                      </div>
                    </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatUSD(item.price * item.quantity)}
                    </p>
                    {orderCreated ? (
                      <button
                        onClick={async () => {
                          if (item.orderItemId) {
                            if (window.confirm(`¿Deseas quitar "${item.name}" de tu orden activa?`)) {
                              await removeItemFromActiveOrder(item.orderItemId);
                            }
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Quitar de la orden"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            </div>

            {orderCreated && (
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  + Agregar más laptops o componentes a esta orden
                </Link>
              </div>
            )}

            {/* Totalizadores en USD y Bolívares */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monto Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {totalUsdStr}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">
                  Total a Transferir (BCV):
                </span>
                <span className="font-mono font-black text-2xl text-blue-600 dark:text-blue-400">
                  Bs. {totalBs}
                </span>
              </div>
            </div>
          </Card>

          {/* Verificador de Pago Móvil con Botón Animado y Sello de Éxito */}
          <PaymentVerifier
            orderId={orderCreated?.id}
            totalBs={totalBs}
            totalUsd={totalUsdStr}
            onVerified={() => {
              clearActiveOrder();
              clearCart();
            }}
          />
        </div>
      </div>
    </div>
  );
};
