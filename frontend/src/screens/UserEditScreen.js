import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';

const UserEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
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
      toast.error('Acceso denegado. Solo administradores pueden editar usuarios.');
    }
  }, [navigate]);
  
  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`/api/users/${id}`, config);
        
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setIsApproved(data.isApproved);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar los detalles del usuario'
        );
        toast.error('Error al cargar los detalles del usuario');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    
    setUpdateLoading(true);
    setError('');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put(`/api/users/${id}`, {
        name,
        email,
        isAdmin,
        isApproved,
      }, config);
      
      toast.success('Usuario actualizado correctamente');
      navigate('/users');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al actualizar el usuario'
      );
      toast.error('Error al actualizar el usuario');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <>
      <Link to="/users" className="btn btn-light my-3">
        <FaArrowLeft className="me-2" /> Volver
      </Link>
      
      <h1 className="mb-4">Editar Usuario</h1>
      
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
                  <Form.Label>Nombre Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese el correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="isAdmin">
                  <Form.Check
                    type="checkbox"
                    label="Es Administrador"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="isApproved">
                  <Form.Check
                    type="checkbox"
                    label="Está Aprobado"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/users')}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Actualizar Usuario
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

export default UserEditScreen;