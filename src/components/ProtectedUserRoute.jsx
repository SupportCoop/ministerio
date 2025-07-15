// components/ProtectedUserRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminAuthService from '../services/adminAuth';

const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Si no es usuario regular autenticado, redirigir al login
  if (!isAuthenticated || !user || user.userType === 'admin') {
    console.log('🚫 Acceso denegado: Usuario no autenticado o es admin');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Acceso permitido para usuario:', user.email);
  return children;
};

export default ProtectedUserRoute;