import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'rgba(255, 255, 255, 0.1)' }) => {
  return (
    <div style={{
      ...styles.card,
      borderColor: color,
      borderLeftColor: color !== 'rgba(255, 255, 255, 0.1)' ? color : 'rgba(255, 255, 255, 0.2)',
      boxShadow: color !== 'rgba(255, 255, 255, 0.1)' ? `0 4px 20px ${color}10` : 'none',
    }}>
      <span style={styles.value}>{value}</span>
      <span style={{
        ...styles.title,
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        {title}
      </span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid',
    borderLeft: '4px solid',
    borderRadius: '1rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '0.5rem',
    minWidth: '180px',
    flex: '1 1 0',
    transition: 'all 0.2s ease-in-out',
  },
  value: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '500',
    // textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }
};

export default StatCard;
