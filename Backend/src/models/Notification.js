const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    {
    type: String,
    enum: ['new_message', 'new_order', 'order_status', 'new_review'],
    required: true,
  },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  link:    { type: String, default: null },   // ruta frontend a la que navega al hacer clic
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
