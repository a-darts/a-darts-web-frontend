import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export interface Player {
  id: string;
  userId: string;
  registrationNumber: string;
  federation: string;
  seasonStartYear: number;
  status: PlayerStatus;
  userAlias?: string;
}

export const playerService = {
  /**
   * Fetches player data for a specific user and season.
   */
  async getPlayerByUserAndSeason(userId: string, seasonYear: number): Promise<Player> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/players/users/${userId}/seasons/${seasonYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  /**
   * Fetches all players, with optional pagination.
   */
  async getPlayers(page?: number, limit?: number, status: PlayerStatus = PlayerStatus.ACTIVE) {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page.toString());
      if (limit !== undefined) queryParams.append('limit', limit.toString());
      if (status !== undefined) queryParams.append('status', status);

      const url = queryParams.toString()
        ? `${API_BASE_URL}/players?${queryParams.toString()}`
        : `${API_BASE_URL}/players`;

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

  /**
   * Fetches a single player by their ID.
   */
  async getPlayerById(id: string): Promise<Player> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/players/${id}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  /**
   * Updates a player's federation.
   */
  async updatePlayerFederation(id: string, federation: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/players/${id}/federation`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newFederation: federation }),
      });

      return await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  /**
   * Registers a new player in the system.
   */
  async createPlayer(data: { userId: string; registrationNumber: string; federation: string; startYear: number }): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.userId,
          registrationNumber: data.registrationNumber,
          federation: data.federation,
          season: {
            startYear: data.startYear,
          },
        }),
      });

      return await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  deletePlayer: async (playerId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
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

  restorePlayer: async (playerId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No hay token de sesión');

    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}/restore`, {
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
};
