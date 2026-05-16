import React, { useEffect, useState } from 'react';
import Icon, { IconName } from './Icon';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: (id?: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'success',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = (): IconName => {
    switch (type) {
      case 'success': return 'Check';
      case 'error': return 'X';
      case 'info': return 'Search'; // Or any other suitable icon
      default: return 'Check';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: 'rgba(196, 232, 102, 0.15)', border: '#C4E866', icon: '#C4E866' };
      case 'error': return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: '#ef4444' };
      case 'info': return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', icon: '#3b82f6' };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      ...styles.toast,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    }}>
      <div style={{ ...styles.iconContainer, backgroundColor: colors.icon }}>
        <Icon name={getIcon()} size={16} color="#000" />
      </div>
      <p style={styles.message}>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(id), 300);
        }}
        style={styles.closeBtn}
      >
        <Icon name="X" size={14} color="rgba(255,255,255,0.5)" />
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    marginBottom: '1rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: '300px',
    maxWidth: '450px',
    pointerEvents: 'auto',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  message: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
};

export default Toast;
