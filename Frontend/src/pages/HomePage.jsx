import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import ActiveFilters from '../components/ActiveFilters';
import API from '../hooks/useApi';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filtros unificados (T28/T30/T32)
  const [filters, setFilters] = useState({
    search:    searchParams.get('search') || '',
    category:  '',
    condition: '',
    minPrice:  '',
    maxPrice:  '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [pagination, setPagination]   = useState({});

  const fetchProducts = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 12 });
      if (currentFilters.search)    params.append('search',    currentFilters.search);
      if (currentFilters.category)  params.append('category',  currentFilters.category);
      if (currentFilters.condition) params.append('condition', currentFilters.condition);
      if (currentFilters.minPrice)  params.append('minPrice',  currentFilters.minPrice);
      if (currentFilters.maxPrice)  params.append('maxPrice',  currentFilters.maxPrice);

      const res = await API.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters, page);
  }, [filters, page]);

  // T29 — Recibe búsqueda desde el Header
  const handleSearchFromHeader = (term) => {
    setFilters(f => ({ ...f, search: term }));
    setPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(f => ({ ...f, ...newFilters }));
    setPage(1);
  };

  // T33 — Remover filtro individual
  const handleRemoveFilter = (key) => {
    setFilters(f => ({ ...f, [key]: '' }));
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.condition, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout} onSearch={handleSearchFromHeader}>
      <div className="flex flex-col gap-4">

        {/* Barra secundaria: filtros y publicar */}
        <div className="flex gap-2 items-center">
          {/* T31 — Botón abrir panel de filtros */}
          <button onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 btn-secondary text-sm relative">
            <span>⚙ Filtros</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold
                text-white flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1" />

          <button onClick={() => navigate('/products/new')} className="btn-primary text-sm">
            + Publicar
          </button>
        </div>

        {/* T33 — Etiquetas de filtros activos */}
        <ActiveFilters
          filters={filters}
          total={pagination.total || 0}
          onRemove={handleRemoveFilter}
        />

        {/* T31 — Panel de filtros */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            onClose={() => setShowFilters(false)}
          />
        )}

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
            <span className="text-6xl">🔍</span>
            <p className="text-gray-500">
              {filters.search || activeFilterCount > 0
                ? 'No se encontraron productos con esos filtros.'
                : 'No hay productos disponibles.'}
            </p>
            {(filters.search || activeFilterCount > 0) ? (
              <button onClick={() => setFilters({ search: '', category: '', condition: '', minPrice: '', maxPrice: '' })}
                className="btn-secondary">
                Limpiar filtros
              </button>
            ) : (
              <button onClick={() => navigate('/products/new')} className="btn-primary">
                Sé el primero en publicar
              </button>
            )}
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
