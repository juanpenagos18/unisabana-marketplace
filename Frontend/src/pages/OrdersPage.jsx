import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const STATUS_CONFIG = {
  'Pendiente':  { color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  'Confirmada': { color: '#3B82F6', bg: '#DBEAFE', icon: '✅' },
  'Entregada':  { color: '#10B981', bg: '#D1FAE5', icon: '📦' },
  'Cancelada':  { color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pendiente'];
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.icon} {status}
    </span>
  );
};

// T39 — Vista de Historial y Seguimiento de Estados
const OrdersPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('purchases'); // 'purchases' | 'sales'
  const [sales, setSales]     = useState([]);

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [buyRes, sellRes] = await Promise.all([
          API.get('/orders/my'),
          API.get('/orders/sales'),
        ]);
        setOrders(buyRes.data.orders);
        setSales(sellRes.data.orders);
      } catch { setOrders([]); setSales([]); }
      finally { setLoading(false); }
    };
    loadAll();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      setSales(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const displayList = tab === 'purchases' ? orders : sales;

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-2xl mx-auto py-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)',
          fontFamily: 'Playfair Display, serif' }}>
          Mis órdenes
        </h2>

        {/* Tabs compras / ventas */}
        <div className="flex rounded-xl overflow-hidden mb-5"
          style={{ border: '1px solid var(--color-border)' }}>
          {[
            { key: 'purchases', label: `🛒 Mis compras (${orders.length})` },
            { key: 'sales',     label: `🏪 Mis ventas (${sales.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors
                ${tab === t.key ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              style={tab === t.key ? { backgroundColor: 'var(--color-primary)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-6xl">{tab === 'purchases' ? '🛒' : '🏪'}</span>
            <p className="text-gray-500">
              {tab === 'purchases' ? 'Aún no has realizado compras.' : 'Aún no tienes ventas.'}
            </p>
            <button onClick={() => navigate('/home')} className="btn-primary">
              {tab === 'purchases' ? 'Explorar productos' : 'Publicar producto'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayList.map(order => (
              <div key={order._id} className="card flex flex-col gap-3">
                {/* Header de la orden */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                    {tab === 'sales' && order.buyer && (
                      <p className="text-xs text-gray-500 mt-1">
                        Comprador: <span className="font-medium">{order.buyer.name}</span>
                      </p>
                    )}
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                        {item.image
                          ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          : <span className="text-lg">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {tab === 'purchases' && item.seller
                            ? `Vendedor: ${item.seller.name}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
                        ${item.price.toLocaleString('es-CO')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-sm font-semibold">Total</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    ${order.totalPrice.toLocaleString('es-CO')}
                  </span>
                </div>

                {/* T39 — Actualizar estado (solo vendedor) */}
                {tab === 'sales' && order.status !== 'Entregada' && order.status !== 'Cancelada' && (
                  <div className="flex gap-2 pt-1">
                    <p className="text-xs text-gray-400 self-center mr-1">Cambiar a:</p>
                    {['Confirmada', 'Entregada', 'Cancelada']
                      .filter(s => s !== order.status)
                      .map(s => (
                        <button key={s} onClick={() => updateStatus(order._id, s)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors
                            ${s === 'Cancelada'
                              ? 'border-red-300 text-red-500 hover:bg-red-50'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                          {STATUS_CONFIG[s].icon} {s}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
