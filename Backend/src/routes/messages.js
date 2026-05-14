const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// ── T41: POST /api/messages — Enviar mensaje ─────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;
    if (!receiverId || !content?.trim())
      return res.status(400).json({ message: 'Destinatario y contenido son obligatorios' });
    if (receiverId === req.user._id.toString())
      return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' });

    const message = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      product:  productId || null,
      content:  content.trim(),
    });
    await message.populate('sender', 'name photo');
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T42: GET /api/messages/chats — Lista de chats activos ────────────────────
// Devuelve una conversación resumida por cada contacto único
router.get('/chats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Todos los mensajes donde participa el usuario
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender',   'name photo')
      .populate('receiver', 'name photo')
      .populate('product',  'title images')
      .sort({ createdAt: -1 });

    // Agrupar por conversación (par único sender-receiver + producto)
    const chatMap = new Map();
    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      const productId = msg.product?._id?.toString() || 'general';
      const key = [otherId, productId].sort().join('-');

      if (!chatMap.has(key)) {
        chatMap.set(key, {
          key,
          contact: msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          product: msg.product,
          lastMessage: msg.content,
          lastAt:      msg.createdAt,
          unread: msg.receiver._id.toString() === userId.toString() && !msg.read ? 1 : 0,
        });
      } else if (msg.receiver._id.toString() === userId.toString() && !msg.read) {
        chatMap.get(key).unread++;
      }
    }

    res.json({ chats: Array.from(chatMap.values()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── T43/T44: GET /api/messages/conversation — Mensajes de una conversación ───
// T44 — El frontend hace polling cada 3s a este endpoint para nuevos mensajes
router.get('/conversation', protect, async (req, res) => {
  try {
    const { contactId, productId } = req.query;
    if (!contactId) return res.status(400).json({ message: 'contactId es obligatorio' });

    const userId = req.user._id;
    const filter = {
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    };
    if (productId) filter.product = productId;

    const messages = await Message.find(filter)
      .populate('sender', 'name photo')
      .sort({ createdAt: 1 });

    // Marcar como leídos los mensajes recibidos
    await Message.updateMany(
      { sender: contactId, receiver: userId, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
