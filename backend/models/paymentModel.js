
const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del cliente'],
      trim: true,
    },
    clientId: {
      type: String,
      required: [true, 'Por favor ingrese el ID del cliente'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Por favor ingrese el monto del pago'],
      min: [0, 'El monto no puede ser negativo'],
    },
    date: {
      type: Date,
      required: [true, 'Por favor ingrese la fecha del pago'],
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['pagado', 'pendiente', 'cancelado'],
      default: 'pendiente',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['efectivo', 'transferencia', 'tarjeta', 'otro'],
      default: 'efectivo',
    },
    notes: {
      type: String,
      trim: true,
    },
    // Campos para facilitar la búsqueda por semana
    weekNumber: {
      type: Number,
    },
    year: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para calcular y guardar el número de semana y año antes de guardar
paymentSchema.pre('save', function (next) {
  const paymentDate = new Date(this.date);
  
  // Calcular el número de semana
  const firstDayOfYear = new Date(paymentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (paymentDate - firstDayOfYear) / 86400000;
  this.weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Guardar el año
  this.year = paymentDate.getFullYear();
  
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;