import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { apiService } from '../services/api';
import { Search, Filter, Calendar } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos reales desde la API
      const response = await apiService.getEvents();
      const eventsData = response.data || [];

      // Filtrar solo eventos activos y formatear datos
      const activeEvents = eventsData
        .filter(event => event.isActive)
        .map(event => ({
          ...event,
          // Mapear campos para compatibilidad con EventCard
          status: event.isActive ? 'active' : 'inactive',
          capacity: event.maxCapacity,
          category: mapEventTypeToCategory(event.eventType),
          startTime: event.eventDate, // Usar eventDate como startTime también
          imageUrl: event.imagePath || null
        }));

      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      
      // Fallback: usar algunos eventos por defecto si la API falla
      const fallbackEvents = await loadFallbackEvents();
      setEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  // Mapear eventType a categorías para el filtro
  const mapEventTypeToCategory = (eventType) => {
    if (!eventType) return 'other';
    
    const typeMap = {
      'Servicio Regular': 'worship',
      'Servicio Dominical': 'worship',
      'Adoración': 'worship',
      'Estudio Bíblico': 'study',
      'Estudio': 'study',
      'Retiro': 'retreat',
      'Retiro Espiritual': 'retreat',
      'Conferencia': 'conference',
      'Seminario': 'conference',
      'Niños': 'children',
      'Ministerio Infantil': 'children',
      'Jóvenes': 'youth',
      'Ministerio Juvenil': 'youth'
    };

    // Buscar coincidencia exacta o parcial
    for (const [key, value] of Object.entries(typeMap)) {
      if (eventType.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'other';
  };

  // Eventos de fallback desde estadísticas si no hay eventos reales
  const loadFallbackEvents = async () => {
    try {
      const [titleStat, dateStat, locationStat] = await Promise.allSettled([
        apiService.getStatisticByName('next_event_title'),
        apiService.getStatisticByName('next_event_date'),
        apiService.getStatisticByName('next_event_location')
      ]);

      const fallbackEvent = {
        eventID: 'fallback-1',
        title: titleStat.status === 'fulfilled' && titleStat.value.data?.statValue 
          ? titleStat.value.data.statValue 
          : 'Servicio Dominical',
        description: 'Únete a nosotros para un tiempo de adoración, enseñanza y comunión en familia.',
        eventDate: dateStat.status === 'fulfilled' && dateStat.value.data?.statValue
          ? dateStat.value.data.statValue
          : getNextSunday().toISOString(),
        startTime: dateStat.status === 'fulfilled' && dateStat.value.data?.statValue
          ? dateStat.value.data.statValue
          : getNextSunday().toISOString(),
        location: locationStat.status === 'fulfilled' && locationStat.value.data?.statValue
          ? locationStat.value.data.statValue
          : 'Iglesia Principal - Higüey',
        status: 'active',
        category: 'worship',
        maxCapacity: 100,
        capacity: 100,
        currentRegistrations: 0,
        isActive: true,
        eventType: 'Servicio Regular',
        imageUrl: null
      };

      return [fallbackEvent];
    } catch (error) {
      console.error('Error loading fallback events:', error);
      return [];
    }
  };

  const getNextSunday = () => {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
    nextSunday.setHours(11, 0, 0, 0);
    return nextSunday;
  };

  const filterEvents = () => {
    let filtered = events;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.category === filterType);
    }

    // Ordenar por fecha (próximos primero)
    filtered = filtered.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    setFilteredEvents(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  // Función para recargar eventos (puede ser llamada desde EventCard cuando alguien se registra)
  const refreshEvents = () => {
    loadEvents();
  };

  const styles = {
    eventsPage: {
      padding: '2rem 0',
      minHeight: '100vh'
    },
    eventsHeader: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    eventsTitle: {
      fontSize: '2.5rem',
      color: '#1e293b',
      marginBottom: '1rem',
      fontWeight: 'bold'
    },
    eventsSubtitle: {
      fontSize: '1.1rem',
      color: '#64748b'
    },
    eventsControls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      minWidth: '250px'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      flex: 1,
      fontSize: '1rem'
    },
    filterBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      minWidth: '250px'
    },
    filterSelect: {
      border: 'none',
      outline: 'none',
      background: 'none',
      fontSize: '1rem',
      cursor: 'pointer',
      flex: 1
    },
    eventsContent: {
      marginBottom: '3rem'
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '2rem'
    },
    eventsStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    statItem: {
      background: 'white',
      padding: '1rem 2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#667eea',
      margin: 0
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.9rem',
      margin: 0
    },
    noEvents: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b'
    },
    noEventsTitle: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      marginTop: '1rem'
    },
    eventsInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '3rem'
    },
    infoCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    infoTitle: {
      color: '#1e293b',
      marginBottom: '1rem',
      fontSize: '1.3rem',
      fontWeight: '600'
    },
    infoList: {
      color: '#64748b',
      lineHeight: '1.6',
      paddingLeft: '1.2rem'
    },
    infoListItem: {
      marginBottom: '0.5rem'
    },
    eventsLoading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem'
    },
    loadingSpinner: {
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #4A90E2',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.eventsPage}>
        <div className="container">
          <div style={styles.eventsLoading}>
            <div style={styles.loadingSpinner}></div>
            <p>Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.eventsPage}>
      <div className="container">
        <div style={styles.eventsHeader}>
          <h1 style={styles.eventsTitle}>Nuestros Eventos</h1>
          <p style={styles.eventsSubtitle}>Descubre todas las actividades y eventos de nuestra comunidad</p>
        </div>

        {/* Estadísticas de eventos */}
        <div style={styles.eventsStats}>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>{events.length}</p>
            <p style={styles.statLabel}>Eventos Disponibles</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>{events.filter(e => new Date(e.eventDate) > new Date()).length}</p>
            <p style={styles.statLabel}>Próximos Eventos</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>{events.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0)}</p>
            <p style={styles.statLabel}>Total Registrados</p>
          </div>
        </div>

        <div style={styles.eventsControls}>
          <div style={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterBox}>
            <Filter size={20} color="#9ca3af" />
            <select value={filterType} onChange={handleFilterChange} style={styles.filterSelect}>
              <option value="all">Todos los eventos</option>
              <option value="worship">Adoración</option>
              <option value="study">Estudio Bíblico</option>
              <option value="retreat">Retiros</option>
              <option value="conference">Conferencias</option>
              <option value="children">Niños</option>
              <option value="youth">Jóvenes</option>
              <option value="other">Otros</option>
            </select>
          </div>
        </div>

        <div style={styles.eventsContent}>
          {filteredEvents.length > 0 ? (
            <div style={styles.eventsGrid}>
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.eventID} 
                  event={event} 
                  onRegistrationChange={refreshEvents}
                />
              ))}
            </div>
          ) : (
            <div style={styles.noEvents}>
              <Calendar size={64} color="#64748b" />
              <h3 style={styles.noEventsTitle}>No se encontraron eventos</h3>
              <p>
                {searchTerm || filterType !== 'all' 
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'No hay eventos programados en este momento'
                }
              </p>
            </div>
          )}
        </div>

        <div style={styles.eventsInfo}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>¿Cómo participar?</h3>
            <ol style={styles.infoList}>
              <li style={styles.infoListItem}>Navega por los eventos disponibles</li>
              <li style={styles.infoListItem}>Haz clic en "Asistir" en el evento de tu interés</li>
              <li style={styles.infoListItem}>Si no tienes cuenta, se te pedirá registrarte</li>
              <li style={styles.infoListItem}>¡Listo! Recibirás una confirmación</li>
            </ol>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Información Importante</h3>
            <ul style={styles.infoList}>
              <li style={styles.infoListItem}>Algunos eventos tienen cupo limitado</li>
              <li style={styles.infoListItem}>Recibirás notificaciones sobre nuevos eventos</li>
              <li style={styles.infoListItem}>Puedes cancelar tu asistencia si es necesario</li>
              <li style={styles.infoListItem}>Para más información, contáctanos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;