import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import notificationService from '../services/notifications';
import { toast } from 'react-toastify';
import { 
  Upload, 
  Image, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  Plus,
  RefreshCw
} from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [bannerImages, setBannerImages] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    capacity: '',
    category: 'worship'
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadBannerImages();
  }, []);

  const loadBannerImages = () => {
    // Simular carga de imágenes desde la carpeta public/img
    const mockImages = [
      {
        id: 1,
        name: 'banner1.jpg',
        url: '/img/banner1.jpg',
        active: true,
        uploadDate: new Date().toISOString()
      },
      {
        id: 2,
        name: 'banner2.jpg',
        url: '/img/banner2.jpg',
        active: true,
        uploadDate: new Date().toISOString()
      },
      {
        id: 3,
        name: 'banner3.jpg',
        url: '/img/banner3.jpg',
        active: false,
        uploadDate: new Date().toISOString()
      }
    ];
    setBannerImages(mockImages);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Convertir archivo a base64 para simular subida
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          name: file.name,
          url: e.target.result,
          active: true,
          uploadDate: new Date().toISOString(),
          size: file.size,
          type: file.type
        };

        setBannerImages(prev => [...prev, newImage]);
        setUploadProgress(100);
        
        setTimeout(() => {
          setUploadProgress(0);
          setLoading(false);
          toast.success('Imagen subida exitosamente');
        }, 500);

        clearInterval(progressInterval);
      };

      reader.onerror = () => {
        clearInterval(progressInterval);
        setLoading(false);
        setUploadProgress(0);
        toast.error('Error al subir la imagen');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setLoading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
      toast.error('Error al subir la imagen');
    }
  };

  const toggleImageVisibility = (imageId) => {
    setBannerImages(prev =>
      prev.map(img =>
        img.id === imageId ? { ...img, active: !img.active } : img
      )
    );
    
    const image = bannerImages.find(img => img.id === imageId);
    toast.success(
      `Imagen ${image?.active ? 'ocultada' : 'mostrada'} exitosamente`
    );
  };

  const deleteImage = (imageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      setBannerImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada exitosamente');
    }
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createEvent = async () => {
    // Validaciones
    if (!newEvent.title || !newEvent.description || !newEvent.eventDate) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const eventDate = new Date(newEvent.eventDate);
    if (eventDate <= new Date()) {
      toast.error('La fecha del evento debe ser futura');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...newEvent,
        eventID: Date.now(),
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userID
      };

      // En producción, harías una petición POST a la API
      console.log('Creating event:', eventData);

      // Simular creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Notificar a todos los usuarios sobre el nuevo evento
      try {
        const usersResponse = await apiService.getUsers();
        const activeUsers = usersResponse.data.filter(u => u.isActive && u.userID !== user.userID);
        
        await notificationService.notifyNewEvent(eventData, activeUsers);
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // No fallar la creación del evento si las notificaciones fallan
      }

      // Limpiar formulario
      setNewEvent({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        capacity: '',
        category: 'worship'
      });

      toast.success('Evento creado y notificaciones enviadas exitosamente');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h3>Acceso Denegado</h3>
          <p>No tienes permisos para acceder a este panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Panel de Administración</h2>
        <p>Gestiona el contenido y eventos del sitio</p>
      </div>

      <div className="admin-sections">
        {/* Sección de Gestión de Imágenes */}
        <div className="admin-section">
          <div className="section-header">
            <h3>
              <Image size={20} />
              Gestión de Imágenes del Banner
            </h3>
            <div className="section-actions">
              <label className="upload-button">
                <Upload size={16} />
                {loading ? 'Subiendo...' : 'Subir Imagen'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
              <button 
                className="refresh-button"
                onClick={loadBannerImages}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span>{uploadProgress}%</span>
            </div>
          )}

          <div className="images-grid">
            {bannerImages.map(image => (
              <div key={image.id} className="image-item">
                <div className="image-preview">
                  <img src={image.url} alt={image.name} />
                  <div className="image-overlay">
                    <button
                      className="action-button toggle-button"
                      onClick={() => toggleImageVisibility(image.id)}
                      title={image.active ? 'Ocultar' : 'Mostrar'}
                    >
                      {image.active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => deleteImage(image.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="image-details">
                  <h4>{image.name}</h4>
                  <div className="image-info">
                    <span className={`status ${image.active ? 'active' : 'inactive'}`}>
                      {image.active ? 'Visible' : 'Oculta'}
                    </span>
                    <span className="file-size">{formatFileSize(image.size || 0)}</span>
                  </div>
                  <small className="upload-date">
                    Subida: {formatDate(image.uploadDate)}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="images-info">
            <h4>Información Importante:</h4>
            <ul>
              <li>Resolución recomendada: 1200x400px o superior</li>
              <li>Formatos soportados: JPG, PNG, WebP</li>
              <li>Tamaño máximo: 5MB por imagen</li>
              <li>Las imágenes visibles aparecen en el banner principal</li>
            </ul>
          </div>
        </div>

        {/* Sección de Creación de Eventos */}
        <div className="admin-section">
          <div className="section-header">
            <h3>
              <Plus size={20} />
              Crear Nuevo Evento
            </h3>
          </div>

          <div className="event-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="event-title">Título del Evento *</label>
                <input
                  type="text"
                  id="event-title"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventInputChange}
                  placeholder="Ej: Servicio Dominical"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-category">Categoría</label>
                <select
                  id="event-category"
                  name="category"
                  value={newEvent.category}
                  onChange={handleEventInputChange}
                >
                  <option value="worship">Adoración</option>
                  <option value="study">Estudio Bíblico</option>
                  <option value="retreat">Retiro</option>
                  <option value="conference">Conferencia</option>
                  <option value="children">Ministerio Infantil</option>
                  <option value="youth">Jóvenes</option>
                  <option value="special">Evento Especial</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="event-date">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  id="event-date"
                  name="eventDate"
                  value={newEvent.eventDate}
                  onChange={handleEventInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-capacity">Capacidad</label>
                <input
                  type="number"
                  id="event-capacity"
                  name="capacity"
                  value={newEvent.capacity}
                  onChange={handleEventInputChange}
                  placeholder="Ej: 100"
                  min="1"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="event-location">Ubicación</label>
                <input
                  type="text"
                  id="event-location"
                  name="location"
                  value={newEvent.location}
                  onChange={handleEventInputChange}
                  placeholder="Ej: Iglesia Principal - Higüey"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="event-description">Descripción *</label>
                <textarea
                  id="event-description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventInputChange}
                  placeholder="Describe el evento, actividades programadas, etc."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="create-event-button"
                onClick={createEvent}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Creando...' : 'Crear Evento y Notificar'}
              </button>
            </div>
          </div>

          <div className="event-form-info">
            <h4>Al crear un evento:</h4>
            <ul>
              <li>Se enviará una notificación automática a todos los usuarios activos</li>
              <li>El evento aparecerá inmediatamente en la página de eventos</li>
              <li>Los usuarios podrán registrarse para asistir</li>
              <li>Se actualizará el contador de próximos eventos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;