import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Agrega un producto — si ya existe suma la cantidad seleccionada
  const addItem = (product) => {
    const qty = product.selectedQty || 1;
    setItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) {
        // Suma qty sin exceder el stock
        return prev.map(i => i._id === product._id
          ? { ...i, qty: Math.min(i.stock, i.qty + qty) }
          : i
        );
      }
      return [...prev, {
        _id:      product._id,
        title:    product.title,
        price:    product.price,
        image:    product.images?.[0] || null,
        seller:   product.seller,
        category: product.category,
        stock:    product.stock || 1,
        qty,
      }];
    });
  };

  // Cambia la cantidad de un item (usado en CartPage)
  const updateQty = (productId, qty) => {
    setItems(prev => prev.map(i =>
      i._id === productId
        ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) }
        : i
    ));
  };

  const removeItem = (productId) =>
    setItems(prev => prev.filter(i => i._id !== productId));

  const clearCart = () => setItems([]);

  const isInCart = (productId) => items.some(i => i._id === productId);

  // Total calculado correctamente con qty
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Total de unidades para el badge del header
  const totalUnits = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, updateQty, removeItem, clearCart, isInCart, total, totalUnits,
    }}>
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
