import React, { useEffect } from 'react';
import Icon, { IconName } from './Icon';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = (): IconName => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'Info';
    }
  };

  return (
    <div style={{ ...styles.toast, ...styles[type] }}>
      <Icon name={getIcon()} size={20} />
      <span style={styles.message}>{message}</span>
      <button onClick={onClose} style={styles.closeButton}>
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    animation: 'slideIn 0.3s ease-out forwards',
    minWidth: '300px',
  },
  message: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  success: {
    backgroundColor: '#0E0E0E',
    border: '1px solid rgba(196, 232, 102, 0.3)',
    color: 'var(--btn-primary-bg)',
  },
  error: {
    backgroundColor: '#0E0E0E',
    border: '1px solid rgba(255, 77, 79, 0.3)',
    color: '#ff4d4f',
  },
  info: {
    backgroundColor: '#0E0E0E',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
};

export default Toast;
