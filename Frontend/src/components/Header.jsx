import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CartButton from './CartButton';

const Header = ({ user, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inHome   = location.pathname === '/home';
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      if (inHome) { onSearch?.(query.trim()); }
      else { navigate(`/home?search=${encodeURIComponent(query.trim())}`); }
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

        {/* Búsqueda */}
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Buscar productos..."
            className="w-full rounded-xl px-4 py-2 text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)' }}
          />
        </div>

        {/* Navegación */}
        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-white/70 text-xs hidden sm:block">
              {user.name?.split(' ')[0]}
            </span>
            <CartButton />
            <button onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
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
