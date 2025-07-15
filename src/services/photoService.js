// src/services/photoService.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7177/api/Photos';

// Configure axios for this service
const axiosConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Add auth token to requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const sessionData = localStorage.getItem('sessionData');
  
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      if (session.adminID) {
        headers['X-Admin-ID'] = session.adminID;
      }
    } catch (error) {
      console.warn('Error parsing session data:', error);
    }
  }
  
  return headers;
};

const photoService = {
  // GET: Get all photos with optional filters
  getAllPhotos: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.includeAlbum !== false) params.append('includeAlbum', 'true');
      if (filters.includeAdmin) params.append('includeAdmin', 'true');
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured);
      if (filters.albumId) params.append('albumId', filters.albumId);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
      
      const response = await axios.get(url, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  // GET: Get photo by ID
  getPhotoById: async (id, includeAlbum = true, includeAdmin = false) => {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de foto inválido');
      }

      const params = new URLSearchParams();
      if (includeAlbum) params.append('includeAlbum', 'true');
      if (includeAdmin) params.append('includeAdmin', 'true');
      
      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}/${id}?${queryString}` : `${API_BASE_URL}/${id}`;
      
      const response = await axios.get(url, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching photo with ID ${id}:`, error);
      throw error;
    }
  },

  // GET: Get photos by album
  getPhotosByAlbum: async (albumId, filters = {}) => {
    try {
      if (!albumId || albumId <= 0) {
        throw new Error('ID de álbum inválido');
      }

      const params = new URLSearchParams();
      if (filters.includeAlbum !== false) params.append('includeAlbum', 'true');
      if (filters.includeAdmin) params.append('includeAdmin', 'true');
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const queryString = params.toString();
      const url = queryString ? 
        `${API_BASE_URL}/album/${albumId}?${queryString}` : 
        `${API_BASE_URL}/album/${albumId}`;
      
      const response = await axios.get(url, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching photos for album with ID ${albumId}:`, error);
      throw error;
    }
  },

  // POST: Create a new photo
  createPhoto: async (photoData) => {
    try {
      console.log('📸 Creating photo with data:', JSON.stringify(photoData, null, 2));
      
      const response = await axios.post(API_BASE_URL, photoData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      
      console.log('✅ Photo created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating photo:', error);
      console.error('❌ Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      console.error('❌ Request data sent:', JSON.stringify(photoData, null, 2));
      
      // Show user-friendly error message
      let errorMessage = 'Error al crear la foto';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = `Errores de validación: ${validationErrors.join(', ')}`;
        }
      }
      
      const customError = new Error(errorMessage);
      customError.status = error.response?.status;
      customError.originalError = error;
      throw customError;
    }
  },

  // PUT: Update an existing photo
  updatePhoto: async (id, photoData) => {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de foto inválido');
      }
      
      // Add photoID for updates
      const updateData = {
        photoID: id,
        ...photoData
      };
      
      console.log(`📸 Updating photo ${id} with data:`, updateData);
      
      const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      
      console.log('✅ Photo updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating photo with ID ${id}:`, error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  // DELETE: Delete a photo
  deletePhoto: async (id) => {
    try {
      if (!id || id <= 0) {
        throw new Error('ID de foto inválido');
      }
      
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          ...getAuthHeaders()
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting photo with ID ${id}:`, error);
      throw error;
    }
  }
};

export default photoService;