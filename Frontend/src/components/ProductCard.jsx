import React from 'react';
import { useNavigate } from 'react-router-dom';

// T22 — Componente Product Card
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const img = product.images?.[0];

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="cursor-pointer rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg"
      style={{ backgroundColor: 'white', border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(27,45,107,0.08)' }}
    >
      {/* Imagen */}
      <div className="w-full h-44 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        {img
          ? <img src={img} alt={product.title} className="w-full h-full object-cover" />
          : <span className="text-5xl">📦</span>}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Etiqueta Nuevo / Usado */}
        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full
          ${product.condition === 'Nuevo'
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'}`}>
          {product.condition}
        </span>

        <p className="font-semibold text-sm leading-tight line-clamp-2"
          style={{ color: 'var(--color-text)' }}>
          {product.title}
        </p>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {product.category}
        </p>

        <p className="font-bold mt-auto text-base" style={{ color: 'var(--color-primary)' }}>
          ${product.price.toLocaleString('es-CO')}
        </p>

        {product.seller && (
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            por {product.seller.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
