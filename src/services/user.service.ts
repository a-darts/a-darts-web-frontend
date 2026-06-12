import { UserRoles, UserStatus } from '../context/AuthContext';
import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export const userService = {

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

  getUsers: async (
    page?: number,
    limit?: number,
    search?: string,
    status?: UserStatus,
    role?: UserRoles,
  ) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page.toString());
      if (limit !== undefined) queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (role) queryParams.append('role', role);

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

  updateEmail: async (userId: string, newEmail: string) => {
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

  updateAlias: async (userId: string, newAlias: string) => {
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

  updatePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
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
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
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
  },

  getStats: async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
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
  }
};
