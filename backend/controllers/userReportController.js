const User = require('../models/userModel');
const ExcelJS = require('exceljs');

// @desc    Generar reporte de usuarios en formato Excel
// @route   GET /api/users/report
// @access  Private/Admin
const generateUserReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir filtros
    const filters = {};
    
    // Filtrar por fecha de creación si se proporcionan fechas
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    // Obtener usuarios según los filtros (excluyendo la contraseña)
    const users = await User.find(filters).select('-password');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios con los filtros proporcionados' });
    }
    
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Pagos';
    workbook.created = new Date();
    
    // Crear una hoja de trabajo
    const worksheet = workbook.addWorksheet('Reporte de Usuarios');
    
    // Definir encabezados
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Rol', key: 'role', width: 15 },
      { header: 'Estado', key: 'isApproved', width: 15 },
      { header: 'Fecha de Registro', key: 'createdAt', width: 20 },
    ];
    
    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Agregar datos
    users.forEach(user => {
      worksheet.addRow({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved ? 'Aprobado' : 'Pendiente',
        createdAt: new Date(user.createdAt).toLocaleDateString(),
      });
    });
    
    // Aplicar estilos condicionales
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Omitir encabezados
        // Obtener el valor de la celda de estado
        const statusCell = row.getCell('isApproved');
        
        // Aplicar color según el estado
        if (statusCell.value === 'Aprobado') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
          statusCell.font = { color: { argb: '006100' } };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' } };
          statusCell.font = { color: { argb: '9C5700' } };
        }
      }
    });
    
    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_usuarios.xlsx');
    
    // Enviar el archivo Excel
    await workbook.xlsx.write(res);
    res.status(200).end();
    
  } catch (error) {
    console.error('Error al generar reporte de usuarios:', error);
    res.status(500).json({ message: 'Error al generar el reporte de usuarios' });
  }
};

module.exports = { generateUserReport };