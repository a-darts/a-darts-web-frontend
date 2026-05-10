import { UserRoles } from "../context/AuthContext";

/**
 * Returns the localized label for a tournament status.
 */
export const getRoleLabel = (role: string): string => {
  return UserRoles[role as keyof typeof UserRoles] || role;
};
