import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminAuthService from '../services/adminAuth';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Users, Clock, Shield } from 'lucide-react';

const EventCard = ({ event }) => {
  const { user: regularUser, isAuthenticated: isUserAuth } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authenticationType, setAuthenticationType] = useState('none');
  const navigate = useNavigate();

  // Determinar el usuario actual y tipo de autenticación
  useEffect(() => {
    const adminUser = adminAuthService.getCurrentAdmin();
    const isAdminAuth = adminAuthService.isAuthenticated();
    
    if (isAdminAuth && adminUser) {
      setCurrentUser({
        userID: adminUser.adminID,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role || 'admin',
        isAdmin: true,
        phone: adminUser.phone,
        source: 'admin'
      });
      setAuthenticationType(isUserAuth ? 'both' : 'admin');
    } else if (isUserAuth && regularUser) {
      setCurrentUser({
        userID: regularUser.userID,
        email: regularUser.email,
        name: regularUser.name,
        role: 'user',
        isAdmin: false,
        phone: regularUser.phone,
        source: 'user'
      });
      setAuthenticationType('user');
    } else {
      setCurrentUser(null);
      setAuthenticationType('none');
    }
  }, [regularUser, isUserAuth]);

  useEffect(() => {
    if (event.eventID) {
      loadAttendeesCount();
    }
  }, [event.eventID]);

  useEffect(() => {
    if (currentUser && event.eventID) {
      checkRegistrationStatus();
    } else {
      setIsRegistered(false);
    }
  }, [currentUser, event.eventID]);

  useEffect(() => {
    // Escuchar eventos de actualización desde otros componentes
    const handleEventUpdate = (customEvent) => {
      if (customEvent.detail && customEvent.detail.eventID === event.eventID) {
        setAttendeesCount(customEvent.detail.newCount);
        setIsRegistered(customEvent.detail.isRegistered);
      }
    };

    window.addEventListener('eventRegistrationUpdate', handleEventUpdate);
    
    return () => {
      window.removeEventListener('eventRegistrationUpdate', handleEventUpdate);
    };
  }, [event.eventID]);

  const checkRegistrationStatus = async () => {
    if (!currentUser || !currentUser.userID) {
      setIsRegistered(false);
      return;
    }

    try {
      const response = await apiService.getRegistrationsByEvent(event.eventID);
      const registrations = response.data || [];
      
      // Verificar si el usuario actual está registrado
      const userRegistration = registrations.find(reg => 
        reg.userID === currentUser.userID && 
        (reg.status === 'confirmed' || reg.status === 'active')
      );
      
      setIsRegistered(!!userRegistration);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsRegistered(false);
      
      // Solo mostrar error si no es problema de red
      if (!error.message.includes('Network Error') && 
          !error.message.includes('ERR_NETWORK_CHANGED') &&
          !error.message.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Error verificando estado de registro');
      }
    }
  };

  const loadAttendeesCount = async () => {
    try {
      const response = await apiService.getRegistrationsByEvent(event.eventID);
      const attendees = response.data || [];
      
      // Contar solo registros confirmados
      const confirmedAttendees = attendees.filter(reg => 
        reg.status === 'confirmed' || reg.status === 'active'
      );
      
      setAttendeesCount(confirmedAttendees.length);
    } catch (error) {
      console.error('Error loading attendees count:', error);
      setAttendeesCount(0);
    }
  };

  const handleAttendClick = async () => {
    const isAuthenticated = authenticationType !== 'none';
    
    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para registrarte en el evento');
      navigate('/login');
      return;
    }

    if (isRegistered) {
      toast.info('Ya estás registrado en este evento');
      return;
    }

    if (!currentUser || !currentUser.userID) {
      toast.error('Error: Usuario no válido. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Evitar múltiples clics rápidos
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Iniciando registro para usuario:', currentUser);

      // Verificar primero si ya está registrado (doble verificación)
      const existingResponse = await apiService.getRegistrationsByEvent(event.eventID);
      const existingRegistrations = existingResponse.data || [];
      const existingRegistration = existingRegistrations.find(reg => 
        reg.userID === currentUser.userID && 
        (reg.status === 'confirmed' || reg.status === 'active')
      );

      if (existingRegistration) {
        toast.info('Ya estás registrado en este evento');
        setIsRegistered(true);
        return;
      }

      // Crear nueva registración
      const registrationData = {
        eventID: event.eventID,
        userID: currentUser.userID,
        registrationDate: new Date().toISOString(),
        status: 'confirmed',
        notes: currentUser.isAdmin ? `Registro de administrador: ${currentUser.name}` : `Registro de usuario: ${currentUser.name}`
      };

      console.log('📤 Enviando datos de registro:', registrationData);
      
      await apiService.registerForEvent(registrationData);
      
      // Actualizar estado local
      setIsRegistered(true);
      const newCount = attendeesCount + 1;
      setAttendeesCount(newCount);
      
      // Disparar evento global para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('eventRegistrationUpdate', {
        detail: {
          eventID: event.eventID,
          newCount: newCount,
          isRegistered: true
        }
      }));
      
      toast.success(`¡Te has registrado exitosamente en el evento "${event.title}"!`);

      // Crear notificación para el usuario (sin bloquear si falla)
      try {
        const notificationData = {
          userID: currentUser.userID,
          title: 'Registro Confirmado',
          message: `Te has registrado exitosamente en el evento: ${event.title}`,
          type: 'event_registration',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        await apiService.createNotification(notificationData);
        console.log('✅ Notificación creada exitosamente');
      } catch (notificationError) {
        console.warn('⚠️ No se pudo crear la notificación:', notificationError);
        // No mostrar error al usuario por esto
      }
    } catch (error) {
      console.error('❌ Error registering for event:', error);
      
      // Manejo de errores más específico
      if (error.response && error.response.status === 409) {
        toast.info('Ya estás registrado en este evento');
        setIsRegistered(true);
        await loadAttendeesCount();
      } else if (error.message.includes('Network Error') || 
                 error.message.includes('ERR_NETWORK_CHANGED') ||
                 error.message.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando e intenta nuevamente.');
      } else if (error.message.includes('timeout')) {
        toast.error('La operación tardó demasiado. Intenta nuevamente.');
      } else if (error.response && error.response.status >= 500) {
        toast.error('Error del servidor. Intenta nuevamente en unos momentos.');
      } else {
        toast.error('Error al registrarse en el evento: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por confirmar';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return '';
    }
  };

  const styles = {
    eventCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      border: currentUser?.isAdmin ? '2px solid #8b5cf6' : '1px solid #e5e7eb'
    },
    eventCardHeader: {
      position: 'relative',
      height: '200px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    eventImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    eventImagePlaceholder: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: 'bold'
    },
    eventBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      display: 'flex',
      gap: '0.5rem'
    },
    statusBadge: {
      background: '#10b981',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500'
    },
    statusBadgeUpcoming: {
      background: '#f59e0b'
    },
    adminBadge: {
      background: '#8b5cf6',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    userTypeBadge: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    eventCardContent: {
      padding: '1.5rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    eventTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    eventDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    eventDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#64748b',
      fontSize: '0.9rem'
    },
    userInfo: {
      fontSize: '0.8rem',
      fontStyle: 'italic',
      color: '#8b5cf6',
      background: '#f3f4f6',
      padding: '0.5rem',
      borderRadius: '6px',
      marginTop: '0.5rem'
    },
    eventDescription: {
      color: '#64748b',
      lineHeight: '1.6',
      marginTop: 'auto'
    },
    eventCardFooter: {
      padding: '1.5rem',
      borderTop: '1px solid #e2e8f0'
    },
    attendBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    attendBtnRegistered: {
      background: '#10b981',
      cursor: 'default'
    },
    attendBtnAdmin: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    attendBtnDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    loadingSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #ffffff30',
      borderTop: '2px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  // CSS para la animación del spinner
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const getButtonText = () => {
    if (loading) return 'Registrando...';
    if (isRegistered) return '✓ Ya Registrado';
    if (authenticationType === 'none') return 'Iniciar Sesión';
    return 'Asistir';
  };

  const getButtonStyle = () => {
    let style = { ...styles.attendBtn };
    
    if (isRegistered) {
      style = { ...style, ...styles.attendBtnRegistered };
    } else if (currentUser?.isAdmin) {
      style = { ...style, ...styles.attendBtnAdmin };
    }
    
    if (loading || isRegistered) {
      style = { ...style, ...styles.attendBtnDisabled };
    }
    
    return style;
  };

  return (
    <>
      <style>{spinnerStyle}</style>
      <div 
        style={styles.eventCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        <div style={styles.eventCardHeader}>
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              style={styles.eventImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 1.2rem; font-weight: bold;">${event.title}</div>`;
              }}
            />
          ) : (
            <div style={styles.eventImagePlaceholder}>
              <Calendar size={48} />
            </div>
          )}
          
          {/* Badge de tipo de usuario */}
          {currentUser && (
            <div style={styles.userTypeBadge}>
              {currentUser.isAdmin ? (
                <>
                  <Shield size={12} />
                  Admin
                </>
              ) : (
                <>
                  👤 Usuario
                </>
              )}
            </div>
          )}
          
          <div style={styles.eventBadge}>
            <span style={{
              ...styles.statusBadge,
              ...(event.status === 'upcoming' ? styles.statusBadgeUpcoming : {})
            }}>
              {event.status === 'active' ? 'Activo' : 'Próximo'}
            </span>
          </div>
        </div>

        <div style={styles.eventCardContent}>
          <h3 style={styles.eventTitle}>{event.title || 'Evento sin título'}</h3>
          
          <div style={styles.eventDetails}>
            <div style={styles.eventDetail}>
              <Calendar size={16} color="#667eea" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            
            {event.location && (
              <div style={styles.eventDetail}>
                <MapPin size={16} color="#667eea" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.startTime && (
              <div style={styles.eventDetail}>
                <Clock size={16} color="#667eea" />
                <span>{formatTime(event.startTime)}</span>
              </div>
            )}
            
            <div style={styles.eventDetail}>
              <Users size={16} color="#667eea" />
              <span>{attendeesCount} asistente{attendeesCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Mostrar información del usuario actual */}
          {currentUser && (
            <div style={styles.userInfo}>
              👤 Conectado como: <strong>{currentUser.name}</strong>
              {currentUser.isAdmin && <span> (Administrador)</span>}
              <br />
              📧 {currentUser.email}
            </div>
          )}

          {event.description && (
            <p style={styles.eventDescription}>{event.description}</p>
          )}
        </div>

        <div style={styles.eventCardFooter}>
          <button 
            style={getButtonStyle()}
            onClick={handleAttendClick}
            disabled={loading || isRegistered}
            onMouseEnter={(e) => {
              if (!loading && !isRegistered) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isRegistered) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading && <div style={styles.loadingSpinner}></div>}
            {getButtonText()}
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;