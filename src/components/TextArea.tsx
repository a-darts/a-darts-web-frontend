import React, { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  onFocus,
  onBlur,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const textAreaId = id || useId();

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div style={styles.container}>
      {label && <label htmlFor={textAreaId} style={styles.label}>{label}</label>}
      <div style={{
        ...styles.textareaWrapper,
        borderColor: error ? '#ff4d4f' : (isFocused ? '#C4E866' : 'var(--btn-secondary-border)')
      }}>
        <textarea
          id={textAreaId}
          style={styles.textarea}
          className={className}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      {error &&
        <div style={styles.errorContainer}>
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
    textAlign: 'left',
  },
  textareaWrapper: {
    backgroundColor: 'var(--header-bg)',
    border: '1px solid var(--btn-secondary-border)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    transition: 'all 0.2s ease',
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-color)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ff4d4f',
    marginLeft: '0.25rem',
  },
};

export default TextArea;
