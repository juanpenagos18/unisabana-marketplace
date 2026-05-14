const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, category, condition, stock, images } = req.body;
    if (!title||!description||price===undefined||!category||!condition||!stock)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    const product = await Product.create({
      title, description, price, category, condition,
      stock: Number(stock), images: images||[], seller: req.user._id,
    });
    if (req.user.role==='buyer') await User.findByIdAndUpdate(req.user._id, { role:'seller' });
    await product.populate('seller','name email career photo reputation');
    res.status(201).json({ product });
  } catch (err) {
    if (err.name==='ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e=>e.message).join(', ') });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/seller/my', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

router.get('/', async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)||1);
    const limit     = Math.min(20, parseInt(req.query.limit)||12);
    const skip      = (page-1)*limit;
    const search    = req.query.search    || '';
    const category  = req.query.category  || '';
    const condition = req.query.condition || '';
    const sellerId  = req.query.sellerId  || ''; // NUEVO — filtrar por vendedor
    const minPrice  = parseFloat(req.query.minPrice)||0;
    const maxPrice  = parseFloat(req.query.maxPrice)||Infinity;

    const filter = { isActive: true };
    if (search)    filter.$text    = { $search: search };
    if (category)  filter.category = category;
    if (condition) filter.condition= condition;
    if (sellerId)  filter.seller   = sellerId;
    filter.price = { $gte: minPrice };
    if (maxPrice!==Infinity) filter.price.$lte = maxPrice;

    const sortOption = search ? { score:{$meta:'textScore'}, createdAt:-1 } : { createdAt:-1 };

    const [products, total] = await Promise.all([
      Product.find(filter, search?{score:{$meta:'textScore'}}:{})
        .populate('seller','name photo reputation')
        .sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, pagination:{ total, page, pages:Math.ceil(total/limit), limit } });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Error del servidor' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller','name email photo career reputation');
    if (!product||!product.isActive) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ product });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product||!product.isActive) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.seller.toString()!==req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });
    const { title, description, price, category, condition, stock, images } = req.body;
    if (title)             product.title       = title;
    if (description)       product.description = description;
    if (price!==undefined) product.price       = price;
    if (category)          product.category    = category;
    if (condition)         product.condition   = condition;
    if (stock!==undefined) product.stock       = Number(stock);
    if (images)            product.images      = images;
    await product.save();
    await product.populate('seller','name email photo reputation');
    res.json({ product });
  } catch (err) {
    if (err.name==='ValidationError')
      return res.status(400).json({ message: Object.values(err.errors).map(e=>e.message).join(', ') });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (product.seller.toString()!==req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Producto desactivado correctamente' });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
