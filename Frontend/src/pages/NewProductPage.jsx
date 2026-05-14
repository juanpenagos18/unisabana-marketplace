import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const CATEGORIES = [
  'Académico', 'Tecnología', 'Hogar', 'Moda', 'Comida',
  'Transporte', 'Entretenimiento', 'Deporte', 'Cuidado Personal', 'Servicios', 'Otros'
];

const NewProductPage = () => {
  const { user, logout, upgradeToSeller } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: '' });
  const [images, setImages]       = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'unisabana');
    const cloud = import.meta.env.VITE_CLOUDINARY_NAME || 'demo';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: data });
    const json = await res.json();
    return json.secure_url;
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    if (!files.length) return;
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setImages(prev => [...prev, ...urls]);
    } catch { setError('Error subiendo imágenes.'); }
    finally { setUploading(false); }
  };

  const removeImage = i => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setError('');
    const { title, description, price, category, condition } = form;
    if (!title || !description || !price || !category || !condition)
      return setError('Todos los campos son obligatorios.');
    if (isNaN(price) || Number(price) < 0)
      return setError('El precio debe ser un número positivo.');
    try {
      setLoading(true);
      await API.post('/products', { title, description, price: Number(price), category, condition, images });
      if (user?.role === 'buyer') upgradeToSeller();
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar.');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto py-6">
        <h2 className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-primary)', fontFamily: 'Playfair Display, serif' }}>
          Publicar producto
        </h2>
        <div className="card flex flex-col gap-4">
          {/* Imágenes */}
          <div>
            <p className="text-sm font-medium mb-2">Fotos del producto (máx. 4)</p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                  {uploading && i >= images.length && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}
              {previews.length < 4 && (
                <button onClick={() => fileRef.current.click()}
                  className="w-20 h-20 rounded-xl flex flex-col items-center justify-center text-xs gap-1"
                  style={{ border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface-alt)' }}>
                  <span className="text-2xl">📷</span>Agregar
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </div>
          </div>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Título *" className="input-base" />
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Descripción *" rows={3} className="input-base resize-none" />
          <input name="price" value={form.price} onChange={handleChange}
            placeholder="Precio en COP *" type="number" min="0" className="input-base" />
          <select name="category" value={form.category} onChange={handleChange} className="input-base">
            <option value="">Selecciona una categoría *</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-3">
            {['Nuevo', 'Usado'].map(cond => (
              <button key={cond} onClick={() => setForm({ ...form, condition: cond })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors
                  ${form.condition === cond ? 'text-white border-transparent' : 'bg-white border-gray-300 text-gray-600'}`}
                style={form.condition === cond ? { backgroundColor: 'var(--color-primary)' } : {}}>
                {cond}
              </button>
            ))}
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate('/home')} className="btn-secondary flex-1" disabled={loading}>Cancelar</button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading || uploading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewProductPage;
