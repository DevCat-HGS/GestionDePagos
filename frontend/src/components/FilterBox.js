import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

const FilterBox = ({ onFilter }) => {
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      clientName,
      clientId,
      status,
      startDate,
      endDate,
    });
  };
  
  const handleReset = () => {
    setClientName('');
    setClientId('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    onFilter({});
  };
  
  return (
    <Form onSubmit={handleSubmit} className="filter-form mb-4">
      <Row className="mb-3">
        <Form.Group as={Col} md={4}>
          <Form.Label>Nombre del Cliente</Form.Label>
          <Form.Control
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre del cliente"
          />
        </Form.Group>
        
        <Form.Group as={Col} md={4}>
          <Form.Label>ID del Cliente</Form.Label>
          <Form.Control
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="ID del cliente"
          />
        </Form.Group>
        
        <Form.Group as={Col} md={4}>
          <Form.Label>Estado</Form.Label>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelado">Cancelado</option>
          </Form.Select>
        </Form.Group>
      </Row>
      
      <Row className="mb-3">
        <Form.Group as={Col} md={6}>
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group as={Col} md={6}>
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>
      </Row>
      
      <div className="d-flex justify-content-end">
        <Button variant="secondary" className="me-2" onClick={handleReset}>
          Limpiar
        </Button>
        <Button variant="primary" type="submit">
          Filtrar
        </Button>
      </div>
    </Form>
  );
};

export default FilterBox;