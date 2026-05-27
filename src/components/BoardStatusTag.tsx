import React from 'react';
import { TournamentStatus } from '../services/tournament.service';
import { getStatusLabel } from '../utils/tournament.utils';
import Icon, { IconName } from './Icon';
import i18n from '../i18n';

interface BoardStatusTagProps {
  status: TournamentStatus | string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const BoardStatusTag: React.FC<BoardStatusTagProps> = ({
  status,
  size = 'small',
  showIcon = true,
}) => {
  const label = getStatusLabel(status);

  const getIconName = (s: string): IconName => {
    switch (s) {
      case 'AVAILABLE': return 'CircleDot';
      case 'OCCUPIED': return 'CirclePlay';
      case 'DISABLED': return 'Ban';
      default: return 'Info';
    }
  };

  return (
    <span style={styles.badge(status, size)}>
      {showIcon && (
        <Icon
          name={getIconName(status)}
          size={size === 'small' ? 12 : 14}
          style={{ marginRight: size === 'small' ? '4px' : '6px' }}
        />
      )}
      {i18n.t(`playingArea.${label}`)}
    </span>
  );
};

const styles: { [key: string]: any } = {
  badge: (status: string, size: 'small' | 'medium') => {
    // Determine colors based on status
    let color = '#a1a1a1'; // Default
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';

    switch (status) {
      case 'AVAILABLE':
        color = '#4ade80';
        bgColor = 'rgba(34, 197, 94, 0.1)';
        borderColor = 'rgba(34, 197, 94, 0.2)';
        break;
      case 'OCCUPIED':
        color = '#fbbf24';
        bgColor = 'rgba(245, 158, 11, 0.1)';
        borderColor = 'rgba(245, 158, 11, 0.2)';
        break;
      case 'DISABLED':
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

export default BoardStatusTag;
