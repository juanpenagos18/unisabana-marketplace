import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const MyProductsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products/seller/my');
      setProducts(res.data.products);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto? No aparecerá en la galería.')) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch { alert('Error al desactivar el producto.'); }
    finally { setDeleting(null); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)',
            fontFamily: 'Playfair Display, serif' }}>
            Mis publicaciones
          </h2>
          <button onClick={() => navigate('/products/new')} className="btn-primary text-sm">
            + Nuevo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-6xl">📭</span>
            <p className="text-gray-500">No tienes productos publicados.</p>
            <button onClick={() => navigate('/products/new')} className="btn-primary">
              Publicar mi primer producto
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map(p => (
              <div key={p._id} className="card flex gap-4 items-center">

                {/* Miniatura — clic va al producto */}
                <button
                  onClick={() => navigate(`/products/${p._id}`)}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--color-surface-alt)' }}
                  title="Ver producto">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    : <span className="text-2xl">📦</span>}
                </button>

                {/* Info — título también lleva al producto */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="font-semibold text-sm truncate text-left w-full hover:underline block"
                    style={{ color: 'var(--color-primary)' }}>
                    {p.title}
                  </button>
                  <p className="text-xs text-gray-400">
                    {p.category} · {p.condition} · Stock: {p.stock ?? 0}
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    ${p.price.toLocaleString('es-CO')}
                  </p>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1
                    ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => navigate(`/products/${p._id}/edit`)}
                    className="btn-secondary text-xs px-3 py-1.5">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    disabled={deleting === p._id || !p.isActive}
                    className="text-xs px-3 py-1.5 rounded-xl border border-red-300 text-red-500
                      hover:bg-red-50 transition-colors disabled:opacity-40">
                    {deleting === p._id ? '...' : 'Desactivar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProductsPage;
