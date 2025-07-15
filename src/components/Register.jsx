import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Por favor completa los campos obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un correo válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Estructurar datos según tu AuthService - CAMPOS REQUERIDOS CORREGIDOS
      const userData = {
        name: formData.name,
        email: formData.email,
        passwordHash: formData.password,
        phone: formData.phone || "",  // Cambiar null por string vacío
        city: formData.city || "",
        gender: formData.gender || "",
        address: "", // ✅ REQUERIDO: No puede ser null
        profileImage: "", // ✅ REQUERIDO: No puede ser null
        // Campos adicionales que el backend podría requerir
        isActive: true,
        role: 'user',
        dateOfBirth: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Registrando usuario:', userData);

      // Intentar primero con apiService directamente para ver el error específico
      try {
        const directResponse = await apiService.createUser(userData);
        console.log('Respuesta directa exitosa:', directResponse);
        
        // Si funciona, solo hacer auto-login sin volver a crear el usuario
        if (directResponse.data) {
          // Generar token y hacer login manual
          const user = directResponse.data;
          
          // Simular login exitoso
          localStorage.setItem('authToken', 'temp_token_' + user.userID);
          localStorage.setItem('userData', JSON.stringify(user));
          
          toast.success('¡Cuenta creada exitosamente! Ya estás conectado.');
          navigate('/', { replace: true });
        } else {
          toast.error('Error al procesar el registro');
        }
      } catch (directError) {
        console.error('Error directo de la API:', directError);
        
        // Mostrar detalles específicos del error 400
        if (directError.response && directError.response.status === 400) {
          const errorData = directError.response.data;
          console.log('Detalles del error 400:', errorData);
          console.log('Errores específicos:', errorData.errors);
          
          if (errorData.errors) {
            // Formato de error de ASP.NET Core
            const errorMessages = [];
            Object.keys(errorData.errors).forEach(field => {
              const fieldErrors = errorData.errors[field];
              console.log(`Campo ${field}:`, fieldErrors);
              fieldErrors.forEach(error => {
                errorMessages.push(`${field}: ${error}`);
              });
            });
            toast.error(`Errores de validación: ${errorMessages.join(', ')}`);
          } else if (errorData.title) {
            toast.error(`Error: ${errorData.title}`);
          } else {
            toast.error('Error de validación en los datos enviados');
          }
        } else if (directError.response && directError.response.status === 409) {
          // Email ya existe
          toast.error('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error('Error al crear la cuenta. Intenta con otro correo electrónico.');
        }
      }
    } catch (error) {
      console.error('Error inesperado al crear la cuenta:', error);
      toast.error('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const styles = {
    registerContainer: {
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    registerCard: {
      background: 'white',
      padding: '3rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '600px'
    },
    registerHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    registerTitle: {
      color: '#1e293b',
      marginBottom: '0.5rem',
      fontSize: '2rem',
      fontWeight: 'bold'
    },
    registerSubtitle: {
      color: '#64748b'
    },
    registerForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    formGroupFull: {
      gridColumn: '1 / -1'
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
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      background: 'white',
      cursor: 'pointer',
      outline: 'none'
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
    registerBtn: {
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
    registerBtnDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    registerFooter: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid #e5e7eb'
    },
    loginLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500'
    },
    debugInfo: {
      background: '#f1f5f9',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem',
      fontSize: '0.9rem',
      color: '#475569'
    }
  };

  return (
    <div style={styles.registerContainer}>
      <div style={styles.registerCard}>
        <div style={styles.registerHeader}>
          <h2 style={styles.registerTitle}>Crear Cuenta</h2>
          <p style={styles.registerSubtitle}>Únete a nuestra comunidad de fe</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.registerForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.formLabel}>Nombre Completo *</label>
              <div style={styles.inputWrapper}>
                <User style={styles.inputIcon} size={20} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.formLabel}>Correo Electrónico *</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.formLabel}>Contraseña *</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
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

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.formLabel}>Confirmar Contraseña *</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  required
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="phone" style={styles.formLabel}>Teléfono</label>
              <div style={styles.inputWrapper}>
                <Phone style={styles.inputIcon} size={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(809) 123-4567"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="city" style={styles.formLabel}>Ciudad</label>
              <div style={styles.inputWrapper}>
                <MapPin style={styles.inputIcon} size={20} />
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Tu ciudad"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          <div style={{...styles.formGroup, ...styles.formGroupFull}}>
            <label htmlFor="gender" style={styles.formLabel}>Género</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.registerBtn,
              ...(loading ? styles.registerBtnDisabled : {})
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={styles.registerFooter}>
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              style={styles.loginLink}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;