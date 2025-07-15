// services/testimonialService.js
import api from './api';

const testimonialService = {
  // GET /api/Testimonials - Obtener todos los testimonios
  getAllTestimonials: async () => {
    try {
      const response = await api.get('/Testimonials');
      console.log('🗣️ Testimonios obtenidos de la API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllTestimonials:', error);
      throw error;
    }
  },

  // POST /api/Testimonials - Crear nuevo testimonio
  createTestimonial: async (testimonialData) => {
    try {
      console.log('🗣️ Creando testimonio con datos:', testimonialData);
      const response = await api.post('/Testimonials', testimonialData);
      console.log('✅ Testimonio creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createTestimonial:', error);
      throw error;
    }
  },

  // GET /api/Testimonials/{id} - Obtener testimonio por ID
  getTestimonialById: async (id) => {
    try {
      const response = await api.get(`/Testimonials/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getTestimonialById:', error);
      throw error;
    }
  },

  // DELETE /api/Testimonials/{id} - Eliminar testimonio
  deleteTestimonial: async (id) => {
    try {
      console.log('🗑️ Eliminando testimonio:', id);
      await api.delete(`/Testimonials/${id}`);
      return true;
    } catch (error) {
      console.error('Error in deleteTestimonial:', error);
      throw error;
    }
  },

  // PUT /api/Testimonials/approve/{id} - Aprobar testimonio
  approveTestimonial: async (id) => {
    try {
      console.log('👍 Aprobando testimonio:', id);
      const response = await api.put(`/Testimonials/approve/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in approveTestimonial:', error);
      throw error;
    }
  },
};

export default testimonialService;