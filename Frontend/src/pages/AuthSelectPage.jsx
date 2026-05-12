import React from 'react';
import { useNavigate } from 'react-router-dom';

// Escudo institucional SVG inline
const Escudo = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" rx="28" fill="#1B2D6B" />
    <text x="28" y="37" textAnchor="middle" fill="#C9A84C" fontSize="24" fontWeight="bold" fontFamily="serif">S</text>
  </svg>
);

const AuthSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header azul */}
      <div className="w-full py-4 px-6 text-center">
        <h1 className="text-white text-xl font-bold tracking-tight">
          UniSabana MarketPlace
        </h1>
      </div>

      {/* Fondo con degradado simulando la foto del campus */}
      <div
        className="flex-1 w-full flex items-center justify-center px-4 py-8"
        style={{
          background: 'linear-gradient(180deg, #1B2D6B 0%, #2A3F8F 40%, #4A6FA5 100%)',
        }}
      >
        {/* Card central */}
        <div
          className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 40px rgba(27,45,107,0.25)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <Escudo />
            <div className="text-center">
              <p className="text-xs text-gray-500 tracking-widest uppercase font-medium">
                Universidad de
              </p>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-primary)', fontFamily: 'Playfair Display, serif' }}
              >
                La Sabana
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="w-full flex flex-col gap-3 mt-2">
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary w-full text-lg py-4 font-bold"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary w-full text-lg py-4 font-bold"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectPage;