import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';

const EventCreateScreen = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collectionFrequency, setCollectionFrequency] = useState('ninguno');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is logged in and is admin
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userInfo);
    if (!user.isAdmin) {
      navigate('/');
      toast.error('Acceso denegado. Solo administradores pueden crear eventos.');
    }
  }, [navigate]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !startDate || !endDate || !targetAmount) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de finalización');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.post('/api/events', {
        name,
        description,
        startDate,
        endDate,
        collectionFrequency,
        targetAmount: Number(targetAmount),
      }, config);
      
      toast.success('Evento creado correctamente');
      navigate('/events');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al crear el evento'
      );
      toast.error('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h1 className="mb-4">Crear Nuevo Evento</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre del Evento *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del evento"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingrese una descripción del evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="startDate">
              <Form.Label>Fecha de Inicio *</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="endDate">
              <Form.Label>Fecha de Finalización *</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="collectionFrequency">
              <Form.Label>Frecuencia de Recolección</Form.Label>
              <Form.Select
                value={collectionFrequency}
                onChange={(e) => setCollectionFrequency(e.target.value)}
              >
                <option value="ninguno">Ninguna</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="targetAmount">
              <Form.Label>Monto Objetivo *</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el monto objetivo del evento"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/events')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Evento
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default EventCreateScreen;