const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');
const ExcelJS = require('exceljs');

// @desc    Crear un nuevo evento
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { name, description, startDate, endDate, collectionFrequency, targetAmount } = req.body;

    const event = await Event.create({
      name,
      description,
      startDate,
      endDate,
      collectionFrequency,
      targetAmount,
      createdBy: req.user._id,
    });

    if (event) {
      res.status(201).json(event);
    } else {
      res.status(400).json({ message: 'Datos de evento inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener todos los eventos
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    // Filtros opcionales
    const filters = {};
    
    // Filtrar por estado si se proporciona
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Filtrar por nombre si se proporciona
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: 'i' };
    }
    
    // Filtrar por rango de fechas si se proporciona
    if (req.query.startDate && req.query.endDate) {
      filters.$or = [
        {
          startDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate),
          },
        },
        {
          endDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate),
          },
        },
      ];
    }

    const events = await Event.find(filters)
      .sort({ startDate: -1 })
      .populate('createdBy', 'name email');

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener un evento por ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('payments');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar un evento
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const { name, description, startDate, endDate, collectionFrequency, targetAmount, status } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
      event.name = name || event.name;
      event.description = description || event.description;
      event.startDate = startDate || event.startDate;
      event.endDate = endDate || event.endDate;
      event.collectionFrequency = collectionFrequency || event.collectionFrequency;
      event.targetAmount = targetAmount || event.targetAmount;
      
      // Solo permitir cambio manual de estado si es para cancelar
      if (status === 'cancelado') {
        event.status = status;
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar un evento
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();
      res.json({ message: 'Evento eliminado' });
    } else {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Agregar un pago a un evento
// @route   POST /api/events/:id/payments
// @access  Private
const addPaymentToEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const { paymentId } = req.body;

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Verificar si el pago ya está asociado al evento
    if (event.payments.includes(paymentId)) {
      return res.status(400).json({ message: 'El pago ya está asociado a este evento' });
    }

    // Agregar el pago al evento
    event.payments.push(paymentId);
    event.currentAmount += payment.amount;

    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generar reporte de evento en formato Excel
// @route   GET /api/events/:id/report
// @access  Private
const generateEventReport = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'payments',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      });

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Filtrar pagos por rango de fechas si el evento está en progreso
    let filteredPayments = event.payments;
    if (event.status === 'en_progreso' && req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      
      filteredPayments = event.payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Pagos';
    workbook.created = new Date();
    
    // Crear una hoja para la información del evento
    const eventSheet = workbook.addWorksheet('Información del Evento');
    
    // Agregar encabezados y estilos
    eventSheet.columns = [
      { header: 'Propiedad', key: 'property', width: 20 },
      { header: 'Valor', key: 'value', width: 40 },
    ];
    
    // Agregar información del evento
    eventSheet.addRow({ property: 'Nombre del Evento', value: event.name });
    eventSheet.addRow({ property: 'Descripción', value: event.description || 'N/A' });
    eventSheet.addRow({ property: 'Fecha de Inicio', value: new Date(event.startDate).toLocaleDateString() });
    eventSheet.addRow({ property: 'Fecha de Finalización', value: new Date(event.endDate).toLocaleDateString() });
    eventSheet.addRow({ property: 'Frecuencia de Recolección', value: event.collectionFrequency });
    eventSheet.addRow({ property: 'Monto Objetivo', value: `$${event.targetAmount.toFixed(2)}` });
    eventSheet.addRow({ property: 'Monto Actual', value: `$${event.currentAmount.toFixed(2)}` });
    eventSheet.addRow({ property: 'Estado', value: event.status });
    eventSheet.addRow({ property: 'Creado Por', value: event.createdBy.name });
    eventSheet.addRow({ property: 'Fecha de Creación', value: new Date(event.createdAt).toLocaleDateString() });
    
    // Crear una hoja para los pagos
    const paymentsSheet = workbook.addWorksheet('Pagos');
    
    // Agregar encabezados para la hoja de pagos
    paymentsSheet.columns = [
      { header: 'ID', key: 'id', width: 25 },
      { header: 'Cliente', key: 'clientName', width: 25 },
      { header: 'ID Cliente', key: 'clientId', width: 15 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Método de Pago', key: 'paymentMethod', width: 15 },
      { header: 'Registrado Por', key: 'createdBy', width: 25 },
    ];
    
    // Agregar datos de pagos
    filteredPayments.forEach(payment => {
      paymentsSheet.addRow({
        id: payment._id.toString(),
        clientName: payment.clientName,
        clientId: payment.clientId,
        amount: payment.amount,
        date: new Date(payment.date).toLocaleDateString(),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdBy: payment.createdBy ? payment.createdBy.name : 'N/A',
      });
    });
    
    // Crear una hoja para el resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    
    // Agregar encabezados para la hoja de resumen
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    
    // Calcular métricas
    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const progressPercentage = (event.currentAmount / event.targetAmount) * 100;
    
    // Agregar datos de resumen
    summarySheet.addRow({ metric: 'Total de Pagos', value: totalPayments });
    summarySheet.addRow({ metric: 'Monto Total Recaudado', value: `$${totalAmount.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Monto Objetivo', value: `$${event.targetAmount.toFixed(2)}` });
    summarySheet.addRow({ metric: 'Progreso', value: `${progressPercentage.toFixed(2)}%` });
    
    // Configurar el nombre del archivo
    const fileName = `Reporte_Evento_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Configurar la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Enviar el archivo
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addPaymentToEvent,
  generateEventReport,
};