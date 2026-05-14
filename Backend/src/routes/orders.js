const express      = require('express');
const router       = express.Router();
const Order        = require('../models/Order');
const Product      = require('../models/Product');
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');

// POST /api/orders — Crear orden + notificar vendedores (T47)
router.post('/', protect, async (req, res) => {
  try {
    const { cartItems, totalPrice } = req.body;
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0)
      return res.status(400).json({ message: 'El carrito está vacío' });
    if (!totalPrice || totalPrice <= 0)
      return res.status(400).json({ message: 'El total debe ser mayor a 0' });

    const productIds = cartItems.map(i => i.productId);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== cartItems.length)
      return res.status(400).json({ message: 'Uno o más productos no están disponibles' });

    const ownProduct = products.find(p => p.seller.toString() === req.user._id.toString());
    if (ownProduct)
      return res.status(400).json({ message: 'No puedes comprar tus propios productos' });

    const items = products.map(p => ({
      product: p._id, title: p.title, price: p.price,
      image: p.images?.[0] || null, seller: p.seller,
    }));

    const order = await Order.create({ buyer: req.user._id, items, totalPrice, status: 'Pendiente' });

    // T47 — Notificar a cada vendedor involucrado
    const sellerIds = [...new Set(items.map(i => i.seller.toString()))];
    await Promise.all(sellerIds.map(sellerId =>
      Notification.create({
        user:  sellerId,
        type:  'new_order',
        title: '🛒 Nueva venta',
        body:  `${req.user.name} compró ${items.filter(i => i.seller.toString() === sellerId).length} producto(s)`,
        link:  '/orders',
      })
    ));

    await order.populate('items.seller', 'name email');
    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/orders/my
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.seller', 'name').sort({ createdAt: -1 });
    res.json({ orders });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// GET /api/orders/sales
router.get('/sales', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'name email career')
      .populate('items.seller', 'name').sort({ createdAt: -1 });
    res.json({ orders });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.seller', 'name email');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    const isBuyer  = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'No autorizado' });
    res.json({ order });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// PATCH /api/orders/:id/status — Cambiar estado + notificar comprador (T47)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pendiente', 'Confirmada', 'Entregada', 'Cancelada'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Estado inválido' });

    const order = await Order.findById(req.params.id)
      .populate('items.seller', '_id name')
      .populate('buyer', '_id name');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isSeller) return res.status(403).json({ message: 'Solo el vendedor puede actualizar el estado' });

    order.status = status;
    await order.save();

    // T47 — Notificar al comprador del cambio de estado
    const statusEmoji = { Confirmada: '✅', Entregada: '📦', Cancelada: '❌' };
    await Notification.create({
      user:  order.buyer._id,
      type:  'order_status',
      title: `${statusEmoji[status] || '📋'} Orden ${status.toLowerCase()}`,
      body:  `Tu orden fue marcada como ${status} por el vendedor`,
      link:  '/orders',
    });

    res.json({ order });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
