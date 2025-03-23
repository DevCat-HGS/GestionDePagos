import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import axios from 'axios';

const ProfileScreen = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/users/profile', config);
        
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Error al cargar el perfil'
        );
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
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
      
      const { data } = await axios.put('/api/users/profile', {
        name,
        email,
        password: password ? password : undefined,
      }, config);
      
      // Update localStorage with new user info
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        name: data.name,
        email: data.email,
      }));
      
      toast.success('Perfil actualizado correctamente');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al actualizar el perfil'
      );
      toast.error('Error al actualizar el perfil');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  return (
    <>
      <Row>
        <Col md={6} className="mx-auto">
          <h1 className="mb-4">Mi Perfil</h1>
          
          {error && <Message variant="danger">{error}</Message>}
          {loading ? (
            <Loader />
          ) : (
            <>
              {updateLoading && <Loader />}
              
              <Card className="mb-4">
                <Card.Body>
                  <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>Nombre Completo</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese su nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Ingrese su correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Ingrese nueva contraseña (opcional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        Deje en blanco para mantener la contraseña actual
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirmar Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirme nueva contraseña (opcional)"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit">
                      Actualizar Perfil
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ProfileScreen;