import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Table, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FilterBox from '../components/FilterBox';
import axios from 'axios';

const EventListScreen = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        // Build query params
        const params = new URLSearchParams();
        if (filters.name) params.append('name', filters.name);
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const { data } = await axios.get(`/api/events?${params}`, config);
        setEvents(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los eventos'
        );
        toast.error('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [filters]);
  
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
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      name: '',
      status: '',
      startDate: '',
      endDate: '',
    });
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
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Eventos</h1>
        </Col>
        <Col className="text-end">
          {localStorage.getItem('userInfo') && 
            JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
            <Link to="/events/create">
              <Button variant="primary">
                <FaPlus className="me-2" /> Crear Evento
              </Button>
            </Link>
          )}
        </Col>
      </Row>
      
      <Card className="mb-4">
        <Card.Header>
          <h4>Filtros</h4>
        </Card.Header>
        <Card.Body>
          <FilterBox>
            <Row>
              <Col md={3}>
                <FilterBox.Field
                  label="Nombre"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </Col>
              <Col md={3}>
                <FilterBox.Field
                  label="Estado"
                  name="status"
                  as="select"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </FilterBox.Field>
              </Col>
              <Col md={3}>
                <FilterBox.Field
                  label="Fecha Inicio"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Col>
              <Col md={3}>
                <FilterBox.Field
                  label="Fecha Fin"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="d-flex justify-content-end">
                <Button variant="secondary" onClick={resetFilters} className="me-2">
                  Limpiar
                </Button>
              </Col>
            </Row>
          </FilterBox>
        </Card.Body>
      </Card>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {events.length === 0 ? (
            <Message>No se encontraron eventos</Message>
          ) : (
            <Table striped bordered hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Monto Objetivo</th>
                  <th>Monto Actual</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>
                    <td>{formatDate(event.startDate)}</td>
                    <td>{formatDate(event.endDate)}</td>
                    <td>{formatCurrency(event.targetAmount)}</td>
                    <td>{formatCurrency(event.currentAmount)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(event.status)}`}>
                        {formatStatus(event.status)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/events/${event._id}`} className="btn btn-info btn-sm me-2">
                        <FaEye />
                      </Link>
                      {localStorage.getItem('userInfo') && 
                        JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
                        <Link to={`/events/${event._id}/edit`} className="btn btn-warning btn-sm">
                          <FaEdit />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
};

export default EventListScreen;