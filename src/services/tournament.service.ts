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

export enum BracketStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum MatchStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}


export interface Tournament {
  id: string;
  name: string;
  seasonStartYear: number;
  createdAt: string;
  status: TournamentStatus;
  isDelayed: boolean;
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


export const tournamentService = {
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

  publishTournament: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/publish`, {
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

  unpublishTournament: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}/unpublish`, {
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
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/setupPositions`, {
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
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

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
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

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
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/boardNumber`, {
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
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

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

  createTournament: async (name: string, seasonStartYear: number, info: any): Promise<Tournament> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, seasonStartYear, info }),
      });
      const result = await handleResponse(response);
      return result.data;
    } catch (error: any) {
      throw handleFetchError(error);
    }
  },

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

  releasePlayingAreaBoard: async (playingAreaId: string, boardNumber: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardNumber}/release`, {
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

  disableBoard: async (playingAreaId: string, boardNumber: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardNumber}/disable`, {
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

  enableBoard: async (playingAreaId: string, boardNumber: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error(i18n.t('auth.errors.User not authenticated'));

    try {
      const response = await fetch(`${API_BASE_URL}/playing-areas/${playingAreaId}/boards/${boardNumber}/enable`, {
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
