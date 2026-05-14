const mongoose = require('mongoose');

// T40 — Estructura de conversaciones entre estudiantes
const messageSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  content:  { type: String, required: true, trim: true, maxlength: 1000 },
  read:     { type: Boolean, default: false },
}, { timestamps: true });

// Índice para cargar conversaciones rápido
messageSchema.index({ sender: 1, receiver: 1, product: 1 });

module.exports = mongoose.model('Message', messageSchema);
