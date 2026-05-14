const mongoose = require('mongoose');

const CATEGORIES = [
  'Académico','Tecnología','Hogar','Moda','Comida',
  'Transporte','Entretenimiento','Deporte','Cuidado Personal','Servicios','Otros',
];

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, enum: CATEGORIES },
  condition:   { type: String, required: true, enum: ['Nuevo','Usado'] },
  stock:       { type: Number, required: true, min: 1, default: 1 }, // NUEVO
  images:      [{ type: String }],
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
