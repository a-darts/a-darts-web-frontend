import React from 'react';
import { TournamentStatus } from '../services/tournament.service';
import { getStatusLabel } from '../utils/tournament.utils';
import Icon, { IconName } from './Icon';

interface TournamentStatusTagProps {
  status: TournamentStatus | string;
  size?: 'small' | 'medium';
}

const TournamentStatusTag: React.FC<TournamentStatusTagProps> = ({ status, size = 'small' }) => {
  const label = getStatusLabel(status);

  const getIconName = (s: string): IconName => {
    switch (s) {
      case 'DRAFT': return 'EyeOff';
      case 'PUBLISHED': return 'Megaphone';
      case 'IN_PROGRESS': return 'Radio';
      case 'FINISHED': return 'CheckCircle';
      case 'CANCELLED': return 'XCircle';
      case 'DELETED': return 'Trash';
      // Extra
      case 'DELAYED': return 'AlertTriangle';
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
      case 'DRAFT':
        color = '#a1a1a1';
        bgColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.1)';
        break;
      case 'PUBLISHED':
        color = '#C4E866';
        bgColor = 'rgba(196, 232, 102, 0.1)';
        borderColor = 'rgba(196, 232, 102, 0.2)';
        break;
      case 'IN_PROGRESS':
        color = '#fbbf24';
        bgColor = 'rgba(245, 158, 11, 0.1)';
        borderColor = 'rgba(245, 158, 11, 0.2)';
        break;
      case 'FINISHED':
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
      case 'CANCELLED':
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
      case 'DELAYED':
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
      case 'DELETED':
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

export default TournamentStatusTag;
