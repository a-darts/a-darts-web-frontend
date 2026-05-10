import { TournamentStatus, Federations } from '../services/tournament.service';

/**
 * Returns the localized label for a tournament status.
 */
export const getStatusLabel = (status: string): string => {
  return TournamentStatus[status as keyof typeof TournamentStatus] || status;
};

/**
 * Returns the localized label for a federation.
 */
export const getFederationLabel = (federation: string): string => {
  return Federations[federation as keyof typeof Federations] || federation;
};
