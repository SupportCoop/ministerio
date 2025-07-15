import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, RefreshCw, Loader, Users, Edit, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import eventAttendanceService from '../../services/eventAttendanceService';
import EventAttendanceForm from '../../components/EventAttendanceForm';
import { useAuth } from '../../context/AuthContext';

const EventAttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
  const { admin } = useAuth();

  const fetchAttendances = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedAttendances = await eventAttendanceService.getAllAttendances();
      setAttendances(fetchedAttendances);
      setError(null);
    } catch (err) {
      setError('Error al cargar las asistencias. Intente de nuevo más tarde.');
      toast.error('Error al cargar las asistencias.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const handleAddNew = () => {
    setSelectedAttendance(null);
    setIsFormOpen(true);
  };

  const handleEdit = (attendance) => {
    setSelectedAttendance(attendance);
    setIsFormOpen(true);
  };

  const handleDelete = async (attendanceId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asistencia?')) {
      try {
        // await eventAttendanceService.deleteAttendance(attendanceId); // No delete endpoint provided
        toast.warn('La eliminación no está implementada en la API.');
        // fetchAttendances(); // Refresh the list
      } catch (err) {
        toast.error('Error al eliminar la asistencia.');
        console.error(err);
      }
    }
  };

  const handleSave = async (attendanceData) => {
    try {
      if (selectedAttendance) {
        // await eventAttendanceService.updateAttendance(selectedAttendance.attendanceID, attendanceData); // No update endpoint provided
        toast.warn('La actualización no está implementada en la API.');
      } else {
        await eventAttendanceService.createAttendance(attendanceData);
        toast.success('Asistencia creada con éxito');
      }
      fetchAttendances(); // Refresh the list
      setIsFormOpen(false);
      setSelectedAttendance(null);
    } catch (err) {
      toast.error('Error al guardar la asistencia.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedAttendance(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Asistencia a Eventos</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Añadir Asistencia
          </button>
          <button 
            onClick={fetchAttendances}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw size={20} />}
          </button>
        </div>
      </header>

      {isLoading && <p className="text-center text-lg">Cargando asistencias...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-4">ID Evento</th>
                <th className="p-4">Nombre Invitado / ID Usuario</th>
                <th className="p-4">Email</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(attendance => (
                <tr key={attendance.attendanceID} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{attendance.eventID}</td>
                  <td className="p-4">{attendance.isGuest ? attendance.guestName : `Usuario #${attendance.userID}`}</td>
                  <td className="p-4">{attendance.guestEmail || 'N/A'}</td>
                  <td className="p-4">{new Date(attendance.attendanceDate).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${attendance.status === 'string' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                      {attendance.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(attendance)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDelete(attendance.attendanceID)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <EventAttendanceForm
          attendance={selectedAttendance}
          onSave={handleSave}
          onCancel={handleCancel}
          currentAdmin={admin}
        />
      )}
    </div>
  );
};

export default EventAttendanceManagement;