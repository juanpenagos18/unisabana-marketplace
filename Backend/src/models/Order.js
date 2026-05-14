const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title:    { type: String, required: true },
  price:    { type: Number, required: true },
  image:    { type: String, default: null },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  buyer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [orderItemSchema],
  totalPrice: { type: Number, required: true },
  // T39 — Estados del ciclo de vida de la orden
  status: {
    type: String,
    enum: ['Pendiente', 'Confirmada', 'Entregada', 'Cancelada'],
    default: 'Pendiente',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
