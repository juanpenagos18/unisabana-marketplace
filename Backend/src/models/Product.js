const mongoose = require('mongoose');

// T16 — Modelo de Producto
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede superar 100 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [1000, 'La descripción no puede superar 1000 caracteres'],
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['Libros', 'Electrónica', 'Ropa', 'Deportes', 'Hogar', 'Otro'],
  },
  condition: {
    type: String,
    required: [true, 'La condición es obligatoria'],
    enum: ['Nuevo', 'Usado'],
  },
  // T19 — URLs de imágenes subidas a Cloudinary
  images: [{ type: String }],

  // Referencia al vendedor
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // T27 — Borrado lógico
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
