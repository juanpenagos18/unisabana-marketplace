import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

// T35 — Vista de Carrito y Totalizador
// T37 — Simulación de flujo de pago
const CartPage = () => {
  const { user, logout } = useAuth();
  const { items, removeItem, clearCart, total } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId]   = useState(null);
  const [error, setError]       = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // T36 — Confirmar orden y generar en backend
  const handleConfirm = async () => {
    setError('');
    if (items.length === 0) return;
    try {
      setLoading(true);
      const res = await API.post('/orders', {
        cartItems:  items.map(i => ({ productId: i._id })),
        totalPrice: total,
      });
      setOrderId(res.data.order._id);
      clearCart();
      setConfirmed(true); // T37 — Mostrar pantalla de confirmación
    } catch (err) {
      setError(err.response?.data?.message || 'Error al confirmar la orden.');
    } finally {
      setLoading(false);
    }
  };

  // T37 — Pantalla de confirmación de pago
  if (confirmed) {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <div className="max-w-md mx-auto py-16 flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            🎉
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)',
            fontFamily: 'Playfair Display, serif' }}>
            ¡Orden confirmada!
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu orden fue generada exitosamente. Los vendedores han sido notificados y se contactarán contigo pronto.
          </p>
          {orderId && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg">
              ID: {orderId}
            </p>
          )}
          <div className="flex gap-3 w-full mt-2">
            <button onClick={() => navigate('/orders')} className="btn-secondary flex-1">
              Ver mis órdenes
            </button>
            <button onClick={() => navigate('/home')} className="btn-primary flex-1">
              Seguir comprando
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto py-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)',
          fontFamily: 'Playfair Display, serif' }}>
          Mi carrito
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <span className="text-6xl">🛒</span>
            <p className="text-gray-500">Tu carrito está vacío.</p>
            <button onClick={() => navigate('/home')} className="btn-primary">
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Lista de items */}
            <div className="flex flex-col gap-3">
              {items.map(item => (
                <div key={item._id} className="card flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                    <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-primary)' }}>
                      ${item.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item._id)}
                    className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                    title="Eliminar del carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* T35 — Totalizador */}
            <div className="card mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Productos ({items.length})</span>
                <span className="text-sm">${total.toLocaleString('es-CO')}</span>
              </div>
              <div className="border-t pt-3 mt-2 flex justify-between items-center"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            {error && <p className="text-red-600 text-xs text-center">{error}</p>}

            {/* T35 — Botón de confirmación con borde negro */}
            <button onClick={handleConfirm} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base transition-colors"
              style={{ backgroundColor: 'white', border: '2px solid black', color: 'black' }}
              onMouseEnter={e => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
              onMouseLeave={e => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }}>
              {loading ? 'Procesando...' : 'Confirmar compra'}
            </button>

            <button onClick={() => navigate('/home')} className="btn-secondary w-full">
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
