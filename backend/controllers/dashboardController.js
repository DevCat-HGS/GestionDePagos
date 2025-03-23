const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Event = require('../models/eventModel');

/**
 * @desc    Obtener datos para el dashboard
 * @route   GET /api/users/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // Obtener pagos recientes (últimos 5)
    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name')
      .populate('createdBy', 'name');
    
    // Obtener eventos recientes (últimos 5)
    const recentEvents = await Event.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');
    
    // Devolver los datos del dashboard
    res.json({
      totalUsers,
      totalPayments,
      totalEvents,
      recentPayments,
      recentEvents
    });
  } catch (error) {
    console.error(`Error en getDashboardData: ${error.message}`);
    res.status(500).json({
      message: 'Error al obtener los datos del dashboard',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardData
};