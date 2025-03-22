const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del evento'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Por favor ingrese la fecha de inicio del evento'],
    },
    endDate: {
      type: Date,
      required: [true, 'Por favor ingrese la fecha de finalización del evento'],
    },
    collectionFrequency: {
      type: String,
      required: true,
      enum: ['diario', 'semanal', 'ninguno'],
      default: 'ninguno',
    },
    targetAmount: {
      type: Number,
      required: [true, 'Por favor ingrese el monto objetivo del evento'],
      min: [0, 'El monto no puede ser negativo'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'El monto no puede ser negativo'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pendiente', 'en_progreso', 'finalizado', 'cancelado'],
      default: 'pendiente',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware para actualizar el estado del evento basado en las fechas
eventSchema.pre('save', function (next) {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'pendiente';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'en_progreso';
  } else if (now > this.endDate) {
    this.status = 'finalizado';
  }
  
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;