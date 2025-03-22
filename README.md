# GestionDePagos

## Descripción del Proyecto
Sistema de gestión de pagos que permite registrar y dar seguimiento a los pagos diarios (de lunes a viernes), generar informes semanales y exportar datos a Excel con formato personalizado.

## Tecnologías Utilizadas

### Base de Datos
- MongoDB (inicialmente con MongoDB Compass)
- Esquemas para usuarios, pagos y registros semanales

### Frontend
- HTML5
- CSS3
- Bootstrap
- JavaScript
- Calendario interactivo para visualización de pagos

### Backend
- Node.js
- Express.js
- API RESTful para gestión de datos

### Características Adicionales
- ExcelJS para generación de informes personalizados
- Autenticación de usuarios
- Interfaz responsiva

## Funcionalidades Principales

### Registro de Pagos
- Captura de pagos diarios (lunes a viernes)
- Registro de información del cliente
- Validación de datos en tiempo real

### Calendario de Pagos
- Vista semanal y mensual
- Filtrado por estado de pago (pagado/pendiente)
- Búsqueda de clientes específicos

### Generación de Informes
- Selección de rango de fechas
- Exportación a Excel con formato personalizado (colores, encabezados, etc.)
- Estadísticas de pagos (totales, promedios, pendientes)

## Estructura del Proyecto
- `/frontend`: Archivos HTML, CSS y JavaScript del cliente
- `/backend`: Código de servidor Node.js y Express
- `/models`: Esquemas de MongoDB
- `/controllers`: Lógica de negocio
- `/routes`: Endpoints de la API
- `/utils`: Utilidades, incluyendo generación de Excel

## Requisitos de Instalación
- Node.js (v14 o superior)
- MongoDB
- NPM o Yarn

## Configuración Inicial
1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno
4. Iniciar MongoDB
5. Ejecutar el servidor: `npm start`

## Desarrollo Futuro
- Implementación de notificaciones
- Panel de administración avanzado
- Aplicación móvil complementaria