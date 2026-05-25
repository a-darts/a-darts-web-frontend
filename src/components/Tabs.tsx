import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div style={styles.container} className="responsive-tabs-nav">
      <style>{`
        .responsive-tabs-nav::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={styles.tab(tab.id === activeTabId)}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label.toUpperCase()}
          {tab.id === activeTabId && <div style={styles.activeIndicator} />}
        </button>
      ))}
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    display: 'flex',
    gap: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '2rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
    width: '100%',
  },
  tab: (active: boolean) => ({
    background: 'none',
    border: 'none',
    padding: '1rem 0.25rem',
    color: active ? '#C4E866' : '#b0b0b0',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
    letterSpacing: '1.5px',
    borderRadius: 0,
    outline: 'none',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }),
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#C4E866',
    boxShadow: '0 0 10px rgba(196, 232, 102, 0.5)',
  },
};

export default Tabs;
