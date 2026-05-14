import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CartButton from './CartButton';
import NotificationBell from './NotificationBell';

const Header = ({ user, onLogout, onSearch }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const inHome    = location.pathname === '/home';
  const [query, setQuery]       = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = e => {
    if (e.key === 'Enter' && query.trim()) {
      if (inHome) { onSearch?.(query.trim()); }
      else { navigate(`/home?search=${encodeURIComponent(query.trim())}`); }
    }
  };

  const navLinks = [
    { label: '🏠 Inicio',            path: '/home' },
    { label: '📦 Mis publicaciones', path: '/my-products' },
    { label: '🛒 Mis órdenes',       path: '/orders' },
    { label: '💬 Mis chats',         path: '/chats' },
    { label: '👤 Mi perfil',         path: '/profile' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">

        <button onClick={() => navigate('/home')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            <span className="text-white font-bold text-sm font-serif">S</span>
          </div>
          <span className="text-white font-bold text-sm hidden sm:block tracking-tight">
            UniSabana Market
          </span>
        </button>

        <div className="flex-1 relative">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleSearch}
            placeholder="Buscar productos..."
            className="w-full rounded-xl px-4 py-2 text-sm outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)' }} />
        </div>

        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* T47 — Campanita de notificaciones con sonido */}
            <NotificationBell />
            <CartButton />

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(o => !o)}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-52 rounded-2xl shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {navLinks.map(link => (
                    <button key={link.path}
                      onClick={() => { navigate(link.path); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--color-text)' }}>
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button onClick={() => { onLogout?.(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      🚪 Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
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
