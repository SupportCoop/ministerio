import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Or a spinner component
  }

  console.log('🛡️ AdminProtectedRoute check:', {
    isAuthenticated,
    user,
  });

  if (isAuthenticated && user && user.userType === 'admin') {
    console.log('✅ Acceso de admin autorizado para:', user.email);
    return children;
  }

  console.log('🚫 Acceso denegado: no es un administrador.');
  return <Navigate to="/admin-login" replace />;
};

// Componente de acceso denegado mejorado
const AccessDenied = () => {
  const { isAuthenticated, logout: userLogout } = useAuth();

  const handleAdminLogin = () => {
    // Si hay usuario regular autenticado, cerrar su sesión primero
    if (isAuthenticated) {
      console.log('🔄 Cerrando sesión de usuario antes de ir al login de admin');
      userLogout();
    }
    
    // Limpiar cualquier dato residual de admin
    adminAuthService.logout();
    
    // Redirigir al login de admin
    window.location.href = '/admin-login';
  };

  const handleLogoutAndGoHome = () => {
    // Cerrar todas las sesiones
    if (isAuthenticated) {
      userLogout();
    }
    adminAuthService.logout();
    
    // Ir al inicio
    window.location.href = '/';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      paddingTop: '6rem' // Para el header fijo
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%'
    },
    icon: {
      background: '#fee2e2',
      borderRadius: '50%',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem',
      color: '#dc2626'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    message: {
      color: '#64748b',
      fontSize: '1.1rem',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    warning: {
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '2rem',
      color: '#92400e',
      fontSize: '0.9rem'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      transition: 'all 0.3s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    secondaryButton: {
      background: '#f1f5f9',
      color: '#64748b',
      border: '2px solid #e2e8f0'
    },
    dangerButton: {
      background: '#ef4444',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          <AlertTriangle size={32} />
        </div>
        
        <h1 style={styles.title}>Acceso Denegado</h1>
        
        <p style={styles.message}>
          Esta página está restringida solo para administradores autenticados. 
          Necesitas credenciales de administrador válidas para acceder.
        </p>

        {isAuthenticated && (
          <div style={styles.warning}>
            ⚠️ Tienes una sesión de usuario regular activa. Debes cerrarla para iniciar sesión como administrador.
          </div>
        )}
        
        <div style={styles.buttons}>
          <button 
            onClick={handleAdminLogin}
            style={{...styles.button, ...styles.primaryButton}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Shield size={20} />
            Iniciar Sesión como Admin
          </button>
          
          {isAuthenticated && (
            <button 
              onClick={handleLogoutAndGoHome}
              style={{...styles.button, ...styles.dangerButton}}
              onMouseEnter={(e) => {
                e.target.style.background = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ef4444';
              }}
            >
              <LogOut size={20} />
              Cerrar Sesión y Salir
            </button>
          )}
          
          <a 
            href="/"
            style={{...styles.button, ...styles.secondaryButton}}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f1f5f9';
            }}
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminProtectedRoute;