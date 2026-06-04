import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export enum MatchStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export interface MatchParticipant {
  id: string | null;
  alias: string;
  federation: string;
}

export interface MatchScore {
  participant1: {
    setsWon: number;
    legsWon: number;
  };
  participant2: {
    setsWon: number;
    legsWon: number;
  };
}

export interface Match {
  id: string;
  round: number;
  matchIndex: number;
  boardNumber: number | null;
  boardId: string | null;
  boardShortId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  status: string;
  participant1: MatchParticipant;
  participant2: MatchParticipant;
  matchScore: MatchScore;
}


export const matchService = {

  getTournamentMatches: async (id: string): Promise<Match[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/matches`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  getMatchById: async (id: string): Promise<Match> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  startMatch: async (matchId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/start`, {
        method: 'POST',
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  suspendMatch: async (matchId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/suspend`, {
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

  resumeMatch: async (matchId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/resume`, {
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

  assignMatchBoard: async (matchId: string, boardNumber: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/board-number`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ boardNumber: boardNumber }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  addMatchResult: async (matchId: string, result: { p1Sets: number, p1Legs: number, p2Sets: number, p2Legs: number }): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('exceptions.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/result`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },
};
