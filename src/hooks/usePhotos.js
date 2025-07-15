import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import photoService from '../services/photoService';

export const usePhotos = (albumId = null) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPhotos = albumId
        ? await photoService.getPhotosByAlbum(albumId)
        : await photoService.getAllPhotos();
      setPhotos(fetchedPhotos || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (photoData) => {
    try {
      setLoading(true);
      const newPhoto = await photoService.createPhoto(photoData);
      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      toast.success('Foto añadida exitosamente');
      return newPhoto;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Error al añadir la foto: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePhoto = async (id, photoData) => {
    try {
      setLoading(true);
      const updatedPhoto = await photoService.updatePhoto(id, photoData);
      setPhotos(prevPhotos => prevPhotos.map(p => p.photoID === id ? updatedPhoto : p));
      toast.success('Foto actualizada exitosamente');
      return updatedPhoto;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Error al actualizar la foto: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id) => {
    try {
      setLoading(true);
      await photoService.deletePhoto(id);
      setPhotos(prevPhotos => prevPhotos.filter(p => p.photoID !== id));
      toast.success('Foto eliminada exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error(`Error al eliminar la foto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPhotos();
  }, [albumId]);

  return {
    photos,
    loading,
    error,
    fetchPhotos,
    addPhoto,
    updatePhoto,
    deletePhoto,
  };
};

// hooks/useStats.js
export const useStats = () => {
  const [stats, setStats] = useState({
    general: {},
    gallery: {},
    library: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [generalResponse, galleryStats, libraryStats] = await Promise.all([
        apiService.getStatistics(),
        apiService.getGalleryStats ? apiService.getGalleryStats() : Promise.resolve({}),
        apiService.getLibraryStats ? apiService.getLibraryStats() : Promise.resolve({})
      ]);

      setStats({
        general: generalResponse.data || {},
        gallery: galleryStats,
        library: libraryStats
      });
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchAllStats
  };
};
