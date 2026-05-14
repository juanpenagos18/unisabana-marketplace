const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const Report   = require('../models/Report');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Todas las rutas de admin requieren token válido + role admin
router.use(protect, adminOnly);

// ── T49: GET /api/admin/stats — Métricas generales ───────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      totalReports, pendingReports,
      newUsersThisWeek, activeProducts,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pendiente' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Product.countDocuments({ isActive: true }),
    ]);

    res.json({
      stats: {
        totalUsers, totalProducts, totalOrders,
        totalReports, pendingReports,
        newUsersThisWeek, activeProducts,
      },
    });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── T49: GET /api/admin/users — Lista de usuarios ────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const search = req.query.search || '';
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── T49: PATCH /api/admin/users/:id/suspend — Suspender/activar usuario ──────
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'admin') return res.status(400).json({ message: 'No puedes suspender a un admin' });
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, isSuspended: user.isSuspended } });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── T48: GET /api/admin/reports — Lista de reportes ─────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const status = req.query.status || 'pendiente';
    const reports = await Report.find({ status })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── T50: DELETE /api/admin/products/:id — Eliminar producto reportado ────────
router.delete('/products/:id', async (req, res) => {
  try {
    const { adminReason } = req.body;
    if (!adminReason?.trim())
      return res.status(400).json({ message: 'La razón de eliminación es obligatoria' });

    const product = await Product.findById(req.params.id).populate('seller', '_id name');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Borrado lógico con nota del admin
    product.isActive  = false;
    await product.save();

    // Marcar reportes relacionados como resueltos
    await Report.updateMany(
      { targetId: req.params.id, targetType: 'product' },
      { status: 'resuelto', adminNote: adminReason }
    );

    // Notificar al vendedor
    await Notification.create({
      user:  product.seller._id,
      type:  'order_status',
      title: '⚠️ Producto removido',
      body:  `Tu producto "${product.title}" fue removido por el administrador: ${adminReason}`,
      link:  '/my-products',
    });

    res.json({ message: 'Producto eliminado y vendedor notificado' });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── T48: PATCH /api/admin/reports/:id — Actualizar estado de reporte ─────────
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Reporte no encontrado' });
    res.json({ report });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
