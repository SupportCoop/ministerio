import api from './api';

const messageService = {
  // GET /api/Messages - Obtener todos los mensajes
  getAllMessages: async () => {
    try {
      const response = await api.get('/Messages');
      console.log('✉️ Mensajes obtenidos de la API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllMessages:', error);
      throw error;
    }
  },

  // POST /api/Messages - Crear nuevo mensaje
  createMessage: async (messageData) => {
    try {
      console.log('✉️ Creando mensaje con datos:', messageData);
      const response = await api.post('/Messages', messageData);
      console.log('✅ Mensaje creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createMessage:', error);
      throw error;
    }
  },

  // GET /api/Messages/{id} - Obtener mensaje por ID
  getMessageById: async (id) => {
    try {
      const response = await api.get(`/Messages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getMessageById for id ${id}:`, error);
      throw error;
    }
  },

  // DELETE /api/Messages/{id} - Eliminar mensaje
  deleteMessage: async (id) => {
    try {
      await api.delete(`/Messages/${id}`);
      return true;
    } catch (error) {
      console.error(`Error in deleteMessage for id ${id}:`, error);
      throw error;
    }
  },

  // PUT /api/Messages/markasread/{id} - Marcar como leído
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/Messages/markasread/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in markAsRead for id ${id}:`, error);
      throw error;
    }
  },

  // PUT /api/Messages/markasreplied/{id} - Marcar como respondido
  markAsReplied: async (id) => {
    try {
      const response = await api.put(`/Messages/markasreplied/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in markAsReplied for id ${id}:`, error);
      throw error;
    }
  },
};

export default messageService;