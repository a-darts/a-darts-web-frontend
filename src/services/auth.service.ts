import { API_BASE_URL, handleResponse } from './api';

export const authService = {
  login: async (email: string, password: string) => {
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
  },

  getMe: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await handleResponse(response);
    const userData = result.data || result; // Fallback to result if not nested

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return userData;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
