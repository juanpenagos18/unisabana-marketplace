import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// T29 — Barra de búsqueda en el header azul
const Header = ({ user, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inHome   = location.pathname === '/home';
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      if (inHome) {
        onSearch?.(query.trim());
      } else {
        navigate(`/home?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Logo */}
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            <span className="text-white font-bold text-sm font-serif">S</span>
          </div>
          <span className="text-white font-bold text-sm hidden sm:block tracking-tight">
            UniSabana Market
          </span>
        </button>

        {/* T29 — Barra de búsqueda en el header */}
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Buscar productos..."
            className="w-full rounded-xl px-4 py-2 text-sm outline-none pr-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">⌕</span>
        </div>

        {/* Navegación */}
        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/my-products')}
              className="text-white/80 hover:text-white text-xs hidden sm:block transition-colors">
              Mis productos
            </button>
            <button onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-primary text-xs flex-shrink-0">
            Ingresar
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
