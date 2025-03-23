import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Card } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';

const UserListScreen = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
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
      toast.error('Acceso denegado. Solo administradores pueden ver esta página.');
    }
  }, [navigate]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/users', config);
        setUsers(data);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los usuarios'
        );
        toast.error('Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle user deletion
  const deleteHandler = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/users/${id}`, config);
        toast.success('Usuario eliminado correctamente');
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al eliminar el usuario'
        );
      }
    }
  };
  
  // Handle user approval
  const approveHandler = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put(`/api/users/${id}/approve`, {}, config);
      toast.success('Usuario aprobado correctamente');
      
      // Update user list
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, isApproved: true } : user
        )
      );
    } catch (error) {
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al aprobar el usuario'
      );
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Usuarios</h1>
        </Col>
        <Col className="text-end">
          <Link to="/register">
            <Button variant="primary">
              <FaUserPlus className="btn-icon" /> Crear Usuario
            </Button>
          </Link>
        </Col>
      </Row>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Card>
          <Card.Body>
            {users.length === 0 ? (
              <Message>No se encontraron usuarios</Message>
            ) : (
              <div className="table-responsive">
                <Table striped hover responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>EMAIL</th>
                      <th>ADMIN</th>
                      <th>APROBADO</th>
                      <th>FECHA REGISTRO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user._id.substring(user._id.length - 6)}</td>
                        <td>{user.name}</td>
                        <td>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </td>
                        <td>
                          {user.isAdmin ? (
                            <i className="fas fa-check text-success"></i>
                          ) : (
                            <i className="fas fa-times text-danger"></i>
                          )}
                        </td>
                        <td>
                          {user.isApproved ? (
                            <span className="badge bg-success">Aprobado</span>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => approveHandler(user._id)}
                            >
                              Aprobar
                            </Button>
                          )}
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <Link to={`/users/${user._id}/edit`}>
                            <Button variant="warning" size="sm" className="me-2">
                              <FaEdit />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteHandler(user._id)}
                          >
                            <FaTrash />
                          </Button>
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

export default UserListScreen;