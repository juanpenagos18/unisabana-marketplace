const mongoose = require('mongoose');

const CATEGORIES = [
  'Académico', 'Tecnología', 'Hogar', 'Moda', 'Comida',
  'Transporte', 'Entretenimiento', 'Deporte', 'Cuidado Personal', 'Servicios', 'Otros',
];

const productSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'El título es obligatorio'], trim: true, maxlength: 100 },
  description: { type: String, required: [true, 'La descripción es obligatoria'], trim: true, maxlength: 1000 },
  price:       { type: Number, required: [true, 'El precio es obligatorio'], min: 0 },
  category:    { type: String, required: [true, 'La categoría es obligatoria'], enum: CATEGORIES },
  condition:   { type: String, required: [true, 'La condición es obligatoria'], enum: ['Nuevo', 'Usado'] },
  images:      [{ type: String }],
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// T28 — Índice de texto para búsqueda full-text por título y descripción
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
