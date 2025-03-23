import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import PaymentListScreen from './screens/PaymentListScreen';
import PaymentCreateScreen from './screens/PaymentCreateScreen';
import PaymentEditScreen from './screens/PaymentEditScreen';
import PaymentDetailScreen from './screens/PaymentDetailScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';
import NotFoundScreen from './screens/NotFoundScreen';
// Event Screens
import EventListScreen from './screens/EventListScreen';
import EventCreateScreen from './screens/EventCreateScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import EventEditScreen from './screens/EventEditScreen';
import EventReportScreen from './screens/EventReportScreen';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/payments" element={<PaymentListScreen />} />
            <Route path="/payments/create" element={<PaymentCreateScreen />} />
            <Route path="/payments/:id" element={<PaymentDetailScreen />} />
            <Route path="/payments/:id/edit" element={<PaymentEditScreen />} />
            <Route path="/users" element={<UserListScreen />} />
            <Route path="/users/:id/edit" element={<UserEditScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/reports" element={<ReportScreen />} />
            {/* Rutas de Eventos */}
            <Route path="/events" element={<EventListScreen />} />
            <Route path="/events/create" element={<EventCreateScreen />} />
            <Route path="/events/:id" element={<EventDetailScreen />} />
            <Route path="/events/:id/edit" element={<EventEditScreen />} />
            <Route path="/events/report" element={<EventReportScreen />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App;