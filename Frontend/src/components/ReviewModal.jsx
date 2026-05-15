import React, { useState, useRef } from 'react';
import StarPicker from './StarPicker';
import API from '../hooks/useApi';

const ReviewModal = ({ order, onClose, onSuccess }) => {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  const sellerId  = order?.items?.[0]?.seller?._id || order?.items?.[0]?.seller;
  const productId = order?.items?.[0]?.product;

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'unisabana');
    const cloud = import.meta.env.VITE_CLOUDINARY_NAME || 'demo';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: 'POST', body: data,
    });
    return (await res.json()).secure_url;
  };

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - photos.length);
    if (!files.length) return;
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setPhotos(prev => [...prev, ...urls]);
    } catch { setError('Error subiendo fotos.'); }
    finally { setUploading(false); }
  };

  const removePhoto = (i) => {
    setPhotos(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setError('');
    if (rating === 0) { setError('Selecciona una calificación.'); return; }
    if (!productId)   { setError('No se encontró el producto de esta orden.'); return; }
    try {
      setLoading(true);
      await API.post('/reviews', {
        orderId: order._id, sellerId, productId, rating, comment, photos,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la reseña.');
    } finally { setLoading(false); }
  };

  const labels = { 1:'Muy malo', 2:'Malo', 3:'Regular', 4:'Bueno', 5:'Excelente' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>

        <div className="text-center">
          <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary)',
            fontFamily: 'Playfair Display, serif' }}>
            Calificar producto
          </h3>
          {order?.items?.[0]?.title && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              📦 {order.items[0].title}
            </p>
          )}
        </div>

        {/* Estrellas */}
        <div className="flex flex-col items-center gap-2">
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              {labels[rating]}
            </p>
          )}
        </div>

        {/* Comentario */}
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia con el producto (opcional)..."
          rows={3} className="input-base resize-none text-sm" />

        {/* Fotos del producto */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Fotos del producto recibido (opcional, máx. 3)
          </p>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border"
                style={{ borderColor: 'var(--color-border)' }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  ×
                </button>
                {uploading && i >= photos.length && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
            {previews.length < 3 && (
              <button onClick={() => fileRef.current.click()}
                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-xs gap-0.5"
                style={{ border: '2px dashed var(--color-border)',
                  color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-alt)' }}>
                <span className="text-xl">📷</span>
                <span>Foto</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple
              onChange={handlePhotos} className="hidden" />
          </div>
        </div>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading || uploading}>
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="btn-primary flex-1" disabled={loading || uploading || rating === 0}>
            {loading ? 'Enviando...' : 'Enviar reseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
