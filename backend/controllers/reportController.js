const Payment = require('../models/paymentModel');
const ExcelJS = require('exceljs');

// @desc    Generar reporte de pagos en formato Excel
// @route   GET /api/reports/excel
// @access  Private
const generateExcelReport = async (req, res) => {
  try {
    const { startDate, endDate, status, clientName, clientId } = req.query;
    
    // Construir filtros
    const filters = {};
    
    // Filtrar por rango de fechas
    if (startDate && endDate) {
      filters.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    // Filtrar por estado
    if (status) {
      filters.status = status;
    }
    
    // Filtrar por cliente
    if (clientName) {
      filters.clientName = { $regex: clientName, $options: 'i' };
    }
    
    // Filtrar por ID de cliente
    if (clientId) {
      filters.clientId = clientId;
    }
    
    // Obtener pagos según los filtros
    const payments = await Payment.find(filters)
      .sort({ date: 1 })
      .populate('createdBy', 'name email');
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pagos con los filtros proporcionados' });
    }
    
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Pagos';
    workbook.created = new Date();
    
    // Crear una hoja de trabajo
    const worksheet = workbook.addWorksheet('Reporte de Pagos');
    
    // Definir encabezados
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'clientName', width: 30 },
      { header: 'ID Cliente', key: 'clientId', width: 15 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Método de Pago', key: 'paymentMethod', width: 20 },
      { header: 'Notas', key: 'notes', width: 30 },
      { header: 'Creado Por', key: 'createdBy', width: 20 },
    ];
    
    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Agregar datos
    payments.forEach(payment => {
      worksheet.addRow({
        id: payment._id.toString(),
        clientName: payment.clientName,
        clientId: payment.clientId,
        amount: payment.amount,
        date: new Date(payment.date).toLocaleDateString(),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes || '',
        createdBy: payment.createdBy ? payment.createdBy.name : 'N/A',
      });
    });
    
    // Aplicar estilos condicionales
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Omitir encabezados
        // Obtener el valor de la celda de estado
        const statusCell = row.getCell('status');
        
        // Aplicar color según el estado
        if (statusCell.value === 'pagado') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
          statusCell.font = { color: { argb: '006100' } };
        } else if (statusCell.value === 'pendiente') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' }