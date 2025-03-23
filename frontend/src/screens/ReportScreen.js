import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';

const ReportScreen = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('payments');
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
  
  const generatePaymentReport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor seleccione un rango de fechas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        responseType: 'blob',
      };
      
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      
      const response = await axios.get(`/api/payments/report?${params}`, config);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a link element to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporte_pagos_${today}.xlsx`);
      
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
  
  const generateUserReport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor seleccione un rango de fechas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        responseType: 'blob',
      };
      
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(`/api/users/report?${params}`, config);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a link element to download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporte_usuarios_${today}.xlsx`);
      
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
  
  const handleGenerateReport = () => {
    if (activeTab === 'payments') {
      generatePaymentReport();
    } else if (activeTab === 'events') {
      navigate('/events/report');
    } else if (activeTab === 'users') {
      generateUserReport();
    }
  };
  
  return (
    <>
      <h1 className="mb-4">Reportes</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Card className="mb-4">
        <Card.Header>
          <Nav variant="tabs" defaultActiveKey="payments">
            <Nav.Item>
              <Nav.Link 
                eventKey="payments" 
                onClick={() => setActiveTab('payments')}
              >
                Pagos
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="events" 
                onClick={() => setActiveTab('events')}
              >
                Eventos
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="users" 
                onClick={() => setActiveTab('users')}
              >
                Usuarios
              </Nav.Link>
            </Nav.Item>
          </Nav>
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
              {activeTab === 'payments' && (
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="status">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleGenerateReport}>
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
            Para generar un reporte, seleccione el tipo de reporte, un rango de fechas y opcionalmente
            filtre por estado. El reporte se descargará como un archivo Excel que contiene
            la información relevante según el tipo de reporte seleccionado.
          </p>
          <ul>
            <li><strong>Reporte de Pagos:</strong> Incluye información sobre los pagos realizados en el período seleccionado.</li>
            <li><strong>Reporte de Eventos:</strong> Muestra los eventos y su progreso financiero.</li>
            <li><strong>Reporte de Usuarios:</strong> Contiene información sobre los usuarios registrados en el sistema.</li>
          </ul>
          <p>
            Estos reportes son útiles para llevar un control de las operaciones financieras,
            facilitando la toma de decisiones y la rendición de cuentas.
          </p>
        </Card.Body>
      </Card>
    </>
  );
};

export default ReportScreen;