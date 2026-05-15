import React, { useEffect } from 'react';

// Visor de imagen fullscreen — se cierra con Escape o clic fuera
const ImageViewer = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold hover:bg-white/20 transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        ×
      </button>
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full max-h-full object-contain rounded-xl"
        style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageViewer;
