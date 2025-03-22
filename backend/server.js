const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API ADSO running');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en puerto ${PORT}`);
});