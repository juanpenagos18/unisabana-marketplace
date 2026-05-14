const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/profile — perfil propio
router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/profile — editar perfil
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, career, photo } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id, { name, career, photo },
      { new: true, runValidators: true, select: '-password' }
    );
    res.json({ user: updated });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PATCH /api/users/upgrade-to-seller
router.patch('/upgrade-to-seller', protect, async (req, res) => {
  try {
    if (req.user.role === 'seller') return res.json({ message: 'Ya eres vendedor', user: req.user });
    const updated = await User.findByIdAndUpdate(
      req.user._id, { role: 'seller' }, { new: true, select: '-password' }
    );
    res.json({ message: 'Rol actualizado a vendedor', user: updated });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

// GET /api/users/:id/public — perfil público (para página del vendedor)
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name career photo role reputation createdAt');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
