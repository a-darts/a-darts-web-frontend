import i18n from '../i18n';
import { API_BASE_URL, handleFetchError, handleResponse } from './api';

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
}

export enum Federations {
  ESPAÑA = 'España',
  ARAGON = 'Aragón',
  COMUNIDAD_VALENCIANA = 'Comunidad Valenciana',
  GALICIA = 'Galicia',
  ANDALUCIA = 'Andalucía',
  MADRID = 'Madrid',
  CASTILLA_LA_MANCHA = 'Castilla-La Mancha',
  CASTILLA_Y_LEON = 'Castilla y León',
  CANARIAS = 'Canarias',
  BALEARES = 'Baleares',
  // Otras
  MURCIA = 'Murcia',
  ASTURIAS = 'Asturias',
  CANTABRIA = 'Cantabria',
  CATALUÑA = 'Cataluña',
  PAIS_VASCO = 'País Vasco',
  NAVARRA = 'Navarra',
  LA_RIOJA = 'La Rioja',
  EXTREMADURA = 'Extremadura',
  CEUTA = 'Ceuta',
  MELILLA = 'Melilla',
}

export enum GameModes {
  SINGLE = 'Individual',
  WOMEN_SINGLES = 'Individual Femenino',
  MEN_SINGLES = 'Individual Masculino',
  MIXED_SINGLES = 'Individual Mixto',
  YOUTH_SINGLES = 'Individual Juvenil',
  PAIRS = 'Parejas',
  WOMEN_PAIRS = 'Parejas Femeninas',
  MEN_PAIRS = 'Parejas Masculinas',
  MIXED_PAIRS = 'Parejas Mixtas',
  YOUTH_PAIRS = 'Parejas Juveniles',
  TEAMS = 'Equipos',
}

export enum GameTypes {
  BEST_OF = 'Al mejor de',
  FIRST_TO = 'A ganar',
}

export enum ScheduleTypes {
  KO = 'K.O. directo',
}

export enum RegistrationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Tournament {
  id: string;
  name: string;
  seasonStartYear: number;
  createdAt: string;
  status: TournamentStatus;
  info: {
    place: string;
    dateTime: string;
    mode: GameModes;
    game: string;
    schedule: string;
    maxPlayers: number;
    gameType: GameTypes;
    numLegs: number;
    numSets: number;
    rules: string;
    info: string;
    federation: Federations;
  };
  registration: {
    hasCheckIn: boolean;
    status: RegistrationStatus;
    registrationPeriod: {
      startsAt: string | null;
      endsAt: string | null;
    };
    registeredParticipantsIds: string[];
  };
}

export interface Participant {
  id: string;
  playerId: string;
  alias: string;
  federation: string;
}

export interface UnregisteredPlayer {
  id: string;
  userId: string;
  registrationNumber: string;
  federation: string;
  seasonStartYear: number;
  userAlias: string;
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
  boardNumber: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  status: string;
  participant1: MatchParticipant;
  participant2: MatchParticipant;
  matchScore: MatchScore;
}


export const tournamentService = {
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  getTournamentById: async (id: string): Promise<Tournament> => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/tournaments/${id}`, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

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

  getUnregisteredPlayers: async (id: string): Promise<UnregisteredPlayer[]> => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/unregisteredPlayers`, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  getTournamentBracket: async (id: string): Promise<Bracket> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/bracket`, {
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

  updateTournamentInfo: async (id: string, newInfo: any): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/info`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newInfo }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  updateTournamentName: async (id: string, newName: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/name`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newName }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  openRegistration: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/registration/open`, {
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

  closeRegistration: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/registration/close`, {
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

  updateRegistrationSchedule: async (id: string, newRegistrationPeriod: { startsAt: string | null; endsAt: string | null }): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/registration/schedule`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newRegistrationPeriod }),
      });
      await handleResponse(response);
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

  startTournament: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/start`, {
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
