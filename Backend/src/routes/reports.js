const express = require('express');
const router  = express.Router();
const Report  = require('../models/Report');
const { protect } = require('../middleware/auth');

// T48: POST /api/reports — Reportar contenido sospechoso
router.post('/', protect, async (req, res) => {
  try {
    const { targetId, targetType, reportType, reason } = req.body;
    if (!targetId || !targetType || !reportType || !reason?.trim())
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    // Evitar reportes duplicados del mismo usuario
    const exists = await Report.findOne({ reporter: req.user._id, targetId, status: 'pendiente' });
    if (exists)
      return res.status(400).json({ message: 'Ya reportaste este contenido' });

    const report = await Report.create({
      reporter: req.user._id, targetId, targetType, reportType, reason,
    });
    res.status(201).json({ report, message: 'Reporte enviado. El equipo lo revisará pronto.' });
  } catch { res.status(500).json({ message: 'Error del servidor' }); }
});

module.exports = router;
