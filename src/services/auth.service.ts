import { UserRoles } from '../context/AuthContext';
import i18n from '../i18n';
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

  registerByAdmin: async (email: string, alias: string, role: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, alias, role }),
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

  updateEmail: async (newEmail: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/users/email`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  updateAlias: async (newAlias: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));
    try {
      const response = await fetch(`${API_BASE_URL}/users/alias`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newAlias }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  getUsers: async (page?: number, limit?: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page.toString());
      if (limit !== undefined) queryParams.append('limit', limit.toString());

      const url = queryParams.toString()
        ? `${API_BASE_URL}/users?${queryParams.toString()}`
        : `${API_BASE_URL}/users`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  getUserById: async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await handleResponse(response);
      return result.data || result;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  updateUserEmailByAdmin: async (userId: string, newEmail: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/email`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  updateUserAliasByAdmin: async (userId: string, newAlias: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/alias`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newAlias }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  blockUser: async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  unblockUser: async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  deleteUser: async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/delete`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  restoreUser: async (userId: string, email: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/restore`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  }
};
