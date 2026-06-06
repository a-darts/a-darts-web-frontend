import React from 'react';
import Icon, { IconName } from './Icon';

interface InfoCardProps {
  title: string;
  content: React.ReactNode;
  icon?: IconName;
  onClick?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, content, icon, onClick }) => {
  return (
    <div
      style={{ ...styles.card, ...(onClick ? styles.cardClickable : {}) }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {icon && (
        <div style={styles.iconContainer}>
          <Icon name={icon} size={20} />
        </div>
      )}
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>
        <div style={styles.value}>{content}</div>
      </div>
      {onClick && (
        <div style={styles.arrowContainer}>
          <Icon name="ChevronRight" size={18} />
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderLeft: '1px solid #C4E866',
    width: 'auto',
  },
  cardClickable: {
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary-color)',
    flexShrink: 0,
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-secondary-color)',
    flexShrink: 0,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  value: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-color)',
  },
};

export default InfoCard;
