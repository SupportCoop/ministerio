// PhotoManagement.jsx - Example of how to use the PhotoForm component
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PhotoForm from '../../components/PhotoForm'; // Adjust this path based on your project structure
import photoService from '../../services/photoService';

const PhotoManagement = ({ currentAdmin }) => {
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isActive: true,
    includeAlbum: true
  });

  // Load photos on component mount
  useEffect(() => {
    loadPhotos();
  }, [filters]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const fetchedPhotos = await photoService.getAllPhotos(filters);
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhoto = () => {
    setEditingPhoto(null);
    setShowForm(true);
  };

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo);
    setShowForm(true);
  };

  const handleSavePhoto = async (photoData) => {
    try {
      if (editingPhoto) {
        // Update existing photo
        const updatedPhoto = await photoService.updatePhoto(editingPhoto.photoID, photoData);
        setPhotos(prev => 
          prev.map(photo => 
            photo.photoID === editingPhoto.photoID ? updatedPhoto : photo
          )
        );
        toast.success('Foto actualizada exitosamente');
      } else {
        // Create new photo
        const newPhoto = await photoService.createPhoto(photoData);
        setPhotos(prev => [newPhoto, ...prev]);
        toast.success('Foto creada exitosamente');
      }
      
      setShowForm(false);
      setEditingPhoto(null);
    } catch (error) {
      console.error('Error saving photo:', error);
      // Error handling is done in the service, but we can add additional logic here
      throw error; // Re-throw to let PhotoForm handle it
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      return;
    }

    try {
      await photoService.deletePhoto(photoId);
      setPhotos(prev => prev.filter(photo => photo.photoID !== photoId));
      toast.success('Foto eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  const handleToggleFeatured = async (photoId) => {
    try {
      const updatedPhoto = await photoService.toggleFeatured(photoId);
      setPhotos(prev => 
        prev.map(photo => 
          photo.photoID === photoId ? updatedPhoto : photo
        )
      );
      toast.success('Estado destacado actualizado');
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Error al actualizar el estado destacado');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPhoto(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-600">Cargando fotos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Fotos</h1>
        <button
          onClick={handleCreatePhoto}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          + Nueva Foto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium">Solo fotos activas</span>
          </label>
          
          <button
            onClick={loadPhotos}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div key={photo.photoID} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={photo.thumbnailUrl || photo.imageUrl}
                alt={photo.altText || photo.caption}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg'; // Fallback image
                }}
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate" title={photo.fileName}>
                {photo.fileName}
              </h3>
              
              {photo.caption && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={photo.caption}>
                  {photo.caption}
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>Álbum: {photo.album?.title || 'Sin álbum'}</span>
                {photo.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Destacada
                  </span>
                )}
                {!photo.isActive && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                    Inactiva
                  </span>
                )}
              </div>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEditPhoto(photo)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
                
                <button
                  onClick={() => handleToggleFeatured(photo.photoID)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  title={photo.isFeatured ? 'Quitar destacado' : 'Marcar como destacada'}
                >
                  ⭐
                </button>
                
                <button
                  onClick={() => handleDeletePhoto(photo.photoID)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  title="Eliminar foto"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fotos</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primera foto.</p>
          <button
            onClick={handleCreatePhoto}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Crear Primera Foto
          </button>
        </div>
      )}

      {/* Photo Form Modal */}
      {showForm && (
        <PhotoForm
          photo={editingPhoto}
          onSave={handleSavePhoto}
          onCancel={handleCloseForm}
          currentAdmin={currentAdmin}
        />
      )}
    </div>
  );
};

export default PhotoManagement;