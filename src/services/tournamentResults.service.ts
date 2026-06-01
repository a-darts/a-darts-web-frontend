import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export interface ParticipantResult {
  participantId: string;
  playerId: string;
  alias: string;
  federation: string;
  finalPosition: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  legsWon: number;
  legsLost: number;
}

export interface TournamentResult {
  id: string;
  tournamentId: string;
  participantsResults: ParticipantResult[];
}


export const tournamentResultsService = {
  getTournamentResults: async (id: string): Promise<TournamentResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/results`, {
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
};
