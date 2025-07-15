import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Calendar, Shield, Heart } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar
    console.log('Guardando:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tu perfil</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {getInitials(user.name)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Miembro Activo</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Miembro desde 2024</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-blue-500" />
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                      placeholder="Ingresa tu nombre completo"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.name || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                      placeholder="tu@email.com"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.email || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(809) 000-0000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.phone || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Ciudad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Santo Domingo"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user.city || 'No especificado'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Membership Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6" />
                <h3 className="text-lg font-bold">Membresía</h3>
              </div>
              <p className="text-blue-100 mb-4">Miembro activo de nuestra comunidad de fe</p>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-sm text-blue-100">Estado</div>
                <div className="font-bold">Activo</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;