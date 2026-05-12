import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// SVG del escudo/logo simplificado de La Sabana (representación institucional)
const SabanaLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="#C9A84C" stroke="#fff" strokeWidth="1" />
    <text x="16" y="21" textAnchor="middle" fill="#1B2D6B" fontSize="13" fontWeight="bold" fontFamily="serif">S</text>
  </svg>
);

const Header = ({ user = null, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="app-header sticky top-0 z-50 shadow-md">
      {/* Logo + Nombre */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <SabanaLogo />
        <div className="flex flex-col leading-none">
          <span className="text-xs font-light text-blue-200 tracking-widest uppercase">
            Universidad de La Sabana
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            MarketPlace
          </span>
        </div>
      </Link>

      {/* Acciones del Header */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Avatar del usuario */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline">{user.name}</span>
            </button>

            <button
              onClick={onLogout}
              className="text-white/70 hover:text-white text-xs transition-colors"
            >
              Salir
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Ingresar
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#1B2D6B',
              }}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;