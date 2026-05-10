import { TournamentStatus, Federations } from '../services/tournament.service';

/**
 * Returns the localized label for a tournament status.
 */
export const getStatusLabel = (status: string): string => {
  return TournamentStatus[status as keyof typeof TournamentStatus] || status;
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
