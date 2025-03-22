const express = require('express');
const router = express.Router();
const {
  generateExcelReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas de reportes requieren autenticación
router.use(protect);

// Ruta para generar reporte en Excel
router.get('/excel', generateExcelReport);

module.exports = router;