const Payment = require('../models/paymentModel');

// @desc    Crear un nuevo pago
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { clientName, clientId, amount, date, status, paymentMethod, notes } = req.body;

    const payment = await Payment.create({
      clientName,
      clientId,
      amount,
      date: date || Date.now(),
      status: status || 'pendiente',
      paymentMethod: paymentMethod || 'efectivo',
      notes,
      createdBy: req.user._id,
    });

    if (payment) {
      res.status(201).json(payment);
    } else {
      res.status(400).json({ message: 'Datos de pago inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener todos los pagos
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    // Filtros opcionales
    const filters = {};
    
    // Filtrar por estado si se proporciona
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Filtrar por cliente si se proporciona
    if (req.query.clientName) {
      filters.clientName = { $regex: req.query.clientName, $options: 'i' };
    }
    
    // Filtrar por ID de cliente si se proporciona
    if (req.query.clientId) {
      filters.clientId = req.query.clientId;
    }
    
    // Filtrar por rango de fechas si se proporciona
    if (req.query.startDate && req.query.endDate) {
      filters.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }
    
    // Filtrar por semana y año si se proporcionan
    if (req.query.weekNumber && req.query.year) {
      filters.weekNumber = parseInt(req.query.weekNumber);
      filters.year = parseInt(req.query.year);
    }

    const payments = await Payment.find(filters)
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener un pago por ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (payment) {