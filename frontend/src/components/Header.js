import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { userInfo, logout, isAdmin } = useAuth();
  
  const logoutHandler = () => {
    logout();
  };

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Gestión de Pagos SENA</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  {isAdmin() && (
                    <NavDropdown title="Admin" id="adminmenu">
                      <LinkContainer to="/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/users">
                        <NavDropdown.Item>Usuarios</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/payments/create">
                        <NavDropdown.Item>Crear Pago</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/reports">
                        <NavDropdown.Item>Reportes de Pagos</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/events">
                        <NavDropdown.Item>Eventos</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/events/create">
                        <NavDropdown.Item>Crear Evento</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/events/report">
                        <NavDropdown.Item>Reportes de Eventos</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Perfil</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/payments">
                      <NavDropdown.Item>Pagos</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Cerrar Sesión
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <i className="fas fa-user"></i> Iniciar Sesión
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>
                      <i className="fas fa-user-plus"></i> Registrarse
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;