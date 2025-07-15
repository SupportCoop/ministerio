import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import adminAuthService from '../services/adminAuth';

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false); // Cambiado a false por defecto
  
  // SOLO mostrar en desarrollo Y cuando se active manualmente
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return null; // No mostrar nada en producción
  }
  
  const adminUser = adminAuthService.getCurrentAdmin();
  const isAdminAuthenticated = adminAuthService.isAuthenticated();
  const sessionInfo = adminAuthService.getSessionInfo();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#374151',
          color: 'white',
          border: 'none',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        🔍 Debug
      </button>
    );
  }

  const styles = {
    container: {
      position: 'fixed',
      bottom: '60px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.75rem',
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #444'
    },
    section: {
      marginBottom: '0.75rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #333'
    },
    label: {
      fontWeight: 'bold',
      color: '#60a5fa',
      display: 'inline-block',
      minWidth: '70px'
    },
    value: {
      marginLeft: '0.5rem',
      wordBreak: 'break-all',
      fontSize: '0.7rem'
    },
    status: {
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.6rem',
      fontWeight: 'bold',
      marginLeft: '0.5rem'
    },
    active: {
      background: '#10b981',
      color: 'white'
    },
    inactive: {
      background: '#ef4444',
      color: 'white'
    },
    warning: {
      background: '#f59e0b',
      color: 'white'
    },
    closeBtn: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      cursor: 'pointer'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.25rem'
    },
    button: {
      background: '#374151',
      color: 'white',
      border: 'none',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      cursor: 'pointer',
      margin: '0.25rem 0',
      width: '100%'
    }
  };

  const clearAllAuth = () => {
    if (window.confirm('¿Limpiar toda la autenticación?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={{ margin: 0, color: '#fbbf24' }}>🔍 Debug</h4>
        <button 
          style={styles.closeBtn}
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>
      
      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>Usuario:</span>
          <span style={{
            ...styles.status,
            ...(isAuthenticated ? styles.active : styles.inactive)
          }}>
            {isAuthenticated ? 'SÍ' : 'NO'}
          </span>
        </div>
        {user && (
          <div style={styles.row}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{user.email}</span>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>Admin:</span>
          <span style={{
            ...styles.status,
            ...(isAdminAuthenticated ? styles.active : styles.inactive)
          }}>
            {isAdminAuthenticated ? 'SÍ' : 'NO'}
          </span>
        </div>
        {adminUser && (
          <div style={styles.row}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{adminUser.email}</span>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <button 
          style={{ ...styles.button, background: '#ef4444' }}
          onClick={clearAllAuth}
        >
          🗑️ Limpiar Todo
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;