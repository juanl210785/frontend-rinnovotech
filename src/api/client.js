import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para inyectar token Bearer
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rinnovo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar sesión expirada o errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('rinnovo_token');
      localStorage.removeItem('rinnovo_user');
      // No forzamos redirect si está en tienda pública
    }
    return Promise.reject(error);
  }
);

export default api;
