import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export interface Board {
  id: string;
  shortId: string;
  number: number;
  status: string;
  matchId: string | null;
}

export interface PlayingArea {
  id: string;
  shortId: string;
  tournamentId: string;
  boards: Board[];
}



export const playingAreaService = {

  getPlayingArea: async (tournamentId: string): Promise<PlayingArea | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/playing-areas`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      if (error.message.includes('Playing area not found')) {
        return null;
      }
      throw handleFetchError(error);
    }
  },

  createPlayingArea: async (tournamentId: string, numBoards: number): Promise<PlayingArea> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/playing-areas`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ numBoards }),
      });
      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  releasePlayingAreaBoard: async (playingAreaId: string, boardId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardId}/release`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  addBoardToPlayingArea: async (playingAreaId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  removeLastBoardFromPlayingArea: async (playingAreaId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/last`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  disableBoard: async (playingAreaId: string, boardId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardId}/disable`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  enableBoard: async (playingAreaId: string, boardId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardId}/enable`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },
};
