const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const Report   = require('../models/Report');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// ── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const now  = new Date();
    const week = new Date(now - 7*24*60*60*1000);

    const [totalUsers, totalProducts, totalOrders, totalReports,
           pendingReports, newUsersThisWeek, activeProducts,
           categoryAgg, roleAgg, dailyAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pendiente' }),
      User.countDocuments({ createdAt: { $gte: week } }),
      Product.countDocuments({ isActive: true }),
      // Productos por categoría (para gráfico de barras)
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Distribución de roles (para gráfico de dona)
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      // Nuevos usuarios por día últimos 7 días (para gráfico de línea)
      User.aggregate([
        { $match: { createdAt: { $gte: week } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      stats: { totalUsers, totalProducts, totalOrders, totalReports,
               pendingReports, newUsersThisWeek, activeProducts },
      charts: { categoryAgg, roleAgg, dailyAgg },
    });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error' }); }
});

// ── Usuarios ─────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = 20;
    const search = req.query.search || '';
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 })
          .skip((page-1)*limit).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, pages: Math.ceil(total/limit) });
  } catch { res.status(500).json({ message: 'Error' }); }
});

router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.role === 'admin') return res.status(400).json({ message: 'No puedes suspender a un admin' });
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, isSuspended: user.isSuspended } });
  } catch { res.status(500).json({ message: 'Error' }); }
});

// Productos de un vendedor específico (para admin)
router.get('/users/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch { res.status(500).json({ message: 'Error' }); }
});

// ── Productos (pestaña nueva) ────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const limit    = 20;
    const search   = req.query.search   || '';
    const category = req.query.category || '';
    const status   = req.query.status   || ''; // 'active' | 'inactive' | ''

    const filter = {};
    if (search)   filter.title    = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (status === 'active')   filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('seller','name email')
             .sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, pages: Math.ceil(total/limit) });
  } catch { res.status(500).json({ message: 'Error' }); }
});

// Activar/desactivar producto (toggle)
router.patch('/products/:id/toggle', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ product: { id: product._id, title: product.title, isActive: product.isActive } });
  } catch { res.status(500).json({ message: 'Error' }); }
});

// Eliminar producto con razón
router.delete('/products/:id', async (req, res) => {
  try {
    const { adminReason } = req.body;
    if (!adminReason?.trim())
      return res.status(400).json({ message: 'La razón es obligatoria' });
    const product = await Product.findById(req.params.id).populate('seller','_id name');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    product.isActive = false;
    await product.save();
    await Report.updateMany(
      { targetId: req.params.id, targetType: 'product' },
      { status: 'resuelto', adminNote: adminReason }
    );
    await Notification.create({
      user:  product.seller._id,
      type:  'order_status',
      title: '⚠️ Producto removido',
      body:  `Tu producto "${product.title}" fue removido: ${adminReason}`,
      link:  '/my-products',
    });
    res.json({ message: 'Producto eliminado y vendedor notificado' });
  } catch { res.status(500).json({ message: 'Error' }); }
});

// ── Reportes ─────────────────────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const status   = req.query.status || 'pendiente';
    const reports  = await Report.find({ status })
      .populate('reporter','name email').sort({ createdAt: -1 });
    res.json({ reports });
  } catch { res.status(500).json({ message: 'Error' }); }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id, { status, adminNote: adminNote||'' }, { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Reporte no encontrado' });
    res.json({ report });
  } catch { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
