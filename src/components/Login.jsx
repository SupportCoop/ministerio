import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password, false);
      
      if (result.success) {
        toast.success('¡Bienvenido de vuelta!');
        navigate('/');
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = {
    loginContainer: {
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    loginCard: {
      background: 'white',
      padding: '3rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '450px'
    },
    loginHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    loginTitle: {
      color: '#1e293b',
      marginBottom: '0.5rem',
      fontSize: '2rem',
      fontWeight: 'bold'
    },
    loginSubtitle: {
      color: '#64748b'
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    formLabel: {
      color: '#374151',
      fontWeight: '500',
      fontSize: '0.9rem'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      color: '#9ca3af',
      zIndex: 1
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '0.25rem',
      zIndex: 2
    },
    loginBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '1rem'
    },
    loginBtnDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    loginFooter: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid #e5e7eb'
    },
    registerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500'
    },
    demoCredentials: {
      background: '#f8fafc',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem',
      borderLeft: '4px solid #667eea'
    },
    demoTitle: {
      color: '#374151',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    demoText: {
      margin: 0,
      fontSize: '0.8rem',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <h2 style={styles.loginTitle}>Iniciar Sesión</h2>
          <p style={styles.loginSubtitle}>Bienvenido de vuelta a nuestro ministerio</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.formLabel}>Correo Electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo"
                required
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.formLabel}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                required
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.loginBtn,
              ...(loading ? styles.loginBtnDisabled : {})
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.loginFooter}>
          <p>
            ¿No tienes una cuenta?{' '}
            <Link 
              to="/register" 
              style={styles.registerLink}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div style={styles.demoCredentials}>
          <h4 style={styles.demoTitle}>Credenciales de prueba:</h4>
          <p style={styles.demoText}><strong>Email:</strong> maria@example.com</p>
          <p style={styles.demoText}><strong>Password:</strong> cualquier contraseña</p>
        </div>
      </div>
    </div>
  );
};

export default Login;