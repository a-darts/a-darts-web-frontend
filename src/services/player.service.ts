import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export interface Player {
  id: string;
  userId: string;
  registrationNumber: string;
  federation: string;
  seasonStartYear: number;
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
};
