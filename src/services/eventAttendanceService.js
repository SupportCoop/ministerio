import api from './api';

const eventAttendanceService = {
  // GET /api/EventAttendance - Obtener todas las asistencias
  getAllAttendances: async () => {
    try {
      const response = await api.get('/EventAttendance');
      console.log('👥 Asistencias obtenidas de la API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllAttendances:', error);
      throw error;
    }
  },

  // POST /api/EventAttendance - Crear nueva asistencia
  createAttendance: async (attendanceData) => {
    try {
      console.log('👥 Creando asistencia con datos:', attendanceData);
      const response = await api.post('/EventAttendance', attendanceData);
      console.log('✅ Asistencia creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createAttendance:', error);
      throw error;
    }
  },

  // GET /api/EventAttendance/event/{eventId} - Obtener asistencias por evento
  getAttendancesByEvent: async (eventId) => {
    try {
      const response = await api.get(`/EventAttendance/event/${eventId}`);
      console.log(`👥 Asistencias para el evento ${eventId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in getAttendancesByEvent for event ${eventId}:`, error);
      throw error;
    }
  },
};

export default eventAttendanceService;