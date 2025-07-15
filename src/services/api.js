import axios from 'axios';

const API_BASE_URL = 'https://localhost:7177/api/';

// Configurar axios con timeout más corto y reintentos
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
  retry: 3,
  retryDelay: 1000
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar timestamp para debugging
    config.metadata = { startTime: new Date().getTime() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y reintentos
api.interceptors.response.use(
  (response) => {
    // Log del tiempo de respuesta
    const endTime = new Date().getTime();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    
    return response;
  },
  async (error) => {
    const { config } = error;
    
    // Log del error
    console.error(`🔴 API Error: ${config?.method?.toUpperCase()} ${config?.url}`, error.message);
    
    // Verificar si debemos reintentar
    if (config && shouldRetry(error) && config.__retryCount < (config.retry || 3)) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;
      
      console.log(`🔄 Reintentando petición (${config.__retryCount}/${config.retry || 3}): ${config.url}`);
      
      // Esperar antes del reintento
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// Función para determinar si debemos reintentar
const shouldRetry = (error) => {
  // Reintentar en errores de red o timeouts
  return (
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.message.includes('Network Error') ||
    error.message.includes('timeout') ||
    (error.response && error.response.status >= 500)
  );
};

// API Functions con manejo de errores
export const apiService = {
  // ===============================================
  // UTILIDADES DE CONEXIÓN
  // ===============================================
  
  // Verificar conectividad con el servidor
  async checkConnectivity() {
    try {
      const response = await axios.get(`${API_BASE_URL}health`, { timeout: 3000 });
      return { isConnected: true, latency: response.headers['x-response-time'] || 'unknown' };
    } catch (error) {
      return { isConnected: false, error: error.message };
    }
  },

  // ===============================================
  // EVENTOS
  // ===============================================
  getEvents: async () => {
    try {
      const response = await api.get('/Event');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/Event/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo evento ${id}:`, error);
      throw error;
    }
  },

  createEvent: async (eventData) => {
    try {
      // Validar datos antes de enviar
      if (!eventData.title || !eventData.eventDate) {
        throw new Error('Título y fecha son requeridos');
      }
      
      if (!eventData.createdBy) {
        throw new Error('ID del administrador es requerido');
      }

      console.log('📤 Enviando evento al servidor:', eventData);
      const response = await api.post('/Event', eventData);
      console.log('✅ Evento creado en servidor:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/Event/${id}`, eventData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando evento ${id}:`, error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/Event/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando evento ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // ADMINISTRADORES
  // ===============================================
  getAdmins: async () => {
    try {
      const response = await api.get('/Admins');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo administradores:', error);
      throw error;
    }
  },

  getAdminById: async (id) => {
    try {
      const response = await api.get(`/Admins/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo administrador ${id}:`, error);
      throw error;
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/Admins', adminData);
      return response;
    } catch (error) {
      console.error('❌ Error creando administrador:', error);
      throw error;
    }
  },

  updateAdmin: async (id, adminData) => {
    try {
      const response = await api.put(`/Admins/${id}`, adminData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando administrador ${id}:`, error);
      throw error;
    }
  },

  deleteAdmin: async (id) => {
    try {
      const response = await api.delete(`/Admins/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando administrador ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // AUTENTICACIÓN DE ADMIN
  // ===============================================
  authenticateAdmin: async (email, password) => {
    try {
      const response = await api.get('/Admins');
      const admins = response.data;
      const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());

      if (admin) {
        // In a real app, you would verify a hashed password.
        // Here we simulate a successful login if the admin is found.
        // NOTE: This is insecure and for demonstration purposes only.
        
        // Simulate token generation
        const token = btoa(JSON.stringify({ adminId: admin.adminID, email: admin.email }));

        return {
          success: true,
          admin: admin,
          token: token
        };
      } else {
        return { success: false, error: 'Credenciales de admin incorrectas' };
      }
    } catch (error) {
      console.error('❌ Error en autenticación de admin:', error);
      throw error;
    }
  },

  // ===============================================
  // USUARIOS
  // ===============================================
  getUsers: async () => {
    try {
      const response = await api.get('/Users');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/Users/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo usuario ${id}:`, error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/Users', userData);
      return response;
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/Users/${id}`, userData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando usuario ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/Users/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando usuario ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // REGISTRACIONES Y EVENTOS
  // ===============================================
  getEventRegistrations: async () => {
    try {
      const response = await api.get('/EventRegistration');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo registraciones:', error);
      throw error;
    }
  },

  registerForEvent: async (registrationData) => {
    try {
      console.log('📤 Registrando usuario en evento:', registrationData);
      const response = await api.post('/EventRegistration', registrationData);
      console.log('✅ Registro exitoso:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error registrando en evento:', error);
      throw error;
    }
  },

  getRegistrationsByEvent: async (eventId) => {
    try {
      const response = await api.get(`/EventRegistration/event/${eventId}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo registraciones para evento ${eventId}:`, error);
      throw error;
    }
  },

  deleteRegistration: async (id) => {
    try {
      const response = await api.delete(`/EventRegistration/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando registración ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // ESTADÍSTICAS
  // ===============================================
  getStatistics: async () => {
    try {
      const response = await api.get('/MinisterioStat');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  createStatistic: async (statisticData) => {
    try {
      const response = await api.post('/MinisterioStat', statisticData);
      return response;
    } catch (error) {
      console.error('❌ Error creando estadística:', error);
      throw error;
    }
  },

  updateStatistic: async (statName, newValue, newDescription = null) => {
    try {
      const response = await api.put(`/MinisterioStat/${statName}`, {
        newValue: newValue,
        newDescription: newDescription
      });
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando estadística ${statName}:`, error);
      throw error;
    }
  },

  getStatisticValue: async (statName) => {
    try {
      const response = await api.get(`/MinisterioStat/value/${statName}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo valor de estadística ${statName}:`, error);
      throw error;
    }
  },

  getStatisticValueAsInt: async (statName) => {
    try {
      const response = await api.get(`/MinisterioStat/value-int/${statName}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo valor entero de estadística ${statName}:`, error);
      throw error;
    }
  },

  getStatisticByName: async (statName) => {
    try {
      const response = await api.get(`/MinisterioStat/by-name/${statName}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo estadística por nombre ${statName}:`, error);
      throw error;
    }
  },

  getStatisticById: async (id) => {
    try {
      const response = await api.get(`/MinisterioStat/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo estadística por ID ${id}:`, error);
      throw error;
    }
  },

  deleteStatistic: async (statName) => {
    try {
      const response = await api.delete(`/MinisterioStat/${statName}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando estadística ${statName}:`, error);
      throw error;
    }
  },

  checkStatisticExists: async (statName) => {
    try {
      const response = await api.get(`/MinisterioStat/exists/${statName}`);
      return response;
    } catch (error) {
      console.error(`❌ Error verificando existencia de estadística ${statName}:`, error);
      throw error;
    }
  },

  initializeDefaultStatistics: async () => {
    try {
      const response = await api.post('/MinisterioStat/initialize-defaults');
      return response;
    } catch (error) {
      console.error('❌ Error inicializando estadísticas por defecto:', error);
      throw error;
    }
  },

  // ===============================================
  // NOTIFICACIONES
  // ===============================================
  getUserNotifications: async (userId) => {
    try {
      const response = await api.get(`/Notification/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo notificaciones para usuario ${userId}:`, error);
      throw error;
    }
  },

  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/Notification', notificationData);
      return response;
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await api.put(`/Notification/markasread/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error marcando notificación ${id} como leída:`, error);
      throw error;
    }
  },

  // ===============================================
  // MENSAJES
  // ===============================================
  getMessages: async () => {
    try {
      const response = await api.get('/Messages');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo mensajes:', error);
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/Messages', messageData);
      return response;
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      throw error;
    }
  },

  deleteMessage: async (id) => {
    try {
      const response = await api.delete(`/Messages/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando mensaje ${id}:`, error);
      throw error;
    }
  },

  markMessageAsRead: async (id) => {
    try {
      const response = await api.put(`/Messages/markasread/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error marcando mensaje ${id} como leído:`, error);
      throw error;
    }
  },

  // ===============================================
  // VIDEOS
  // ===============================================
  getVideos: async () => {
    try {
      const response = await api.get('/Videos');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo videos:', error);
      throw error;
    }
  },

  getVideoById: async (id) => {
    try {
      const response = await api.get(`/Videos/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo video ${id}:`, error);
      throw error;
    }
  },

  createVideo: async (videoData) => {
    try {
      const response = await api.post('/Videos', videoData);
      return response;
    } catch (error) {
      console.error('❌ Error creando video:', error);
      throw error;
    }
  },

  updateVideo: async (id, videoData) => {
    try {
      const response = await api.put(`/Videos/${id}`, videoData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando video ${id}:`, error);
      throw error;
    }
  },

  deleteVideo: async (id) => {
    try {
      const response = await api.delete(`/Videos/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando video ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // MÉTODOS DE UTILIDAD PARA ESTADÍSTICAS
  // ===============================================
  
  getWelcomeTitle: async () => {
    try {
      const response = await apiService.getStatisticValue('welcome_title');
      return response.data?.value || 'Bienvenido a Nuestro Ministerio';
    } catch (error) {
      console.error('❌ Error obteniendo título de bienvenida:', error);
      return 'Bienvenido a Nuestro Ministerio';
    }
  },

  getWelcomeDescription: async () => {
    try {
      const response = await apiService.getStatisticValue('welcome_description');
      return response.data?.value || 'Somos una comunidad de fe comprometida con el crecimiento espiritual.';
    } catch (error) {
      console.error('❌ Error obteniendo descripción de bienvenida:', error);
      return 'Somos una comunidad de fe comprometida con el crecimiento espiritual.';
    }
  },

  getActiveMembers: async () => {
    try {
      const response = await apiService.getStatisticValueAsInt('active_members');
      return response.data?.value || 0;
    } catch (error) {
      console.error('❌ Error obteniendo miembros activos:', error);
      return 0;
    }
  },

  getAnnualEvents: async () => {
    try {
      const response = await apiService.getStatisticValueAsInt('annual_events');
      return response.data?.value || 0;
    } catch (error) {
      console.error('❌ Error obteniendo eventos anuales:', error);
      return 0;
    }
  },

  getYearsServing: async () => {
    try {
      const response = await apiService.getStatisticValueAsInt('years_serving');
      return response.data?.value || 0;
    } catch (error) {
      console.error('❌ Error obteniendo años de servicio:', error);
      return 0;
    }
  },

  updateNextEventAttendees: async (newCount) => {
    try {
      await apiService.updateStatistic('next_event_attendees', newCount.toString());
      return true;
    } catch (error) {
      console.error('❌ Error actualizando contador de asistentes:', error);
      return false;
    }
  },
  // Agregar estos métodos al final de tu apiService, antes del método runDiagnostics()

  // ===============================================
  // LIBROS (BOOKS)
  // ===============================================
  getBooks: async () => {
    try {
      const response = await api.get('/Book');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo libros:', error);
      throw error;
    }
  },

  getBooksForAdmin: async () => {
    try {
      const response = await api.get('/Book/admin');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo libros para admin:', error);
      throw error;
    }
  },

  getBookById: async (id) => {
    try {
      const response = await api.get(`/Book/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo libro ${id}:`, error);
      throw error;
    }
  },

  createBook: async (bookData) => {
    try {
      // Validar datos requeridos
      if (!bookData.title || !bookData.author) {
        throw new Error('Título y autor son requeridos');
      }
      
      if (!bookData.createdBy) {
        throw new Error('ID del administrador es requerido');
      }

      console.log('📤 Creando libro:', bookData);
      const response = await api.post('/Book', bookData);
      console.log('✅ Libro creado:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error creando libro:', error);
      throw error;
    }
  },

  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/Book/${id}`, bookData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando libro ${id}:`, error);
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/Book/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando libro ${id}:`, error);
      throw error;
    }
  },

  patchBook: async (id, patchData) => {
    try {
      const response = await api.patch(`/Book/${id}`, patchData);
      return response;
    } catch (error) {
      console.error(`❌ Error parcheando libro ${id}:`, error);
      throw error;
    }
  },

  toggleBookAvailability: async (id) => {
    try {
      const response = await api.patch(`/Book/${id}/toggle-availability`);
      return response;
    } catch (error) {
      console.error(`❌ Error cambiando disponibilidad del libro ${id}:`, error);
      throw error;
    }
  },

  setBookFeatured: async (id, featured = true) => {
    try {
      const response = await api.patch(`/Book/${id}/featured`, { isFeatured: featured });
      return response;
    } catch (error) {
      console.error(`❌ Error marcando libro ${id} como destacado:`, error);
      throw error;
    }
  },

  setBookRecommended: async (id, recommended = true) => {
    try {
      const response = await api.patch(`/Book/${id}/recommended`, { isRecommended: recommended });
      return response;
    } catch (error) {
      console.error(`❌ Error marcando libro ${id} como recomendado:`, error);
      throw error;
    }
  },

  getBooksByCategory: async (category) => {
    try {
      const response = await api.get(`/Book/category/${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo libros de categoría ${category}:`, error);
      throw error;
    }
  },

  getFeaturedBooks: async () => {
    try {
      const response = await api.get('/Book/featured');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo libros destacados:', error);
      throw error;
    }
  },

  getRecommendedBooks: async () => {
    try {
      const response = await api.get('/Book/recommended');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo libros recomendados:', error);
      throw error;
    }
  },

  searchBooks: async (searchParams) => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await api.get(`/Book/search?${queryString}`);
      return response;
    } catch (error) {
      console.error('❌ Error buscando libros:', error);
      throw error;
    }
  },

  getBooksByAuthor: async (author) => {
    try {
      const response = await api.get(`/Book/author/${encodeURIComponent(author)}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo libros del autor ${author}:`, error);
      throw error;
    }
  },

  getBookCategories: async () => {
    try {
      const response = await api.get('/Book/categories');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo categorías de libros:', error);
      throw error;
    }
  },

  recordBookView: async (id) => {
    try {
      const response = await api.post(`/Book/${id}/view`);
      return response;
    } catch (error) {
      console.error(`❌ Error registrando vista del libro ${id}:`, error);
      throw error;
    }
  },

  recordBookClick: async (id) => {
    try {
      const response = await api.post(`/Book/${id}/click`);
      return response;
    } catch (error) {
      console.error(`❌ Error registrando click del libro ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // ÁLBUMES (ALBUMS)
  // ===============================================
  getAlbums: async () => {
    try {
      const response = await api.get('/Album');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo álbumes:', error);
      throw error;
    }
  },

  getAlbumsForAdmin: async () => {
    try {
      const response = await api.get('/Album/admin');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo álbumes para admin:', error);
      throw error;
    }
  },

  getAlbumById: async (id) => {
    try {
      const response = await api.get(`/Album/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo álbum ${id}:`, error);
      throw error;
    }
  },

  createAlbum: async (albumData) => {
    try {
      // Validar datos requeridos
      if (!albumData.title) {
        throw new Error('Título del álbum es requerido');
      }
      
      if (!albumData.createdBy) {
        throw new Error('ID del administrador es requerido');
      }

      console.log('📤 Creando álbum:', albumData);
      const response = await api.post('/Album', albumData);
      console.log('✅ Álbum creado:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error creando álbum:', error);
      throw error;
    }
  },

  updateAlbum: async (id, albumData) => {
    try {
      const response = await api.put(`/Album/${id}`, albumData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando álbum ${id}:`, error);
      throw error;
    }
  },

  deleteAlbum: async (id) => {
    try {
      const response = await api.delete(`/Album/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando álbum ${id}:`, error);
      throw error;
    }
  },

  getAlbumsByCategory: async (category) => {
    try {
      const response = await api.get(`/Album/category/${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo álbumes de categoría ${category}:`, error);
      throw error;
    }
  },

  getAlbumPhotos: async (id) => {
    try {
      const response = await api.get(`/Album/${id}/photos`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo fotos del álbum ${id}:`, error);
      throw error;
    }
  },

  toggleAlbumVisibility: async (id) => {
    try {
      const response = await api.patch(`/Album/${id}/toggle-visibility`);
      return response;
    } catch (error) {
      console.error(`❌ Error cambiando visibilidad del álbum ${id}:`, error);
      throw error;
    }
  },

  searchAlbums: async (searchParams) => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await api.get(`/Album/search?${queryString}`);
      return response;
    } catch (error) {
      console.error('❌ Error buscando álbumes:', error);
      throw error;
    }
  },

  recordAlbumView: async (id) => {
    try {
      const response = await api.post(`/Album/${id}/view`);
      return response;
    } catch (error) {
      console.error(`❌ Error registrando vista del álbum ${id}:`, error);
      throw error;
    }
  },

  updateAlbumCoverImage: async (id, coverImageData) => {
    try {
      const response = await api.patch(`/Album/${id}/cover-image`, coverImageData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando imagen de portada del álbum ${id}:`, error);
      throw error;
    }
  },

  // ===============================================
  // FOTOS (PHOTOS)
  // ===============================================
  getPhotos: async () => {
    try {
      const response = await api.get('/Photo');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo fotos:', error);
      throw error;
    }
  },

  getPhotoById: async (id) => {
    try {
      const response = await api.get(`/Photo/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo foto ${id}:`, error);
      throw error;
    }
  },

  createPhoto: async (photoData) => {
    try {
      // Validar datos requeridos
      if (!photoData.albumID) {
        throw new Error('ID del álbum es requerido');
      }
      
      if (!photoData.uploadedBy) {
        throw new Error('ID del administrador es requerido');
      }

      console.log('📤 Subiendo foto:', photoData);
      const response = await api.post('/Photo', photoData);
      console.log('✅ Foto subida:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error subiendo foto:', error);
      throw error;
    }
  },

  updatePhoto: async (id, photoData) => {
    try {
      const response = await api.put(`/Photo/${id}`, photoData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando foto ${id}:`, error);
      throw error;
    }
  },

  deletePhoto: async (id) => {
    try {
      const response = await api.delete(`/Photo/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando foto ${id}:`, error);
      throw error;
    }
  },

  getPhotosByAlbum: async (albumId) => {
    try {
      const response = await api.get(`/Photo/album/${albumId}`);
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo fotos del álbum ${albumId}:`, error);
      throw error;
    }
  },

  createPhotoBulk: async (photosData) => {
    try {
      console.log('📤 Subiendo fotos masivamente:', photosData);
      const response = await api.post('/Photo/bulk', photosData);
      console.log('✅ Fotos subidas masivamente:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error subiendo fotos masivamente:', error);
      throw error;
    }
  },

  updatePhotoOrder: async (id, orderData) => {
    try {
      const response = await api.patch(`/Photo/${id}/order`, orderData);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando orden de foto ${id}:`, error);
      throw error;
    }
  },

  setPhotoFeatured: async (id, featured = true) => {
    try {
      const response = await api.patch(`/Photo/${id}/featured`, { isFeatured: featured });
      return response;
    } catch (error) {
      console.error(`❌ Error marcando foto ${id} como destacada:`, error);
      throw error;
    }
  },

  getFeaturedPhotos: async () => {
    try {
      const response = await api.get('/Photo/featured');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo fotos destacadas:', error);
      throw error;
    }
  },

  getRecentPhotos: async () => {
    try {
      const response = await api.get('/Photo/recent');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo fotos recientes:', error);
      throw error;
    }
  },

  recordPhotoView: async (id) => {
    try {
      const response = await api.post(`/Photo/${id}/view`);
      return response;
    } catch (error) {
      console.error(`❌ Error registrando vista de foto ${id}:`, error);
      throw error;
    }
  },

  reorderPhotos: async (reorderData) => {
    try {
      const response = await api.patch('/Photo/reorder', reorderData);
      return response;
    } catch (error) {
      console.error('❌ Error reordenando fotos:', error);
      throw error;
    }
  },

  // ===============================================
  // MÉTODOS DE UTILIDAD PARA NUEVAS FUNCIONALIDADES
  // ===============================================
  
  // Obtener estadísticas de galería
  getGalleryStats: async () => {
    try {
      const [albumsResponse, photosResponse] = await Promise.all([
        apiService.getAlbums(),
        apiService.getPhotos()
      ]);
      
      const albums = albumsResponse.data || [];
      const photos = photosResponse.data || [];
      
      return {
        totalAlbums: albums.length,
        totalPhotos: photos.length,
        publicAlbums: albums.filter(a => a.isPublic).length,
        featuredPhotos: photos.filter(p => p.isFeatured).length
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de galería:', error);
      return {
        totalAlbums: 0,
        totalPhotos: 0,
        publicAlbums: 0,
        featuredPhotos: 0
      };
    }
  },

  // Obtener estadísticas de biblioteca
  getLibraryStats: async () => {
    try {
      const response = await apiService.getBooks();
      const books = response.data || [];
      
      return {
        totalBooks: books.length,
        availableBooks: books.filter(b => b.isAvailable).length,
        featuredBooks: books.filter(b => b.isFeatured).length,
        recommendedBooks: books.filter(b => b.isRecommended).length,
        categories: [...new Set(books.map(b => b.category).filter(Boolean))]
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de biblioteca:', error);
      return {
        totalBooks: 0,
        availableBooks: 0,
        featuredBooks: 0,
        recommendedBooks: 0,
        categories: []
      };
    }
  },

  // ===============================================
  // MÉTODOS DE DIAGNÓSTICO
  // ===============================================
  
  async runDiagnostics() {
    console.log('🔍 Ejecutando diagnósticos de API...');
    
    const results = {
      timestamp: new Date().toISOString(),
      connectivity: await this.checkConnectivity(),
      endpoints: {}
    };
    
    // Probar endpoints principales
    const testEndpoints = [
      { name: 'Events', url: '/Event' },
      { name: 'Admins', url: '/Admins' },
      { name: 'Users', url: '/Users' },
      { name: 'Statistics', url: '/MinisterioStat' }
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const start = Date.now();
        await api.get(endpoint.url, { timeout: 3000 });
        const duration = Date.now() - start;
        results.endpoints[endpoint.name] = { 
          status: 'OK', 
          responseTime: duration + 'ms' 
        };
      } catch (error) {
        results.endpoints[endpoint.name] = { 
          status: 'ERROR', 
          error: error.message 
        };
      }
    }
    
    console.log('📊 Resultados de diagnóstico:', results);
    return results;
  }
};

export default api;