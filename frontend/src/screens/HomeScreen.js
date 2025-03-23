import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { FaUsers, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';

const HomeScreen = () => {
  // Check if user is logged in
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  return (
    <>
      <div className="jumbotron bg-light p-5 rounded mb-4">
        <h1 className="display-4">Sistema de Gestión de Pagos SENA</h1>
        <p className="lead">
          Plataforma para el registro y seguimiento de pagos diarios
        </p>
        {!userInfo ? (
          <div className="mt-4">
            <Link to="/login">
              <Button variant="primary" className="me-3">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline-primary">
                Registrarse
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <Link to="/payments">
              <Button variant="primary">
                Ver Pagos
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <FaMoneyBillWave size={50} className="mb-3 text-primary" />
              <Card.Title>Gestión de Pagos</Card.Title>
              <Card.Text>
                Registre y dé seguimiento a los pagos diarios de manera eficiente y organizada.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <FaUsers size={50} className="mb-3 text-primary" />
              <Card.Title>Administración de Usuarios</Card.Title>
              <Card.Text>
                Gestione los usuarios del sistema con diferentes niveles de acceso y permisos.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <FaChartBar size={50} className="mb-3 text-primary" />
              <Card.Title>Reportes y Estadísticas</Card.Title>
              <Card.Text>
                Genere informes detallados y visualice estadísticas para una mejor toma de decisiones.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h3>Acerca del Sistema</h3>
              <p>
                El Sistema de Gestión de Pagos SENA es una plataforma diseñada para facilitar el registro y seguimiento de pagos diarios. 
                Permite a los administradores gestionar usuarios, registrar pagos, generar reportes y visualizar estadísticas.
              </p>
              <p>
                Los usuarios regulares pueden consultar sus pagos y generar reportes según sus necesidades.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HomeScreen;