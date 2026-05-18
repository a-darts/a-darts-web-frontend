import { TournamentStatus, Federations, GameModes, GameTypes, RegistrationStatus, ScheduleTypes } from '../services/tournament.service';

/**
 * Returns the localized label for a tournament status
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: { [key: string]: string } = {
    'DRAFT': 'Borrador',
    'PUBLISHED': 'Publicado',
    'IN_PROGRESS': 'En curso',
    'FINISHED': 'Finalizado',
    'CANCELLED': 'Cancelado',
  };
  return statusLabels[status] || status;
};

/**
 * Returns the localized label for a match status
 */
export const getMatchStatusLabel = (status: string): string => {
  const matchStatusLabels: { [key: string]: string } = {
    'PENDING': 'Pendiente',
    'READY': 'Listo',
    'IN_PROGRESS': 'En curso',
    'FINISHED': 'Finalizado',
    'SUSPENDED': 'Suspendido',
    'CANCELLED': 'Cancelado',
  };
  return matchStatusLabels[status] || status;
};


/**
 * Returns the localized label for a tournament registration status
 */
export const getRegistrationStatusLabel = (status: string): string => {
  const registrationLabels: { [key: string]: string } = {
    'OPEN': 'Inscripciones abiertas',
    'CLOSED': 'Inscripciones cerradas',
  };
  return registrationLabels[status] || status;
};

/**
 * Returns the localized label for a tournament bracket status
 */
export const getBracketStatusLabel = (status: string): string => {
  switch (status) {
    case 'DRAFT': return 'Borrador';
    case 'PUBLISHED': return 'Publicado';
    case 'IN_PROGRESS': return 'En curso';
    case 'FINISHED': return 'Finalizado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
};

/**
 * Returns the localized label for a tournament mode.
 */
export const getModeLabel = (mode: string): string => {
  return GameModes[mode as keyof typeof GameModes] || mode;
};

/**
 * Returns the localized label for a tournament game type.
 */
export const getGameTypeLabel = (gameType: string): string => {
  return GameTypes[gameType as keyof typeof GameTypes] || gameType;
};

/**
 * Returns the localized label for a tournament schedule type.
 */
export const getScheduleTypeLabel = (scheduleType: string): string => {
  return ScheduleTypes[scheduleType as keyof typeof ScheduleTypes] || scheduleType;
};

/**
 * Returns the flag URL for a federation.
 */
export const getFederationFlag = (federation: string): string | null => {
  const flags: { [key: string]: string } = {
    'ESPAÑA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Spain.svg&width=40',
    'ANDALUCIA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Andaluc%C3%ADa.svg&width=40',
    'ARAGON': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Aragon.svg&width=40',
    'ASTURIAS': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Asturias.svg&width=40',
    'BALEARES': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Balearic_Islands.svg&width=40',
    'CANARIAS': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Canary_Islands.svg&width=40',
    'CANTABRIA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Cantabria.svg&width=40',
    'CASTILLA_LA_MANCHA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Castile-La_Mancha.svg&width=40',
    'CASTILLA_Y_LEON': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Castile_and_Le%C3%B3n.svg&width=40',
    'CATALUÑA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Catalonia.svg&width=40',
    'EXTREMADURA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Extremadura.svg&width=40',
    'GALICIA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Galicia.svg&width=40',
    'LA_RIOJA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_La_Rioja.svg&width=40',
    'MADRID': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Community_of_Madrid.svg&width=40',
    'MURCIA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Region_of_Murcia.svg&width=40',
    'NAVARRA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Navarre.svg&width=40',
    'PAIS_VASCO': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Basque_Country.svg&width=40',
    'COMUNIDAD_VALENCIANA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_the_Valencian_Community.svg&width=40',
    'CEUTA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Ceuta.svg&width=40',
    'MELILLA': 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Flag_of_Melilla.svg&width=40',
  };

  return flags[federation] || null;
};

/**
 * Returns the localized label for a federation.
 */
export const getFederationLabel = (federation: string): string => {
  return Federations[federation as keyof typeof Federations] || federation;
};

/**
 * Formats a Date object or date string to a localized Spanish date in UTC timezone
 */
export const formatTournamentDate = (dateVal: any): string => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  });
};

/**
 * Formats a Date object or date string to a string time (HH:MM) in Europe/Madrid timezone
 */
export const formatTournamentTime = (dateVal: any): string => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Madrid',
  });
};

/**
 * Formats a Date object or date string to full Spanish date and time in UTC timezone
 */
export const formatTournamentDateTime = (dateVal: any): string => {
  if (!dateVal) return 'Sin programar';
  const formattedDate = formatTournamentDate(dateVal);
  const formattedTime = formatTournamentTime(dateVal);
  if (!formattedDate || !formattedTime) return 'Sin programar';
  return `${formattedDate} a las ${formattedTime}`;
};

/**
 * Returns the end year of a season based on its start year (simply adds 1)
 */
export const getSeasonEndYear = (startYear: number): number => {
  return startYear + 1;
};
