const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getPendingUsers,
  approveUser
} = require('../controllers/userController');
const { getDashboardData } = require('../controllers/dashboardController');
const { generateUserReport } = require('../controllers/userReportController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/', registerUser);
router.post('/login', loginUser);

// Rutas protegidas para todos los usuarios
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Ruta para obtener datos del dashboard
router.route('/dashboard')
  .get(protect, getDashboardData);

// Ruta para generar reporte de usuarios
router.route('/report')
  .get(protect, admin, generateUserReport);

// Rutas protegidas solo para administradores
router.route('/')
  .get(protect, admin, getUsers);

router.route('/pending')
  .get(protect, admin, getPendingUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
  
router.route('/:id/approve')
  .put(protect, admin, approveUser);

module.exports = router;