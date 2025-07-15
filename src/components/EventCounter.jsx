import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminAuthService from '../services/adminAuth';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Users, Clock, ArrowRight, Shield, Sparkles, Star } from 'lucide-react';

const EventCounter = () => {
  const { user: regularUser, isAuthenticated: isUserAuth } = useAuth();
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authenticationType, setAuthenticationType] = useState('none');
  const [registering, setRegistering] = useState(false);
  const [countAnimation, setCountAnimation] = useState(false);
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
        source: 'user'
      });
      setAuthenticationType('user');
    } else {
      setCurrentUser(null);
      setAuthenticationType('none');
    }
  }, [regularUser, isUserAuth]);

  useEffect(() => {
    loadNextEvent();
  }, []);

  useEffect(() => {
    if (nextEvent && currentUser) {
      checkRegistrationStatus();
      loadAttendeesCount();
    }
  }, [nextEvent, currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (nextEvent && nextEvent.eventDate) {
        setTimeLeft(calculateTimeLeft(nextEvent.eventDate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  // Animación del contador cuando cambia
  useEffect(() => {
    if (attendeesCount > 0) {
      setCountAnimation(true);
      const timer = setTimeout(() => setCountAnimation(false), 600);
      return () => clearTimeout(timer);
    }
  }, [attendeesCount]);

  const loadNextEvent = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando próximo evento...');
      
      const response = await apiService.getEvents();
      const events = response.data || [];
      
      // Filtrar y ordenar eventos futuros
      const futureEvents = events
        .filter(event => new Date(event.eventDate) > new Date())
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      if (futureEvents.length > 0) {
        setNextEvent(futureEvents[0]);
        console.log('✅ Próximo evento cargado:', futureEvents[0]);
      } else {
        setNextEvent(null);
        console.log('📅 No hay eventos futuros disponibles');
      }
    } catch (error) {
      console.error('❌ Error loading next event:', error);
      setNextEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!nextEvent || !currentUser || !currentUser.userID) {
      setIsRegistered(false);
      return;
    }

    try {
      const response = await apiService.getRegistrationsByEvent(nextEvent.eventID);
      const registrations = response.data || [];
      
      const userRegistration = registrations.find(reg => 
        reg.userID === currentUser.userID && 
        (reg.status === 'confirmed' || reg.status === 'active')
      );
      
      setIsRegistered(!!userRegistration);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsRegistered(false);
    }
  };

  const loadAttendeesCount = async () => {
    if (!nextEvent) return;

    try {
      const response = await apiService.getRegistrationsByEvent(nextEvent.eventID);
      const attendees = response.data || [];
      
      const confirmedAttendees = attendees.filter(reg => 
        reg.status === 'confirmed' || reg.status === 'active'
      );
      
      setAttendeesCount(confirmedAttendees.length);
    } catch (error) {
      console.error('Error loading attendees count:', error);
      setAttendeesCount(0);
    }
  };

  const calculateTimeLeft = (eventDate) => {
    const difference = +new Date(eventDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const handleRegister = async () => {
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

    if (registering) return;

    setRegistering(true);
    try {
      const registrationData = {
        eventID: nextEvent.eventID,
        userID: currentUser.userID,
        registrationDate: new Date().toISOString(),
        status: 'confirmed',
        notes: currentUser.isAdmin ? `Registro de administrador: ${currentUser.name}` : `Registro de usuario: ${currentUser.name}`
      };

      console.log('📤 Registrando en evento:', registrationData);
      
      await apiService.registerForEvent(registrationData);
      
      setIsRegistered(true);
      const newCount = attendeesCount + 1;
      setAttendeesCount(newCount);
      
      // Disparar evento global
      window.dispatchEvent(new CustomEvent('eventRegistrationUpdate', {
        detail: {
          eventID: nextEvent.eventID,
          newCount: newCount,
          isRegistered: true
        }
      }));
      
      toast.success(`¡Te has registrado exitosamente en "${nextEvent.title}"!`);

      // Crear notificación
      try {
        const notificationData = {
          userID: currentUser.userID,
          title: 'Registro Confirmado',
          message: `Te has registrado exitosamente en el evento: ${nextEvent.title}`,
          type: 'event_registration',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        await apiService.createNotification(notificationData);
      } catch (notificationError) {
        console.warn('No se pudo crear la notificación:', notificationError);
      }
    } catch (error) {
      console.error('❌ Error registering for event:', error);
      
      if (error.response && error.response.status === 409) {
        toast.info('Ya estás registrado en este evento');
        setIsRegistered(true);
        await loadAttendeesCount();
      } else if (error.message.includes('Network Error') || 
                 error.message.includes('ERR_NETWORK_CHANGED') ||
                 error.message.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        toast.error('Error al registrarse en el evento: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por confirmar';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem 0'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
      `,
      zIndex: 1
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      position: 'relative',
      zIndex: 2
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '2rem'
    },
    eventCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '3rem',
      margin: '0 auto',
      maxWidth: '900px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
      position: 'relative'
    },
    eventTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '2rem',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
    },
    userInfo: {
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))',
      borderRadius: '16px',
      padding: '1rem 1.5rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1rem',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    eventDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    eventDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '1rem',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    attendeesDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
      padding: '1.5rem',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(16, 185, 129, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    attendeesCount: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      color: '#10b981',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      transform: countAnimation ? 'scale(1.2)' : 'scale(1)',
      transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      position: 'relative',
      zIndex: 2
    },
    attendeesLabel: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'white'
    },
    attendeesGlow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100px',
      height: '100px',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
      borderRadius: '50%',
      opacity: countAnimation ? 1 : 0,
      transition: 'opacity 0.6s ease',
      zIndex: 1
    },
    description: {
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: '1.6',
      marginBottom: '2rem',
      textAlign: 'center',
      fontSize: '1.1rem'
    },
    countdown: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
      margin: '3rem 0'
    },
    countdownItem: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    countdownNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      display: 'block',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
    },
    countdownLabel: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    actions: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '3rem'
    },
    button: {
      padding: '1rem 2.5rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1.1rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      position: 'relative',
      overflow: 'hidden'
    },
    registerBtn: {
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      color: '#667eea',
      boxShadow: '0 10px 25px rgba(255, 255, 255, 0.2)'
    },
    registeredBtn: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      cursor: 'default',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
    },
    adminBtn: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: 'white',
      boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
    },
    viewAllBtn: {
      background: 'transparent',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(10px)'
    },
    loadingContainer: {
      padding: '4rem',
      textAlign: 'center',
      color: 'white'
    },
    loadingSpinner: {
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 2rem'
    },
    noEvent: {
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1.2rem'
    },
    sparkle: {
      position: 'absolute',
      color: 'rgba(255, 255, 255, 0.6)',
      animation: 'sparkle 2s ease-in-out infinite'
    }
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;

  const getRegisterButtonText = () => {
    if (registering) return (
      <>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        Registrando...
      </>
    );
    if (isRegistered) return (
      <>
        <Star size={20} />
        Ya Registrado
      </>
    );
    if (authenticationType === 'none') return 'Iniciar Sesión';
    return (
      <>
        <Sparkles size={20} />
        Registrarse
      </>
    );
  };

  const getRegisterButtonStyle = () => {
    let style = { ...styles.button };
    
    if (isRegistered) {
      style = { ...style, ...styles.registeredBtn };
    } else if (currentUser?.isAdmin) {
      style = { ...style, ...styles.adminBtn };
    } else {
      style = { ...style, ...styles.registerBtn };
    }
    
    if (registering || isRegistered) {
      style.opacity = isRegistered ? '1' : '0.8';
      style.cursor = isRegistered ? 'default' : 'not-allowed';
    }
    
    return style;
  };

  return (
    <>
      <style>{keyframes}</style>
      <section style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        
        <div style={styles.content}>
          <div style={styles.header}>
            <h2 style={styles.title}>Próximo Evento</h2>
            <p style={styles.subtitle}>
              No te pierdas nuestro próximo encuentro de fe y comunidad
            </p>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Cargando próximo evento...</p>
            </div>
          ) : nextEvent ? (
            <div style={styles.eventCard}>
              <h3 style={styles.eventTitle}>{nextEvent.title}</h3>
              
              {/* Información del usuario conectado */}
              {currentUser && (
                <div style={styles.userInfo}>
                  {currentUser.isAdmin && <Shield size={18} />}
                  <span>
                    👤 Conectado como: <strong>{currentUser.name}</strong>
                    {currentUser.isAdmin && <span> (Administrador)</span>}
                  </span>
                </div>
              )}

              <div style={styles.eventDetails}>
                <div style={styles.eventDetail}>
                  <Calendar size={22} />
                  <span>{formatDate(nextEvent.eventDate)}</span>
                </div>
                {nextEvent.location && (
                  <div style={styles.eventDetail}>
                    <MapPin size={22} />
                    <span>{nextEvent.location}</span>
                  </div>
                )}
                <div style={styles.attendeesDetail}>
                  <div style={styles.attendeesGlow}></div>
                  <Users size={24} />
                  <div>
                    <div style={styles.attendeesCount}>{attendeesCount}</div>
                    <div style={styles.attendeesLabel}>registrado{attendeesCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{...styles.sparkle, top: '10px', right: '15px'}}>
                    <Sparkles size={16} />
                  </div>
                  <div style={{...styles.sparkle, bottom: '10px', left: '15px', animationDelay: '1s'}}>
                    <Sparkles size={12} />
                  </div>
                </div>
              </div>

              {nextEvent.description && (
                <p style={styles.description}>
                  {nextEvent.description}
                </p>
              )}

              {/* Contador regresivo */}
              {Object.keys(timeLeft).length > 0 && (
                <div style={styles.countdown}>
                  {Object.entries(timeLeft).map(([interval, value]) => (
                    <div key={interval} style={styles.countdownItem}>
                      <span style={styles.countdownNumber}>{value}</span>
                      <span style={styles.countdownLabel}>{interval}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.actions}>
                <button
                  style={getRegisterButtonStyle()}
                  onClick={handleRegister}
                  disabled={registering || isRegistered}
                  onMouseEnter={(e) => {
                    if (!registering && !isRegistered) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!registering && !isRegistered) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                >
                  {getRegisterButtonText()}
                </button>

                <button
                  style={{...styles.button, ...styles.viewAllBtn}}
                  onClick={() => navigate('/events')}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 35px rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Ver Todos los Eventos
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.noEvent}>
              <Calendar size={64} style={{ opacity: '0.5', marginBottom: '2rem' }} />
              <p>No hay eventos programados próximamente.</p>
              <p>¡Mantente atento para futuras actividades!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EventCounter;