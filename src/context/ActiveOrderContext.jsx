import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const ActiveOrderContext = createContext();

// Helper para convertir los items de una orden de Laravel en items compatibles con el carrito
const mapOrderItemsToCartItems = (orderItems = []) => {
  const fallbackImg =
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';

  return orderItems.map((oi) => {
    const variant = oi.variant || {};
    const cartItemId = `${oi.product_id}-${oi.variant_id || oi.product_id}`;
    return {
      cartItemId,
      productId: oi.product_id,
      name: oi.product_name || 'Laptop RinnovoTech',
      image: variant.image_url || fallbackImg,
      price: parseFloat(oi.price || 0),
      selectedVariant: {
        id: oi.variant_id,
        sku: oi.variant_sku || variant.sku,
        label:
          variant.features?.map((f) => f.value).join(' / ') ||
          oi.variant_sku ||
          'Configuración estándar',
        image_url: variant.image_url || null,
        stock: variant.stock ?? 1,
        price: oi.price,
      },
      quantity: oi.quantity || 1,
      stock: variant.stock ?? 1,
    };
  });
};

export const ActiveOrderProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { replaceCartItems, clearCart } = useCart();

  // Cargar orden activa persistida en localStorage como estado inicial
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('rinnovo_active_order');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed.expires_at) {
        const remaining = Math.floor((new Date(parsed.expires_at).getTime() - Date.now()) / 1000);
        if (remaining <= 0) {
          localStorage.removeItem('rinnovo_active_order');
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [loadingActiveOrder, setLoadingActiveOrder] = useState(false);

  // Cálculo de segundos restantes
  const calculateRemaining = useCallback((order) => {
    if (!order?.expires_at) return 0;
    const target = new Date(order.expires_at).getTime();
    const diff = Math.floor((target - Date.now()) / 1000);
    return Math.max(0, diff);
  }, []);

  const [secondsLeft, setSecondsLeft] = useState(() => calculateRemaining(activeOrder));

  // Guardar orden activa local y en storage
  const saveActiveOrder = useCallback((order, paymentInstructions = null, shipping = null, rate = null) => {
    const expiresAt =
      order.expires_at ||
      new Date(Date.now() + 20 * 60 * 1000).toISOString();

    const orderData = {
      id: order.id,
      total: order.total || order.subtotal || order.total_usd,
      total_bs: order.total_bs,
      rate: rate || order.bcv_rate || order.rate,
      expires_at: expiresAt,
      items: order.items || [],
      shipping: shipping || {
        contact_name: order.contact_name,
        phone: order.phone,
        city: order.city,
        shipping_address: order.shipping_address,
        envio_type: order.envio_type,
      },
      payment_instructions: paymentInstructions || order.payment_instructions || null,
      created_at: order.created_at || new Date().toISOString(),
    };

    setActiveOrder(orderData);
    localStorage.setItem('rinnovo_active_order', JSON.stringify(orderData));
    setSecondsLeft(calculateRemaining(orderData));
  }, [calculateRemaining]);

  // Limpiar orden activa local
  const clearActiveOrder = useCallback(() => {
    setActiveOrder(null);
    setSecondsLeft(0);
    localStorage.removeItem('rinnovo_active_order');
  }, []);

  // Consultar en Laravel la orden activa del cliente autenticado
  const syncWithApi = useCallback(async () => {
    const token = localStorage.getItem('rinnovo_token');
    if (!token) {
      clearActiveOrder();
      return;
    }

    try {
      setLoadingActiveOrder(true);
      const res = await ordersApi.getActive();
      if (res?.active_order) {
        saveActiveOrder(
          res.active_order,
          res.payment_instructions,
          {
            contact_name: res.active_order.contact_name,
            phone: res.active_order.phone,
            city: res.active_order.city,
            shipping_address: res.active_order.shipping_address,
            envio_type: res.active_order.envio_type,
          },
          res.active_order.bcv_rate
        );

        // Llenar automáticamente el carrito con los productos de la orden pendiente
        if (Array.isArray(res.active_order.items) && res.active_order.items.length > 0) {
          replaceCartItems(mapOrderItemsToCartItems(res.active_order.items));
        }
      } else {
        // La API determinó que no hay orden activa o ya expiró y liberó el stock
        clearActiveOrder();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        clearActiveOrder();
      }
    } finally {
      setLoadingActiveOrder(false);
    }
  }, [clearActiveOrder, saveActiveOrder, replaceCartItems]);

  // Sincronizar con la API al iniciar sesión o cambiar usuario autenticado
  useEffect(() => {
    if (isAuthenticated) {
      syncWithApi();
    } else {
      clearActiveOrder();
    }
  }, [isAuthenticated, user?.id, syncWithApi, clearActiveOrder]);

  // Cancelar manualmente una orden pendiente en la API y liberar el stock físico (Rollback)
  const cancelActiveOrder = useCallback(async (orderId = null) => {
    const idToCancel = orderId || activeOrder?.id;
    if (!idToCancel) {
      clearActiveOrder();
      return { success: true };
    }

    try {
      const res = await ordersApi.cancel(idToCancel);
      clearActiveOrder();
      return { success: true, message: res.message };
    } catch (err) {
      clearActiveOrder();
      return {
        success: false,
        message: err.response?.data?.message || 'Error al cancelar la orden.',
      };
    }
  }, [activeOrder, clearActiveOrder]);

  // Agregar un producto en caliente a la orden activa en Laravel
  const addItemToActiveOrder = useCallback(async (variantId, quantity = 1) => {
    if (!activeOrder?.id) return { success: false, message: 'No hay orden activa' };

    try {
      const res = await ordersApi.addItem(activeOrder.id, {
        variant_id: variantId,
        quantity,
      });

      if (res?.active_order) {
        saveActiveOrder(
          res.active_order,
          res.payment_instructions,
          {
            contact_name: res.active_order.contact_name,
            phone: res.active_order.phone,
            city: res.active_order.city,
            shipping_address: res.active_order.shipping_address,
            envio_type: res.active_order.envio_type,
          },
          res.active_order.bcv_rate
        );

        if (Array.isArray(res.active_order.items)) {
          replaceCartItems(mapOrderItemsToCartItems(res.active_order.items));
        }

        return { success: true, message: res.message, order: res.active_order };
      }

      return { success: false, message: 'Error al actualizar la orden' };
    } catch (err) {
      const msg =
        err.response?.data?.errors?.quantity?.[0] ||
        err.response?.data?.message ||
        'No se pudo agregar el producto a la orden.';
      return { success: false, message: msg };
    }
  }, [activeOrder?.id, saveActiveOrder, replaceCartItems]);

  // Quitar un producto en caliente de la orden activa en Laravel
  const removeItemFromActiveOrder = useCallback(async (orderItemId) => {
    if (!activeOrder?.id) return { success: false, message: 'No hay orden activa' };

    try {
      const res = await ordersApi.removeItem(activeOrder.id, orderItemId);

      if (res?.active_order) {
        saveActiveOrder(
          res.active_order,
          res.payment_instructions,
          {
            contact_name: res.active_order.contact_name,
            phone: res.active_order.phone,
            city: res.active_order.city,
            shipping_address: res.active_order.shipping_address,
            envio_type: res.active_order.envio_type,
          },
          res.active_order.bcv_rate
        );

        if (Array.isArray(res.active_order.items)) {
          replaceCartItems(mapOrderItemsToCartItems(res.active_order.items));
        }
      } else {
        clearActiveOrder();
        replaceCartItems([]);
      }

      return { success: true, message: res.message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'No se pudo eliminar el producto de la orden.';
      return { success: false, message: msg };
    }
  }, [activeOrder?.id, saveActiveOrder, replaceCartItems, clearActiveOrder]);

  // Timer sincronizado con reloj real
  useEffect(() => {
    if (!activeOrder?.expires_at) {
      setSecondsLeft(0);
      return;
    }

    const currentRemaining = calculateRemaining(activeOrder);
    setSecondsLeft(currentRemaining);

    if (currentRemaining <= 0) {
      syncWithApi();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining(activeOrder);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        syncWithApi();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder, calculateRemaining, syncWithApi]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = Boolean(activeOrder) && secondsLeft <= 0;

  return (
    <ActiveOrderContext.Provider
      value={{
        activeOrder,
        hasActiveOrder: Boolean(activeOrder),
        loadingActiveOrder,
        secondsLeft,
        formattedTime,
        isExpired,
        saveActiveOrder,
        clearActiveOrder,
        cancelActiveOrder,
        addItemToActiveOrder,
        removeItemFromActiveOrder,
        syncWithApi,
      }}
    >
      {children}
    </ActiveOrderContext.Provider>
  );
};

export const useActiveOrder = () => {
  const context = useContext(ActiveOrderContext);
  if (!context) {
    throw new Error('useActiveOrder debe utilizarse dentro de ActiveOrderProvider');
  }
  return context;
};
