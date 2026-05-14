import React, { useState } from 'react';

const CATEGORIES = [
  'Académico', 'Tecnología', 'Hogar', 'Moda', 'Comida',
  'Transporte', 'Entretenimiento', 'Deporte', 'Cuidado Personal', 'Servicios', 'Otros'
];

// T31 — Modal/Sidebar de Filtros
// T33 — Etiquetas de filtros activos con opción de remover
const FilterSidebar = ({ filters, onChange, onClose }) => {
  const [local, setLocal] = useState({ ...filters });

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { const empty = { category: '', condition: '', minPrice: '', maxPrice: '' }; setLocal(empty); onChange(empty); onClose(); };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:top-0 sm:right-0 sm:bottom-0 sm:w-80
        z-50 flex flex-col rounded-t-2xl sm:rounded-none sm:rounded-l-2xl overflow-hidden"
        style={{ backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(27,45,107,0.15)' }}>

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-primary)',
            fontFamily: 'Playfair Display, serif' }}>
            Filtros
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">

          {/* T30 — Categoría */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => setLocal(l => ({ ...l, category: l.category === cat ? '' : cat }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                    ${local.category === cat ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  style={local.category === cat ? { backgroundColor: 'var(--color-primary)' } : {}}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* T32 — Condición */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>Condición</p>
            <div className="flex gap-3">
              {['Nuevo', 'Usado'].map(cond => (
                <button key={cond}
                  onClick={() => setLocal(l => ({ ...l, condition: l.condition === cond ? '' : cond }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors
                    ${local.condition === cond ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  style={local.condition === cond ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' } : {}}>
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* T30 — Rango de precio */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>Rango de precio (COP)</p>
            <div className="flex gap-3 items-center">
              <input
                type="number" min="0" placeholder="Mínimo"
                value={local.minPrice}
                onChange={e => setLocal(l => ({ ...l, minPrice: e.target.value }))}
                className="input-base flex-1 text-sm"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="number" min="0" placeholder="Máximo"
                value={local.maxPrice}
                onChange={e => setLocal(l => ({ ...l, maxPrice: e.target.value }))}
                className="input-base flex-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={reset} className="btn-secondary flex-1">
            Limpiar
          </button>
          <button onClick={apply} className="btn-primary flex-1">
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  );
};

// T33 — Etiquetas de filtros activos
export const FilterTags = ({ filters, onChange }) => {
  const tags = [];

  if (filters.category)  tags.push({ key: 'category',  label: filters.category });
  if (filters.condition) tags.push({ key: 'condition',  label: filters.condition });
  if (filters.minPrice)  tags.push({ key: 'minPrice',   label: `Desde $${Number(filters.minPrice).toLocaleString('es-CO')}` });
  if (filters.maxPrice)  tags.push({ key: 'maxPrice',   label: `Hasta $${Number(filters.maxPrice).toLocaleString('es-CO')}` });

  if (!tags.length) return null;

  const remove = (key) => onChange({ ...filters, [key]: '' });
  const removeAll = () => onChange({ category: '', condition: '', minPrice: '', maxPrice: '' });

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map(tag => (
        <span key={tag.key}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(27,45,107,0.08)', color: 'var(--color-primary)' }}>
          {tag.label}
          <button onClick={() => remove(tag.key)}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 leading-none text-base">
            ×
          </button>
        </span>
      ))}
      <button onClick={removeAll}
        className="text-xs underline"
        style={{ color: 'var(--color-text-muted)' }}>
        Limpiar todo
      </button>
    </div>
  );
};

export default FilterSidebar;
