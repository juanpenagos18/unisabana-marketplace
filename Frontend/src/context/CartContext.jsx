import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

// T34 — Lógica de carrito con persistencia en LocalStorage
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch { return []; }
  });

  // Sincroniza con localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) return prev; // ya está en el carrito
      return [...prev, {
        _id:      product._id,
        title:    product.title,
        price:    product.price,
        image:    product.images?.[0] || null,
        seller:   product.seller,
        category: product.category,
      }];
    });
  };

  const removeItem = (productId) =>
    setItems(prev => prev.filter(i => i._id !== productId));

  const clearCart = () => setItems([]);

  const isInCart = (productId) => items.some(i => i._id === productId);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};

export default CartContext;
