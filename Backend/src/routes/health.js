const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// GET /api/health
router.get('/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbStatus = mongoose.connection.readyState;
  res.status(200).json({
    status: 'OK',
    message: 'UniSabana Marketplace API funcionando',
    timestamp: new Date().toISOString(),
    database: { status: states[dbStatus], connected: dbStatus === 1 },
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
