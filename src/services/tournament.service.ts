import { API_BASE_URL, handleResponse } from './api';

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

export enum RegistrationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Tournament {
  id: string;
  name: string;
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
  alias: string;
  federation: string;
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

  getParticipantsByTournamentId: async (id: string): Promise<Participant[]> => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${id}/participants`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return result.data;
  },

  registerParticipant: async (tournamentId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/participants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });
    await handleResponse(response);
  },
};
