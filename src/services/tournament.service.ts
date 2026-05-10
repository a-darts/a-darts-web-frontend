import { API_BASE_URL, handleResponse } from './api';

export enum TournamentStatus {
  DRAFT = 'BORRADOR',
  PUBLISHED = 'PUBLICADO',
  IN_PROGRESS = 'EN CURSO',
  CANCELLED = 'CANCELADO',
  FINISHED = 'FINALIZADO',
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  status: TournamentStatus;
  info: {
    place: string;
    dateTime: string;
    mode: string;
    game: string;
    schedule: string;
    maxPlayers: number;
    gameType: string;
    numLegs: number;
    numSets: number;
    rules: string;
    info: string;
    federation: string;
  };
  registration: {
    hasCheckIn: boolean;
    registrationPeriod: {
      startsAt: string | null;
      endsAt: string | null;
    };
    registeredParticipantsIds: string[];
  };
}

export const tournamentService = {
  getTournaments: async (): Promise<Tournament[]> => {
    const response = await fetch(`${API_BASE_URL}/tournaments`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return result.data;
  },

  getTournamentById: async (id: string): Promise<Tournament> => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return result.data;
  },
};
