const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getWeeklyPayments,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Todas las rutas de pagos requieren autenticación
router.use(protect);

// Rutas para pagos
router.route('/')
  .post(admin, createPayment) // Solo administradores pueden crear pagos
  .get(getPayments);

// Ruta para obtener pagos semanales
router.get('/weekly', getWeeklyPayments);

// Rutas para pagos específicos por ID
router.route('/:id')
  .get(getPaymentById)
  .put(admin, updatePayment) // Solo administradores pueden actualizar pagos
  .delete(admin, deletePayment); // Solo administradores pueden eliminar pagos

module.exports = router;