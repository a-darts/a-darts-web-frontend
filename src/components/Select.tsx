import React, { useState, useRef, useEffect } from 'react';
import Icon, { IconName } from './Icon';
import { DropdownItem } from './Dropdown';

interface SelectProps {
  value: string;
  options: { [key: string]: string } | { value: string; label: string; icon?: IconName }[];
  onChange: (value: string) => void;
  icon?: IconName;
  label?: string;
  align?: 'left' | 'right';
  style?: React.CSSProperties;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  icon,
  label,
  align = 'left',
  style,
  placeholder = 'Seleccionar...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Normalizar opciones
  let displayValue = '';
  let dropdownItems: DropdownItem[] = [];

  if (Array.isArray(options)) {
    const selectedOpt = options.find((o) => o.value === value);
    displayValue = selectedOpt ? selectedOpt.label : (value || placeholder);
    dropdownItems = options.map((opt) => ({
      label: opt.label,
      icon: opt.icon,
      onClick: () => onChange(opt.value)
    }));
  } else {
    const recordOptions = options as { [key: string]: string };
    displayValue = recordOptions[value] || (value || placeholder);
    dropdownItems = Object.keys(recordOptions).map((key) => ({
      label: recordOptions[key],
      onClick: () => onChange(key)
    }));
  }

  return (
    <div style={{ ...styles.selectContainer, ...style }} ref={selectRef}>
      {label && <label style={styles.selectLabel}>{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            ...styles.selectWrapper,
            cursor: 'pointer',
            borderColor: isOpen ? '#C4E866' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {icon && <Icon name={icon} size={16} style={styles.selectIcon} />}
            <span style={{
              color: value ? '#fff' : 'rgba(255, 255, 255, 0.4)',
              fontSize: '0.875rem'
            }}>
              {displayValue}
            </span>
          </div>
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
        </div>

        {isOpen && (
          <div style={{
            ...styles.menu,
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            width: '100%',
            minWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {dropdownItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                style={{
                  ...styles.item,
                  ...(item.variant === 'danger' ? styles.dangerItem : {}),
                  backgroundColor: item.label === displayValue ? 'rgba(196, 232, 102, 0.1)' : 'transparent',
                  color: item.label === displayValue ? '#C4E866' : '#E0E0E0',
                }}
                className="dropdown-item"
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  menu: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '0.5rem',
    minWidth: '180px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  item: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#E0E0E0',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s ease',
    justifyContent: 'flex-start',
  },
  dangerItem: {
    color: '#FF4D4D',
  },
  selectContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  },
  selectLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary-color)',
    marginLeft: '0.25rem',
    textAlign: 'left',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--header-bg)',
    border: '1px solid var(--btn-secondary-border)',
    borderRadius: '10px',
    padding: '0 1rem',
    transition: 'all 0.2s ease',
    height: '48px',
    boxSizing: 'border-box',
    width: '100%',
  },
  selectIcon: {
    color: 'var(--text-secondary-color)',
    marginRight: '0.75rem',
  },
};

export default Select;
