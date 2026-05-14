const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

// Una sola reseña por orden
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
