import { apiService } from './api';

class AdminAuthService {
  constructor() {
    this.tokenKey = 'adminToken';
    this.adminKey = 'adminUserData';
    this.sessionTimeoutKey = 'adminSessionTimeout';
    this.lastActivityKey = 'adminLastActivity';
    
    // Configuración de sesión
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
    this.inactivityTimeout = 2 * 60 * 60 * 1000; // 2 horas de inactividad
    
    // Inicializar listener de actividad
    this.initActivityListener();
  }






  

  async login(email, password) {
    try {
      console.log('🔄 Intentando login de admin:', email);
      
      const result = await apiService.authenticateAdmin(email, password);
      
      if (result.success && result.admin) {
        // Generar token y configurar sesión
        const token = this.generateSecureToken(result.admin);
        const sessionExpiry = Date.now() + this.sessionDuration;
        const lastActivity = Date.now();
        
        // Guardar en localStorage
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.adminKey, JSON.stringify(result.admin));
        localStorage.setItem(this.sessionTimeoutKey, sessionExpiry.toString());
        localStorage.setItem(this.lastActivityKey, lastActivity.toString());
        
        console.log('✅ Login exitoso:', result.admin);
        return {
          success: true,
          admin: result.admin
        };
      } else {
        throw new Error(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  logout() {
    // Limpiar todos los datos de sesión
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);
    localStorage.removeItem(this.sessionTimeoutKey);
    localStorage.removeItem(this.lastActivityKey);
    
    console.log('🚪 Admin desconectado');
    
    // La redirección se manejará en el contexto o componente que llama a logout.
  }

  isAuthenticated() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const admin = this.getCurrentAdmin();
      
      if (!token || !admin || !admin.adminID) {
        return false;
      }
      
      // Verificar si la sesión ha expirado por tiempo
      if (this.isSessionExpired()) {
        console.log('🔒 Sesión expirada por tiempo, cerrando sesión');
        this.logout();
        return false;
      }
      
      // Verificar si la sesión ha expirado por inactividad
      if (this.isInactivityExpired()) {
        console.log('🔒 Sesión expirada por inactividad, cerrando sesión');
        this.logout();
        return false;
      }
      
      // Actualizar última actividad
      this.updateLastActivity();
      
      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  getCurrentAdmin() {
    try {
      const adminData = localStorage.getItem(this.adminKey);
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (admin && admin.adminID) {
          return admin;
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo admin actual:', error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Generar token seguro
  generateSecureToken(admin) {
    const tokenData = {
      adminID: admin.adminID,
      email: admin.email,
      role: admin.role,
      timestamp: Date.now(),
      randomSalt: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    // En producción, usar una librería JWT real
    return btoa(JSON.stringify(tokenData));
  }

  // Verificar si la sesión ha expirado por tiempo total
  isSessionExpired() {
    try {
      const sessionTimeout = localStorage.getItem(this.sessionTimeoutKey);
      if (!sessionTimeout) return true;
      
      const timeout = parseInt(sessionTimeout);
      const now = Date.now();
      
      return now > timeout;
    } catch (error) {
      console.error('Error verificando expiración de sesión:', error);
      return true;
    }
  }

  // Verificar si la sesión ha expirado por inactividad
  isInactivityExpired() {
    try {
      const lastActivity = localStorage.getItem(this.lastActivityKey);
      if (!lastActivity) return true;
      
      const lastActivityTime = parseInt(lastActivity);
      const now = Date.now();
      
      return (now - lastActivityTime) > this.inactivityTimeout;
    } catch (error) {
      console.error('Error verificando inactividad:', error);
      return true;
    }
  }

  // Actualizar última actividad
  updateLastActivity() {
    localStorage.setItem(this.lastActivityKey, Date.now().toString());
  }

  // Inicializar listener de actividad del usuario
  initActivityListener() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      if (this.isAuthenticated()) {
        this.updateLastActivity();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    // También actualizar actividad periódicamente
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.updateLastActivity();
      }
    }, 30000); // Cada 30 segundos
  }

  // Extender sesión
  extendSession() {
    const newTimeout = Date.now() + this.sessionDuration;
    const newActivity = Date.now();
    
    localStorage.setItem(this.sessionTimeoutKey, newTimeout.toString());
    localStorage.setItem(this.lastActivityKey, newActivity.toString());
    
    console.log('⏰ Sesión extendida');
  }

  // Obtener información de sesión
  getSessionInfo() {
    const admin = this.getCurrentAdmin();
    const sessionTimeout = localStorage.getItem(this.sessionTimeoutKey);
    const lastActivity = localStorage.getItem(this.lastActivityKey);
    
    const now = Date.now();
    const sessionTimeRemaining = sessionTimeout ? Math.max(0, parseInt(sessionTimeout) - now) : 0;
    const timeSinceLastActivity = lastActivity ? now - parseInt(lastActivity) : 0;
    const inactivityTimeRemaining = Math.max(0, this.inactivityTimeout - timeSinceLastActivity);
    
    return {
      isAuthenticated: this.isAuthenticated(),
      admin: admin,
      sessionTimeRemaining: sessionTimeRemaining,
      inactivityTimeRemaining: inactivityTimeRemaining,
      sessionExpiry: sessionTimeout ? new Date(parseInt(sessionTimeout)).toISOString() : null,
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)).toISOString() : null,
      sessionTimeRemainingFormatted: this.formatTime(sessionTimeRemaining),
      inactivityTimeRemainingFormatted: this.formatTime(inactivityTimeRemaining)
    };
  }

  // Formatear tiempo
  formatTime(milliseconds) {
    if (milliseconds <= 0) return 'Expirado';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Verificar permisos
  hasPermission(permission) {
    const admin = this.getCurrentAdmin();
    if (!admin || !admin.isActive) return false;

    const permissions = {
      super_admin: ['all'],
      admin: ['albums', 'events', 'users', 'books', 'messages', 'statistics'],
      moderator: ['albums', 'events', 'messages'],
      readonly: ['view']
    };

    const adminRole = admin.role || 'readonly';
    const adminPermissions = permissions[adminRole] || [];

    return adminPermissions.includes('all') || adminPermissions.includes(permission);
  }

  // Método para uso en componentes React
  useAuthCheck() {
    // Verificar autenticación sin causar logout automático
    const token = localStorage.getItem(this.tokenKey);
    const admin = this.getCurrentAdmin();
    
    if (!token || !admin || !admin.adminID) {
      return { isAuthenticated: false, admin: null };
    }
    
    // Solo verificar expiración, no actualizar actividad aquí
    const isExpired = this.isSessionExpired() || this.isInactivityExpired();
    
    return {
      isAuthenticated: !isExpired,
      admin: isExpired ? null : admin,
      sessionInfo: this.getSessionInfo()
    };
  }

  // Limpiar datos corruptos
  cleanup() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const admin = localStorage.getItem(this.adminKey);
      
      if (!token || !admin) {
        this.logout();
        return;
      }
      
      // Verificar que el admin sea válido
      const parsedAdmin = JSON.parse(admin);
      if (!parsedAdmin || !parsedAdmin.adminID) {
        console.log('🧹 Datos de admin corruptos, limpiando...');
        this.logout();
      }
    } catch (error) {
      console.error('Error en cleanup:', error);
      this.logout();
    }
  }

  // Método de debug
  getDebugInfo() {
    return {
      hasToken: !!this.getToken(),
      hasAdmin: !!this.getCurrentAdmin(),
      isSessionExpired: this.isSessionExpired(),
      isInactivityExpired: this.isInactivityExpired(),
      isAuthenticated: this.isAuthenticated(),
      sessionInfo: this.getSessionInfo(),
      adminData: this.getCurrentAdmin()
    };
  }
}


const adminAuthService = new AdminAuthService();
export default adminAuthService;