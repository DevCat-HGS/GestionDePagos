import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { FaUsers, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import axios from 'axios';

// Create axios instance with base URL and auth token
const API = axios.create({
  baseURL: '/api',
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalEvents: 0,
    totalUsers: 0,
    recentPayments: [],
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para almacenar la información del usuario
  const [userInfo, setUserInfo] = useState(null);
  
  // Obtener información del usuario del localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  // Obtener datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const { data } = await API.get('/users/dashboard');
        setStats(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los datos del dashboard'
        );
        toast.error('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchDashboardData();
    }
  }, [userInfo]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
      <h1 className="mb-4">Dashboard {userInfo && userInfo.role === 'admin' ? 'Administrativo' : 'de Usuario'}</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        userInfo && (
        <>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3>{stats.totalPayments}</h3>
                      <p className="text-muted mb-0">Total Pagos</p>
                    </div>
                    <FaMoneyBillWave size={40} className="text-primary" />
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Link to="/payments" className="text-decoration-none">
                    Ver todos los pagos
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3>{stats.totalEvents}</h3>
                      <p className="text-muted mb-0">Total Eventos</p>
                    </div>
                    <FaCalendarAlt size={40} className="text-success" />
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Link to="/events" className="text-decoration-none">
                    Ver todos los eventos
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3>{stats.totalUsers}</h3>
                      <p className="text-muted mb-0">Total Usuarios</p>
                    </div>
                    <FaUsers size={40} className="text-info" />
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Link to="/users" className="text-decoration-none">
                    Ver todos los usuarios
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Pagos Recientes</h5>
                </Card.Header>
                <Card.Body>
                  {stats.recentPayments && stats.recentPayments.length === 0 ? (
                    <Message>No hay pagos recientes</Message>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentPayments &&
                            stats.recentPayments.map((payment) => (
                              <tr key={payment._id}>
                                <td>{payment.clientName}</td>
                                <td>{formatDate(payment.date)}</td>
                                <td>{formatCurrency(payment.amount)}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      payment.status === 'completado'
                                        ? 'success'
                                        : payment.status === 'pendiente'
                                        ? 'warning'
                                        : 'danger'
                                    }`}
                                  >
                                    {payment.status.charAt(0).toUpperCase() +
                                      payment.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Link to="/payments" className="text-decoration-none">
                    Ver todos los pagos
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Eventos Recientes</h5>
                </Card.Header>
                <Card.Body>
                  {stats.recentEvents && stats.recentEvents.length === 0 ? (
                    <Message>No hay eventos recientes</Message>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Fecha Inicio</th>
                            <th>Monto Objetivo</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentEvents &&
                            stats.recentEvents.map((event) => (
                              <tr key={event._id}>
                                <td>{event.name}</td>
                                <td>{formatDate(event.startDate)}</td>
                                <td>{formatCurrency(event.targetAmount)}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      event.status === 'finalizado'
                                        ? 'success'
                                        : event.status === 'en_progreso'
                                        ? 'primary'
                                        : event.status === 'pendiente'
                                        ? 'warning'
                                        : 'danger'
                                    }`}
                                  >
                                    {event.status.charAt(0).toUpperCase() +
                                      event.status.slice(1).replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Link to="/events" className="text-decoration-none">
                    Ver todos los eventos
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )
      )}
    </>
  );
};

export default DashboardScreen;