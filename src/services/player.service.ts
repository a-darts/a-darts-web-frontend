import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export interface Player {
  id: string;
  userId: string;
  registrationNumber: string;
  federation: string;
  seasonStartYear: number;
  userAlias?: string;
}

export const playerService = {
  /**
   * Fetches player data for a specific user and season.
   */
  async getPlayerByUserAndSeason(userId: string, seasonYear: number): Promise<Player> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/players/user/${userId}/season/${seasonYear}`, {
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
  async getPlayers(page?: number, limit?: number) {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page.toString());
      if (limit !== undefined) queryParams.append('limit', limit.toString());

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
};
