require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');

const healthRoutes  = require('./routes/health');
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const productRoutes = require('./routes/products'); // T16-T27

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api',          healthRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes); // NUEVO — Módulo 3

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log('🚀 Servidor en http://localhost:' + PORT));
};
start();
