import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import albumService from '../services/albumService';
import photoService from '../services/photoService';

const PhotoForm = ({ photo, onSave, onCancel, currentAdmin }) => {
  const [formData, setFormData] = useState({
    photoID: 0,
    albumID: 1,
    imageUrl: '',
    thumbnailUrl: '',
    fileName: '',
    caption: '',
    altText: '',
    displayOrder: 1,
    uploadedDate: new Date().toISOString(),
    uploadedBy: currentAdmin?.adminID || 3,
    fileSize: 0,
    fileType: 'image/jpeg',
    width: 0,
    height: 0,
    isActive: true,
    isFeatured: false,
    viewsCount: 0,
    likesCount: 0,
    tags: '',
    dateTaken: new Date().toISOString(),
    cameraModel: '',
    location: '',
    lastModified: new Date().toISOString(),
    modifiedBy: currentAdmin?.adminID || 3,
    ...photo
  });

  const [albums, setAlbums] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [albumsLoading, setAlbumsLoading] = useState(true);

  // Fetch albums with proper error handling
  const fetchAlbums = useCallback(async () => {
    try {
      setAlbumsLoading(true);
      console.log('🔄 Iniciando carga de álbumes...');
      
      const fetchedAlbums = await albumService.getAllAlbums();
      console.log('📁 Albums cargados:', fetchedAlbums);
      console.log('📊 Cantidad de álbumes:', fetchedAlbums?.length || 0);
      
      if (!fetchedAlbums || fetchedAlbums.length === 0) {
        console.warn('⚠️ No se encontraron álbumes');
        toast.warning('No hay álbumes disponibles. Crea un álbum primero.');
        setAlbums([]);
        return;
      }
      
      setAlbums(fetchedAlbums);
      
      // Verify if album ID 1 exists, if not use the first available album
      if (!photo) {
        const albumExists = fetchedAlbums.find(album => album.albumID === 1);
        console.log('🔍 ¿Existe álbum con ID 1?:', albumExists);
        
        if (!albumExists && fetchedAlbums.length > 0) {
          console.log('⚠️ Álbum con ID 1 no existe, usando primer álbum disponible:', fetchedAlbums[0]);
          setFormData(prev => ({ ...prev, albumID: fetchedAlbums[0].albumID }));
        } else if (albumExists) {
          console.log('✅ Manteniendo álbum por defecto ID: 1');
        }
      }
    } catch (error) {
      console.error('❌ Error completo al cargar álbumes:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      
      setAlbums([]);
      
      // Check if this is an endpoint not found error
      if (error.message.includes('Ningún endpoint de álbumes encontrado')) {
        console.warn('🚧 Usando álbumes mock para desarrollo');
        toast.warning('Endpoint de álbumes no encontrado. Usando datos de prueba.');
        
        // Create mock albums for development
        const mockAlbums = [
          { albumID: 1, albumName: 'Álbum Principal', title: 'Álbum Principal' },
          { albumID: 2, albumName: 'Eventos', title: 'Eventos' },
          { albumID: 3, albumName: 'Ministerio', title: 'Ministerio' }
        ];
        
        setAlbums(mockAlbums);
        console.log('📁 Álbumes mock cargados:', mockAlbums);
        return;
      }
      
      if (error.response) {
        toast.error(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else if (error.request) {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        toast.error(`Error al cargar álbumes: ${error.message}`);
      }
    } finally {
      setAlbumsLoading(false);
      console.log('✅ Carga de álbumes finalizada');
    }
  }, [photo]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Debug effect to track formData changes
  useEffect(() => {
    console.log('📋 PhotoForm - formData actualizado:', {
      albumID: formData.albumID,
      fileName: formData.fileName,
      imageUrl: formData.imageUrl
    });
  }, [formData.albumID, formData.fileName, formData.imageUrl]);

  // Update admin info when currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      setFormData(prev => ({
        ...prev,
        uploadedBy: prev.uploadedBy || currentAdmin.adminID,
        modifiedBy: currentAdmin.adminID,
        lastModified: new Date().toISOString()
      }));
    }
  }, [currentAdmin]);

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.imageUrl?.trim()) {
      newErrors.imageUrl = 'La URL de la imagen es requerida';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'La URL de la imagen no es válida';
    }
    
    if (!formData.fileName?.trim()) {
      newErrors.fileName = 'El nombre del archivo es requerido';
    }
    
    if (!formData.albumID) {
      newErrors.albumID = 'Debe seleccionar un álbum';
    }
    
    // Optional URL validation
    if (formData.thumbnailUrl && !isValidUrl(formData.thumbnailUrl)) {
      newErrors.thumbnailUrl = 'La URL de la miniatura no es válida';
    }
    
    // Numeric field validation
    if (formData.displayOrder < 1) {
      newErrors.displayOrder = 'El orden debe ser mayor a 0';
    }
    
    if (formData.width < 0) {
      newErrors.width = 'El ancho no puede ser negativo';
    }
    
    if (formData.height < 0) {
      newErrors.height = 'El alto no puede ser negativo';
    }
    
    if (formData.fileSize < 0) {
      newErrors.fileSize = 'El tamaño del archivo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Iniciando envío de foto...');
      console.log('📋 Albums disponibles:', albums);
      
      // Verificar que hay álbumes disponibles
      if (albums.length === 0) {
        toast.error("No hay álbumes disponibles. Por favor, crea un álbum primero.");
        return;
      }

      const selectedAlbum = albums.find(a => a.albumID === Number(formData.albumID));
      console.log('🎯 Álbum seleccionado:', selectedAlbum);

      if (!selectedAlbum) {
        toast.error("Por favor, selecciona un álbum válido.");
        return;
      }

      // Format data exactly like the working Swagger example
      const photoData = {
        albumID: Number(formData.albumID),
        imageUrl: formData.imageUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl?.trim() || "",
        fileName: formData.fileName.trim(),
        caption: formData.caption?.trim() || "",
        altText: formData.altText?.trim() || "",
        displayOrder: Number(formData.displayOrder) || 1,
        uploadedDate: photo ? formData.uploadedDate : new Date().toISOString(),
        uploadedBy: Number(currentAdmin?.adminID) || 1,
        fileSize: Number(formData.fileSize) || 0,
        fileType: formData.fileType || "image/jpeg",
        width: Number(formData.width) || 0,
        height: Number(formData.height) || 0,
        isActive: Boolean(formData.isActive),
        isFeatured: Boolean(formData.isFeatured),
        viewsCount: Number(formData.viewsCount) || 0,
        likesCount: Number(formData.likesCount) || 0,
        tags: formData.tags?.trim() || "",
        dateTaken: formData.dateTaken ? new Date(formData.dateTaken).toISOString() : new Date().toISOString(),
        cameraModel: formData.cameraModel?.trim() || "",
        location: formData.location?.trim() || "",
        lastModified: new Date().toISOString(),
        modifiedBy: Number(currentAdmin?.adminID) || 1
      };

      // Basic validation before sending
      if (!photoData.albumID || photoData.albumID <= 0) {
        toast.error('Debe seleccionar un álbum válido');
        return;
      }
      
      if (!photoData.imageUrl || photoData.imageUrl.trim() === '') {
        toast.error('La URL de la imagen es requerida');
        return;
      }
      
      if (!photoData.fileName || photoData.fileName.trim() === '') {
        toast.error('El nombre del archivo es requerido');
        return;
      }
      
      // Validate URL format
      try {
        new URL(photoData.imageUrl);
      } catch (e) {
        toast.error('La URL de la imagen no es válida');
        return;
      }
      
      // Validate thumbnail URL if provided
      if (photoData.thumbnailUrl && photoData.thumbnailUrl.trim() !== '') {
        try {
          new URL(photoData.thumbnailUrl);
        } catch (e) {
          toast.error('La URL de la miniatura no es válida');
          return;
        }
      }

      console.log('📤 Datos que se van a enviar:', JSON.stringify(photoData, null, 2));
      console.log('👤 Admin actual:', currentAdmin);
      console.log('🎯 Álbum seleccionado:', JSON.stringify(selectedAlbum, null, 2));

      let result;
      
      if (photo) {
        // Update existing photo
        result = await photoService.updatePhoto(formData.photoID, photoData);
        toast.success('Foto actualizada exitosamente');
      } else {
        // Create new photo
        result = await photoService.createPhoto(photoData);
        toast.success('Foto creada exitosamente');
      }
      
      // Call parent onSave if provided for additional logic
      if (typeof onSave === 'function') {
        await onSave(result);
      }
      
      // Close the form
      onCancel();
      
    } catch (error) {
      console.error('Error saving photo:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        originalError: error.originalError
      });
      
      // More specific error messages
      if (error.status === 400) {
        toast.error(`Error de validación: ${error.message}`);
      } else if (error.status === 401) {
        toast.error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.status === 403) {
        toast.error('No tienes permisos para realizar esta acción.');
      } else if (error.status === 500) {
        toast.error('Error del servidor. Por favor, intenta más tarde.');
      } else {
        toast.error(`Error al guardar la foto: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {photo ? 'Editar Foto' : 'Crear Nueva Foto'}
              </h2>
              <p className="text-blue-100 mt-1">
                {photo ? 'Modifica los detalles de la foto' : 'Agrega una nueva foto al álbum'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Album Selection - Prominent */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  📁 Álbum de Destino *
                </label>
                <button
                  type="button"
                  onClick={fetchAlbums}
                  className="text-sm bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 transition-colors flex items-center gap-2"
                  disabled={albumsLoading}
                >
                  🔄 Recargar
                </button>
              </div>
              
              {albumsLoading ? (
                <div className="w-full px-4 py-4 bg-white rounded-xl border-2 border-gray-200 text-gray-500 text-center">
                  <div className="animate-pulse">Cargando álbumes...</div>
                </div>
              ) : albums.length === 0 ? (
                <div className="w-full px-4 py-4 bg-red-50 rounded-xl border-2 border-red-200 text-red-600 text-center">
                  ⚠️ No hay álbumes disponibles. Verifica tu conexión o crea un álbum primero.
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    name="albumID"
                    value={formData.albumID || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium bg-white ${
                      errors.albumID ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona un álbum</option>
                    {albums.map(album => (
                      <option key={album.albumID} value={album.albumID}>
                        {album.albumName || album.title || `Álbum ${album.albumID}`}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                    💡 Albums disponibles: {albums.length} | Seleccionado: {formData.albumID || 'Ninguno'}
                  </div>
                </div>
              )}
              {errors.albumID && <p className="text-red-500 text-sm mt-3 font-medium">⚠️ {errors.albumID}</p>}
            </div>

            {/* Main Info Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  🖼️ Información Principal
                </h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">URL de la Imagen *</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.imageUrl ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                    disabled={loading}
                  />
                  {errors.imageUrl && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.imageUrl}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">URL de la Miniatura</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.thumbnailUrl ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="https://ejemplo.com/miniatura.jpg"
                    disabled={loading}
                  />
                  {errors.thumbnailUrl && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.thumbnailUrl}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Nombre del Archivo *</label>
                  <input
                    type="text"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.fileName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="concierto_01.jpg"
                    required
                    disabled={loading}
                  />
                  {errors.fileName && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.fileName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Archivo</label>
                  <select
                    name="fileType"
                    value={formData.fileType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    disabled={loading}
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/gif">GIF</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/bmp">BMP</option>
                    <option value="image/tiff">TIFF</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Descripción / Leyenda</label>
                  <textarea
                    name="caption"
                    value={formData.caption}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24 resize-none"
                    placeholder="Descripción de la foto..."
                    disabled={loading}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Texto Alternativo (Accesibilidad)</label>
                  <input
                    type="text"
                    name="altText"
                    value={formData.altText}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Descripción breve para lectores de pantalla"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  ⚙️ Detalles Adicionales
                </h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Etiquetas</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="escenario, banda, luces"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Separadas por comas</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Ubicación</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="La Romana, República Dominicana"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Orden de Visualización</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.displayOrder ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  {errors.displayOrder && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.displayOrder}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Fecha de Captura</label>
                  <input
                    type="datetime-local"
                    name="dateTaken"
                    value={formData.dateTaken ? formData.dateTaken.substring(0, 16) : ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Modelo de Cámara</label>
                  <input
                    type="text"
                    name="cameraModel"
                    value={formData.cameraModel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Canon EOS R5"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Estado</label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        disabled={loading}
                      />
                      <span className="font-medium text-gray-700">Activa</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tamaño (bytes)</label>
                  <input
                    type="number"
                    name="fileSize"
                    value={formData.fileSize}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.fileSize ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  {errors.fileSize && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.fileSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Ancho (px)</label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.width ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  {errors.width && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.width}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Alto (px)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.height ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  {errors.height && <p className="text-red-500 text-sm mt-2 font-medium">⚠️ {errors.height}</p>}
                </div>
              </div>
            </div>
            
            {/* Admin Info */}
            {currentAdmin && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  👤 Información del Administrador
                </h4>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-gray-700">
                    <span className="font-medium">{photo ? 'Modificado por:' : 'Subido por:'}</span> 
                    <span className="font-bold text-blue-600 ml-2">{currentAdmin.name || currentAdmin.email}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {currentAdmin.adminID} • {photo ? 'Última modificación' : 'Fecha de subida'}: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer with Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || albumsLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  {photo ? '✅ Actualizar Foto' : '🖼️ Crear Foto'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoForm;