import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EventEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo, isAdmin } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collectionFrequency, setCollectionFrequency] = useState('ninguno');
  const [targetAmount, setTargetAmount] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Check if user is logged in and is admin
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      navigate('/');
      toast.error('Acceso denegado. Solo administradores pueden editar eventos.');
    }
  }, [userInfo, isAdmin, navigate]);
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!userInfo) return;
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`/api/events/${id}`, config);
        
        setName(data.name);
        setDescription(data.description || '');
        setStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '');
        setEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '');
        setCollectionFrequency(data.collectionFrequency);
        setTargetAmount(data.targetAmount);
        setStatus(data.status);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los detalles del evento'
        );
        toast.error('Error al cargar los detalles del evento');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);
  
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
    
    setUpdateLoading(true);
    setError('');
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put(`/api/events/${id}`, {
        name,
        description,
        startDate,
        endDate,
        collectionFrequency,
        targetAmount: Number(targetAmount),
        status,
      }, config);
      
      toast.success('Evento actualizado correctamente');
      navigate(`/events/${id}`);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al actualizar el evento'
      );
      toast.error('Error al actualizar el evento');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <>
      <Link to={`/events/${id}`} className="btn btn-light my-3">
        <FaArrowLeft className="me-2" /> Volver
      </Link>
      
      <h1 className="mb-4">Editar Evento</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {updateLoading && <Loader />}
          
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
                
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(`/events/${id}`)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Actualizar Evento
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export default EventEditScreen;