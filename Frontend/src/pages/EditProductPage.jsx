import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const CATEGORIES = [
  'Académico','Tecnología','Hogar','Moda','Comida',
  'Transporte','Entretenimiento','Deporte','Cuidado Personal','Servicios','Otros',
];

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: '', stock: '1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const p   = res.data.product;
        if (user?.id !== p.seller?._id?.toString()) {
          navigate('/my-products');
          return;
        }
        setForm({
          title:       p.title,
          description: p.description,
          price:       p.price,
          category:    p.category,
          condition:   p.condition,
          stock:       p.stock ?? 1,
        });
      } catch { navigate('/my-products'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    const { title, description, price, category, condition, stock } = form;
    if (!title || !description || !price || !category || !condition || !stock)
      return setError('Todos los campos son obligatorios.');
    if (isNaN(price) || Number(price) < 0)
      return setError('El precio debe ser un número positivo.');
    if (isNaN(stock) || Number(stock) < 0)
      return setError('El stock no puede ser negativo.');
    try {
      setSaving(true);
      await API.put(`/products/${id}`, {
        title, description,
        price:    Number(price),
        category, condition,
        stock:    Number(stock),
      });
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto py-6">
        <h2 className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-primary)', fontFamily: 'Playfair Display, serif' }}>
          Editar producto
        </h2>

        <div className="card flex flex-col gap-4">
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="Título del producto *" className="input-base" />

          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Descripción *" rows={3} className="input-base resize-none" />

          {/* Precio y stock en la misma fila */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Precio (COP) *</label>
              <input name="price" value={form.price} onChange={handleChange}
                type="number" min="0" placeholder="Ej: 50000" className="input-base w-full" />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">Stock disponible *</label>
              <input name="stock" value={form.stock} onChange={handleChange}
                type="number" min="0" placeholder="Ej: 5" className="input-base w-full" />
            </div>
          </div>

          {/* Indicador visual del stock */}
          {form.stock !== '' && (
            <p className={`text-xs font-medium -mt-2
              ${Number(form.stock) === 0 ? 'text-red-500' :
                Number(form.stock) <= 3  ? 'text-orange-500' : 'text-green-600'}`}>
              {Number(form.stock) === 0
                ? '⚠️ Sin stock — el producto no aparecerá disponible para compra'
                : Number(form.stock) <= 3
                ? `⚡ Stock bajo: ${form.stock} unidad${Number(form.stock) > 1 ? 'es' : ''}`
                : `✓ ${form.stock} unidades disponibles`}
            </p>
          )}

          <select name="category" value={form.category} onChange={handleChange} className="input-base">
            <option value="">Selecciona una categoría *</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-3">
            {['Nuevo', 'Usado'].map(cond => (
              <button key={cond}
                onClick={() => setForm({ ...form, condition: cond })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors
                  ${form.condition === cond ? 'text-white border-transparent' : 'bg-white border-gray-300 text-gray-600'}`}
                style={form.condition === cond ? { backgroundColor: 'var(--color-primary)' } : {}}>
                {cond}
              </button>
            ))}
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate(`/products/${id}`)}
              className="btn-secondary flex-1" disabled={saving}>
              Cancelar
            </button>
            <button onClick={handleSubmit}
              className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProductPage;
