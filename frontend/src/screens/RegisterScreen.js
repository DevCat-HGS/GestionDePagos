import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { registerUser } from '../services/api';

const RegisterScreen = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await registerUser(name, email, password);
      toast.success('Registro exitoso. Por favor espere la aprobación del administrador.');
      navigate('/login');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al registrarse'
      );
      toast.error('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FormContainer>
      <h1 className="my-4 text-center">Registrarse</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      
      <Form onSubmit={submitHandler} className="auth-form">
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
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirme su contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>
        
        <Button variant="primary" type="submit" className="w-100 mt-3">
          Registrarse
        </Button>
      </Form>
      
      <Row className="py-3 text-center">
        <Col>
          ¿Ya tiene una cuenta? <Link to="/login">Inicie sesión aquí</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;