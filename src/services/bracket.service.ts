import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export enum BracketStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export interface BracketPosition {
  position: number;
  participantId: string | null;
  participantAlias: string | null;
  participantFederation: string | null;
}

export interface Bracket {
  id: string;
  tournamentId: string;
  status: string;
  totalPositions: number;
  positions: BracketPosition[];
}


export const bracketService = {

  getTournamentBracket: async (id: string): Promise<Bracket> => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/bracket`, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },


  generateBracketAutomatically: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/bracket/automatic`, {
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

  generateBracketManually: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/bracket/manual`, {
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

  saveBracketPositions: async (bracketId: string, positions: BracketPosition[]): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/setup-positions`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPositions: positions.map(pos => {
            const isEmpty = !pos.participantId ||
              pos.participantAlias === 'Por determinar' ||
              pos.participantAlias === 'Bye';
            return {
              participantId: isEmpty ? null : pos.participantId,
              position: pos.position
            };
          })
        })
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  publishBracket: async (bracketId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/publish`, {
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

  unpublishBracket: async (bracketId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/unpublish`, {
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

  deleteBracket: async (bracketId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}`, {
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

  reshuffleBracket: async (bracketId: string): Promise<Bracket> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/reshuffle`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await handleResponse(response);
      return data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },
};
