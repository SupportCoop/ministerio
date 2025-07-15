// src/services/auth.js
import { apiService } from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.USER_KEY = 'userData';
  }

  // Iniciar sesión - ahora maneja usuarios y admins
  async login(email, password) {
    try {
      // Si no es admin o falla, intentar como usuario regular
      const userResult = await this.loginAsUser(email, password);
      if (userResult.success) {
        return userResult;
      }

      // Si ambos fallan, devolver un error genérico
      return {
        success: false,
        error: 'Credenciales incorrectas o usuario no encontrado.'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Error de conexión. Inténtalo de nuevo.'
      };
    }
  }


  // Login específico para usuarios regulares
  async loginAsUser(email, password) {
    try {
      const response = await apiService.getUsers();
      const users = response.data;
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: 'Cuenta desactivada. Contacta al administrador.'
        };
      }

      // En producción verificarías el password hash
      // Por ahora simulamos que cualquier password es válido para demo
      
      // Generar token para usuario
      const token = this.generateToken(user.userID, 'user');
      
      // Estructurar datos de usuario
      const regularUser = {
        ...user,
        userType: 'user',
        role: user.role || 'user'
      };
      
      // Guardar en localStorage
      this.setToken(token);
      this.setUser(regularUser);
      
      return {
        success: true,
        user: regularUser,
        token: token,
        userType: 'user'
      };
    } catch (error) {
      console.error('User login error:', error);
      return {
        success: false,
        error: 'Error de conexión. Inténtalo de nuevo.'
      };
    }
  }

  // Registrar nuevo usuario (solo usuarios regulares, no admins)
  async register(userData) {
    try {
      // Validar que el email no esté en uso en usuarios
      const existingUsers = await apiService.getUsers();
      const emailExistsInUsers = existingUsers.data.some(
        user => user.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (emailExistsInUsers) {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado'
        };
      }

      // Validar que el email no esté en uso en admins
      try {
        const existingAdmins = await apiService.getAdmins();
        const emailExistsInAdmins = existingAdmins.data.some(
          admin => admin.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (emailExistsInAdmins) {
          return {
            success: false,
            error: 'Este correo electrónico ya está registrado'
          };
        }
      } catch (adminError) {
        console.log('Error checking admin emails:', adminError);
      }

      // Crear el nuevo usuario
      const newUser = {
        ...userData,
        passwordHash: this.hashPassword(userData.passwordHash), // En producción usar bcrypt
        isActive: true,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await apiService.createUser(newUser);
      
      if (response.data) {
        // Auto-login después del registro
        const token = this.generateToken(response.data.userID, 'user');
        
        const userWithType = {
          ...response.data,
          userType: 'user',
          role: 'user'
        };
        
        this.setToken(token);
        this.setUser(userWithType);
        
        return {
          success: true,
          user: userWithType,
          token: token,
          userType: 'user'
        };
      } else {
        return {
          success: false,
          error: 'Error al crear la cuenta'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Error al registrar usuario. Inténtalo de nuevo.'
      };
    }
  }

  // Crear nuevo administrador (solo para super admins)
  async createAdmin(adminData) {
    try {
      const currentUser = this.getCurrentUser();
      
      // Verificar que el usuario actual sea admin
      if (!currentUser || !this.isAdmin()) {
        return {
          success: false,
          error: 'No tienes permisos para crear administradores'
        };
      }

      // Validar que el email no esté en uso
      const [existingUsers, existingAdmins] = await Promise.all([
        apiService.getUsers(),
        apiService.getAdmins()
      ]);

      const emailExists = 
        existingUsers.data.some(user => user.email.toLowerCase() === adminData.email.toLowerCase()) ||
        existingAdmins.data.some(admin => admin.email.toLowerCase() === adminData.email.toLowerCase());

      if (emailExists) {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado'
        };
      }

      // Crear el nuevo admin
      const newAdmin = {
        name: adminData.name,
        email: adminData.email,
        passwordHash: this.hashPassword(adminData.passwordHash),
        phone: adminData.phone || null,
        role: adminData.role || 'admin',
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await apiService.createAdmin(newAdmin);
      
      if (response.data) {
        return {
          success: true,
          admin: response.data
        };
      } else {
        return {
          success: false,
          error: 'Error al crear el administrador'
        };
      }
    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        error: 'Error al crear administrador. Inténtalo de nuevo.'
      };
    }
  }

  // Cerrar sesión
  logout() {
    this.removeToken();
    this.removeUser();
    
    // Limpiar cualquier otro dato relacionado con la sesión
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('notifications');
    
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Verificar si el token no ha expirado
    return this.isTokenValid(token);
  }

  // Obtener usuario actual
  getCurrentUser() {
    if (this.isAuthenticated()) {
      return this.getUser();
    }
    return null;
  }

  // Verificar si es administrador
  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.role === 'admin' || user.userType === 'admin');
  }

  // Verificar si es super admin
  isSuperAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'super_admin';
  }

  // Verificar permisos de usuario
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Definir permisos por rol
    const rolePermissions = {
      super_admin: [
        'manage_users',
        'manage_admins',
        'manage_events',
        'manage_media',
        'send_notifications',
        'view_statistics',
        'manage_settings',
        'delete_users',
        'delete_admins'
      ],
      admin: [
        'manage_events',
        'manage_media',
        'send_notifications',
        'view_statistics',
        'manage_users'
      ],
      moderator: [
        'manage_events',
        'send_notifications',
        'view_statistics'
      ],
      user: [
        'view_events',
        'register_events',
        'view_profile',
        'update_profile'
      ]
    };

    const userPermissions = rolePermissions[user.role] || rolePermissions.user;
    return userPermissions.includes(permission);
  }

  // Actualizar datos del usuario/admin
  async updateUser(userId, updatedData) {
    try {
      const currentUser = this.getCurrentUser();
      
      if (currentUser.userType === 'admin') {
        // Actualizar admin
        const response = await apiService.updateAdmin(userId, updatedData);
        
        if (response.data) {
          // Si está actualizando su propio perfil, actualizar localStorage
          if (currentUser.adminID === userId) {
            this.setUser({ ...currentUser, ...response.data });
          }
          
          return {
            success: true,
            user: response.data
          };
        }
      } else {
        // Actualizar usuario regular
        const response = await apiService.updateUser(userId, updatedData);
        
        if (response.data) {
          // Si está actualizando su propio perfil, actualizar localStorage
          if (currentUser.userID === userId) {
            this.setUser({ ...currentUser, ...response.data });
          }
          
          return {
            success: true,
            user: response.data
          };
        }
      }
      
      return {
        success: false,
        error: 'Error al actualizar usuario'
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Error al actualizar datos del usuario'
      };
    }
  }

  // Métodos privados para manejo de tokens y storage
  generateToken(userId, userType = 'user') {
    // En producción usarías JWT o similar
    const payload = {
      userId: userId,
      userType: userType,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 días
      iat: Date.now()
    };
    
    return btoa(JSON.stringify(payload));
  }

  isTokenValid(token) {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch (error) {
      return false;
    }
  }

  hashPassword(password) {
    // En producción usar bcrypt o similar
    // Esto es solo para demo
    let hash = 0;
    if (password.length === 0) return hash.toString();
    
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `$2b$10$${Math.abs(hash).toString(36)}`;
  }

  // Métodos de localStorage
  setToken(token) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  getToken() {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  removeToken() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  setUser(user) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  removeUser() {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  // Método para refrescar token
  async refreshToken() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No user found');
      }

      // En producción harías una petición al servidor para refrescar el token
      const newToken = this.generateToken(
        user.userType === 'admin' ? user.adminID : user.userID, 
        user.userType
      );
      this.setToken(newToken);
      
      return {
        success: true,
        token: newToken
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return {
        success: false,
        error: 'Error al refrescar sesión'
      };
    }
  }

  // Método para auto-refrescar token
  setupTokenRefresh() {
    const refreshInterval = 6 * 60 * 60 * 1000; // 6 horas
    
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.refreshToken();
      }
    }, refreshInterval);
  }
}

// Crear instancia singleton
const authService = new AuthService();

// Configurar auto-refresh de token
if (typeof window !== 'undefined') {
  authService.setupTokenRefresh();
}

export default authService;