import React from 'react';
import Icon, { IconName } from './Icon';

interface EmptyStateProps {
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, children }) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.description}>
        {description}
      </div>
      {children && (
        <div style={styles.actions}>
          {children}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '4rem 2rem',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    marginTop: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '450px',
    margin: '0 auto',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  actions: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  }
};

export default EmptyState;
