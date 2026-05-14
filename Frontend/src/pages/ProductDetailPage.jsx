import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addItem, isInCart } = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch { setError('Producto no encontrado.'); }
      finally  { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isOwner = user && product && (user.id === product.seller?._id || user.id === product.seller?._id?.toString());
  const inCart  = product ? isInCart(product._id) : false;

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // T43 — Abrir chat con el vendedor desde el detalle del producto
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

  const imgs = product.images?.length ? product.images : [];

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
                <button onClick={() => setImgIndex(i => (i - 1 + imgs.length) % imgs.length)}
                  className="absolute left-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">‹</button>
                <button onClick={() => setImgIndex(i => (i + 1) % imgs.length)}
                  className="absolute right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">›</button>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {imgs.map((src, i) => (
                <img key={i} src={src} alt="" onClick={() => setImgIndex(i)}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer flex-shrink-0
                    ${i === imgIndex ? 'opacity-100 ring-2 ring-blue-700' : 'opacity-60'}`} />
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
              ${product.condition === 'Nuevo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {product.condition}
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
            ${product.price.toLocaleString('es-CO')}
          </p>
          <p className="text-sm text-gray-500">{product.category}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {product.description}
          </p>
        </div>

        {/* Vendedor */}
        {product.seller && (
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              {product.seller.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{product.seller.name}</p>
              <p className="text-xs text-gray-400">{product.seller.career || 'Estudiante'}</p>
            </div>
            <div className="flex text-yellow-400 text-sm">
              {'★'.repeat(Math.round(product.seller.reputation || 0))}
              {'☆'.repeat(5 - Math.round(product.seller.reputation || 0))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {!isOwner && (
            <div className="flex gap-3">
              <button onClick={inCart ? () => navigate('/cart') : handleAddToCart}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                style={{ backgroundColor: inCart || added ? '#10B981' : 'white',
                  border: '2px solid black',
                  color: inCart || added ? 'white' : 'black' }}>
                {inCart ? '✓ Ver carrito' : added ? '✓ Agregado' : '🛒 Agregar al carrito'}
              </button>
              {/* T43 — Botón que abre el chat con el vendedor */}
              <button onClick={handleContact}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-colors text-white"
                style={{ backgroundColor: 'var(--color-primary)', border: '2px solid black' }}>
                💬 Chatear
              </button>
            </div>
          )}
          {isOwner && (
            <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-primary w-full">
              Editar producto
            </button>
          )}
          <button onClick={() => navigate('/home')} className="btn-secondary w-full">← Volver</button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
