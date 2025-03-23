import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { generateEventReport } from '../services/apiService';

const EventReportScreen = () => {
  const navigate = useNavigate();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor seleccione un rango de fechas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Preparar filtros para el reporte
      const filters = {
        startDate,
        endDate,
        status
      };
      
      // Llamar al servicio API centralizado
      const response = await generateEventReport(filters);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a link element to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporte_eventos_${today}.xlsx`);
      
      // Append to the document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Reporte generado correctamente');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al generar el reporte'
      );
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h1 className="mb-4">Reportes de Eventos</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Card className="mb-4">
        <Card.Header>
          <h4>Generar Reporte de Eventos</h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="startDate">
                  <Form.Label>Fecha Inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="endDate">
                  <Form.Label>Fecha Fin *</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={generateReport}>
                Generar Reporte Excel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h4>Instrucciones</h4>
        </Card.Header>
        <Card.Body>
          <p>
            Para generar un reporte de eventos, seleccione un rango de fechas y opcionalmente
            filtre por estado. El reporte se descargará como un archivo Excel que contiene
            la siguiente información:
          </p>
          <ul>
            <li>Nombre del evento</li>
            <li>Descripción</li>
            <li>Fecha de inicio y finalización</li>
            <li>Monto objetivo y monto actual recaudado</li>
            <li>Estado del evento</li>
            <li>Frecuencia de recolección</li>
            <li>Información del creador</li>
          </ul>
          <p>
            Este reporte es útil para llevar un control de los eventos y su progreso financiero,
            facilitando la toma de decisiones y la rendición de cuentas.  
          </p>
        </Card.Body>
      </Card>
    </>
  );
};

export default EventReportScreen;