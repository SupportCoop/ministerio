import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, isAuthenticated, admin } = useAuth();

  useEffect(() => {
    // Si ya está autenticado como admin, redirigir al panel
    if (isAuthenticated && admin) {
      navigate('/admin');
    }
  }, [isAuthenticated, admin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password, true);
      
      if (result.success) {
        toast.success(`¡Bienvenido, ${admin?.name || formData.email}!`);
        navigate('/admin');
      } else {
        toast.error(result.error || 'Error de autenticación');
        setErrors({ 
          general: result.error || 'Credenciales incorrectas' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error de conexión');
      setErrors({ 
        general: 'Error de conexión. Intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    loginCard: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      width: '100%',
      maxWidth: '450px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    icon: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      color: 'white'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    inputGroup: {
      position: 'relative'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      paddingLeft: '3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '0.25rem'
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    generalError: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    submitButtonDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    footer: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid #e5e7eb'
    },
    footerText: {
      color: '#6b7280',
      fontSize: '0.9rem'
    },
    footerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600'
    },
    loadingSpinner: {
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <Shield size={32} />
          </div>
          <h1 style={styles.title}>Panel de Administración</h1>
          <p style={styles.subtitle}>
            Acceso restringido solo para administradores
          </p>
        </div>

        {errors.general && (
          <div style={styles.generalError}>
            <div style={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.inputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@ministerio.com"
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {})
                }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div style={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                style={{
                  ...styles.input,
                  paddingRight: '3rem',
                  ...(errors.password ? styles.inputError : {})
                }}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={styles.passwordToggle}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div style={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <div style={styles.loadingSpinner}></div>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <Shield size={20} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿No eres administrador?{' '}
            <Link to="/login" style={styles.footerLink}>
              Iniciar sesión como usuario
            </Link>
          </p>
          <p style={styles.footerText}>
            <Link to="/" style={styles.footerLink}>
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;