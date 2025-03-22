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
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas de pagos requieren autenticación
router.use(protect);

// Rutas para pagos
router.route('/')
  .post(createPayment)
  .get(getPayments);

// Ruta para obtener pagos semanales
router.get('/weekly', getWeeklyPayments);

// Rutas para pagos específicos por ID
router.route('/:id')
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;