import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, Table } from 'react-bootstrap';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import axios from 'axios';

const EventDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`/api/events/${id}`, config);
        setEvent(data);
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
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-warning';
      case 'en_progreso':
        return 'bg-primary';
      case 'finalizado':
        return 'bg-success';
      case 'cancelado':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };
  
  // Format collection frequency for display
  const formatCollectionFrequency = (frequency) => {
    switch (frequency) {
      case 'diario':
        return 'Diario';
      case 'semanal':
        return 'Semanal';
      case 'ninguno':
        return 'Ninguna';
      default:
        return frequency;
    }
  };
  
  return (
    <>
      <Link to="/events" className="btn btn-light my-3">
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
              <h1>Detalles del Evento</h1>
            </Col>
            <Col className="text-end">
              {localStorage.getItem('userInfo') && 
                JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
                <Link to={`/events/${id}/edit`}>
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
                  <h4>Información del Evento</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>ID del Evento:</strong></Col>
                        <Col md={8}>{event._id}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Nombre:</strong></Col>
                        <Col md={8}>{event.name}</Col>
                      </Row>
                    </ListGroup.Item>
                    {event.description && (
                      <ListGroup.Item>
                        <Row>
                          <Col md={4}><strong>Descripción:</strong></Col>
                          <Col md={8}>{event.description}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Fecha de Inicio:</strong></Col>
                        <Col md={8}>{formatDate(event.startDate)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Fecha de Finalización:</strong></Col>
                        <Col md={8}>{formatDate(event.endDate)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Frecuencia de Recolección:</strong></Col>
                        <Col md={8}>{formatCollectionFrequency(event.collectionFrequency)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Monto Objetivo:</strong></Col>
                        <Col md={8}>{formatCurrency(event.targetAmount)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Monto Actual:</strong></Col>
                        <Col md={8}>{formatCurrency(event.currentAmount)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={4}><strong>Estado:</strong></Col>
                        <Col md={8}>
                          <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                            {formatStatus(event.status)}
                          </span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
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
                          {event.createdBy ? (
                            <>
                              {event.createdBy.name} <br />
                              <small className="text-muted">{event.createdBy.email}</small>
                            </>
                          ) : (
                            'Usuario no disponible'
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col><strong>Progreso:</strong></Col>
                      </Row>
                      <Row>
                        <Col>
                          <div className="progress">
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${(event.currentAmount / event.targetAmount) * 100}%` }}
                              aria-valuenow={(event.currentAmount / event.targetAmount) * 100}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {Math.round((event.currentAmount / event.targetAmount) * 100)}%
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {event.payments && event.payments.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Pagos Asociados</h4>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>ID Cliente</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Método</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{payment.clientName}</td>
                        <td>{payment.clientId}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{formatDate(payment.date)}</td>
                        <td>
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                        <td>
                          {payment.paymentMethod.charAt(0).toUpperCase() + 
                            payment.paymentMethod.slice(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default EventDetailScreen;