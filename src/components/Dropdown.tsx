import React, { useState, useRef, useEffect } from 'react';
import Icon, { IconName } from './Icon';

export interface DropdownItem {
  label: string;
  icon?: IconName;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  items: DropdownItem[];
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <div style={styles.container} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} style={styles.trigger}>
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </div>

      {isOpen && (
        <div style={{ ...styles.menu, ...(align === 'right' ? { right: 0 } : { left: 0 }) }}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              style={{
                ...styles.item,
                ...(item.variant === 'danger' ? styles.dangerItem : {}),
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
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
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
  },
  item: {
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
};

export default Dropdown;
