import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export interface Participant {
  id: string;
  playerId: string;
  alias: string;
  federation: string;
}


export const registeredParticipantService = {

  getParticipantsByTournamentId: async (id: string): Promise<Participant[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/participants`, {
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

  registerParticipant: async (tournamentId: string, playerId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  unregisterParticipant: async (tournamentId: string, participantId: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },
};
