import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import adminAuthService from '../../services/adminAuth';
import { Calendar, Search, Plus, Edit, Trash2, ArrowLeft, Users, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Para evitar múltiples clics
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    capacity: '',
    category: 'servicio'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    
    // Obtener información del admin autenticado
    const adminData = adminAuthService.getCurrentAdmin();
    setCurrentAdmin(adminData);
    
    loadEvents();
  }, [navigate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando eventos...');
      const response = await apiService.getEvents();
      console.log('✅ Eventos cargados:', response.data);
      setEvents(response.data || []);
    } catch (error) {
      console.error('❌ Error loading events:', error);
      toast.error('Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    // Validaciones
    if (!newEvent.title || !newEvent.eventDate) {
      toast.error('Título y fecha son requeridos');
      return;
    }

    if (!currentAdmin || !currentAdmin.adminID) {
      toast.error('Error: No se pudo identificar el administrador');
      return;
    }

    if (isCreating) {
      return; // Evitar múltiples clics
    }

    try {
      setIsCreating(true);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || '',
        eventDate: newEvent.eventDate,
        location: newEvent.location || '',
        capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
        category: newEvent.category || 'servicio',
        status: 'upcoming',
        createdBy: currentAdmin.adminID, // Asegurar que existe el AdminID
        createdAt: new Date().toISOString()
      };

      console.log('🔄 Creando evento:', eventData);
      console.log('👤 Admin actual:', currentAdmin);
      
      const response = await apiService.createEvent(eventData);
      console.log('✅ Evento creado exitosamente:', response.data);
      
      toast.success('Evento creado exitosamente');
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        capacity: '',
        category: 'servicio'
      });
      
      // Recargar eventos
      await loadEvents();
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      
      // Manejo de errores más específico
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data || 'Error del servidor';
        if (errorMessage.includes('FOREIGN KEY constraint')) {
          toast.error('Error: Administrador no válido. Por favor, inicia sesión nuevamente.');
          adminAuthService.logout();
          navigate('/admin');
        } else {
          toast.error(`Error al crear evento: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        toast.error('Error inesperado al crear evento');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent.title || !editingEvent.eventDate) {
      toast.error('Título y fecha son requeridos');
      return;
    }

    try {
      const eventData = {
        ...editingEvent,
        capacity: editingEvent.capacity ? parseInt(editingEvent.capacity) : null
      };

      console.log('🔄 Actualizando evento:', eventData);
      await apiService.updateEvent(editingEvent.eventID, eventData);
      toast.success('Evento actualizado exitosamente');
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      console.error('❌ Error updating event:', error);
      toast.error('Error al actualizar evento');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      console.log('🔄 Eliminando evento:', eventId);
      await apiService.deleteEvent(eventId);
      toast.success('Evento eliminado exitosamente');
      await loadEvents();
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      toast.error('Error al eliminar evento');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // ... resto del código de estilos permanece igual ...

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
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    searchBox: {
      position: 'relative',
      minWidth: '300px'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    addButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      opacity: isCreating ? 0.7 : 1
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '3rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    loadingSpinner: {
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 2s linear infinite',
      margin: '0 auto 1rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      color: '#64748b'
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '2rem'
    },
    eventCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      transition: 'all 0.3s'
    },
    eventHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1.5rem'
    },
    eventTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    eventCategory: {
      fontSize: '0.875rem',
      opacity: '0.8',
      textTransform: 'capitalize'
    },
    eventBody: {
      padding: '1.5rem'
    },
    eventInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      color: '#64748b',
      fontSize: '0.9rem'
    },
    eventDescription: {
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '1.5rem'
    },
    eventActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      background: 'none',
      border: '1px solid #e5e7eb',
      padding: '0.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    editButton: {
      color: '#3b82f6',
      borderColor: '#3b82f6'
    },
    deleteButton: {
      color: '#ef4444',
      borderColor: '#ef4444'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#1e293b'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2rem'
    },
    cancelButton: {
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    saveButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      opacity: isCreating ? 0.7 : 1
    }
  };

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
            <Calendar size={32} color="#667eea" />
            Gestión de Eventos
          </h1>
          {currentAdmin && (
            <span style={{ marginLeft: 'auto', color: '#64748b' }}>
              Conectado como: {currentAdmin.name}
            </span>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {/* Controles */}
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addButton}
            disabled={isCreating}
          >
            <Plus size={20} />
            {isCreating ? 'Creando...' : 'Crear Evento'}
          </button>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Cargando eventos...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
              {searchTerm ? 'No se encontraron eventos' : 'No hay eventos creados'}
            </h3>
            <p style={{ margin: 0 }}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Crea tu primer evento haciendo clic en "Crear Evento"'
              }
            </p>
          </div>
        ) : (
          <div style={styles.eventsGrid}>
            {filteredEvents.map(event => (
              <div 
                key={event.eventID} 
                style={styles.eventCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={styles.eventHeader}>
                  <div style={styles.eventTitle}>{event.title}</div>
                  <div style={styles.eventCategory}>{event.category || 'Evento'}</div>
                </div>
                <div style={styles.eventBody}>
                  <div style={styles.eventInfo}>
                    <Calendar size={16} />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  {event.location && (
                    <div style={styles.eventInfo}>
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div style={styles.eventInfo}>
                      <Users size={16} />
                      <span>Capacidad: {event.capacity}</span>
                    </div>
                  )}
                  {event.description && (
                    <div style={styles.eventDescription}>
                      {event.description}
                    </div>
                  )}
                  <div style={styles.eventActions}>
                    <button
                      onClick={() => setEditingEvent(event)}
                      style={{...styles.actionButton, ...styles.editButton}}
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.eventID)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para crear evento */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Crear Nuevo Evento</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Título *</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                style={styles.input}
                placeholder="Nombre del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descripción</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                style={styles.textarea}
                placeholder="Descripción del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha y Hora *</label>
              <input
                type="datetime-local"
                value={formatDateTime(newEvent.eventDate)}
                onChange={(e) => setNewEvent({...newEvent, eventDate: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ubicación</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                style={styles.input}
                placeholder="Ubicación del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Capacidad</label>
              <input
                type="number"
                value={newEvent.capacity}
                onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                style={styles.input}
                placeholder="Número máximo de asistentes"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoría</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                style={styles.select}
              >
                <option value="servicio">Servicio</option>
                <option value="festival">Festival</option>
                <option value="conferencia">Conferencia</option>
                <option value="retiro">Retiro</option>
                <option value="estudio">Estudio Bíblico</option>
                <option value="reunion">Reunión</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowAddModal(false)}
                style={styles.cancelButton}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEvent}
                style={styles.saveButton}
                disabled={isCreating}
              >
                {isCreating ? 'Creando...' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar evento */}
      {editingEvent && (
        <div style={styles.modal} onClick={() => setEditingEvent(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Editar Evento</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Título *</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                style={styles.input}
                placeholder="Nombre del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descripción</label>
              <textarea
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                style={styles.textarea}
                placeholder="Descripción del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha y Hora *</label>
              <input
                type="datetime-local"
                value={formatDateTime(editingEvent.eventDate)}
                onChange={(e) => setEditingEvent({...editingEvent, eventDate: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ubicación</label>
              <input
                type="text"
                value={editingEvent.location || ''}
                onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                style={styles.input}
                placeholder="Ubicación del evento"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Capacidad</label>
              <input
                type="number"
                value={editingEvent.capacity || ''}
                onChange={(e) => setEditingEvent({...editingEvent, capacity: e.target.value})}
                style={styles.input}
                placeholder="Número máximo de asistentes"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoría</label>
              <select
                value={editingEvent.category || 'servicio'}
                onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                style={styles.select}
              >
                <option value="servicio">Servicio</option>
                <option value="festival">Festival</option>
                <option value="conferencia">Conferencia</option>
                <option value="retiro">Retiro</option>
                <option value="estudio">Estudio Bíblico</option>
                <option value="reunion">Reunión</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setEditingEvent(null)}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateEvent}
                style={styles.saveButton}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;