const express      = require('express');
const router       = express.Router();
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');

// GET /api/notifications — Obtener notificaciones del usuario (con polling T47)
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PATCH /api/notifications/:id/read — Marcar una notificación como leída
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PATCH /api/notifications/read-all — Marcar todas como leídas
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
