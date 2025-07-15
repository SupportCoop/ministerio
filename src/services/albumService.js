// src/services/albumService.js
import apiClient from './config/axios';

const albumService = {
  // GET: Get all albums
  getAllAlbums: async () => {
    try {
      console.log('📁 Fetching all albums...');
      const response = await apiClient.get('/Albums'); // Note: Using 'Albums' (plural)
      console.log('📁 Albums response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching albums:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // GET: Get album by ID
  getAlbumById: async (id) => {
    try {
      console.log(`📁 Fetching album with ID: ${id}`);
      const response = await apiClient.get(`/Albums/${id}`);
      console.log('📁 Album response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching album with ID ${id}:`, error);
      throw error;
    }
  },

  // POST: Create a new album
  createAlbum: async (albumData) => {
    try {
      console.log('📁 Creating new album:', albumData);
      const response = await apiClient.post('/Albums', albumData);
      console.log('📁 Created album:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating album:', error);
      throw error;
    }
  },

  // PUT: Update an existing album
  updateAlbum: async (id, albumData) => {
    try {
      console.log(`📁 Updating album ${id}:`, albumData);
      const response = await apiClient.put(`/Albums/${id}`, albumData);
      console.log('📁 Updated album:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating album with ID ${id}:`, error);
      throw error;
    }
  },

  // DELETE: Delete an album
  deleteAlbum: async (id) => {
    try {
      console.log(`📁 Deleting album with ID: ${id}`);
      const response = await apiClient.delete(`/Albums/${id}`);
      console.log('📁 Album deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting album with ID ${id}:`, error);
      throw error;
    }
  },

  // GET: Get photos for a specific album
  getAlbumPhotos: async (id) => {
    try {
      console.log(`📁 Fetching photos for album ${id}`);
      const response = await apiClient.get(`/Albums/${id}/photos`);
      console.log('📁 Album photos:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching photos for album with ID ${id}:`, error);
      throw error;
    }
  },

  // PATCH: Toggle album visibility
  toggleAlbumVisibility: async (id) => {
    try {
      console.log(`📁 Toggling visibility for album ${id}`);
      const response = await apiClient.patch(`/Albums/${id}/toggle-visibility`);
      console.log('📁 Album visibility toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error toggling visibility for album with ID ${id}:`, error);
      throw error;
    }
  },

  // PATCH: Update album cover image
  updateAlbumCoverImage: async (id, imageUrl) => {
    try {
      console.log(`📁 Updating cover image for album ${id}:`, imageUrl);
      const response = await apiClient.patch(`/Albums/${id}/cover-image`, { 
        coverImageUrl: imageUrl 
      });
      console.log('📁 Cover image updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating cover image for album with ID ${id}:`, error);
      throw error;
    }
  },

  // POST: Increment album view count
  incrementAlbumView: async (id) => {
    try {
      console.log(`📁 Incrementing view count for album ${id}`);
      const response = await apiClient.post(`/Albums/${id}/view`);
      console.log('📁 View count incremented:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error incrementing view count for album with ID ${id}:`, error);
      throw error;
    }
  },

  // GET: Search albums
  searchAlbums: async (query) => {
    try {
      console.log(`📁 Searching albums with query: "${query}"`);
      const response = await apiClient.get('/Albums/search', { 
        params: { q: query } 
      });
      console.log('📁 Search results:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error searching albums with query "${query}":`, error);
      throw error;
    }
  },

  // GET: Get public albums only
  getPublicAlbums: async () => {
    try {
      console.log('📁 Fetching public albums...');
      const response = await apiClient.get('/Albums/public');
      console.log('📁 Public albums:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching public albums:', error);
      throw error;
    }
  }
};

export default albumService;