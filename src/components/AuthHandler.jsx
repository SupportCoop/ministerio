import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthHandler = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const isAuthRoute = location.pathname === '/login' || location.pathname === '/admin-login' || location.pathname === '/register';

      if (isAuthenticated) {
        if (isAuthRoute) {
          navigate(user.userType === 'admin' ? '/admin' : '/');
        }
      } else {
        if (location.pathname.startsWith('/admin') && location.pathname !== '/admin-login') {
          navigate('/admin-login');
        } else if (location.pathname === '/profile') {
          navigate('/login');
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate, location]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return children;
};

export default AuthHandler;