// src/utils/helpers.js

// Formatear fechas
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Fecha no disponible';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Santo_Domingo'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return date.toLocaleDateString('es-ES', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

// Formatear tiempo
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  try {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santo_Domingo'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Formatear fecha y hora completa
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  const date = new Date(dateString);
  
  try {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santo_Domingo'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Fecha inválida';
  }
};

// Calcular tiempo restante para un evento
export const getTimeRemaining = (targetDate) => {
  if (!targetDate) return null;
  
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;
  
  if (difference <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true
    };
  }
  
  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    expired: false
  };
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono dominicano
export const isValidDominicanPhone = (phone) => {
  // Formatos válidos: (809) 123-4567, 809-123-4567, 8091234567, +1 809 123 4567
  const phoneRegex = /^(\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar códigos de área dominicanos
  const dominicanAreaCodes = ['809', '829', '849'];
  
  if (cleanPhone.length === 10) {
    const areaCode = cleanPhone.substring(0, 3);
    return dominicanAreaCodes.includes(areaCode);
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    const areaCode = cleanPhone.substring(1, 4);
    return dominicanAreaCodes.includes(areaCode);
  }
  
  return phoneRegex.test(phone) && dominicanAreaCodes.some(code => phone.includes(code));
};

// Formatear teléfono
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.substring(0, 3)}) ${cleanPhone.substring(3, 6)}-${cleanPhone.substring(6)}`;
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    const areaCode = cleanPhone.substring(1, 4);
    const number = cleanPhone.substring(4);
    return `+1 (${areaCode}) ${number.substring(0, 3)}-${number.substring(3)}`;
  }
  
  return phone;
};

// Generar hash simple para passwords (solo para demo - en producción usar bcrypt)
export const generateSimpleHash = (password) => {
  let hash = 0;
  if (password.length === 0) return hash.toString();
  
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Formatear nombres propios
export const formatName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Generar color aleatorio para avatares
export const getRandomColor = (seed = '') => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#f8ffae', '#43c6ac', '#ff9a9e', '#fecfef'
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Debounce para búsquedas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle para scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Detectar dispositivo móvil
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Validar edad (mayor de 13 años para COPPA compliance)
export const isValidAge = (birthDate) => {
  if (!birthDate) return true; // Permitir si no se proporciona fecha
  
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13;
  }
  
  return age >= 13;
};

// Formatear números con separadores de miles
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('es-ES');
};

// Obtener saludo basado en la hora
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Buenos días';
  } else if (hour < 18) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

// Validar que una imagen sea válida
export const isValidImageFile = (file) => {
  if (!file) return false;
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

// Convertir archivo a base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Ordenar eventos por fecha
export const sortEventsByDate = (events, ascending = true) => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Filtrar eventos por estado
export const filterEventsByStatus = (events, status) => {
  if (!status || status === 'all') return events;
  
  return events.filter(event => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    switch (status) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate < now;
      case 'today':
        return eventDate.toDateString() === now.toDateString();
      default:
        return event.status === status;
    }
  });
};

// Obtener próximos eventos
export const getUpcomingEvents = (events, limit = 5) => {
  const now = new Date();
  return events
    .filter(event => new Date(event.eventDate) > now)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, limit);
};

// Verificar si el usuario es admin
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// Generar color de estado
export const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    inactive: '#6b7280',
    pending: '#f59e0b',
    confirmed: '#10b981',
    cancelled: '#dc2626',
    upcoming: '#3b82f6',
    past: '#6b7280'
  };
  
  return colors[status] || '#6b7280';
};

// Storage helpers para localStorage
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};