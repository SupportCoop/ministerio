// src/services/notifications.js
import { toast } from 'react-toastify';
import { apiService } from './api';

class NotificationService {
  constructor() {
    this.subscribers = [];
  }

  // Suscribir a notificaciones
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notificar a todos los suscriptores
  notifySubscribers(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Mostrar notificación toast
  showToast(type, message, options = {}) {
    const defaultOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    const toastOptions = { ...defaultOptions, ...options };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  }

  // Crear notificación en la base de datos
  async createNotification(userId, title, message, type = 'general') {
    try {
      const notificationData = {
        userID: userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const response = await apiService.createNotification(notificationData);
      
      // Notificar a los suscriptores
      this.notifySubscribers({
        ...notificationData,
        notificationID: response.data?.notificationID || Date.now()
      });

      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notificar nuevo evento a todos los usuarios
  async notifyNewEvent(eventData, usersList = []) {
    try {
      const notifications = [];
      
      for (const user of usersList) {
        if (user.isActive) {
          const notificationData = {
            userID: user.userID,
            title: 'Nuevo Evento Disponible',
            message: `¡Se ha añadido un nuevo evento: "${eventData.title}"! No te lo pierdas.`,
            type: 'event_announcement',
            isRead: false,
            createdAt: new Date().toISOString()
          };

          try {
            const response = await apiService.createNotification(notificationData);
            notifications.push(response.data);
          } catch (error) {
            console.error(`Error sending notification to user ${user.userID}:`, error);
          }
        }
      }

      // Mostrar toast de confirmación
      this.showToast('success', `Notificación enviada a ${notifications.length} usuarios`);
      
      return notifications;
    } catch (error) {
      console.error('Error notifying new event:', error);
      this.showToast('error', 'Error al enviar notificaciones');
      throw error;
    }
  }

  // Solicitar permisos de notificación del navegador
  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Mostrar notificación del navegador
  async showBrowserNotification(title, options = {}) {
    const hasPermission = await this.requestBrowserPermission();
    
    if (!hasPermission) {
      // Fallback to toast notification
      this.showToast('info', title);
      return;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      dir: 'ltr',
      lang: 'es',
      renotify: false,
      requireInteraction: false,
      tag: 'ministerio-notification',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    const notificationOptions = { ...defaultOptions, ...options };

    try {
      const notification = new Notification(title, notificationOptions);
      
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
        
        // Si hay una URL en las opciones, navegar a ella
        if (options.url) {
          window.location.href = options.url;
        }
      });

      // Auto-cerrar después de 10 segundos si no requiere interacción
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing browser notification:', error);
      // Fallback to toast
      this.showToast('info', title);
    }
  }

  // Enviar notificación por email (simulado)
  async sendEmailNotification(email, subject, message) {
    try {
      // En producción, aquí integrarías con un servicio de email como SendGrid, Mailgun, etc.
      console.log('Sending email notification:', { email, subject, message });
      
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular éxito o fallo aleatoriamente para demo
      if (Math.random() > 0.1) {
        console.log('Email sent successfully to:', email);
        return { success: true, messageId: 'sim_' + Date.now() };
      } else {
        throw new Error('Simulated email sending failure');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      await apiService.markNotificationAsRead(notificationId);
      
      // Notificar a los suscriptores del cambio
      this.notifySubscribers({
        type: 'notification_read',
        notificationId
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Obtener notificaciones de un usuario
  async getUserNotifications(userId) {
    try {
      const response = await apiService.getUserNotifications(userId);
      return response.data || [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Configurar notificaciones automáticas para eventos
  setupEventNotifications() {
    // Verificar eventos próximos cada hora
    setInterval(async () => {
      try {
        await this.checkUpcomingEvents();
      } catch (error) {
        console.error('Error checking upcoming events:', error);
      }
    }, 60 * 60 * 1000); // 1 hora
  }

  // Verificar eventos próximos y enviar recordatorios
  async checkUpcomingEvents() {
    try {
      // En producción, obtendrías los eventos de la API
      const mockEvents = [
        {
          eventID: 1,
          title: 'Servicio Dominical',
          eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Mañana
        }
      ];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      for (const event of mockEvents) {
        const eventDate = new Date(event.eventDate);
        
        // Si el evento es mañana, enviar recordatorio
        if (eventDate >= tomorrow && eventDate < dayAfter) {
          const users = await apiService.getUsers();
          const activeUsers = users.data.filter(user => user.isActive);
          
          for (const user of activeUsers) {
            await this.createNotification(
              user.userID,
              'Recordatorio de Evento',
              `¡No olvides que mañana tenemos: ${event.title}!`,
              'reminder'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error in checkUpcomingEvents:', error);
    }
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

// Auto-configurar notificaciones de eventos
if (typeof window !== 'undefined') {
  notificationService.setupEventNotifications();
}

export default notificationService;