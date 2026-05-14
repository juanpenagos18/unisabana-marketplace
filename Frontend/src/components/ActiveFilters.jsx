import React from 'react';

// T33 — Muestra etiquetas de filtros activos y permite removerlos
const ActiveFilters = ({ filters, onRemove, total }) => {
  const tags = [];
  if (filters.search)    tags.push({ key: 'search',    label: `"${filters.search}"` });
  if (filters.category)  tags.push({ key: 'category',  label: filters.category });
  if (filters.condition) tags.push({ key: 'condition', label: filters.condition });
  if (filters.minPrice)  tags.push({ key: 'minPrice',  label: `Desde $${Number(filters.minPrice).toLocaleString('es-CO')}` });
  if (filters.maxPrice)  tags.push({ key: 'maxPrice',  label: `Hasta $${Number(filters.maxPrice).toLocaleString('es-CO')}` });

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-gray-400">{total} resultado{total !== 1 ? 's' : ''}:</span>
      {tags.map(tag => (
        <span key={tag.key}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          {tag.label}
          <button onClick={() => onRemove(tag.key)}
            className="ml-1 hover:text-yellow-300 transition-colors font-bold leading-none">
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;
