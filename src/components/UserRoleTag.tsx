import React from 'react';
import Icon, { IconName } from './Icon';
import { getRoleLabel } from '../utils/auth.utils';
import { UserRoles } from '../context/AuthContext';
import i18n from '../i18n';

interface UserRoleTagProps {
  role: UserRoles | string;
  size?: 'small' | 'medium';
}

const UserRoleTag: React.FC<UserRoleTagProps> = ({ role, size = 'small' }) => {
  const label = i18n.t(`auth.${getRoleLabel(role)}`);

  const getIconName = (s: string): IconName => {
    switch (s) {
      case UserRoles.ADMIN: return 'Shield';
      case UserRoles.PLAYER: return 'User';
      default: return 'Info';
    }
  };

  return (
    <span style={styles.badge(role, size)}>
      <Icon
        name={getIconName(role)}
        size={size === 'small' ? 12 : 14}
        style={{ marginRight: size === 'small' ? '4px' : '6px' }}
      />
      {label}
    </span>
  );
};

const styles: { [key: string]: any } = {
  badge: (status: string, size: 'small' | 'medium') => {
    // Determine colors based on status
    let color = '#a1a1a1'; // Default / Draft
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';

    switch (status) {
      case UserRoles.PLAYER:
        color = '#a1a1a1';
        bgColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.1)';
        break;
      case UserRoles.ADMIN:
        color = '#60a5fa';
        bgColor = 'rgba(59, 130, 246, 0.1)';
        borderColor = 'rgba(59, 130, 246, 0.2)';
        break;
    }

    return {
      fontSize: size === 'small' ? '0.65rem' : '0.8rem',
      fontWeight: '700',
      padding: size === 'small' ? '0.25rem 0.6rem' : '0.4rem 1rem',
      borderRadius: '100px',
      letterSpacing: size === 'small' ? '0.5px' : '1px',
      backgroundColor: bgColor,
      color: color,
      border: `1px solid ${borderColor}`,
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
};

export default UserRoleTag;
