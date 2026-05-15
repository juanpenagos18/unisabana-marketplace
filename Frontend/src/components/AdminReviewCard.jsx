import React, { useState } from 'react';
import ImageViewer from './ImageViewer';

// Tarjeta de reseña para el panel admin — con fotos clickeables
const AdminReviewCard = ({ review, onDelete, actionLoading }) => {
  const [viewerSrc, setViewerSrc] = useState(null);
  const r = review;

  return (
    <>
      <div className="card flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            <span className="font-semibold">{r.reviewer?.name}</span>
            <span className="text-gray-400"> → </span>
            <span className="font-semibold">{r.seller?.name}</span>
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">📦 {r.product?.title}</p>
          <div className="flex text-yellow-400 text-xs my-1">
            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
            <span className="text-gray-400 ml-1 not-italic">({r.rating}/5)</span>
          </div>
          {r.comment && (
            <p className="text-xs text-gray-600 mb-2">{r.comment}</p>
          )}
          {/* Fotos de la reseña — clickeables para ver en grande */}
          {r.photos?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-1">
              {r.photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg cursor-zoom-in hover:opacity-80 transition-opacity"
                  onClick={() => setViewerSrc(src)}
                  title="Ver en grande"
                />
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-300 mt-1">
            {new Date(r.createdAt).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={() => onDelete(r._id)}
          disabled={actionLoading}
          className="text-xs px-3 py-1.5 rounded-xl border border-red-300 text-red-500
            hover:bg-red-50 flex-shrink-0 transition-colors disabled:opacity-40">
          Eliminar
        </button>
      </div>

      {viewerSrc && (
        <ImageViewer src={viewerSrc} alt="Foto de reseña" onClose={() => setViewerSrc(null)} />
      )}
    </>
  );
};

export default AdminReviewCard;
