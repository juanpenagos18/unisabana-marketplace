import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/layout/Layout';
import ReportModal from '../components/ReportModal';
import API from '../hooks/useApi';

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
    <span className="text-sm text-gray-500">{rating.toFixed(1)} ({count} reseña{count!==1?'s':''})</span>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addItem, isInCart } = useCart();

  const [product, setProduct]     = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [imgIndex, setImgIndex]   = useState(0);
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);
  const [error, setError]         = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [prodRes, reviewRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/product/${id}`),
        ]);
        setProduct(prodRes.data.product);
        setReviews(reviewRes.data.reviews);
        setReviewAvg(reviewRes.data.average);
      } catch { setError('Producto no encontrado.'); }
      finally  { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isOwner = user && product && (user.id === product.seller?._id?.toString());
  const inCart  = product ? isInCart(product._id) : false;

  const handleAddToCart = () => {
    addItem({ ...product, selectedQty: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleContact = () => {
    if (!user) { navigate('/login'); return; }
    const params = new URLSearchParams({
      contactId:    product.seller._id,
      contactName:  product.seller.name,
      productId:    product._id,
      productTitle: product.title,
    });
    navigate(`/chats/conversation?${params}`);
  };

  const handleReportReview = (reviewId) => {
    setReportTarget({ id: reviewId, type: 'review' });
    setShowReport(true);
  };

  if (loading) return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  );

  if (error || !product) return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => navigate('/home')} className="btn-secondary">Volver</button>
      </div>
    </Layout>
  );

  const imgs  = product.images?.length ? product.images : [];
  const stock = product.stock || 0;

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">

        {/* Carrusel */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="w-full h-72 flex items-center justify-center relative"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            {imgs.length > 0
              ? <img src={imgs[imgIndex]} alt={product.title} className="w-full h-full object-contain" />
              : <span className="text-8xl">📦</span>}
            {imgs.length > 1 && (
              <>
                <button onClick={() => setImgIndex(i => (i-1+imgs.length)%imgs.length)}
                  className="absolute left-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">‹</button>
                <button onClick={() => setImgIndex(i => (i+1)%imgs.length)}
                  className="absolute right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">›</button>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {imgs.map((src,i) => (
                <img key={i} src={src} alt="" onClick={() => setImgIndex(i)}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer flex-shrink-0
                    ${i===imgIndex ? 'opacity-100 ring-2 ring-blue-700' : 'opacity-60'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)',
              fontFamily: 'Playfair Display, serif' }}>{product.title}</h1>
            <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full
              ${product.condition==='Nuevo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {product.condition}
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
            ${product.price.toLocaleString('es-CO')}
          </p>
          <p className="text-sm text-gray-500">{product.category}</p>
          {/* Rating del producto */}
          {reviews.length > 0 && <StarRating rating={reviewAvg} count={reviews.length} />}
          <p className="text-sm font-medium">
            <span className={stock > 0 ? 'text-green-600' : 'text-red-500'}>
              {stock > 0 ? `✓ ${stock} disponible${stock!==1?'s':''}` : '✗ Sin stock'}
            </span>
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {product.description}
          </p>
        </div>

        {/* Vendedor */}
        {product.seller && (
          <button onClick={() => navigate(`/seller/${product.seller._id}`)}
            className="card flex items-center gap-3 text-left hover:shadow-md transition-shadow w-full">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              {product.seller.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{product.seller.name}</p>
              <p className="text-xs text-gray-400">{product.seller.career || 'Estudiante'} · Ver perfil →</p>
            </div>
            <div className="flex text-yellow-400 text-sm">
              {'★'.repeat(Math.round(product.seller.reputation||0))}
              {'☆'.repeat(5-Math.round(product.seller.reputation||0))}
            </div>
          </button>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {!isOwner && stock > 0 && (
            <>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-600">Cantidad:</p>
                <div className="flex items-center gap-2 rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--color-border)' }}>
                  <button onClick={() => setQty(q => Math.max(1, q-1))}
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-gray-100">−</button>
                  <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stock, q+1))}
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-gray-100">+</button>
                </div>
                <p className="text-xs text-gray-400">de {stock}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={inCart ? () => navigate('/cart') : handleAddToCart}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                  style={{ backgroundColor: inCart||added ? '#10B981' : 'white',
                    border: '2px solid black', color: inCart||added ? 'white' : 'black' }}>
                  {inCart ? '✓ Ver carrito' : added ? '✓ Agregado' : `🛒 Agregar (${qty})`}
                </button>
                <button onClick={handleContact}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ backgroundColor: 'var(--color-primary)', border: '2px solid black' }}>
                  💬 Chatear
                </button>
              </div>
            </>
          )}
          {isOwner && (
            <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-primary w-full">
              Editar producto
            </button>
          )}
          <div className="flex gap-3">
            <button onClick={() => navigate('/home')} className="btn-secondary flex-1">← Volver</button>
            {user && !isOwner && (
              <button onClick={() => { setReportTarget({ id: product._id, type: 'product' }); setShowReport(true); }}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-gray-400 border border-gray-200
                  hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                🚩 Reportar
              </button>
            )}
          </div>
        </div>

        {/* Reseñas del producto */}
        {reviews.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
              Reseñas ({reviews.length})
            </h2>
            {reviews.map(r => (
              <div key={r._id} className="card flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)' }}>
                      {r.reviewer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.reviewer?.name}</p>
                      <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('es-CO', { day:'2-digit', month:'short' })}
                    </p>
                    {/* Reportar reseña */}
                    {user && (
                      <button onClick={() => handleReportReview(r._id)}
                        className="text-[10px] text-gray-300 hover:text-red-400 transition-colors">
                        🚩
                      </button>
                    )}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 pl-11">{r.comment}</p>}
                {/* Fotos de la reseña */}
                {r.photos?.length > 0 && (
                  <div className="flex gap-2 pl-11 flex-wrap">
                    {r.photos.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-xl" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showReport && reportTarget && (
        <ReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => { setShowReport(false); setReportTarget(null); }}
        />
      )}
    </Layout>
  );
};

export default ProductDetailPage;
