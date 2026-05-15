const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, trim: true, maxlength: 500, default: '' },
  photos:   [{ type: String }],  // URLs de Cloudinary
}, { timestamps: true });

reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ seller: 1 });

module.exports = mongoose.model('Review', reviewSchema);
