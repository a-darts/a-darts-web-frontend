import React, { useEffect } from 'react';
import Button from './Button';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
  loading?: boolean;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'primary',
  loading = false,
  maxWidth = '480px',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header style={styles.header}>
          <h2 id="modal-title" style={styles.title}>{title}</h2>
        </header>

        <div style={styles.body}>
          <p style={styles.description}>{description}</p>
        </div>

        <footer style={styles.footer}>
          <Button
            variant="danger"
            onClick={onClose}
            disabled={loading}
            leftIcon='X'
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            leftIcon='Check'
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1.5rem',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: '480px',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    fontFamily: 'var(--font-title)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    marginRight: '-0.5rem',
  },
  body: {
    marginBottom: '2.5rem',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.6',
    margin: 0,
    fontSize: '1rem',
    whiteSpace: 'pre-line',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
};

export default Modal;
