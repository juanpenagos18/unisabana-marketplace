const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// ── T36: POST /api/orders — Generar orden de compra ──────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { cartItems, totalPrice } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0)
      return res.status(400).json({ message: 'El carrito está vacío' });
    if (!totalPrice || totalPrice <= 0)
      return res.status(400).json({ message: 'El total debe ser mayor a 0' });

    // Verificar que todos los productos existen y están activos
    const productIds = cartItems.map(i => i.productId);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== cartItems.length)
      return res.status(400).json({ message: 'Uno o más productos no están disponibles' });

    // No puede comprarse a sí mismo
    const ownProduct = products.find(p => p.seller.toString() === req.user._id.toString());
    if (ownProduct)
      return res.status(400).json({ message: 'No puedes comprar tus propios productos' });

    // Construir items con info persistente (snapshot del momento de compra)
    const items = products.map(p => ({
      product: p._id,
      title:   p.title,
      price:   p.price,
      image:   p.images?.[0] || null,
      seller:  p.seller,
    }));

    const order = await Order.create({
      buyer: req.user._id,
      items,
      totalPrice,
      status: 'Pendiente',
    });

    await order.populate('items.seller', 'name email');
    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T38: GET /api/orders/my — Historial de órdenes del comprador ─────────────
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T38: GET /api/orders/sales — Historial de ventas del vendedor ────────────
router.get('/sales', protect, async (req, res) => {
  try {
    // Órdenes que contienen productos del vendedor actual
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'name email career')
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T39: GET /api/orders/:id — Detalle de orden ──────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.seller', 'name email');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    // Solo el comprador o un vendedor involucrado puede verla
    const isBuyer  = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isBuyer && !isSeller)
      return res.status(403).json({ message: 'No autorizado' });
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T39: PATCH /api/orders/:id/status — Actualizar estado (vendedor) ─────────
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pendiente', 'Confirmada', 'Entregada', 'Cancelada'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Estado inválido' });

    const order = await Order.findById(req.params.id).populate('items.seller', '_id');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isSeller) return res.status(403).json({ message: 'Solo el vendedor puede actualizar el estado' });

    order.status = status;
    await order.save();
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
