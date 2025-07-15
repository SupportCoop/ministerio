import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import bookService from '../../services/bookService';
import videoService from '../../services/videoService';
import adminAuthService from '../../services/adminAuth';
import { 
  BarChart3, ArrowLeft, Users, Calendar, TrendingUp, Activity,
  BookOpen, Video, Eye, Star, Heart, Play
} from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    recentRegistrations: 0,
    totalBooks: 0,
    featuredBooks: 0,
    availableBooks: 0,
    totalVideos: 0,
    featuredVideos: 0,
    totalVideoViews: 0,
    totalVideoLikes: 0,
    videoCategories: 0,
    bookCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadStatistics();
  }, [navigate]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios
      const usersResponse = await apiService.getUsers();
      const users = usersResponse.data || [];
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isActive).length;

      // Cargar eventos
      const eventsResponse = await apiService.getEvents();
      const events = eventsResponse.data || [];
      const totalEvents = events.length;
      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.eventDate) > now).length;

      // Cargar registraciones
      const registrationsResponse = await apiService.getEventRegistrations();
      const registrations = registrationsResponse.data || [];
      const totalRegistrations = registrations.length;
      
      // Registraciones de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRegistrations = registrations.filter(reg => 
        new Date(reg.registrationDate) > thirtyDaysAgo
      ).length;

      // Cargar libros
      let booksStats = {
        totalBooks: 0,
        featuredBooks: 0,
        availableBooks: 0,
        bookCategories: 0
      };

      try {
        const books = await bookService.getAllBooks();
        booksStats.totalBooks = books.length;
        booksStats.featuredBooks = books.filter(book => book.isFeatured).length;
        booksStats.availableBooks = books.filter(book => book.isAvailable).length;
        const uniqueBookCategories = [...new Set(books.map(book => book.category))].filter(Boolean);
        booksStats.bookCategories = uniqueBookCategories.length;
      } catch (error) {
        console.warn('Error loading books statistics:', error);
      }

      // Cargar videos
      let videosStats = {
        totalVideos: 0,
        featuredVideos: 0,
        totalVideoViews: 0,
        totalVideoLikes: 0,
        videoCategories: 0
      };

      try {
        const videos = await videoService.getAllVideos();
        videosStats.totalVideos = videos.length;
        videosStats.featuredVideos = videos.filter(video => video.isFeatured).length;
        videosStats.totalVideoViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
        videosStats.totalVideoLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0);
        const uniqueVideoCategories = [...new Set(videos.map(video => video.category))].filter(Boolean);
        videosStats.videoCategories = uniqueVideoCategories.length;
      } catch (error) {
        console.warn('Error loading videos statistics:', error);
      }

      setStats({
        totalUsers,
        activeUsers,
        totalEvents,
        upcomingEvents,
        totalRegistrations,
        recentRegistrations,
        ...booksStats,
        ...videosStats
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '6rem'
    },
    header: {
      background: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '2rem 0'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    backButton: {
      background: '#f1f5f9',
      border: 'none',
      padding: '0.75rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#64748b'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    statIcon: {
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      lineHeight: '1'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.9rem',
      marginTop: '0.5rem'
    },
    statSubtext: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginTop: '0.5rem'
    },
    section: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem'
    },
    trendsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1.5rem'
    },
    trendItem: {
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '8px',
      textAlign: 'center'
    },
    trendValue: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    trendLabel: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      fontSize: '1.1rem',
      color: '#64748b'
    },
    summaryText: {
      color: '#64748b',
      lineHeight: '1.8',
      fontSize: '0.9rem'
    }
  };

  const userActivityRate = stats.totalUsers > 0 ? 
    Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;

  const bookAvailabilityRate = stats.totalBooks > 0 ? 
    Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0;

  const avgViewsPerVideo = stats.totalVideos > 0 ? 
    Math.round(stats.totalVideoViews / stats.totalVideos) : 0;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            onClick={() => navigate('/admin')} 
            style={styles.backButton}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 style={styles.title}>
            <BarChart3 size={32} color="#667eea" />
            Estadísticas del Sistema
          </h1>
        </div>
      </header>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>Cargando estadísticas...</div>
        ) : (
          <>
            {/* Estadísticas principales */}
            <h2 style={styles.sectionTitle}>
              <Users size={20} />
              Usuarios y Eventos
            </h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalUsers}</div>
                    <div style={styles.statLabel}>Total de Usuarios</div>
                    <div style={styles.statSubtext}>
                      {stats.activeUsers} activos ({userActivityRate}%)
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  }}>
                    <Users size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalEvents}</div>
                    <div style={styles.statLabel}>Total de Eventos</div>
                    <div style={styles.statSubtext}>
                      {stats.upcomingEvents} próximos eventos
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}>
                    <Calendar size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalRegistrations}</div>
                    <div style={styles.statLabel}>Total Registraciones</div>
                    <div style={styles.statSubtext}>
                      {stats.recentRegistrations} en los últimos 30 días
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{userActivityRate}%</div>
                    <div style={styles.statLabel}>Tasa de Actividad</div>
                    <div style={styles.statSubtext}>
                      Usuarios activos vs total
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  }}>
                    <Activity size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de Libros */}
            <h2 style={styles.sectionTitle}>
              <BookOpen size={20} />
              Biblioteca de Libros
            </h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalBooks}</div>
                    <div style={styles.statLabel}>Total de Libros</div>
                    <div style={styles.statSubtext}>
                      {stats.availableBooks} disponibles ({bookAvailabilityRate}%)
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  }}>
                    <BookOpen size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.featuredBooks}</div>
                    <div style={styles.statLabel}>Libros Destacados</div>
                    <div style={styles.statSubtext}>
                      Recomendaciones especiales
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  }}>
                    <Star size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.bookCategories}</div>
                    <div style={styles.statLabel}>Categorías de Libros</div>
                    <div style={styles.statSubtext}>
                      Diversidad de temas
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                  }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalBooks - stats.availableBooks}</div>
                    <div style={styles.statLabel}>Libros Prestados</div>
                    <div style={styles.statSubtext}>
                      Actualmente en uso
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                  }}>
                    <Heart size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de Videos */}
            <h2 style={styles.sectionTitle}>
              <Video size={20} />
              Biblioteca de Videos
            </h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalVideos}</div>
                    <div style={styles.statLabel}>Total de Videos</div>
                    <div style={styles.statSubtext}>
                      Contenido multimedia disponible
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  }}>
                    <Video size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalVideoViews.toLocaleString()}</div>
                    <div style={styles.statLabel}>Total Visualizaciones</div>
                    <div style={styles.statSubtext}>
                      Promedio: {avgViewsPerVideo} por video
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  }}>
                    <Eye size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.totalVideoLikes.toLocaleString()}</div>
                    <div style={styles.statLabel}>Total Me Gusta</div>
                    <div style={styles.statSubtext}>
                      Interacciones positivas
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}>
                    <Heart size={20} />
                  </div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <div>
                    <div style={styles.statNumber}>{stats.featuredVideos}</div>
                    <div style={styles.statLabel}>Videos Destacados</div>
                    <div style={styles.statSubtext}>
                      Contenido recomendado
                    </div>
                  </div>
                  <div style={{
                    ...styles.statIcon,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  }}>
                    <Star size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Adicionales */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <TrendingUp size={20} />
                Métricas Adicionales
              </h2>
              <div style={styles.trendsGrid}>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>{stats.upcomingEvents}</div>
                  <div style={styles.trendLabel}>Eventos Próximos</div>
                </div>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>{stats.totalEvents - stats.upcomingEvents}</div>
                  <div style={styles.trendLabel}>Eventos Pasados</div>
                </div>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>{stats.videoCategories}</div>
                  <div style={styles.trendLabel}>Categorías Videos</div>
                </div>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>
                    {stats.totalEvents > 0 ? Math.round(stats.totalRegistrations / stats.totalEvents) : 0}
                  </div>
                  <div style={styles.trendLabel}>Promedio Asistentes/Evento</div>
                </div>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>{stats.recentRegistrations}</div>
                  <div style={styles.trendLabel}>Registros Últimos 30 Días</div>
                </div>
                <div style={styles.trendItem}>
                  <div style={styles.trendValue}>
                    {stats.totalVideos > 0 ? Math.round((stats.totalVideoLikes / stats.totalVideos) * 10) / 10 : 0}
                  </div>
                  <div style={styles.trendLabel}>Promedio Likes/Video</div>
                </div>
              </div>
            </div>

            {/* Resumen del Sistema */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <Activity size={20} />
                Resumen del Sistema
              </h2>
              <div style={styles.summaryText}>
                <p>
                  <strong>Usuarios:</strong> El sistema cuenta con {stats.totalUsers} usuarios registrados, 
                  de los cuales {stats.activeUsers} están activos ({userActivityRate}% de actividad).
                </p>
                <p>
                  <strong>Eventos:</strong> Se han creado {stats.totalEvents} eventos en total, 
                  con {stats.upcomingEvents} eventos programados para el futuro y {stats.totalRegistrations} registraciones.
                </p>
                <p>
                  <strong>Biblioteca:</strong> La biblioteca cuenta con {stats.totalBooks} libros ({stats.availableBooks} disponibles) 
                  distribuidos en {stats.bookCategories} categorías diferentes.
                </p>
                <p>
                  <strong>Videos:</strong> Se tienen {stats.totalVideos} videos con {stats.totalVideoViews.toLocaleString()} visualizaciones totales 
                  y {stats.totalVideoLikes.toLocaleString()} me gusta, organizados en {stats.videoCategories} categorías.
                </p>
                <p>
                  <strong>Actividad reciente:</strong> En los últimos 30 días se registraron {stats.recentRegistrations} nuevas 
                  asistencias a eventos, mostrando una comunidad activa y comprometida.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Statistics;