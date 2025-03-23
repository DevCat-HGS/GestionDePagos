import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getPaymentById, updatePayment } from '../services/api';

const PaymentEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
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
      toast.error('Acceso denegado. Solo administradores pueden editar pagos.');
    }
  }, [navigate]);
  
  // Fetch payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const { data } = await getPaymentById(id);
        
        setClientName(data.clientName);
        setClientId(data.clientId);
        setAmount(data.amount);
        setDate(data.date ? new Date(data.date).toISOString().split('T')[0] : '');
        setStatus(data.status);
        setPaymentMethod(data.paymentMethod);
        setNotes(data.notes || '');
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los detalles del pago'
        );
        toast.error('Error al cargar los detalles del pago');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [id]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!clientName || !clientId || !amount) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    
    setUpdateLoading(true);
    setError('');
    
    try {
      await updatePayment(id, {
        clientName,
        clientId,
        amount: Number(amount),
        date: date || new Date(),
        status,
        paymentMethod,
        notes,
      });
      
      toast.success('Pago actualizado correctamente');
      navigate(`/payments/${id}`);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al actualizar el pago'
      );
      toast.error('Error al actualizar el pago');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <>
      <Link to={`/payments/${id}`} className="btn btn-light my-3">
        <FaArrowLeft className="me-2" /> Volver
      </Link>
      
      <h1 className="mb-4">Editar Pago</h1>
      
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
                    <option value="completado">Completado</option>
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
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="notes">
                  <Form.Label>Notas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ingrese notas adicionales"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate(`/payments/${id}`)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Actualizar Pago
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

export default PaymentEditScreen;