import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post('/auth/register', userData);

      set({
        isLoading: false,
        error: null
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      // Get current session ID (you'd need to track this)
      const sessionId = 'current-session-id'; // This should be stored in state
      await api.post('/auth/logout', { sessionId });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.clear();
      set({
        user: null,
        isAuthenticated: false,
        error: null
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      set({
        user: data,
        isAuthenticated: true,
        error: null
      });
    } catch (error) {
      // Token might be expired, try refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Retry getting user info
          const { data: userData } = await api.get('/auth/me');
          set({
            user: userData,
            isAuthenticated: true,
            error: null
          });
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.clear();
          set({ user: null, isAuthenticated: false });
        }
      } else {
        localStorage.clear();
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null })
}));

export { useAuthStore };
