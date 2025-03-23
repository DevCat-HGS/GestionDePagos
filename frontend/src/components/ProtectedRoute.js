import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.adminOnly - Si la ruta es solo para administradores
 * @returns {JSX.Element} - Componente renderizado
 */
const ProtectedRoute = ({ adminOnly = false }) => {
  const { userInfo, isAdmin } = useAuth();
  
  // Si no hay usuario autenticado, redirigir al login
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // Si la ruta es solo para administradores y el usuario no es admin, redirigir al dashboard
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si el usuario está pendiente de aprobación, redirigir a la página de espera
  if (userInfo.approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }
  
  // Si el usuario está rechazado, redirigir al login
  if (userInfo.approvalStatus === 'rejected') {
    return <Navigate to="/login" replace />;
  }
  
  // Si todo está bien, renderizar el componente hijo
  return <Outlet />;
};

export default ProtectedRoute;