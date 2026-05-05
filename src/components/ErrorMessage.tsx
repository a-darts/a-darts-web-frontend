import React from 'react';
import Icon from './Icon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div style={styles.errorBanner}>
      <Icon name="AlertCircle" size={18} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  errorBanner: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    color: '#ff4444',
    padding: '0.7rem 1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: 'auto',
  },
};

export default ErrorMessage;
