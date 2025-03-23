import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser as apiLoginUser } from '../services/api';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar información del usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await apiLoginUser(email, password);
      
      // Verificar si el usuario está pendiente de aprobación
      if (data.approvalStatus === 'pending') {
        // Guardar información del usuario para mostrar datos en la pantalla de espera
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUserInfo(data);
        navigate('/pending-approval');
        return;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login');
    toast.success('Sesión cerrada correctamente');
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return userInfo && userInfo.role === 'admin';
  };

  // Valores proporcionados por el contexto
  const value = {
    userInfo,
    loading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;