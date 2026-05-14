import React, { useState } from 'react';

// T46 — Selector interactivo de 1 a 5 estrellas
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          style={{ color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB' }}>
          ★
        </button>
      ))}
    </div>
  );
};

export default StarPicker;
