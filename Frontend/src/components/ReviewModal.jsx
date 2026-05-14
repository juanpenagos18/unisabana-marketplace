import React, { useState } from 'react';
import StarPicker from './StarPicker';
import API from '../hooks/useApi';

// T46 — Formulario de calificación UI
const ReviewModal = ({ order, onClose, onSuccess }) => {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Obtener el ID del vendedor (primer vendedor de la orden)
  const sellerId = order?.items?.[0]?.seller?._id || order?.items?.[0]?.seller;

  const handleSubmit = async () => {
    setError('');
    if (rating === 0) { setError('Selecciona una calificación.'); return; }
    try {
      setLoading(true);
      await API.post('/reviews', {
        orderId:  order._id,
        sellerId,
        rating,
        comment,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la reseña.');
    } finally { setLoading(false); }
  };

  const labels = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
          style={{ backgroundColor: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          onClick={e => e.stopPropagation()}>

          <div className="text-center">
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary)',
              fontFamily: 'Playfair Display, serif' }}>
              Calificar vendedor
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Orden #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* T46 — Selector de estrellas */}
          <div className="flex flex-col items-center gap-2">
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                {labels[rating]}
              </p>
            )}
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)..."
            rows={3}
            className="input-base resize-none text-sm"
          />

          {error && <p className="text-red-600 text-xs text-center">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancelar
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading || rating === 0}>
              {loading ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;
