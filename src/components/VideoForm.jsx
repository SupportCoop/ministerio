import React, { useState, useEffect } from 'react';
import { 
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const VideoForm = ({ video, onSave, onCancel, currentAdmin }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youTubeUrl: '',
    thumbnailPath: '',
    duration: '',
    category: '',
    uploadedBy: currentAdmin?.adminID || 1,
    ...video
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.youTubeUrl.trim()) newErrors.youTubeUrl = 'La URL de YouTube es requerida';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const videoData = {
        ...formData,
        uploadedBy: formData.uploadedBy || currentAdmin?.adminID || 1,
      };
      if (typeof onSave === 'function') {
        onSave(videoData);
      } else {
        console.error("onSave is not a function");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    if (currentAdmin) {
      setFormData(prev => ({
        ...prev,
        uploadedBy: prev.uploadedBy || currentAdmin.adminID
      }));
    }
  }, [currentAdmin]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {video ? 'Editar Video' : 'Crear Nuevo Video'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎥 Información del Video</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="Ingresa el título del video"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">⚠️ {errors.title}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL de YouTube *</label>
              <input
                type="url"
                name="youTubeUrl"
                value={formData.youTubeUrl}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.youTubeUrl ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              {errors.youTubeUrl && <p className="text-red-500 text-sm mt-2">⚠️ {errors.youTubeUrl}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categoría *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Conferencias">Conferencias</option>
                <option value="Predicas">Predicas</option>
                <option value="Musica">Música</option>
                <option value="Testimonios">Testimonios</option>
                <option value="Documentales">Documentales</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-2">⚠️ {errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Duración</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="HH:MM:SS"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Ruta de la Miniatura</label>
              <input
                type="text"
                name="thumbnailPath"
                value={formData.thumbnailPath}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="/thumbnails/video.jpg"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all h-32 resize-none"
                placeholder="Descripción del video..."
              />
            </div>
          </div>
          
          {currentAdmin && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">👤 Información del Administrador</h4>
              <p className="text-sm text-gray-600">
                {video ? 'Modificado por:' : 'Subido por:'} {currentAdmin.name || currentAdmin.email}
              </p>
            </div>
          )}
          
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              {video ? '✅ Actualizar Video' : '🎥 Crear Video'}
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

export default VideoForm;