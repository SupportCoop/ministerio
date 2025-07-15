import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import adminAuthService from '../services/adminAuth';
import { User, LogOut, Menu, X, Shield } from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Usar refs para evitar comparaciones innecesarias
  const lastUserCheck = useRef(null);
  const lastAdminCheck = useRef(null);

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    checkAuthentication();

    // Verificar cada 5 segundos (menos frecuente)
    const authInterval = setInterval(() => {
      checkAuthentication();
    }, 5000);

    // Listeners para eventos específicos
    const handleAdminLogin = (event) => {
      console.log('✅ Admin login exitoso:', event.detail.name);
      setAdmin(event.detail);
      setIsAdminAuthenticated(true);
    };

    const handleAdminLogout = () => {
      console.log('🚪 Admin logout');
      setAdmin(null);
      setIsAdminAuthenticated(false);
    };

    const handleUserLogin = () => {
      console.log('✅ User login detectado');
      checkAuthentication();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'adminToken' || e.key === 'currentUser' || e.key === 'currentAdmin') {
        console.log('🔄 Storage relevante cambió:', e.key);
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminLogin', handleAdminLogin);
    window.addEventListener('adminLogout', handleAdminLogout);
    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      clearInterval(authInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminLogin', handleAdminLogin);
      window.removeEventListener('adminLogout', handleAdminLogout);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  const checkAuthentication = () => {
    // VERIFICAR ADMIN PRIMERO (tiene prioridad)
    let adminAuthenticated = false;
    let currentAdmin = null;

    try {
      adminAuthenticated = adminAuthService.isAuthenticated();
      currentAdmin = adminAuthService.getCurrentAdmin();
      
      // Validar que los datos del admin sean correctos
      if (adminAuthenticated && currentAdmin && currentAdmin.adminID) {
        console.log('🔒 Admin autenticado:', currentAdmin.name);
      } else if (adminAuthenticated && !currentAdmin) {
        // Si isAuthenticated devuelve true pero no hay admin, limpiar
        console.log('⚠️ Estado de admin inconsistente, limpiando...');
        adminAuthService.logout();
        adminAuthenticated = false;
        currentAdmin = null;
      }
    } catch (error) {
      console.error('Error verificando admin:', error);
      adminAuthenticated = false;
      currentAdmin = null;
    }

    // VERIFICAR USUARIO REGULAR SOLO SI NO HAY ADMIN AUTENTICADO
    let userAuthenticated = false;
    let currentUser = null;

    if (!adminAuthenticated) {
      // Verificar con authService
      try {
        userAuthenticated = authService.isAuthenticated();
        currentUser = authService.getCurrentUser();
        
        // Validar que NO sea un admin logueado como usuario
        if (userAuthenticated && currentUser) {
          // Si el usuario actual tiene userType 'admin', debe usar el sistema de admin
          if (currentUser.userType === 'admin' || currentUser.adminID) {
            console.log('⚠️ Usuario con permisos de admin detectado, redirigiendo al sistema de admin');
            // Limpiar la sesión de usuario y forzar uso del sistema de admin
            authService.logout();
            userAuthenticated = false;
            currentUser = null;
          }
        }
      } catch (error) {
        console.error('Error verificando usuario:', error);
        userAuthenticated = false;
        currentUser = null;
      }

      // Fallback: verificar localStorage directamente para usuarios regulares
      if (!userAuthenticated) {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          const possibleUserKeys = ['currentUser', 'user', 'userData'];

          for (const key of possibleUserKeys) {
            const userStr = localStorage.getItem(key);
            if (userStr) {
              try {
                const parsedUser = JSON.parse(userStr);
                // Verificar que sea un usuario regular (no admin)
                if (parsedUser && 
                    (parsedUser.email || parsedUser.username || parsedUser.id || parsedUser.userID) &&
                    parsedUser.userType !== 'admin' && 
                    !parsedUser.adminID) {
                  currentUser = parsedUser;
                  userAuthenticated = true;
                  break;
                }
              } catch (error) {
                // Ignorar errores de parsing
              }
            }
          }
        }
      }
    }

    // ACTUALIZAR ESTADO SOLO SI HAY CAMBIOS REALES
    const userChecksum = JSON.stringify({ userAuthenticated, currentUser });
    const adminChecksum = JSON.stringify({ adminAuthenticated, currentAdmin });

    if (lastUserCheck.current !== userChecksum) {
      lastUserCheck.current = userChecksum;
      if (userAuthenticated !== isAuthenticated) {
        setIsAuthenticated(userAuthenticated);
      }
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }

    if (lastAdminCheck.current !== adminChecksum) {
      lastAdminCheck.current = adminChecksum;
      if (adminAuthenticated !== isAdminAuthenticated) {
        setIsAdminAuthenticated(adminAuthenticated);
      }
      if (JSON.stringify(currentAdmin) !== JSON.stringify(admin)) {
        setAdmin(currentAdmin);
      }
    }
  };

  const handleLogout = () => {
    console.log('🚪 === LOGOUT INICIADO ===');

    // Limpiar estado inmediatamente para una respuesta rápida en la UI
    setIsAuthenticated(false);
    setUser(null);
    setIsAdminAuthenticated(false);
    setAdmin(null);

    // Limpiar localStorage
    const allKeys = [
      'authToken', 'currentUser', 'user', 'userData',
      'adminToken', 'currentAdmin', 'adminUserData', 'adminSessionTimeout', 'adminLastActivity'
    ];

    allKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // Usar servicios de logout
    try {
      if (authService.logout) authService.logout();
      if (adminAuthService.logout) adminAuthService.logout();
    } catch (error) {
      console.error('Error durante el proceso de logout:', error);
    }

    // Limpiar refs
    lastUserCheck.current = null;
    lastAdminCheck.current = null;

    setIsMenuOpen(false);
    navigate('/');
    console.log('✅ Logout completado');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (admin) return admin.name || admin.email || 'Administrador';
    if (user) {
      return user.name || user.firstName || user.username || user.email || user.displayName || 'Usuario';
    }
    return '';
  };

  const getUserRoleDisplay = () => {
    if (admin) {
      switch (admin.role) {
        case 'super_admin': return 'Super Admin';
        case 'admin': return 'Administrador';
        default: return 'Admin';
      }
    }

    if (user && user.role && user.userType !== 'admin') {
      switch (user.role) {
        case 'moderator': return 'Moderador';
        default: return '';
      }
    }

    return '';
  };

  // Estados derivados para simplificar el JSX
  // IMPORTANTE: Solo mostrar botón de admin si está autenticado como admin
  const showAdminButton = isAdminAuthenticated;
  const userRoleDisplay = getUserRoleDisplay();
  const isLoggedIn = isAuthenticated || isAdminAuthenticated;

  // Reemplaza esta URL con la ruta real de tu imagen desde la carpeta 'public'
  const profileImageUrl = '/img/perfil.jpg';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 shadow-xl relative transition-all duration-300">
      {/* Imagen de perfil en la esquina superior izquierda, más cerca del logo */}
      {profileImageUrl && (
        <div className="absolute top-3 left-3 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
          <img
            src={profileImageUrl}
            alt="Perfil"
            className="object-cover w-full h-full"
            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150/9333ea/FFFFFF?text=Error" }}
          />
        </div>
      )}

      {/* Contenedor principal del header con esquinas redondas y fondo gris */}
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-2 rounded-full my-3 bg-gray-800/40 backdrop-blur-sm shadow-inner">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Ajustado con ml-16 para espacio */}
          <Link
            to="/"
            className="text-white text-3xl font-extrabold tracking-tight transform hover:scale-105 transition-transform duration-200 ml-16"
            onClick={closeMenu}
          >
             AWILDA MOTA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link
              to="/"
              className="text-white hover:text-purple-100 transition-colors px-4 py-2 rounded-lg
                         hover:bg-purple-700/50 hover:shadow-md transform hover:-translate-y-1
                         transition-all duration-200 text-lg font-medium"
              onClick={closeMenu}
            >
              Inicio
            </Link>
            <Link
              to="/events"
              className="text-white hover:text-purple-100 transition-colors px-4 py-2 rounded-lg
                         hover:bg-purple-700/50 hover:shadow-md transform hover:-translate-y-1
                         transition-all duration-200 text-lg font-medium"
              onClick={closeMenu}
            >
              Eventos
            </Link>
            <Link
              to="/testimonials"
              className="text-white hover:text-purple-100 transition-colors px-4 py-2 rounded-lg
                         hover:bg-purple-700/50 hover:shadow-md transform hover:-translate-y-1
                         transition-all duration-200 text-lg font-medium"
              onClick={closeMenu}
            >
              Testimonios
            </Link>
            {/* Solo mostrar perfil para usuarios regulares autenticados */}
            {isAuthenticated && !isAdminAuthenticated && (
              <Link
                to="/profile"
                className="text-white hover:text-purple-100 transition-colors px-4 py-2 rounded-lg
                           hover:bg-purple-700/50 hover:shadow-md transform hover:-translate-y-1
                           transition-all duration-200 text-lg font-medium"
                onClick={closeMenu}
              >
                Perfil
              </Link>
            )}
            {/* Solo mostrar Admin Panel si está autenticado como admin */}
            {showAdminButton && (
              <Link
                to="/admin"
                className="text-yellow-100 hover:text-yellow-50 transition-colors px-4 py-2 rounded-lg
                           bg-yellow-600/30 hover:bg-yellow-600/50 hover:shadow-md
                           transform hover:-translate-y-1 transition-all duration-200
                           text-lg font-medium flex items-center space-x-2"
                onClick={closeMenu}
              >
                <Shield size={18} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-white cursor-default">
                  {isAdminAuthenticated ? <Shield size={24} className="text-yellow-200" /> : <User size={24} />}
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{getUserDisplayName()}</span>
                    {userRoleDisplay && (
                      <span className="text-sm text-purple-100">{userRoleDisplay}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700
                           text-white px-5 py-2 rounded-full shadow-lg hover:shadow-xl
                           transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white bg-purple-700 hover:bg-purple-800 px-5 py-2
                           rounded-full shadow-lg hover:shadow-xl transform hover:scale-105
                           transition-all duration-200 font-medium"
                  onClick={closeMenu}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/admin-login"
                  className="text-yellow-100 bg-yellow-600 hover:bg-yellow-700 px-5 py-2
                           rounded-full shadow-lg hover:shadow-xl transform hover:scale-105
                           transition-all duration-200 font-medium flex items-center space-x-2"
                  onClick={closeMenu}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-700 hover:bg-gray-100 px-5 py-2
                           rounded-full shadow-lg hover:shadow-xl transform hover:scale-105
                           transition-all duration-200 font-medium"
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-3 hover:bg-white/20 rounded-full transition-colors
                       focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-purple-800/95 backdrop-blur-md rounded-b-xl shadow-xl
                          mt-2 p-6 origin-top animate-fade-in-down">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-white hover:text-purple-100 transition-colors py-3 px-4
                         rounded-lg hover:bg-purple-700/60 font-medium text-lg"
                onClick={closeMenu}
              >
                Inicio
              </Link>
              <Link
                to="/events"
                className="text-white hover:text-purple-100 transition-colors py-3 px-4
                         rounded-lg hover:bg-purple-700/60 font-medium text-lg"
                onClick={closeMenu}
              >
                Eventos
              </Link>
              <Link
                to="/testimonials"
                className="text-white hover:text-purple-100 transition-colors py-3 px-4
                         rounded-lg hover:bg-purple-700/60 font-medium text-lg"
                onClick={closeMenu}
              >
                Testimonios
              </Link>
              {/* Solo mostrar perfil para usuarios regulares autenticados */}
              {isAuthenticated && !isAdminAuthenticated && (
                <Link
                  to="/profile"
                  className="text-white hover:text-purple-100 transition-colors py-3 px-4
                           rounded-lg hover:bg-purple-700/60 font-medium text-lg"
                  onClick={closeMenu}
                >
                  Perfil
                </Link>
              )}
              {/* Solo mostrar Admin Panel si está autenticado como admin */}
              {showAdminButton && (
                <Link
                  to="/admin"
                  className="text-yellow-100 hover:text-yellow-50 transition-colors py-3 px-4
                           rounded-lg bg-yellow-700/40 hover:bg-yellow-700/60 font-medium
                           text-lg flex items-center space-x-3"
                  onClick={closeMenu}
                >
                  <Shield size={20} />
                  <span>Panel Admin</span>
                </Link>
              )}
            </nav>

            <div className="mt-6 pt-6 border-t border-purple-700">
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white py-2 cursor-default">
                    {isAdminAuthenticated ? <Shield size={24} className="text-yellow-200" /> : <User size={24} />}
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">{getUserDisplayName()}</span>
                      {userRoleDisplay && (
                        <span className="text-sm text-purple-100">{userRoleDisplay}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-3 w-full bg-red-600 hover:bg-red-700
                             text-white px-4 py-3 rounded-full shadow-lg transform hover:scale-105
                             transition-all duration-200 font-medium text-lg"
                  >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block text-center text-white bg-purple-700 hover:bg-purple-800
                             px-4 py-3 rounded-full shadow-lg transform hover:scale-105
                             transition-all duration-200 font-medium text-lg"
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/admin-login"
                    className="block text-center text-yellow-100 bg-yellow-600 hover:bg-yellow-700
                             px-4 py-3 rounded-full shadow-lg transform hover:scale-105
                             transition-all duration-200 font-medium text-lg"
                    onClick={closeMenu}
                  >
                    <Shield size={18} className="inline mr-2" />
                    Admin Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-white text-purple-700 hover:bg-gray-100
                             px-4 py-3 rounded-full shadow-lg transform hover:scale-105
                             transition-all duration-200 font-medium text-lg"
                    onClick={closeMenu}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;