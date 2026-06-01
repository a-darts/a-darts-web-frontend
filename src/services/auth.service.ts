import { UserRoles } from '../context/AuthContext';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await handleResponse(response);
      const { token, user } = result.data || {};

      // Store token if it exists in the response
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return result;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  register: async (email: string, password: string, alias: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, alias, role: UserRoles.PLAYER }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  activateAccount: async (email: string, temporaryPassword: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/activate-account`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, temporaryPassword, newPassword }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },


  getMe: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await handleResponse(response);
      const userData = result.data || result;

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return userData;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  logout: async () => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Network error during backend logout:', error);
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
