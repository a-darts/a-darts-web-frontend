import React, { useId } from 'react';
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
  onFocus,
  onBlur,
  style,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const inputId = id || useId();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div style={{
      ...styles.container,
      ...style,
      opacity: props.disabled ? 0.5 : undefined,
      cursor: props.disabled ? 'not-allowed' : undefined
    }}>
      {label && (
        <label htmlFor={inputId} style={styles.label}>
          {label}
        </label>
      )}
      <div style={{
        ...styles.inputWrapper,
        borderColor: error ? '#ff4d4f' : (isFocused ? '#C4E866' : 'var(--btn-secondary-border)'),
        cursor: props.disabled ? 'not-allowed' : undefined
      }}>
        {icon && <Icon name={icon} size={18} style={styles.icon} />}
        <input
          id={inputId}
          style={{
            ...styles.input,
            cursor: props.disabled ? 'not-allowed' : undefined
          }}
          className={className}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onWheel={(e) => e.currentTarget.blur()}
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
