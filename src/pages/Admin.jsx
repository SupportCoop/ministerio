// pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { 
  Users, Calendar, BarChart3, Settings, UserPlus, 
  BookOpen, Search, TrendingUp, Shield, Database,
  ChevronRight, Activity, Bell, Download, RefreshCw, Image, Video, Mail, MessageSquare
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, admin, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    admins: 0,
    loading: true
  });

  // Usar admin o user, dando preferencia a admin
  const currentUser = admin || user;
  
  // Verificar permisos (después de definir hooks)
  const hasAdminAccess = isAuthenticated && 
    ((user && user.role === 'admin') || (admin && admin.isActive));

  // Cargar estadísticas reales - SIEMPRE ejecutar hooks antes de cualquier return
  useEffect(() => {
    if (!hasAdminAccess) return; // Solo cargar si tiene acceso
    
    const loadStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        const [usersResponse, eventsResponse, adminsResponse] = await Promise.all([
          apiService.getUsers().catch(() => ({ data: [] })),
          apiService.getEvents().catch(() => ({ data: [] })),
          apiService.getAdmins().catch(() => ({ data: [] }))
        ]);

        setStats({
          users: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
          events: Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0,
          admins: Array.isArray(adminsResponse.data) ? adminsResponse.data.length : 0,
          loading: false
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, [hasAdminAccess]); // Dependencia del acceso admin

  // DESPUÉS de todos los hooks, hacer la verificación de acceso
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: Users,
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Gestión de Eventos',
      description: 'Administrar eventos y actividades',
      icon: Calendar,
      path: '/admin/events',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Gestión de Libros',
      description: 'Administrar biblioteca digital',
      icon: BookOpen,
      path: '/admin/books',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Gestión de Fotos',
      description: 'Administrar galería de fotos',
      icon: Image,
      path: '/admin/photos',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    {
      title: 'Gestión de Videos',
      description: 'Administrar videos de YouTube',
      icon: Video,
      path: '/admin/videos',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Gestión de Asistencia',
      description: 'Administrar asistencia a eventos',
      icon: Users,
      path: '/admin/event-attendance',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Gestión de Mensajes',
      description: 'Administrar mensajes de contacto',
      icon: Mail,
      path: '/admin/messages',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Gestión de Testimonios',
      description: 'Administrar testimonios de usuarios',
      icon: MessageSquare,
      path: '/admin/testimonials',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Estadísticas',
      description: 'Ver métricas y análisis del sistema',
      icon: BarChart3,
      path: '/admin/statistics',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Configuración',
      description: 'Configurar ajustes del sistema',
      icon: Settings,
      path: '/admin/configuration',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      title: 'Agregar Admin',
      description: 'Crear nuevos administradores',
      icon: UserPlus,
      path: '/admin/add-admin',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  const quickStatsData = [
    { 
      label: 'Usuarios Registrados', 
      value: stats.loading ? '...' : stats.users.toString(), 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Eventos Activos', 
      value: stats.loading ? '...' : stats.events.toString(), 
      icon: Calendar, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Administradores', 
      value: stats.loading ? '...' : stats.admins.toString(), 
      icon: Shield, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'Estado Sistema', 
      value: '🟢 Online', 
      icon: Activity, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const refreshStats = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const [usersResponse, eventsResponse, adminsResponse] = await Promise.all([
        apiService.getUsers().catch(() => ({ data: [] })),
        apiService.getEvents().catch(() => ({ data: [] })),
        apiService.getAdmins().catch(() => ({ data: [] }))
      ]);

      setStats({
        users: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
        events: Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0,
        admins: Array.isArray(adminsResponse.data) ? adminsResponse.data.length : 0,
        loading: false
      });
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header del Admin */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
                <p className="text-blue-100 text-lg">
                  Bienvenido, {currentUser?.name || currentUser?.email || 'Administrador'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                🛡️ Administrador
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                🕒 {new Date().toLocaleDateString()}
              </span>
              {admin && (
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                  👤 ID: {admin.adminID}
                </span>
              )}
              <button
                onClick={refreshStats}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${stats.loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas Reales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStatsData.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Accesos Rápidos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Gestión del Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <Link
                key={index}
                to={section.path}
                className={`${section.bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:scale-105 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                    <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/admin/users"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Users className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold mb-2">Gestionar Usuarios</h3>
              <p className="text-sm opacity-90">Ver y administrar usuarios ({stats.users})</p>
            </Link>
            
            <Link 
              to="/admin/events"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Calendar className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold mb-2">Gestionar Eventos</h3>
              <p className="text-sm opacity-90">Administrar eventos ({stats.events})</p>
            </Link>
            
            <Link 
              to="/admin/books"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <BookOpen className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold mb-2">Gestionar Libros</h3>
              <p className="text-sm opacity-90">Administrar biblioteca digital</p>
            </Link>

            <Link
              to="/admin/photos"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Image className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold mb-2">Gestionar Fotos</h3>
              <p className="text-sm opacity-90">Administrar galería de fotos</p>
            </Link>
          </div>
        </div>

        {/* Notificaciones y Alertas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              Resumen del Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Total de usuarios: {stats.users}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Eventos activos: {stats.events}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Administradores: {stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" />
              Herramientas de Exportación
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors">
                <p className="font-medium text-gray-900">Exportar Usuarios</p>
                <p className="text-sm text-gray-600">Descargar lista de usuarios en CSV</p>
              </button>
              <button className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors">
                <p className="font-medium text-gray-900">Exportar Eventos</p>
                <p className="text-sm text-gray-600">Descargar lista de eventos</p>
              </button>
              <button className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg text-left transition-colors">
                <p className="font-medium text-gray-900">Reporte Completo</p>
                <p className="text-sm text-gray-600">Generar reporte del sistema</p>
              </button>
            </div>
          </div>
        </div>

        {/* Información de sesión */}
        {admin && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Sesión</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{admin.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Último acceso:</span>
                <p className="text-gray-900">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado:</span>
                <p className="text-green-600 font-medium">
                  {admin.isActive ? '✅ Activo' : '❌ Inactivo'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer del Panel */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Panel de Administración • Versión 2.0 • 
            <span className="text-blue-600 font-medium"> Sistema de Gestión Integral</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;