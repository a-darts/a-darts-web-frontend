import { API_BASE_URL, handleResponse } from './api';

export interface Player {
  id: string;
  userId: string;
  registrationNumber: string;
  federation: string;
  seasonStartYear: number;
  seasonEndYear: number;
}

export const playerService = {
  /**
   * Fetches player data for a specific user and season.
   */
  async getPlayerByUserAndSeason(userId: string, seasonYear: number): Promise<Player> {
    const response = await fetch(`${API_BASE_URL}/players/user/${userId}/season/${seasonYear}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await handleResponse(response);
    return result.data;
  },
};
