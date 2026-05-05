import React from 'react';
import Icon, { IconName } from './Icon';

interface InfoCardProps {
  title: string;
  content: string;
  icon?: IconName;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, content, icon }) => {
  return (
    <div style={styles.card}>
      {icon && (
        <div style={styles.iconContainer}>
          <Icon name={icon} size={20} />
        </div>
      )}
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>
        <p style={styles.value}>{content}</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    width: '100%',
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary-color)',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary-color)',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#ffffff',
  },
};

export default InfoCard;
