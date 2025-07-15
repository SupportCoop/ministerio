// hooks/useBooks.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBooks();
      setBooks(response.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    try {
      setLoading(true);
      const response = await apiService.createBook(bookData);
      await fetchBooks(); // Recargar la lista
      toast.success('Libro creado exitosamente');
      return response.data;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear el libro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      await apiService.updateBook(id, bookData);
      await fetchBooks(); // Recargar la lista
      toast.success('Libro actualizado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar el libro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      await apiService.deleteBook(id);
      await fetchBooks(); // Recargar la lista
      toast.success('Libro eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar el libro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleBookFeatured = async (id) => {
    try {
      await apiService.setBookFeatured(id);
      await fetchBooks();
      toast.success('Estado del libro actualizado');
    } catch (err) {
      toast.error('Error al actualizar el libro');
      throw err;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    toggleBookFeatured
  };
};

// hooks/useAlbums.js
export const useAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAlbums();
      setAlbums(response.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar los álbumes');
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (albumData) => {
    try {
      setLoading(true);
      const response = await apiService.createAlbum(albumData);
      await fetchAlbums();
      toast.success('Álbum creado exitosamente');
      return response.data;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear el álbum');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAlbum = async (id, albumData) => {
    try {
      setLoading(true);
      await apiService.updateAlbum(id, albumData);
      await fetchAlbums();
      toast.success('Álbum actualizado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar el álbum');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (id) => {
    try {
      setLoading(true);
      await apiService.deleteAlbum(id);
      await fetchAlbums();
      toast.success('Álbum eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar el álbum');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleAlbumVisibility = async (id) => {
    try {
      await apiService.toggleAlbumVisibility(id);
      await fetchAlbums();
      toast.success('Visibilidad del álbum actualizada');
    } catch (err) {
      toast.error('Error al actualizar la visibilidad');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return {
    albums,
    loading,
    error,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    toggleAlbumVisibility
  };
};

// hooks/usePhotos.js
export const usePhotos = (albumId = null) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (albumId) {
        response = await apiService.getPhotosByAlbum(albumId);
      } else {
        response = await apiService.getPhotos();
      }
      
      setPhotos(response.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (photoData) => {
    try {
      setLoading(true);
      const response = await apiService.createPhoto(photoData);
      await fetchPhotos();
      toast.success('Foto subida exitosamente');
      return response.data;
    } catch (err) {
      setError(err.message);
      toast.error('Error al subir la foto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotoBulk = async (photosData) => {
    try {
      setLoading(true);
      const response = await apiService.createPhotoBulk(photosData);
      await fetchPhotos();
      toast.success('Fotos subidas exitosamente');
      return response.data;
    } catch (err) {
      setError(err.message);
      toast.error('Error al subir las fotos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePhoto = async (id, photoData) => {
    try {
      setLoading(true);
      await apiService.updatePhoto(id, photoData);
      await fetchPhotos();
      toast.success('Foto actualizada exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar la foto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id) => {
    try {
      setLoading(true);
      await apiService.deletePhoto(id);
      await fetchPhotos();
      toast.success('Foto eliminada exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar la foto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const togglePhotoFeatured = async (id) => {
    try {
      await apiService.setPhotoFeatured(id);
      await fetchPhotos();
      toast.success('Estado de la foto actualizado');
    } catch (err) {
      toast.error('Error al actualizar la foto');
      throw err;
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
    uploadPhoto,
    uploadPhotoBulk,
    updatePhoto,
    deletePhoto,
    togglePhotoFeatured
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

// hooks/useMediaLibrary.js
export const useMediaLibrary = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file, metadata = {}) => {
    try {
      setLoading(true);
      setUploadProgress(0);
      
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Aquí implementarías la lógica de subida real
      // Por ahora simulamos una subida exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Archivo subido exitosamente');
      
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (err) {
      setError(err.message);
      toast.error('Error al subir el archivo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setLoading(true);
      // Implementar lógica de eliminación
      toast.success('Archivo eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar el archivo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    error,
    uploadProgress,
    uploadFile,
    deleteFile
  };
};