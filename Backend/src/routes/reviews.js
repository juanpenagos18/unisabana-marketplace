const express  = require('express');
const router   = express.Router();
const Review   = require('../models/Review');
const Order    = require('../models/Order');
const User     = require('../models/User');
const Report   = require('../models/Report');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// POST /api/reviews — Crear reseña con fotos (sobre el producto)
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, sellerId, productId, rating, comment, photos } = req.body;
    if (!orderId || !sellerId || !productId || !rating)
      return res.status(400).json({ message: 'orderId, sellerId, productId y rating son obligatorios' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'El rating debe ser entre 1 y 5' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    if (order.status !== 'Entregada')
      return res.status(400).json({ message: 'Solo puedes reseñar órdenes entregadas' });
    if (order.buyer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Solo el comprador puede dejar una reseña' });

    const existing = await Review.findOne({ order: orderId, reviewer: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'Ya dejaste una reseña para esta orden' });

    const review = await Review.create({
      order: orderId, reviewer: req.user._id,
      seller: sellerId, product: productId,
      rating, comment: comment || '',
      photos: photos || [],
    });

    // Recalcular reputación del vendedor
    const allReviews = await Review.find({ seller: sellerId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(sellerId, { reputation: Math.round(avg * 10) / 10 });

    // Notificar al vendedor
    await Notification.create({
      user:  sellerId,
      type:  'new_review',
      title: '⭐ Nueva reseña en tu producto',
      body:  `${req.user.name} calificó tu producto con ${rating} estrella${rating > 1 ? 's' : ''}`,
      link:  '/profile',
    });

    await review.populate('reviewer', 'name photo');
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Ya dejaste una reseña para esta orden' });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/reviews/product/:productId — Reseñas de un producto
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('reviewer', 'name photo')
      .sort({ createdAt: -1 });
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// GET /api/reviews/seller/:sellerId — Reseñas de un vendedor (con info del producto)
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name photo')
      .populate('product',  'title images')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// GET /api/reviews/can-review/:orderId
router.get('/can-review/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.json({ canReview: false });
    const isBuyer     = order.buyer.toString() === req.user._id.toString();
    const isDelivered = order.status === 'Entregada';
    const existing    = await Review.findOne({ order: req.params.orderId, reviewer: req.user._id });
    res.json({ canReview: isBuyer && isDelivered && !existing, alreadyReviewed: !!existing });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// DELETE /api/reviews/:id — Solo admin puede eliminar reseñas
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Solo el administrador puede eliminar reseñas' });
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    // Recalcular reputación del vendedor
    const remaining = await Review.find({ seller: review.seller });
    const avg = remaining.length
      ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
      : 0;
    await User.findByIdAndUpdate(review.seller, { reputation: Math.round(avg * 10) / 10 });
    res.json({ message: 'Reseña eliminada' });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
