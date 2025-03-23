const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  generateEventReport
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

// Todas las rutas de eventos requieren autenticación
router.use(protect);

// Rutas para eventos
router.route('/')
  .post(admin, createEvent) // Solo administradores pueden crear eventos
  .get(getEvents);

// Ruta para generar reportes de eventos
router.get('/report', generateEventReport);

// Rutas para eventos específicos por ID
router.route('/:id')
  .get(getEventById)
  .put(admin, updateEvent) // Solo administradores pueden actualizar eventos
  .delete(admin, deleteEvent); // Solo administradores pueden eliminar eventos

module.exports = router;