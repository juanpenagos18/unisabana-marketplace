const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// ── POST /api/products — Crear producto ──────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, category, condition, images } = req.body;
    if (!title || !description || price === undefined || !category || !condition)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    const product = await Product.create({
      title, description, price, category, condition,
      images: images || [],
      seller: req.user._id,
    });
    if (req.user.role === 'buyer')
      await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

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

// ── GET /api/products/seller/my — Mis publicaciones ─────────────────────────
router.get('/seller/my', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── GET /api/products — Listar con búsqueda y filtros (T28/T30/T32) ─────────
router.get('/', async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(20, parseInt(req.query.limit) || 12);
    const skip      = (page - 1) * limit;

    // T28 — búsqueda por texto
    const search    = req.query.search    || '';
    // T30 — filtro por categoría y rango de precio
    const category  = req.query.category  || '';
    const minPrice  = parseFloat(req.query.minPrice) || 0;
    const maxPrice  = parseFloat(req.query.maxPrice) || Infinity;
    // T32 — filtro por condición
    const condition = req.query.condition || '';

    const filter = { isActive: true };

    // Búsqueda full-text (T28) — usa el índice de texto de MongoDB
    if (search) {
      filter.$text = { $search: search };
    }

    if (category)  filter.category  = category;
    if (condition) filter.condition  = condition;

    // Rango de precio (T30)
    filter.price = { $gte: minPrice };
    if (maxPrice !== Infinity) filter.price.$lte = maxPrice;

    const sortOption = search
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter, search ? { score: { $meta: 'textScore' } } : {})
        .populate('seller', 'name photo reputation')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── GET /api/products/:id — Detalle ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email photo career reputation');
    if (!product || !product.isActive)
      return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ product });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// ── PUT /api/products/:id — Actualizar ──────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });

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

// ── DELETE /api/products/:id — Borrado lógico ────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Producto desactivado correctamente' });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
