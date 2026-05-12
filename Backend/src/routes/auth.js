const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

// Genera un JWT firmado con el id del usuario
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── T7: POST /api/auth/register ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, career } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    // Validación dominio institucional (también validada en el modelo)
    if (!email.endsWith('@unisabana.edu.co')) {
      return res.status(400).json({ message: 'Solo se aceptan correos @unisabana.edu.co' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'El correo ya está registrado' });

    // T7 — Encriptación de contraseña
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, password: hashed, career: career || null });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id, name: user.name, email: user.email,
        career: user.career, photo: user.photo, role: user.role,
        reputation: user.reputation,
      },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'El correo ya está registrado' });
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T9: POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });
    if (user.isSuspended) return res.status(403).json({ message: 'Cuenta suspendida' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id, name: user.name, email: user.email,
        career: user.career, photo: user.photo, role: user.role,
        reputation: user.reputation,
      },
    });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
