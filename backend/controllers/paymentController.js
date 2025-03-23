const Payment = require('../models/paymentModel');
const Event = require('../models/eventModel');

// @desc    Crear un nuevo pago
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { clientName, clientId, amount, date, status, paymentMethod, notes, eventId } = req.body;

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
      // Si hay un evento asociado, actualizar su monto actual
      if (eventId) {
        const event = await Event.findById(eventId);
        if (event) {
          // Solo actualizar el monto si el pago está en estado 'pagado'
          if (payment.status === 'pagado') {
            event.currentAmount += payment.amount;
            event.payments.push(payment._id);
            await event.save();
          }
        }
      }
      
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
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Pago no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar un pago
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res) => {
  try {
    const { clientName, clientId, amount, date, status, paymentMethod, notes, eventId } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (payment) {
      // Guardar el estado y monto anterior para comparar después
      const previousStatus = payment.status;
      const previousAmount = payment.amount;
      
      payment.clientName = clientName || payment.clientName;
      payment.clientId = clientId || payment.clientId;
      payment.amount = amount || payment.amount;
      payment.date = date || payment.date;
      payment.status = status || payment.status;
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.notes = notes || payment.notes;

      const updatedPayment = await payment.save();
      
      // Buscar eventos que tengan este pago
      const events = await Event.find({ payments: payment._id });
      
      // Si hay eventos asociados, actualizar sus montos
      if (events.length > 0) {
        for (const event of events) {
          // Si el estado cambió a 'pagado' desde otro estado, sumar el monto
          if (payment.status === 'pagado' && previousStatus !== 'pagado') {
            event.currentAmount += payment.amount;
          } 
          // Si el estado cambió desde 'pagado' a otro estado, restar el monto anterior
          else if (previousStatus === 'pagado' && payment.status !== 'pagado') {
            event.currentAmount -= previousAmount;
          } 
          // Si el estado sigue siendo 'pagado' pero el monto cambió, ajustar la diferencia
          else if (payment.status === 'pagado' && previousStatus === 'pagado' && payment.amount !== previousAmount) {
            event.currentAmount = event.currentAmount - previousAmount + payment.amount;
          }
          
          await event.save();
        }
      }
      
      // Si se proporcionó un nuevo eventId, asociar el pago a ese evento
      if (eventId) {
        const newEvent = await Event.findById(eventId);
        if (newEvent && !newEvent.payments.includes(payment._id)) {
          newEvent.payments.push(payment._id);
          
          // Si el pago está en estado 'pagado', actualizar el monto del evento
          if (payment.status === 'pagado') {
            newEvent.currentAmount += payment.amount;
          }
          
          await newEvent.save();
        }
      }
      
      res.json(updatedPayment);
    } else {
      res.status(404).json({ message: 'Pago no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar un pago
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      // Buscar eventos que tengan este pago
      const events = await Event.find({ payments: payment._id });
      
      // Si hay eventos asociados, actualizar sus montos y eliminar la referencia al pago
      if (events.length > 0) {
        for (const event of events) {
          // Si el pago estaba en estado 'pagado', restar su monto del evento
          if (payment.status === 'pagado') {
            event.currentAmount -= payment.amount;
            // Asegurar que el monto no sea negativo
            if (event.currentAmount < 0) {
              event.currentAmount = 0;
            }
          }
          
          // Eliminar la referencia al pago
          event.payments = event.payments.filter(
            (paymentId) => paymentId.toString() !== payment._id.toString()
          );
          
          await event.save();
        }
      }
      
      await payment.deleteOne();
      res.json({ message: 'Pago eliminado' });
    } else {
      res.status(404).json({ message: 'Pago no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener pagos semanales
// @route   GET /api/payments/weekly
// @access  Private
const getWeeklyPayments = async (req, res) => {
  try {
    // Obtener la semana y año actual si no se proporcionan
    const now = new Date();
    const weekNumber = parseInt(req.query.weekNumber) || getWeekNumber(now);
    const year = parseInt(req.query.year) || now.getFullYear();

    const payments = await Payment.find({
      weekNumber,
      year
    }).sort({ date: 1 }).populate('createdBy', 'name email');

    // Calcular totales por estado
    const totals = {
      pagado: 0,
      pendiente: 0,
      cancelado: 0,
      total: 0
    };

    payments.forEach(payment => {
      if (payment.status === 'pagado') {
        totals.pagado += payment.amount;
      } else if (payment.status === 'pendiente') {
        totals.pendiente += payment.amount;
      } else if (payment.status === 'cancelado') {
        totals.cancelado += payment.amount;
      }
      totals.total += payment.amount;
    });

    res.json({
      weekNumber,
      year,
      payments,
      totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función auxiliar para obtener el número de semana de una fecha
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getWeeklyPayments,
};