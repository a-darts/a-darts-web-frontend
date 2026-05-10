import React, { useState } from 'react';
import Icon from './Icon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Buscar torneos...' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={styles.container(isFocused)}>
      <Icon name="Search" size={18} style={styles.icon(isFocused)} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          style={styles.clearButton}
          title="Limpiar búsqueda"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: (isFocused: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: isFocused ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.03)',
    borderRadius: '100px',
    padding: '0.6rem 1.2rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${isFocused ? 'rgba(196, 232, 102, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
    boxShadow: isFocused ? '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(196, 232, 102, 0.1)' : 'none',
    width: '100%',
  }),
  icon: (isFocused: boolean) => ({
    color: isFocused ? '#C4E866' : 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    transform: isFocused ? 'scale(1.1)' : 'scale(1)',
  }),
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    height: '24px',
    padding: 0,
  },
  clearButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.4)',
    padding: 0,
    transition: 'all 0.2s ease',
    outline: 'none',
  },
};

export default SearchInput;
