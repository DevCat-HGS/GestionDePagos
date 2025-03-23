import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FilterBox from '../components/FilterBox';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import { getPayments, deletePayment } from '../services/api';

const PaymentListScreen = () => {
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await getPayments(filters);
      setPayments(data);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al cargar los pagos'
      );
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };
  
  // Load payments on component mount and when filters change
  useEffect(() => {
    fetchPayments();
  }, [filters]);
  
  // Handle filter changes
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Handle payment deletion
  const deleteHandler = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await deletePayment(id);
        toast.success('Pago eliminado correctamente');
        fetchPayments();
      } catch (error) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al eliminar el pago'
        );
      }
    }
  };
  
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
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Pagos</h1>
        </Col>
        <Col className="text-end">
          {localStorage.getItem('userInfo') && 
            JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
            <Link to="/payments/create">
              <Button variant="primary">
                <FaPlus className="btn-icon" /> Crear Pago
              </Button>
            </Link>
          )}
        </Col>
      </Row>
      
      <FilterBox onFilter={handleFilter} />
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Card>
          <Card.Body>
            {payments.length === 0 ? (
              <Message>No se encontraron pagos</Message>
            ) : (
              <div className="table-responsive">
                <Table striped hover responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CLIENTE</th>
                      <th>ID CLIENTE</th>
                      <th>FECHA</th>
                      <th>MONTO</th>
                      <th>MÉTODO</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{payment._id.substring(payment._id.length - 6)}</td>
                        <td>{payment.clientName}</td>
                        <td>{payment.clientId}</td>
                        <td>{formatDate(payment.date)}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>
                          {payment.paymentMethod.charAt(0).toUpperCase() +
                            payment.paymentMethod.slice(1)}
                        </td>
                        <td>
                          <PaymentStatusBadge status={payment.status} />
                        </td>
                        <td>
                          <Link to={`/payments/${payment._id}`}>
                            <Button variant="info" size="sm" className="me-2">
                              <FaEye />
                            </Button>
                          </Link>
                          {localStorage.getItem('userInfo') && 
                            JSON.parse(localStorage.getItem('userInfo')).isAdmin && (
                            <>
                              <Link to={`/payments/${payment._id}/edit`}>
                                <Button variant="warning" size="sm" className="me-2">
                                  <FaEdit />
                                </Button>
                              </Link>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => deleteHandler(payment._id)}
                              >
                                <FaTrash />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default PaymentListScreen;