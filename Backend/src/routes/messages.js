const express      = require('express');
const router       = express.Router();
const Message      = require('../models/Message');
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');

// POST /api/messages — Enviar mensaje + notificar receptor (T47)
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;
    if (!receiverId || !content?.trim())
      return res.status(400).json({ message: 'Destinatario y contenido son obligatorios' });
    if (receiverId === req.user._id.toString())
      return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' });

    const message = await Message.create({
      sender: req.user._id, receiver: receiverId,
      product: productId || null, content: content.trim(),
    });

    // T47 — Notificar al receptor del nuevo mensaje
    const params = new URLSearchParams({ contactId: req.user._id.toString(), contactName: req.user.name });
    if (productId) params.append('productId', productId);

    await Notification.create({
      user:  receiverId,
      type:  'new_message',
      title: '💬 Nuevo mensaje',
      body:  `${req.user.name}: ${content.trim().slice(0, 60)}${content.length > 60 ? '...' : ''}`,
      link:  `/chats/conversation?${params}`,
    });

    await message.populate('sender', 'name photo');
    res.status(201).json({ message });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/messages/chats
router.get('/chats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .populate('sender',   'name photo')
      .populate('receiver', 'name photo')
      .populate('product',  'title images')
      .sort({ createdAt: -1 });

    const chatMap = new Map();
    for (const msg of messages) {
      const otherId   = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString() : msg.sender._id.toString();
      const productId = msg.product?._id?.toString() || 'general';
      const key       = [otherId, productId].sort().join('-');
      if (!chatMap.has(key)) {
        chatMap.set(key, {
          key,
          contact:     msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          product:     msg.product,
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

// GET /api/messages/conversation
router.get('/conversation', protect, async (req, res) => {
  try {
    const { contactId, productId } = req.query;
    if (!contactId) return res.status(400).json({ message: 'contactId es obligatorio' });
    const userId = req.user._id;
    const filter = { $or: [{ sender: userId, receiver: contactId }, { sender: contactId, receiver: userId }] };
    if (productId) filter.product = productId;
    const messages = await Message.find(filter).populate('sender', 'name photo').sort({ createdAt: 1 });
    await Message.updateMany({ sender: contactId, receiver: userId, read: false }, { read: true });
    res.json({ messages });
  } catch {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
