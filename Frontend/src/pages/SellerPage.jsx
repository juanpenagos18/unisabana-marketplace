import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ProductCard';
import ReportModal from '../components/ReportModal';
import API from '../hooks/useApi';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5 items-center">
    {[1,2,3,4,5].map(s => (
      <svg key={s} xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
    <span className="text-sm text-gray-500 ml-1">({rating?.toFixed(1) || '0.0'})</span>
  </div>
);

const SellerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [seller, setSeller]         = useState(null);
  const [products, setProducts]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, prodsRes, reviewsRes] = await Promise.all([
          API.get(`/users/${id}/public`),
          API.get(`/products?sellerId=${id}`),
          API.get(`/reviews/seller/${id}`),
        ]);
        const s = userRes.data.user;
        if (s.role !== 'seller' && s.role !== 'admin') {
          setError('Este usuario no tiene página de vendedor.');
          setLoading(false);
          return;
        }
        setSeller(s);
        setProducts(prodsRes.data.products);
        setReviews(reviewsRes.data.reviews);
      } catch { setError('Vendedor no encontrado.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isOwnProfile = user?.id === id;

  if (loading) return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  );

  if (error || !seller) return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <span className="text-6xl">🏪</span>
        <p className="text-gray-500">{error || 'Vendedor no encontrado.'}</p>
        <button onClick={() => navigate('/home')} className="btn-secondary">Volver</button>
      </div>
    </Layout>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">

        {/* Perfil */}
        <div className="card flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {seller.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)',
                  fontFamily: 'Playfair Display, serif' }}>{seller.name}</h1>
                {seller.career && <p className="text-sm text-gray-400 mt-0.5">{seller.career}</p>}
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  🏪 Vendedor verificado
                </span>
              </div>
              {user && !isOwnProfile && (
                <button onClick={() => setShowReport(true)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400
                    hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                  🚩 Reportar
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={seller.reputation || 0} />
              <span className="text-xs text-gray-400">{reviews.length} reseña{reviews.length!==1?'s':''}</span>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{products.length}</p>
                <p className="text-xs text-gray-400">Productos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
                  {seller.reputation?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-400">Calificación</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Productos ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="text-4xl block mb-2">📭</span>
              <p>No tiene productos activos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>

        {/* Reseñas — ahora muestran a qué producto pertenecen */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
              Reseñas recibidas ({reviews.length})
            </h2>
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r._id} className="card flex flex-col gap-2">
                  {/* Producto al que pertenece la reseña */}
                  {r.product && (
                    <button onClick={() => navigate(`/products/${r.product._id}`)}
                      className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity">
                      {r.product.images?.[0] && (
                        <img src={r.product.images[0]} alt=""
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                        📦 {r.product.title} →
                      </p>
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)' }}>
                      {r.reviewer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{r.reviewer?.name}</p>
                      <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('es-CO', { day:'2-digit', month:'short' })}
                    </p>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 pl-11">{r.comment}</p>}
                  {r.photos?.length > 0 && (
                    <div className="flex gap-2 pl-11 flex-wrap">
                      {r.photos.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded-xl" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal targetId={id} targetType="user" onClose={() => setShowReport(false)} />
      )}
    </Layout>
  );
};

export default SellerPage;
