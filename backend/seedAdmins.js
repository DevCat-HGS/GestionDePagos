//node backend/seedAdmins.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Administradores predefinidos
const admins = [
  {
    name: 'Harold',
    email: 'adminhgs@adso.com',
    password: 'harold123',
    role: 'admin',
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Instructor Elvis',
    email: 'elvisvergara@adso.com',
    password: '123elvis',
    role: 'admin',
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Juan Andres',
    email: 'andres@adso.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved'
  }
];

// Función para importar los administradores
const importAdmins = async () => {
  try {
    // Limpiar administradores existentes (opcional)
    // await User.deleteMany({ role: 'admin' });
    
    console.log('Verificando administradores existentes...');
    
    // Verificar y crear cada administrador
    for (const admin of admins) {
      const userExists = await User.findOne({ email: admin.email });
      
      if (userExists) {
        console.log(`El administrador ${admin.email} ya existe.`);
      } else {
        await User.create(admin);
        console.log(`Administrador ${admin.email} creado exitosamente.`);
      }
    }
    
    console.log('Proceso de importación de administradores completado.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Ejecutar la función
importAdmins();