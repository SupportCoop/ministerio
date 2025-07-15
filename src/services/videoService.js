// services/videoService.js
import api from './api';

const videoService = {
  // GET /api/Videos - Obtener todos los videos
  getAllVideos: async () => {
    try {
      const response = await api.get('/Videos');
      console.log('🎥 Videos obtenidos de la API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllVideos:', error);
      throw error;
    }
  },

  // POST /api/Videos - Crear nuevo video
  createVideo: async (videoData) => {
    try {
      console.log('🎥 Creando video con datos:', videoData);
      
      const formattedVideo = {
        videoID: 0,
        title: videoData.title,
        description: videoData.description || "",
        youTubeUrl: videoData.youTubeUrl,
        thumbnailPath: videoData.thumbnailPath || "",
        duration: videoData.duration || "00:00:00",
        viewCount: 0,
        category: videoData.category,
        isActive: true,
        uploadedBy: videoData.uploadedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await api.post('/Videos', formattedVideo);
      console.log('✅ Video creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createVideo:', error);
      throw error;
    }
  },

  // GET /api/Videos/{id} - Obtener video por ID
  getVideoById: async (id) => {
    try {
      const response = await api.get(`/Videos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getVideoById:', error);
      throw error;
    }
  },

  // PUT /api/Videos/{id} - Actualizar video
  updateVideo: async (id, videoData) => {
    try {
      console.log('📝 Actualizando video:', id, videoData);
      
      const response = await api.put(`/Videos/${id}`, {
        ...videoData,
        updatedAt: new Date().toISOString(),
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in updateVideo:', error);
      throw error;
    }
  },

  // DELETE /api/Videos/{id} - Eliminar video
  deleteVideo: async (id) => {
    try {
      console.log('🗑️ Eliminando video:', id);
      await api.delete(`/Videos/${id}`);
      return true;
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      throw error;
    }
  },
};

export default videoService;