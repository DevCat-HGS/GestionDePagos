import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import Message from '../components/Message';

const PendingApprovalScreen = () => {
  // Limpiar la información del usuario del localStorage
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="text-center" style={{ maxWidth: '600px' }}>
        <Card.Header as="h3">
          <FaExclamationTriangle className="text-warning me-2" />
          Cuenta Pendiente de Aprobación
        </Card.Header>
        <Card.Body>
          <Message variant="warning">
            Su cuenta está pendiente de aprobación por un administrador.
          </Message>
          
          <Card.Text className="my-4">
            Gracias por registrarse en nuestro sistema. Su cuenta ha sido creada correctamente, 
            pero actualmente se encuentra en estado de revisión. Un administrador debe aprobar 
            su cuenta antes de que pueda acceder al sistema.
          </Card.Text>
          
          <Card.Text>
            Este proceso puede tomar algún tiempo. Por favor, vuelva a intentar iniciar sesión más tarde.
          </Card.Text>
          
          <Row className="mt-4">
            <Col>
              <Link to="/login">
                <Button variant="primary" onClick={handleLogout}>
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="text-muted">
          Si tiene alguna pregunta, por favor contacte al administrador del sistema.
        </Card.Footer>
      </Card>
    </div>
  );
};

export default PendingApprovalScreen;