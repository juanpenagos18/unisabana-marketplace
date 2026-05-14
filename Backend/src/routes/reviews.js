const express  = require('express');
const router   = express.Router();
const Review   = require('../models/Review');
const Order    = require('../models/Order');
const User     = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── T45: POST /api/reviews — Crear reseña ────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, sellerId, rating, comment } = req.body;

    if (!orderId || !sellerId || !rating)
      return res.status(400).json({ message: 'orderId, sellerId y rating son obligatorios' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'El rating debe ser entre 1 y 5' });

    // Solo si la orden está Entregada (T45 criterio)
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    if (order.status !== 'Entregada')
      return res.status(400).json({ message: 'Solo puedes reseñar órdenes entregadas' });
    if (order.buyer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Solo el comprador puede dejar una reseña' });

    // Evitar reseña duplicada
    const existing = await Review.findOne({ order: orderId, reviewer: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'Ya dejaste una reseña para esta orden' });

    const review = await Review.create({
      order:    orderId,
      reviewer: req.user._id,
      seller:   sellerId,
      rating,
      comment:  comment || '',
    });

    // Recalcular reputación del vendedor (promedio de todas sus reseñas)
    const allReviews = await Review.find({ seller: sellerId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(sellerId, { reputation: Math.round(avg * 10) / 10 });

    // T47 — Notificar al vendedor de la nueva reseña
    await Notification.create({
      user:  sellerId,
      type:  'new_review',
      title: '⭐ Nueva reseña',
      body:  `${req.user.name} te dejó ${rating} estrella${rating > 1 ? 's' : ''}`,
      link:  '/profile',
    });

    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Ya dejaste una reseña para esta orden' });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/reviews/seller/:sellerId — Reseñas de un vendedor
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name photo')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/reviews/can-review/:orderId — Verifica si el usuario puede reseñar
router.get('/can-review/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.json({ canReview: false });
    const isBuyer    = order.buyer.toString() === req.user._id.toString();
    const isDelivered = order.status === 'Entregada';
    const existing   = await Review.findOne({ order: req.params.orderId, reviewer: req.user._id });
    res.json({ canReview: isBuyer && isDelivered && !existing, alreadyReviewed: !!existing });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
