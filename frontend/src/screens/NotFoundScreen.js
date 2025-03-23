import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';

const NotFoundScreen = () => {
  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Col xs={12} md={6} className="text-center">
        <h1 className="display-1 fw-bold text-primary mb-4">404</h1>
        <h2 className="mb-4">Página No Encontrada</h2>
        <p className="lead mb-5">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <FaHome className="me-2" /> Volver al Inicio
          </Button>
        </Link>
      </Col>
    </Row>
  );
};

export default NotFoundScreen;