import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../hooks/useApi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('Correo y contraseña son obligatorios.');
      return;
    }
    try {
      setLoading(true);
      const res = await API.post('/auth/login', form);
      login(res.data.token, res.data.user);

      // Si venía de /admin u otra ruta protegida, redirige allá
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="w-full py-4 px-6 text-center">
        <h1 className="text-white text-xl font-bold tracking-tight">UniSabana MarketPlace</h1>
      </div>
      <div className="flex-1 w-full flex items-center justify-center px-4 py-8"
        style={{ background: 'linear-gradient(180deg,#1B2D6B 0%,#2A3F8F 40%,#4A6FA5 100%)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 40px rgba(27,45,107,0.25)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              <span className="text-yellow-300 font-bold font-serif">S</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Universidad de</p>
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)',
                fontFamily: 'Playfair Display, serif' }}>La Sabana</p>
            </div>
          </div>

          {/* Aviso si viene de /admin */}
          {searchParams.get('redirect') === '/admin' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-blue-600 font-medium">
                🔐 Inicia sesión con tu cuenta de administrador para acceder al panel
              </p>
            </div>
          )}

          <input name="email" value={form.email} onChange={handleChange}
            placeholder="Ingresa tu correo (@unisabana.edu.co)" type="email"
            className="input-base" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <input name="password" value={form.password} onChange={handleChange}
            placeholder="Ingresa tu contraseña" type="password"
            className="input-base" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          {error && <p className="text-red-600 text-xs text-center">{error}</p>}

          <div className="flex flex-col gap-3 mt-1">
            <button onClick={handleSubmit}
              className="btn-primary w-full text-base py-3 font-bold" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button onClick={() => navigate('/')}
              className="btn-secondary w-full text-base py-3 font-bold" disabled={loading}>
              Atrás
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
