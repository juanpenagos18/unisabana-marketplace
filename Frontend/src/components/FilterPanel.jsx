import React from 'react';

const CATEGORIES = [
  'Académico', 'Tecnología', 'Hogar', 'Moda', 'Comida',
  'Transporte', 'Entretenimiento', 'Deporte', 'Cuidado Personal', 'Servicios', 'Otros',
];

// T31 — Modal/Sidebar de filtros avanzados
// T33 — Etiquetas de filtros activos removibles
const FilterPanel = ({ filters, onChange, onClose }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const clear = () => onChange({ category: '', condition: '', minPrice: '', maxPrice: '' });

  const activeCount = [filters.category, filters.condition, filters.minPrice, filters.maxPrice]
    .filter(Boolean).length;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-full z-50 flex flex-col shadow-2xl"
        style={{ backgroundColor: 'white' }}>

        {/* Header del panel */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              Filtros
            </h3>
            {activeCount > 0 && (
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={clear} className="text-xs text-red-500 hover:underline">
                Limpiar todo
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">

          {/* T30 — Categoría */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => set('category', filters.category === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${filters.category === cat
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                  style={filters.category === cat
                    ? { backgroundColor: 'var(--color-primary)' } : {}}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* T32 — Condición */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Condición</p>
            <div className="flex gap-3">
              {['Nuevo', 'Usado'].map(cond => (
                <button key={cond}
                  onClick={() => set('condition', filters.condition === cond ? '' : cond)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors
                    ${filters.condition === cond
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300'}`}
                  style={filters.condition === cond
                    ? { backgroundColor: 'var(--color-accent)' } : {}}>
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* T30 — Rango de precio */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}>Rango de precio (COP)</p>
            <div className="flex gap-2 items-center">
              <input
                type="number" min="0" placeholder="Mínimo"
                value={filters.minPrice}
                onChange={e => set('minPrice', e.target.value)}
                className="input-base flex-1 text-sm" />
              <span className="text-gray-400">—</span>
              <input
                type="number" min="0" placeholder="Máximo"
                value={filters.maxPrice}
                onChange={e => set('maxPrice', e.target.value)}
                className="input-base flex-1 text-sm" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={onClose} className="btn-primary w-full py-3 font-bold">
            Ver resultados
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
