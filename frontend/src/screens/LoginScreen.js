import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { userInfo, loading, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // La navegación se maneja dentro del contexto de autenticación
    } catch (error) {
      setError(
        error.message || 'Error al iniciar sesión'
      );
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