import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const StarRating = ({ rating }) => (
  <div className="flex gap-1 items-center">
    {[1,2,3,4,5].map(star => (
      <svg key={star} xmlns="http://www.w3.org/2000/svg"
        className={`w-6 h-6 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
    <span className="text-sm text-gray-500 ml-1 font-medium">
      {rating > 0 ? rating.toFixed(1) : 'Sin calificaciones aún'}
    </span>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, login } = useAuth();

  // Datos frescos del servidor — reemplaza al user del contexto
  const [profile, setProfile]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: '', career: '' });
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');

  // Carga el perfil fresco desde el servidor cada vez que se monta
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          API.get('/users/profile'),
          // Solo carga reseñas si es vendedor
          authUser?.role === 'seller' || authUser?.role === 'admin'
            ? API.get(`/reviews/seller/${authUser.id}`)
            : Promise.resolve({ data: { reviews: [] } }),
        ]);
        const freshUser = profileRes.data.user;
        setProfile(freshUser);
        setForm({ name: freshUser.name || '', career: freshUser.career || '' });
        setReviews(reviewsRes.data.reviews || []);

        // Actualiza también el localStorage para que el header y otros componentes
        // vean la reputación actualizada
        const token = localStorage.getItem('token');
        login(token, {
          id:         freshUser._id,
          name:       freshUser.name,
          email:      freshUser.email,
          career:     freshUser.career,
          photo:      freshUser.photo,
          role:       freshUser.role,
          reputation: freshUser.reputation,
        });
      } catch {
        setProfile(authUser);
      } finally { setLoadingProfile(false); }
    };
    loadProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError(''); setSuccess('');
    try {
      setSaving(true);
      const res = await API.put('/users/profile', form);
      const updated = res.data.user;
      setProfile(updated);
      const token = localStorage.getItem('token');
      login(token, {
        id:         updated._id,
        name:       updated.name,
        email:      updated.email,
        career:     updated.career,
        photo:      updated.photo,
        role:       updated.role,
        reputation: updated.reputation,
      });
      setSuccess('Perfil actualizado correctamente.');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const quickLinks = [
    { label: '📦 Mis publicaciones', path: '/my-products' },
    { label: '🛒 Mis órdenes',       path: '/orders' },
    { label: '💬 Mis chats',         path: '/chats' },
  ];

  const user = profile || authUser;

  if (loadingProfile) return (
    <Layout user={authUser} onLogout={handleLogout}>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  );

  return (
    <Layout user={authUser} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto py-8 flex flex-col gap-4">

        {/* Cabecera */}
        <div className="card flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {user?.name}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.career && <p className="text-sm text-gray-400 mt-1">{user.career}</p>}
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
              ${user?.role === 'seller' ? 'bg-green-100 text-green-700' :
                user?.role === 'admin'  ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'}`}>
              {user?.role === 'seller' ? '🏪 Vendedor' :
               user?.role === 'admin'  ? '⚙️ Admin' : '🛒 Comprador'}
            </span>
          </div>

          {/* Reputación — siempre visible, datos frescos del servidor */}
          <div className="flex flex-col items-center gap-1 w-full pt-3 border-t"
            style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
              Mi reputación
            </p>
            <StarRating rating={user?.reputation || 0} />
            {reviews.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Basada en {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
              </p>
            )}
            {user?.role === 'seller' && reviews.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Aún no tienes reseñas de compradores
              </p>
            )}
          </div>
        </div>

        {/* Reseñas recibidas — solo para vendedores */}
        {user?.role === 'seller' && reviews.length > 0 && (
          <div className="card flex flex-col gap-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
              Reseñas recibidas ({reviews.length})
            </h3>
            {reviews.slice(0, 3).map(r => (
              <div key={r._id} className="flex gap-3 items-start pb-3 border-b last:border-0 last:pb-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  {r.reviewer?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.reviewer?.name}</p>
                    <div className="flex text-yellow-400 text-xs flex-shrink-0">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-500 mt-0.5">{r.comment}</p>
                  )}
                  <p className="text-[10px] text-gray-300 mt-1">
                    {new Date(r.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {reviews.length > 3 && (
              <button onClick={() => navigate(`/seller/${authUser.id}`)}
                className="text-xs text-center font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}>
                Ver todas las reseñas →
              </button>
            )}
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="card flex flex-col gap-2">
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Accesos rápidos
          </h3>
          {quickLinks.map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ border: '1px solid var(--color-border)' }}>
              {link.label}
              <span className="float-right text-gray-400">›</span>
            </button>
          ))}
        </div>

        {/* Edición de datos */}
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
            Mis datos
          </h3>
          {!editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase">Nombre</p>
                <p className="text-gray-800">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Carrera</p>
                <p className="text-gray-800">{user?.career || '—'}</p>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-2">
                Editar perfil
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Tu nombre" className="input-base" />
              <input name="career" value={form.career} onChange={handleChange}
                placeholder="Tu carrera (opcional)" className="input-base" />
              {error   && <p className="text-red-600 text-xs">{error}</p>}
              {success && <p className="text-green-600 text-xs">{success}</p>}
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1" disabled={saving}>
                  Cancelar
                </button>
                <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleLogout}
          className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-red-600
            border border-red-200 hover:bg-red-50 transition-colors">
          Cerrar sesión
        </button>
      </div>
    </Layout>
  );
};

export default ProfilePage;
