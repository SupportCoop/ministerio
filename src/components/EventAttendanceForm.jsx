import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const EventAttendanceForm = ({ attendance, onSave, onCancel, currentAdmin }) => {
  const [formData, setFormData] = useState({
    eventID: '',
    userID: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    isGuest: false,
    status: 'Presente',
    ...attendance
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventID) newErrors.eventID = 'El ID del evento es requerido';
    if (formData.isGuest && !formData.guestName.trim()) newErrors.guestName = 'El nombre del invitado es requerido';
    if (!formData.isGuest && !formData.userID) newErrors.userID = 'El ID de usuario es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const attendanceData = {
        ...formData,
        attendanceDate: new Date().toISOString(),
        eventID: Number(formData.eventID),
        userID: formData.isGuest ? null : Number(formData.userID),
      };
      onSave(attendanceData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {attendance ? 'Editar Asistencia' : 'Registrar Asistencia'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">ID del Evento *</label>
            <input
              type="number"
              name="eventID"
              value={formData.eventID}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.eventID ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
              }`}
              placeholder="ID del evento"
              required
            />
            {errors.eventID && <p className="text-red-500 text-sm mt-2">⚠️ {errors.eventID}</p>}
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              name="isGuest"
              checked={formData.isGuest}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="font-medium text-gray-700">Es un invitado</label>
          </div>

          {formData.isGuest ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre del Invitado *</label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.guestName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                  }`}
                  placeholder="Nombre del invitado"
                  required
                />
                {errors.guestName && <p className="text-red-500 text-sm mt-2">⚠️ {errors.guestName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email del Invitado</label>
                <input
                  type="email"
                  name="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Email del invitado"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Teléfono del Invitado</label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={formData.guestPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Teléfono del invitado"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">ID de Usuario *</label>
              <input
                type="number"
                name="userID"
                value={formData.userID}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.userID ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="ID del usuario registrado"
                required
              />
              {errors.userID && <p className="text-red-500 text-sm mt-2">⚠️ {errors.userID}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            >
              <option value="Presente">Presente</option>
              <option value="Ausente">Ausente</option>
              <option value="Registrado">Registrado</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              {attendance ? '✅ Actualizar Asistencia' : '👥 Registrar Asistencia'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-all font-semibold"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventAttendanceForm;