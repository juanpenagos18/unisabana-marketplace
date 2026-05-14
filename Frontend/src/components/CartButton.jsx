import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Botón flotante del carrito que se muestra en el Header
const CartButton = () => {
  const { items } = useCart();
  const navigate  = useNavigate();

  return (
    <button onClick={() => navigate('/cart')}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors"
      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      title="Mi carrito">
      <span className="text-white text-lg">🛒</span>
      {items.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold
          text-white flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent)' }}>
          {items.length > 9 ? '9+' : items.length}
        </span>
      )}
    </button>
  );
};

export default CartButton;
