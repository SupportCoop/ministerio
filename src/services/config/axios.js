// src/config/axios.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Base configuration
const API_BASE_URL = 'https://localhost:7177/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add session data if available
    const sessionData = localStorage.getItem('sessionData');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.adminID) {
          config.headers['X-Admin-ID'] = session.adminID;
        }
      } catch (error) {
        console.warn('Error parsing session data:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);
    
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url;
      
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${url} - ${status}`);
      
      switch (status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionData');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('No tienes permisos para realizar esta acción.');
          break;
        case 404:
          toast.error('Recurso no encontrado.');
          break;
        case 500:
          toast.error('Error del servidor. Por favor, intenta más tarde.');
          break;
      }
    } else if (error.request) {
      console.error('❌ Network error:', error.request);
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;