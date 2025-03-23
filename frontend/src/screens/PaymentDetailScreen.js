import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import { getPaymentById } from '../services/api';

const PaymentDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const { data } = await getPaymentById(id);
        setPayment(data);
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
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <>
      <Link to="/payments" className="btn btn-light my-3">
        <FaArrowLeft className="me-2" /> Volver
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row className="align-items-center mb-3">
            <Col>
              <h1>Detalles del Pago</h1>
            </Col>
            <Col className="text-end">
              {localStorage.getItem('userInfo') && 
                JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
                <Link to={`/payments/${id}/edit`}>
                  <Button variant="warning">
                    <FaEdit className="me-2" /> Editar
                  </Button>
                </Link>
              )}
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Información del Pago</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>ID del Pago:</strong></Col>
                        <Col md={8}>{payment._id}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Cliente:</strong></Col>
                        <Col md={8}>{payment.clientName}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>ID del Cliente:</strong></Col>
                        <Col md={8}>{payment.clientId}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Monto:</strong></Col>
                        <Col md={8}>{formatCurrency(payment.amount)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Fecha:</strong></Col>
                        <Col md={8}>{formatDate(payment.date)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Estado:</strong></Col>
                        <Col md={8}>
                          <PaymentStatusBadge status={payment.status} />
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Método de Pago:</strong></Col>
                        <Col md={8}>
                          {payment.paymentMethod.charAt(0).toUpperCase() + 
                            payment.paymentMethod.slice(1)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {payment.notes && (
                      <ListGroup.Item>
                        <Row>
                          <Col md={4}><strong>Notas:</strong></Col>
                          <Col md={8}>{payment.notes}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Información Adicional</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col><strong>Creado por:</strong></Col>
                      </Row>
                      <Row>
                        <Col>
                          {payment.createdBy ? (
                            <>
                              {payment.createdBy.name} <br />
                              <small className="text-muted">{payment.createdBy.email}</small>
                            </>
                          ) : (
                            'Usuario no disponible'
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col><strong>Semana:</strong></Col>
                      </Row>
                      <Row>
                        <Col>
                          {payment.weekNumber ? (
                            <>Semana {payment.weekNumber} de {payment.year}</>
                          ) : (
                            'No disponible'
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default PaymentDetailScreen;