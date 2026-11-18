import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const prevUserIdRef = useRef(user?.id);

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rinnovo_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const fallbackImg =
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
      return parsed.map((item) => ({
        ...item,
        image:
          item.image && item.image !== '/placeholder.png'
            ? item.image
            : item.selectedVariant?.image_url || fallbackImg,
      }));
    } catch {
      return [];
    }
  });

  // Si el usuario cierra sesión o cambia de usuario, limpiar el carrito en memoria y en localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem('rinnovo_cart');
    } else if (prevUserIdRef.current && prevUserIdRef.current !== user?.id) {
      setItems([]);
      localStorage.removeItem('rinnovo_cart');
    }
    prevUserIdRef.current = user?.id;
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    localStorage.setItem('rinnovo_cart', JSON.stringify(items));
  }, [items]);

  // item: { id, productId, name, image, price, selectedVariant, quantity, stock }
  const addItem = (product, selectedVariant = null, quantity = 1) => {
    setItems((prevItems) => {
      const cartItemId = selectedVariant 
        ? `${product.id}-${selectedVariant.id}` 
        : `${product.id}`;

      const existingIndex = prevItems.findIndex((i) => i.cartItemId === cartItemId);

      const price = selectedVariant?.price 
        ? parseFloat(selectedVariant.price) 
        : parseFloat(product.price || 0);

      const maxStock = selectedVariant?.stock ?? product.stock ?? 99;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, maxStock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const fallbackImg =
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
        const image =
          selectedVariant?.image_url ||
          selectedVariant?.image ||
          product.image_url ||
          product.image ||
          product.variants?.[0]?.image_url ||
          product.variants?.[0]?.image ||
          fallbackImg;

        return [
          ...prevItems,
          {
            cartItemId,
            productId: product.id,
            name: product.name,
            image,
            price,
            selectedVariant,
            quantity: Math.min(quantity, maxStock),
            stock: maxStock,
          },
        ];
      }
    });
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: Math.min(newQty, item.stock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const replaceCartItems = (newItems) => {
    setItems(Array.isArray(newItems) ? newItems : []);
  };

  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmountUSD = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        replaceCartItems,
        totalItemsCount,
        totalAmountUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
