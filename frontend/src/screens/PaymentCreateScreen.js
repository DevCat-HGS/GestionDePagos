import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { createPayment, getUsers } from '../services/api';
import { getEvents } from '../services/eventApi';
import { useAuth } from '../context/AuthContext';

const PaymentCreateScreen = () => {
  const navigate = useNavigate();
  const { userInfo, isAdmin } = useAuth();
  
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para usuarios y eventos
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [userError, setUserError] = useState('');
  const [eventError, setEventError] = useState('');
  
  // Check if user is logged in and is admin
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      navigate('/');
      toast.error('Acceso denegado. Solo administradores pueden crear pagos.');
      return;
    }
    
    // Cargar usuarios y eventos cuando el componente se monta
    fetchUsers();
    fetchEvents();
  }, [userInfo, isAdmin, navigate]);
  
  // Función para cargar usuarios
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError('');
    
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (error) {
      setUserError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al cargar los usuarios'
      );
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Función para cargar eventos
  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventError('');
    
    try {
      const { data } = await getEvents();
      setEvents(data);
    } catch (error) {
      setEventError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al cargar los eventos'
      );
      toast.error('Error al cargar los eventos');
    } finally {
      setLoadingEvents(false);
    }
  };
  
  // Manejar cambio de usuario seleccionado
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    
    if (userId) {
      const user = users.find(u => u._id === userId);
      if (user) {
        setClientName(user.name);
        setClientId(user._id);
      }
    } else {
      setClientName('');
      setClientId('');
    }
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!clientName || !clientId || !amount) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Usar el token del contexto de autenticación
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Crear objeto de pago con datos básicos
      const paymentData = {
        clientName,
        clientId,
        amount: Number(amount),
        date: date || new Date(),
        status,
        paymentMethod,
        notes,
      };
      
      // Si hay un evento seleccionado, añadirlo al pago
      if (selectedEvent) {
        paymentData.eventId = selectedEvent;
      }
      
      await createPayment(paymentData, config);
      
      toast.success('Pago creado correctamente');
      navigate('/payments');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al crear el pago'
      );
      toast.error('Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h1 className="mb-4">Crear Nuevo Pago</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={submitHandler}>
            {/* Selector de Usuario */}
            <Form.Group className="mb-3" controlId="selectedUser">
              <Form.Label>Seleccionar Usuario</Form.Label>
              {loadingUsers ? (
                <Loader size="sm" />
              ) : userError ? (
                <Message variant="danger">{userError}</Message>
              ) : (
                <Form.Select
                  value={selectedUser}
                  onChange={handleUserChange}
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Form.Select>
              )}
              <Form.Text className="text-muted">
                Seleccione un usuario o ingrese los datos manualmente
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="clientName">
              <Form.Label>Nombre del Cliente *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="clientId">
              <Form.Label>ID del Cliente *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el ID del cliente"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
            </Form.Group>
            
            {/* Selector de Evento */}
            <Form.Group className="mb-3" controlId="selectedEvent">
              <Form.Label>Asociar a Evento</Form.Label>
              {loadingEvents ? (
                <Loader size="sm" />
              ) : eventError ? (
                <Message variant="danger">{eventError}</Message>
              ) : (
                <Form.Select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">-- Seleccione un evento (opcional) --</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name} ({new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()})
                    </option>
                  ))}
                </Form.Select>
              )}
              <Form.Text className="text-muted">
                Asociar este pago a un evento (opcional)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label>Monto *</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el monto del pago"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="date">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="paymentMethod">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="notes">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Notas adicionales sobre el pago"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/payments')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Pago
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default PaymentCreateScreen;