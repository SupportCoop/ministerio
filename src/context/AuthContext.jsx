// context/AuthContext.jsx - Contexto de autenticación completo
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import adminAuthService from '../services/adminAuth';
import authService from '../services/auth';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔐 AuthProvider: Estado actual:', { 
    user: !!user, 
    admin: !!admin,
    isAuthenticated, 
    loading 
  });

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    console.log('🔐 checkAuthStatus: Verificando autenticación...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Primero verificar si hay una sesión de admin válida
      const adminAuthCheck = adminAuthService.useAuthCheck();
      
      if (adminAuthCheck.isAuthenticated && adminAuthCheck.admin) {
        console.log('🔐 checkAuthStatus: Sesión de admin válida encontrada:', adminAuthCheck.admin);
        
        const adminData = adminAuthCheck.admin;
        
        const userData = {
          ...adminData,
          userID: adminData.adminID,
          userType: 'admin',
        };
        
        setUser(userData);
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        console.log('🔐 checkAuthStatus: Usuario (como admin) y admin establecidos');
      } else {
        // Si la sesión de admin no es válida, limpiar antes de continuar
        adminAuthService.cleanup();

        // Verificar si hay una sesión de usuario regular
        const userIsAuthenticated = authService.isAuthenticated();
        if (userIsAuthenticated) {
          const regularUser = authService.getCurrentUser();
          if (regularUser) {
            console.log('🔐 checkAuthStatus: Sesión de usuario regular válida encontrada:', regularUser);
            setUser(regularUser);
            setAdmin(null);
            setIsAuthenticated(true);
          }
        } else {
          console.log('🔐 checkAuthStatus: No hay sesión válida');
          
          // Limpiar estado y localStorage
          setUser(null);
          setAdmin(null);
          setIsAuthenticated(false);
          authService.logout(); // Asegura que el localStorage del usuario también se limpie
        }
      }
    } catch (error) {
      console.error('🔐 checkAuthStatus: Error verificando autenticación:', error);
      setError(error.message);
      
      // En caso de error, limpiar todo
      setUser(null);
      setAdmin(null);
      setIsAuthenticated(false);
      adminAuthService.cleanup();
      authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de login
  const login = async (email, password, isAdminLogin = false) => {
    console.log(`🔐 login: Intentando login para: ${email} (admin: ${isAdminLogin})`);
    
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (isAdminLogin) {
        result = await adminAuthService.login(email, password);
      } else {
        result = await authService.login(email, password);
      }
      
      if (result.success) {
        await checkAuthStatus(); // Re-verificar el estado para actualizar el contexto
        return { success: true };
      } else {
        throw new Error(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('🔐 login: Error en login:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para registro (crear nuevo admin)
  const register = async (userData) => {
    console.log('🔐 register: Registrando admin:', userData);
    
    try {
      setLoading(true);
      setError(null);
      
      const newAdmin = {
        name: userData.name,
        email: userData.email,
        passwordHash: userData.password, // En producción hashear la contraseña
        phone: userData.phone || '',
        role: userData.role || 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Usar apiService para crear el admin
      const response = await apiService.createAdmin(newAdmin);
      
      if (response && response.data) {
        const createdAdmin = response.data;
        console.log('🔐 register: Admin creado:', createdAdmin);
        
        // Auto-login después del registro
        const loginResult = await login(userData.email, userData.password);
        
        if (loginResult.success) {
          console.log('🔐 register: Registro y auto-login exitoso');
          return { success: true, user: loginResult.user, admin: loginResult.admin };
        } else {
          throw new Error('Admin creado pero error en auto-login');
        }
      } else {
        throw new Error('Error creando administrador');
      }
    } catch (error) {
      console.error('🔐 register: Error en registro:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = useCallback(() => {
    console.log('🔐 logout: Cerrando sesión...');
    
    // Usar ambos servicios de logout y cleanup para asegurar limpieza completa
    authService.logout();
    adminAuthService.logout(); // logout también limpia localStorage
    adminAuthService.cleanup(); // cleanup adicional por si acaso
    
    // Limpiar estado local
    setUser(null);
    setAdmin(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('🔐 logout: Sesión cerrada');
  }, []);

  // Función para actualizar datos del usuario/admin
  const updateUser = async (updatedData) => {
    console.log('🔐 updateUser: Actualizando admin:', updatedData);
    
    try {
      if (!admin || !admin.adminID) {
        throw new Error('No hay admin autenticado');
      }
      
      const response = await apiService.updateAdmin(admin.adminID, {
        ...admin,
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      
      if (response && response.data) {
        const updatedAdmin = response.data;
        
        const userData = {
          ...updatedAdmin,
          userID: updatedAdmin.adminID,
        };
        
        // Actualizar localStorage
        localStorage.setItem('adminUserData', JSON.stringify(updatedAdmin));
        
        // Actualizar estado
        setUser(userData);
        setAdmin(updatedAdmin);
        
        console.log('🔐 updateUser: Admin actualizado');
        return { success: true, user: userData, admin: updatedAdmin };
      } else {
        throw new Error('Error actualizando administrador');
      }
    } catch (error) {
      console.error('🔐 updateUser: Error actualizando:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Función para extender sesión
  const extendSession = () => {
    if (isAuthenticated) {
      adminAuthService.extendSession();
      console.log('🔐 Sesión extendida');
    }
  };

  // Función para obtener información de sesión
  const getSessionInfo = () => {
    return adminAuthService.getSessionInfo();
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    console.log('🔐 AuthProvider: Ejecutando checkAuthStatus...');
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Configurar verificación periódica de sesión (cada 5 minutos)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        const authCheck = adminAuthService.useAuthCheck();
        if (!authCheck.isAuthenticated) {
          console.log('🔐 Verificación periódica: Sesión expirada');
          logout();
        }
      }, 5 * 60 * 1000); // 5 minutos
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, logout]);

  // Valor del contexto
  const value = {
    // Estados
    user,
    admin,
    isAuthenticated,
    loading,
    error,
    
    // Métodos de autenticación
    login,
    register,
    logout,
    updateUser,
    
    // Métodos de utilidad
    clearError,
    extendSession,
    getSessionInfo,
    
    // Información adicional
    hasPermission: (permission) => adminAuthService.hasPermission(permission)
  };

  console.log('🔐 AuthProvider: Valor del contexto:', { 
    userExists: !!user, 
    adminExists: !!admin,
    userID: user?.userID,
    adminID: admin?.adminID,
    isAuthenticated, 
    loading,
    hasError: !!error
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};