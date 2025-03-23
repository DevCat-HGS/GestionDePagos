import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { loginUser } from '../services/api';

const LoginScreen = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await loginUser(email, password);
      
      // Verificar si el usuario está pendiente de aprobación
      if (data.approvalStatus === 'pending') {
        // Guardar información del usuario para mostrar datos en la pantalla de espera
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/pending-approval');
        return;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al iniciar sesión'
      );
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FormContainer>
      <h1 className="my-4 text-center">Iniciar Sesión</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Form onSubmit={submitHandler} className="auth-form">
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
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        
        <Button variant="primary" type="submit" className="w-100 mt-3">
          Iniciar Sesión
        </Button>
      </Form>
      
      <Row className="py-3 text-center">
        <Col>
          ¿No tiene una cuenta? <Link to="/register">Regístrese aquí</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;