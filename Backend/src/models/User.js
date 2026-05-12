const mongoose = require('mongoose');

// T6 — Modelo de Usuario con todos los campos del TRD
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    // T7 — Restricción dominio institucional
    match: [/^[^\s@]+@unisabana\.edu\.co$/, 'Solo se permiten correos @unisabana.edu.co'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6,
  },
  career:  { type: String, trim: true, default: null },
  photo:   { type: String, default: null },
  // T15 — Rol para conversión automática comprador → vendedor
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer',
  },
  reputation:  { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
