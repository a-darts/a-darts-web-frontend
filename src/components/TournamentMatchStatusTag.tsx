import React from 'react';
import { getMatchStatusLabel } from '../utils/tournament.utils';
import Icon, { IconName } from './Icon';

interface TournamentMatchStatusTagProps {
  status: string;
  size?: 'small' | 'medium';
}

const TournamentMatchStatusTag: React.FC<TournamentMatchStatusTagProps> = ({ status, size = 'small' }) => {
  const label = getMatchStatusLabel(status);

  const getIconName = (s: string): IconName => {
    switch (s) {
      case 'PENDING': return 'Clock';
      case 'READY': return 'Zap';
      case 'IN_PROGRESS': return 'Play';
      case 'FINISHED': return 'Check';
      case 'SUSPENDED': return 'Pause';
      case 'CANCELLED': return 'X';
      default: return 'Info';
    }
  };

  return (
    <span style={styles.badge(status, size)}>
      <Icon
        name={getIconName(status)}
        size={size === 'small' ? 10 : 12}
        style={{ marginRight: size === 'small' ? '3px' : '5px' }}
      />
      {label}
    </span>
  );
};

const styles: { [key: string]: any } = {
  badge: (status: string, size: 'small' | 'medium') => {
    let color = '#a1a1a1';
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';

    switch (status) {
      case 'PENDING':
        color = 'rgba(255, 255, 255, 0.4)';
        bgColor = 'rgba(255, 255, 255, 0.02)';
        borderColor = 'rgba(255, 255, 255, 0.05)';
        break;
      case 'READY':
        color = '#60a5fa';           // Azul brillante / Celeste
        bgColor = 'rgba(59, 130, 246, 0.1)';
        borderColor = 'rgba(59, 130, 246, 0.2)';
        break;
      case 'IN_PROGRESS':
        color = '#fbbf24';
        bgColor = 'rgba(245, 158, 11, 0.1)';
        borderColor = 'rgba(245, 158, 11, 0.2)';
        break;
      case 'FINISHED':
        color = '#C4E866';
        bgColor = 'rgba(196, 232, 102, 0.1)';
        borderColor = 'rgba(196, 232, 102, 0.2)';
        break;
      case 'SUSPENDED':
        color = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.1)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
        break;
      case 'CANCELLED':
        color = '#a1a1a1';
        bgColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.1)';
        break;
    }

    return {
      fontSize: size === 'small' ? '0.6rem' : '0.75rem',
      fontWeight: '800',
      padding: size === 'small' ? '0.15rem 0.5rem' : '0.3rem 0.8rem',
      borderRadius: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
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

export default TournamentMatchStatusTag;
