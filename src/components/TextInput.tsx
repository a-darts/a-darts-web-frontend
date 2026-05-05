import React from 'react';
import Icon, { IconName } from './Icon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: IconName;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={{ ...styles.inputWrapper, ...(error ? styles.inputError : {}) }}>
        {icon && <Icon name={icon} size={18} style={styles.icon} />}
        <input
          style={styles.input}
          className={className}
          {...props}
        />
      </div>
      {error &&
        <div style={styles.errorContainer}>
          <Icon name="AlertCircle" size={14} style={styles.errorIcon} />
          <span style={styles.errorText}>{error}</span>
        </div>
      }
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary-color)',
    marginLeft: '0.25rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--header-bg)',
    border: '1px solid var(--btn-secondary-border)',
    borderRadius: '10px',
    padding: '0 1rem',
    transition: 'all 0.2s ease',
    height: '48px',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  icon: {
    color: 'var(--text-secondary-color)',
    marginRight: '0.75rem',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-color)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    height: '100%',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    color: '#ff4d4f',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ff4d4f',
    marginLeft: '0.25rem',
  },
};

export default TextInput;
