import React from 'react';

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
    return (
        <label style={styles.container}>
            <span style={styles.label}>{label}</span>
            <div style={{ ...styles.track, backgroundColor: checked ? 'var(--btn-primary-bg)' : 'rgba(255, 255, 255, 0.1)' }}>
                <div style={{ ...styles.thumb, transform: checked ? 'translateX(18px)' : 'translateX(0px)' }} />
            </div>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={styles.hiddenInput}
            />
        </label>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
        width: 'fit-content',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-secondary-color)',
        width: 'fit-content',
    },
    track: {
        cursor: 'pointer',
        width: '42px',
        height: '24px',
        borderRadius: '12px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s ease',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    thumb: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    hiddenInput: {
        display: 'none',
    }
};

export default Switch;
