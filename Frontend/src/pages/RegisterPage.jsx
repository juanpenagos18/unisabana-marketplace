import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../hooks/useApi';

// T8 — Formulario de Registro UI
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', career: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  // Validación de correo institucional (T8)
  const validateEmail = (email) => /^[^\s@]+@unisabana\.edu\.co$/.test(email);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Solo se aceptan correos @unisabana.edu.co');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
      // T7 — Consume POST /api/auth/register
      const res = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        career: form.career || undefined,
      });
      login(res.data.token, res.data.user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse. Intenta de nuevo.');
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
      <div className="flex-1 w-full flex items-start justify-center px-4 py-6"
        style={{ background: 'linear-gradient(180deg,#1B2D6B 0%,#2A3F8F 40%,#4A6FA5 100%)' }}>
        <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 40px rgba(27,45,107,0.25)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              <span className="text-yellow-300 font-bold text-sm font-serif">S</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Universidad de</p>
              <p className="text-base font-bold" style={{ color: 'var(--color-primary)',
                fontFamily: 'Playfair Display, serif' }}>La Sabana</p>
            </div>
          </div>

          {/* Foto de perfil */}
          <div className="flex justify-center">
            <button onClick={() => fileRef.current.click()}
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '2px solid var(--color-border)' }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <span style={{ color: 'var(--color-text-muted)' }}><CameraIcon /></span>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <input name="name" value={form.name} onChange={handleChange}
            placeholder="Ingresa tu nombre" className="input-base" />
          <input name="email" value={form.email} onChange={handleChange}
            placeholder="Ingresa tu correo (@unisabana.edu.co)" type="email" className="input-base" />
          <input name="password" value={form.password} onChange={handleChange}
            placeholder="Ingresa tu contraseña" type="password" className="input-base" />
          <input name="career" value={form.career} onChange={handleChange}
            placeholder="Ingresa tu carrera (Opcional)" className="input-base" />

          {error && <p className="text-red-600 text-xs text-center">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate('/')} className="btn-secondary flex-1" disabled={loading}>
              Atras
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Cargando...' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
