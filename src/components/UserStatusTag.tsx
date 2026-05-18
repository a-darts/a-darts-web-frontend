import React from 'react';
import Icon, { IconName } from './Icon';
import { getUserStatusLabel } from '../utils/auth.utils';
import { UserStatus } from '../context/AuthContext';
import i18n from '../i18n';

interface UserStatusTagProps {
  status: UserStatus | string;
  size?: 'small' | 'medium';
}

const UserStatusTag: React.FC<UserStatusTagProps> = ({ status, size = 'small' }) => {
  const label = i18n.t(`auth.${getUserStatusLabel(status)}`);

  const getIconName = (s: string): IconName => {
    switch (s) {
      case UserStatus.ACTIVE: return 'CheckCircle';
      case UserStatus.INACTIVE: return 'MinusCircle';
      case UserStatus.BLOCKED: return 'Lock';
      case UserStatus.DELETED: return 'Trash';
      default: return 'Info';
    }
  };

  return (
    <span style={styles.badge(status, size)}>
      <Icon
        name={getIconName(status)}
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
      case UserStatus.ACTIVE:
        color = '#C4E866';
        bgColor = 'rgba(196, 232, 102, 0.1)';
        borderColor = 'rgba(196, 232, 102, 0.2)';
        break;
      case UserStatus.INACTIVE:
        color = '#a1a1a1';
        bgColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.1)';
        break;
      case UserStatus.BLOCKED:
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
      case UserStatus.DELETED:
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
    }

    return {
      fontSize: size === 'small' ? '0.65rem' : '0.8rem',
      fontWeight: '700',
      padding: size === 'small' ? '0.25rem 0.6rem' : '0.4rem 1rem',
      borderRadius: '100px',
      textTransform: 'uppercase',
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

export default UserStatusTag;
