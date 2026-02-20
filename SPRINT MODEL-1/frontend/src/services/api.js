import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,  // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token for state-changing requests
    if (['post', 'put', 'delete'].includes(config.method)) {
      const csrfToken = sessionStorage.getItem('csrf-token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
