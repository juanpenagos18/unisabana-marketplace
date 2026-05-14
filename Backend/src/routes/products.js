const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// ── T17: POST /api/products — Crear producto ─────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, category, condition, images } = req.body;

    if (!title || !description || price === undefined || !category || !condition) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const product = await Product.create({
      title, description, price, category, condition,
      images: images || [],
      seller: req.user._id,
    });

    // T15 — Conversión automática a vendedor al publicar primer producto
    if (req.user.role === 'buyer') {
      await User.findByIdAndUpdate(req.user._id, { role: 'seller' });
    }

    await product.populate('seller', 'name email career photo reputation');
    res.status(201).json({ product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T26: GET /api/products/seller/my — Mis publicaciones ────────────────────
// IMPORTANTE: esta ruta debe ir ANTES de /:id para que no confunda "my" con un id
router.get('/seller/my', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T20: GET /api/products — Listar productos activos con paginación ─────────
router.get('/', async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(20, parseInt(req.query.limit) || 12);
    const skip      = (page - 1) * limit;
    const category  = req.query.category;
    const condition = req.query.condition;
    const search    = req.query.search;

    const filter = { isActive: true };
    if (category)  filter.category  = category;
    if (condition) filter.condition  = condition;
    if (search)    filter.title      = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name photo reputation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T23: GET /api/products/:id — Detalle de producto ────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email photo career reputation');
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ product });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T25: PUT /api/products/:id — Actualizar producto ────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    const { title, description, price, category, condition, images } = req.body;
    if (title)             product.title       = title;
    if (description)       product.description = description;
    if (price !== undefined) product.price     = price;
    if (category)          product.category    = category;
    if (condition)         product.condition   = condition;
    if (images)            product.images      = images;

    await product.save();
    await product.populate('seller', 'name email photo reputation');
    res.json({ product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T27: DELETE /api/products/:id — Borrado lógico ──────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    // Solo cambia isActive a false — no se borra de la BD
    product.isActive = false;
    await product.save();
    res.json({ message: 'Producto desactivado correctamente' });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
