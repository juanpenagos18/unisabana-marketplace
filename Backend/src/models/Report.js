const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId:   { type: String, required: true },   // ID del producto o usuario reportado
  targetType: { type: String, enum: ['product', 'user'], required: true },
  reportType: {
    type: String,
    enum: ['spam', 'fraude', 'contenido_inapropiado', 'precio_abusivo', 'otro'],
    required: true,
  },
  reason:  { type: String, required: true, trim: true, maxlength: 500 },
  status:  { type: String, enum: ['pendiente', 'revisado', 'resuelto'], default: 'pendiente' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
