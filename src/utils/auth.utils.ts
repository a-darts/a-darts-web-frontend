import { UserRoles, UserStatus } from "../context/AuthContext";

/**
 * Returns the localized label for a user role.
 */
export const getRoleLabel = (role: string): string => {
  return UserRoles[role as keyof typeof UserRoles] || role;
};

/**
 * Returns the localized label for a user status.
 */
export const getUserStatusLabel = (status: string): string => {
  return UserStatus[status as keyof typeof UserStatus] || status;
};
