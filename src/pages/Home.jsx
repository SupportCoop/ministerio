import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import EventCounter from '../components/EventCounter';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import bookService from '../services/bookService';
import videoService from '../services/videoService';
import testimonialService from '../services/testimonialService';
import {
  Calendar, Users, Heart, BookOpen, Video, Youtube,
  Star, User, Tag, Eye, ArrowRight, Play, MessageSquare
} from 'lucide-react';

const Home = () => {
  const [homeData, setHomeData] = useState({
    welcomeTitle: 'Bienvenido a Nuestro Ministerio',
    welcomeDescription: 'Somos una comunidad de fe comprometida con el crecimiento espiritual y el servicio a nuestro prójimo. Únete a nosotros en este viaje de fe, esperanza y amor.',
    activeMembers: 0,
    annualEvents: 0,
    yearsServing: 0
  });
  const [services, setServices] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  // Auto-scroll para libros
  useEffect(() => {
    if (featuredBooks.length > 0) {
      const interval = setInterval(() => {
        setCurrentBookIndex((prevIndex) => 
          prevIndex >= featuredBooks.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Cambia cada 3 segundos
      return () => clearInterval(interval);
    }
  }, [featuredBooks]);

  // Auto-scroll para videos
  useEffect(() => {
    if (featuredVideos.length > 0) {
      const interval = setInterval(() => {
        setCurrentVideoIndex((prevIndex) => 
          prevIndex >= featuredVideos.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Cambia cada 4 segundos
      return () => clearInterval(interval);
    }
  }, [featuredVideos]);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando datos del home...');
      
      // Cargar estadísticas REALES desde la API (con fallback automático)
      const stats = await loadStatistics();
      
      // Cargar servicios/información del ministerio
      const servicesData = await loadServices();
      
      // Cargar libros y videos destacados
      const [booksData, videosData, testimonialsData] = await Promise.all([
       loadFeaturedBooks(),
       loadFeaturedVideos(),
       loadRecentTestimonials()
     ]);
     
     setHomeData(prevData => ({
        ...prevData,
        ...stats
      }));
      
      setServices(servicesData);
      setFeaturedBooks(booksData);
      setFeaturedVideos(videosData);
      setTestimonials(testimonialsData);
      console.log('✅ Datos del home cargados:', { stats, books: booksData.length, videos: videosData.length, testimonials: testimonialsData.length });
    } catch (error) {
      console.error('❌ Error loading home data:', error);
      // En caso de error, mantener valores por defecto
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Intentar cargar estadísticas desde la API (con fallback)
      let welcomeTitle = 'Bienvenido a Nuestro Ministerio';
      let welcomeDescription = 'Somos una comunidad de fe comprometida con el crecimiento espiritual y el servicio a nuestro prójimo.';
      let annualEvents = 50; // Valor por defecto
      let yearsServing = 15; // Valor por defecto

      try {
        const statsResponse = await apiService.getStatistics();
        const statsArray = statsResponse.data || [];
        
        // Convertir array a objeto para fácil acceso
        const statsObject = {};
        statsArray.forEach(stat => {
          if (stat.statName && stat.statValue !== undefined) {
            statsObject[stat.statName] = stat.statValue;
          }
        });

        // Usar estadísticas de la DB si existen
        welcomeTitle = statsObject.welcome_title || welcomeTitle;
        welcomeDescription = statsObject.welcome_description || welcomeDescription;
        annualEvents = statsObject.annual_events ? parseInt(statsObject.annual_events) : annualEvents;
        yearsServing = statsObject.years_serving ? parseInt(statsObject.years_serving) : yearsServing;

      } catch (statsError) {
        console.warn('💡 Estadísticas no disponibles, usando valores por defecto');
      }

      return {
        activeMembers: statsObject.active_members ? parseInt(statsObject.active_members) : 5,
        annualEvents: annualEvents,
        yearsServing: yearsServing,
        welcomeTitle: welcomeTitle,
        welcomeDescription: welcomeDescription
      };
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
      return {
        activeMembers: 5, // Fallback para demo
        annualEvents: 50,
        yearsServing: 15,
        welcomeTitle: 'Bienvenido a Nuestro Ministerio',
        welcomeDescription: 'Somos una comunidad de fe comprometida con el crecimiento espiritual y el servicio a nuestro prójimo.'
      };
    }
  };

  const loadServices = async () => {
    // Por ahora, usar servicios por defecto
    // En el futuro podrías crear una tabla "Services" en tu DB
    return [
      {
        id: 1,
        title: 'Servicios Dominicales',
        description: 'Únete a nosotros cada domingo para adoración, enseñanza y comunión en familia.',
        icon: 'calendar',
        linkText: 'Ver Eventos',
        linkTo: '/events'
      },
      {
        id: 2,
        title: 'Estudio Bíblico',
        description: 'Profundiza en las Escrituras con estudios semanales dirigidos por nuestros pastores.',
        icon: 'book',
        linkText: 'Ver Biblioteca',
        linkTo: '/books'
      },
      {
        id: 3,
        title: 'Grupos Pequeños',
        description: 'Conecta con otros creyentes en grupos íntimos de crecimiento y apoyo mutuo.',
        icon: 'users',
        linkText: 'Únete',
        linkTo: '/events'
      },
      {
        id: 4,
        title: 'Videos Espirituales',
        description: 'Disfruta de nuestros sermones y enseñanzas en video.',
        icon: 'video',
        linkText: 'Ver Videos',
        linkTo: '/videos'
      }
    ];
  };

  const loadFeaturedBooks = async () => {
    try {
      const allBooks = await bookService.getAllBooks();
      // Obtener los primeros 8 libros destacados o los primeros 8 si no hay destacados
      const featured = allBooks.filter(book => book.isFeatured).slice(0, 8);
      return featured.length > 0 ? featured : allBooks.slice(0, 8);
    } catch (error) {
      console.error('Error loading featured books:', error);
      return [];
    }
  };

  const loadFeaturedVideos = async () => {
    try {
      const allVideos = await videoService.getAllVideos();
      // Obtener los primeros 8 videos destacados o los primeros 8 si no hay destacados
      const featured = allVideos.filter(video => video.isFeatured).slice(0, 8);
      return featured.length > 0 ? featured : allVideos.slice(0, 8);
    } catch (error) {
      console.error('Error loading featured videos:', error);
      return [];
    }
  };

  const loadRecentTestimonials = async () => {
    try {
      const allTestimonials = await testimonialService.getAllTestimonials();
      const approvedAndPublic = allTestimonials.filter(t => t.isApproved && t.isPublic);
      // Sort by creation date descending and take the first 5
      const sorted = approvedAndPublic.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sorted.slice(0, 5);
    } catch (error) {
      console.error('Error loading recent testimonials:', error);
      return [];
    }
  };

  const getServiceIcon = (iconName) => {
    const iconProps = { size: 40 };
    switch (iconName) {
      case 'calendar': return <Calendar {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      case 'users': return <Users {...iconProps} />;
      case 'video': return <Video {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const styles = {
    home: {
      minHeight: '100vh'
    },
    eventCounterSection: {
      padding: '2rem 0'
    },
    welcomeSection: {
      padding: '4rem 0',
      background: 'white'
    },
    welcomeContent: {
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    },
    welcomeTitle: {
      fontSize: '2.5rem',
      color: '#1e293b',
      marginBottom: '1.5rem',
      fontWeight: 'bold'
    },
    welcomeText: {
      fontSize: '1.1rem',
      color: '#64748b',
      lineHeight: '1.8',
      marginBottom: '3rem'
    },
    welcomeStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginTop: '3rem'
    },
    stat: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.5rem',
      background: '#f8fafc',
      borderRadius: '12px'
    },
    statInfo: {
      textAlign: 'left'
    },
    statNumber: {
      fontSize: '2rem',
      color: '#1e293b',
      margin: 0,
      fontWeight: 'bold'
    },
    statLabel: {
      color: '#64748b',
      margin: 0
    },
    servicesSection: {
      padding: '4rem 0',
      background: '#f8fafc'
    },
    mediaSection: {
      padding: '4rem 0',
      background: 'white'
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      color: '#1e293b',
      marginBottom: '1rem',
      fontWeight: 'bold'
    },
    sectionSubtitle: {
      textAlign: 'center',
      fontSize: '1.1rem',
      color: '#64748b',
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto 3rem'
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem'
    },
    mediaGrid: {
      display: 'flex',
      overflow: 'hidden',
      gap: '1rem',
      marginBottom: '2rem',
      position: 'relative'
    },
    carouselContainer: {
      display: 'flex',
      transition: 'transform 0.5s ease-in-out',
      gap: '1rem'
    },
    serviceCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      transition: 'all 0.3s',
      cursor: 'pointer'
    },
    bookCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s',
      cursor: 'pointer',
      minWidth: '240px',
      width: '240px',
      height: '320px',
      flexShrink: 0
    },
    videoCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s',
      cursor: 'pointer',
      minWidth: '260px',
      width: '260px',
      height: '320px',
      flexShrink: 0
    },
    serviceIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      margin: '0 auto 1.5rem',
      color: 'white'
    },
    serviceTitle: {
      fontSize: '1.5rem',
      color: '#1e293b',
      marginBottom: '1rem',
      fontWeight: '600'
    },
    serviceDescription: {
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '1.5rem'
    },
    serviceLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      border: '2px solid #667eea',
      borderRadius: '8px',
      transition: 'all 0.3s',
      display: 'inline-block'
    },
    mediaImage: {
      width: '100%',
      height: '180px',
      objectFit: 'cover'
    },
    mediaContent: {
      padding: '1rem'
    },
    mediaTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    },
    mediaAuthor: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    mediaCategory: {
      fontSize: '0.7rem',
      background: '#e0f2fe',
      color: '#0369a1',
      padding: '0.2rem 0.5rem',
      borderRadius: '8px',
      display: 'inline-block',
      marginBottom: '0.5rem'
    },
    videoOverlay: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0',
      transition: 'opacity 0.3s'
    },
    playButton: {
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    carouselDots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#cbd5e1',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    activeDot: {
      background: '#667eea',
      transform: 'scale(1.2)'
    },
    viewAllButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.3s',
      margin: '0 auto'
    },
    ctaSection: {
      padding: '4rem 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center'
    },
    testimonialSection: {
      padding: '4rem 0',
      background: '#f8fafc',
    },
    testimonialCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
    },
    testimonialContent: {
      fontStyle: 'italic',
      color: '#64748b',
      marginBottom: '1.5rem',
      fontSize: '1.1rem',
    },
    testimonialAuthor: {
      fontWeight: 'bold',
      color: '#1e293b',
    },
    testimonialTitle: {
      color: '#667eea',
      fontSize: '0.9rem',
    },
    ctaTitle: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
      fontWeight: 'bold'
    },
    ctaText: {
      fontSize: '1.1rem',
      opacity: '0.9',
      marginBottom: '2rem',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    ctaButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    ctaBtn: {
      padding: '1rem 2rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.3s',
      display: 'inline-block'
    },
    ctaBtnPrimary: {
      background: 'white',
      color: '#667eea'
    },
    ctaBtnSecondary: {
      background: 'transparent',
      color: 'white',
      border: '2px solid white'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    },
    loadingSpinner: {
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #4A90E2',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginRight: '1rem'
    }
  };

  return (
    <div style={styles.home}>
      {/* Banner Principal */}
      <Banner />

      {/* Contador de Eventos */}
      <section style={styles.eventCounterSection}>
        <EventCounter />
      </section>

      {/* Sección de Bienvenida */}
      <section style={styles.welcomeSection}>
        <div className="container">
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Cargando información...</p>
            </div>
          ) : (
            <div style={styles.welcomeContent}>
              <h2 style={styles.welcomeTitle}>{homeData.welcomeTitle}</h2>
              <p style={styles.welcomeText}>
                {homeData.welcomeDescription}
              </p>
              <div style={styles.welcomeStats}>
                <div style={styles.stat}>
                  <Users size={32} color="#667eea" />
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{homeData.activeMembers}</h3>
                    <p style={styles.statLabel}>Miembros activos</p>
                  </div>
                </div>
                <div style={styles.stat}>
                  <Calendar size={32} color="#667eea" />
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{homeData.annualEvents}+</h3>
                    <p style={styles.statLabel}>Eventos anuales</p>
                  </div>
                </div>
                <div style={styles.stat}>
                  <Heart size={32} color="#667eea" />
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{homeData.yearsServing}</h3>
                    <p style={styles.statLabel}>Años sirviendo</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Servicios */}
      <section style={styles.servicesSection}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Nuestros Servicios</h2>
          <div style={styles.servicesGrid}>
            {services.map((service) => (
              <div 
                key={service.id}
                style={styles.serviceCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={styles.serviceIcon}>
                  {getServiceIcon(service.icon)}
                </div>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDescription}>
                  {service.description}
                </p>
                <Link 
                  to={service.linkTo} 
                  style={styles.serviceLink}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#667eea';
                  }}
                >
                  {service.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Libros Destacados */}
      {featuredBooks.length > 0 && (
        <section style={styles.mediaSection}>
          <div className="container">
            <h2 style={styles.sectionTitle}>Libros Recomendados</h2>
            <p style={styles.sectionSubtitle}>
              Descubre nuestra selección de libros que fortalecerán tu crecimiento espiritual
            </p>
            <div style={styles.mediaGrid}>
              <div 
                style={{
                  ...styles.carouselContainer,
                  transform: `translateX(-${currentBookIndex * 260}px)`
                }}
              >
                {featuredBooks.map((book) => (
                  <div
                    key={book.bookID}
                    style={styles.bookCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img 
                      src={book.coverImageUrl || '/api/placeholder/240/180'} 
                      alt={book.title}
                      style={styles.mediaImage}
                    />
                    <div style={styles.mediaContent}>
                      <h3 style={styles.mediaTitle}>{book.title}</h3>
                      <div style={styles.mediaAuthor}>
                        <User size={12} />
                        {book.author}
                      </div>
                      <span style={styles.mediaCategory}>{book.category}</span>
                      {book.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{book.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicadores de libros */}
            <div style={styles.carouselDots}>
              {featuredBooks.map((_, index) => (
                <div
                  key={`book-dot-${index}`}
                  style={{
                    ...styles.dot,
                    ...(index === currentBookIndex ? styles.activeDot : {})
                  }}
                  onClick={() => setCurrentBookIndex(index)}
                />
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/books" style={styles.viewAllButton}>
                <BookOpen size={20} />
                Ver Todos los Libros
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sección de Videos Destacados */}
      {featuredVideos.length > 0 && (
        <section style={{ ...styles.mediaSection, background: '#f8fafc' }}>
          <div className="container">
            <h2 style={styles.sectionTitle}>Videos Destacados</h2>
            <p style={styles.sectionSubtitle}>
              Disfruta de nuestros sermones y enseñanzas más impactantes
            </p>
            <div style={styles.mediaGrid}>
              <div 
                style={{
                  ...styles.carouselContainer,
                  transform: `translateX(-${currentVideoIndex * 280}px)`
                }}
              >
                {featuredVideos.map((video) => (
                  <div 
                    key={video.videoID}
                    style={styles.videoCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      const overlay = e.currentTarget.querySelector('.video-overlay');
                      if (overlay) overlay.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      const overlay = e.currentTarget.querySelector('.video-overlay');
                      if (overlay) overlay.style.opacity = '0';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={video.thumbnailPath || 'https://via.placeholder.com/260x180.png?text=Video'} 
                        alt={video.title}
                        style={styles.mediaImage}
                      />
                      <div className="video-overlay" style={styles.videoOverlay}>
                        <a 
                          href={video.youTubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={styles.playButton}
                        >
                          <Youtube size={20} />
                        </a>
                      </div>
                    </div>
                    <div style={styles.mediaContent}>
                      <h3 style={styles.mediaTitle}>{video.title}</h3>
                      <div style={styles.mediaAuthor}>
                        <User size={12} />
                        {video.preacher || 'Sin predicador'}
                      </div>
                      <span style={{...styles.mediaCategory, background: '#fce7f3', color: '#be185d'}}>
                        {video.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {video.viewCount && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Eye size={10} color="#64748b" />
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{video.viewCount}</span>
                          </div>
                        )}
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {formatDate(video.uploadDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicadores de videos */}
            <div style={styles.carouselDots}>
              {featuredVideos.map((_, index) => (
                <div
                  key={`video-dot-${index}`}
                  style={{
                    ...styles.dot,
                    ...(index === currentVideoIndex ? styles.activeDot : {})
                  }}
                  onClick={() => setCurrentVideoIndex(index)}
                />
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/videos" style={styles.viewAllButton}>
                <Video size={20} />
                Ver Todos los Videos
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sección de Testimonios */}
      {testimonials.length > 0 && (
        <section style={styles.testimonialSection}>
          <div className="container">
            <h2 style={styles.sectionTitle}>Lo que dicen de nosotros</h2>
            <p style={styles.sectionSubtitle}>
              Testimonios de nuestra comunidad que reflejan el impacto de nuestro ministerio.
            </p>
            <div style={styles.servicesGrid}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.testimonyID} style={styles.testimonialCard}>
                  <MessageSquare size={40} color="#667eea" style={{ margin: '0 auto 1.5rem' }} />
                  <p style={styles.testimonialContent}>"{testimonial.content}"</p>
                  <h4 style={styles.testimonialAuthor}>- {testimonial.name}</h4>
                  <span style={styles.testimonialTitle}>{testimonial.title}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/testimonials" style={styles.viewAllButton}>
                <MessageSquare size={20} />
                Ver Todos los Testimonios
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sección de Llamada a la Acción */}
      <section style={styles.ctaSection}>
        <div className="container">
          <h2 style={styles.ctaTitle}>¿Listo para ser parte de nuestra familia?</h2>
          <p style={styles.ctaText}>
            Te invitamos a conocer más sobre nuestra comunidad y 
            participar en nuestros próximos eventos.
          </p>
          <div style={styles.ctaButtons}>
            <Link 
              to="/events" 
              style={{...styles.ctaBtn, ...styles.ctaBtnPrimary}}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Ver Eventos
            </Link>
            <Link 
              to="/register" 
              style={{...styles.ctaBtn, ...styles.ctaBtnSecondary}}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Únete Hoy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;