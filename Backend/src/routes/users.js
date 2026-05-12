const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// ── T13: GET /api/users/profile ──────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user });
});

// ── T13: PUT /api/users/profile ──────────────────────────────────────────────
// Solo el dueño del perfil puede editar (garantizado por el token)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, career, photo } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, career, photo },
      { new: true, runValidators: true, select: '-password' }
    );
    res.json({ user: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── T15: PATCH /api/users/upgrade-to-seller ──────────────────────────────────
// Llamado automáticamente al crear el primer producto (lógica en módulo de productos)
router.patch('/upgrade-to-seller', protect, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      return res.json({ message: 'Ya eres vendedor', user: req.user });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'seller' },
      { new: true, select: '-password' }
    );
    res.json({ message: 'Rol actualizado a vendedor', user: updated });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
