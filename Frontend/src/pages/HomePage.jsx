import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ProductCard';
import API from '../hooks/useApi';

const CATEGORIES = ['Todas', 'Libros', 'Electrónica', 'Ropa', 'Deportes', 'Hogar', 'Otro'];
const CONDITIONS = ['Todas', 'Nuevo', 'Usado'];

// T21 — Vista de Galería Principal
const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('Todas');
  const [condition, setCondition] = useState('Todas');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search)                params.append('search',    search);
      if (category !== 'Todas')  params.append('category',  category);
      if (condition !== 'Todas') params.append('condition', condition);

      const res = await API.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, category, condition]);

  // Buscar al presionar Enter
  const handleSearch = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchProducts(); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="flex flex-col gap-5">

        {/* Barra de búsqueda + botón publicar */}
        <div className="flex gap-2 items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Buscar productos... (Enter)"
            className="input-base flex-1"
          />
          <button onClick={() => navigate('/products/new')} className="btn-primary whitespace-nowrap">
            + Publicar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${category === cat
                  ? 'text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
              style={category === cat ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}>
              {cat}
            </button>
          ))}
          <span className="w-px bg-gray-200 mx-1" />
          {CONDITIONS.map(cond => (
            <button key={cond}
              onClick={() => { setCondition(cond); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                ${condition === cond
                  ? 'text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
              style={condition === cond ? { backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : {}}>
              {cond}
            </button>
          ))}
        </div>

        {/* Galería */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse"
                style={{ backgroundColor: 'var(--color-surface-alt)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-6xl">🛍️</span>
            <p className="text-gray-500">No hay productos disponibles.</p>
            <button onClick={() => navigate('/products/new')} className="btn-primary">
              Sé el primero en publicar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} className="btn-secondary px-4 py-2 text-sm">
              ← Anterior
            </button>
            <span className="flex items-center text-sm text-gray-500">
              {page} / {pagination.pages}
            </span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm">
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
