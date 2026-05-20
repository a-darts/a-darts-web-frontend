import React from 'react';
import Icon, { IconName } from './Icon';

interface SidebarTab {
  id: string;
  label: string;
  icon: IconName;
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const tabsList: SidebarTab[] = [
  { id: 'usuarios', label: 'Usuarios', icon: 'Users' },
  { id: 'jugadores', label: 'Jugadores', icon: 'Target' },
  { id: 'torneos', label: 'Torneos', icon: 'Trophy' },
  { id: 'configuracion', label: 'Configuración', icon: 'Settings' }
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="admin-sidebar">
      <style>{`
        .admin-sidebar {
          width: 260px;
          background: rgba(255, 255, 255, 0.01);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 2.5rem 1.25rem;
          gap: 0.5rem;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar-header {
          padding: 0 1rem 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1.5rem;
        }

        .admin-sidebar-title {
          font-family: var(--font-title);
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 2.5px;
        }

        .admin-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .admin-sidebar-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1.25rem;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          justify-content: flex-start;
          font-family: var(--font-main);
          letter-spacing: 0.2px;
        }

        .admin-sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          color: #ffffff;
          transform: translateX(4px);
        }

        .admin-sidebar-btn.active {
          background: rgba(196, 232, 102, 0.06);
          border: 1px solid rgba(196, 232, 102, 0.15);
          color: var(--btn-primary-bg, #C4E866);
          box-shadow: 0 4px 20px rgba(196, 232, 102, 0.02);
        }

        .admin-sidebar-btn.active .admin-sidebar-icon {
          color: var(--btn-primary-bg, #C4E866);
          filter: drop-shadow(0 0 6px rgba(196, 232, 102, 0.3));
        }

        .admin-sidebar-icon {
          color: rgba(255, 255, 255, 0.35);
          transition: all 0.25s ease;
        }

        .admin-sidebar-btn:hover .admin-sidebar-icon {
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            width: 100%;
            flex-direction: row;
            padding: 0.75rem 1rem;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            gap: 1rem;
            align-items: center;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .admin-sidebar::-webkit-scrollbar {
            display: none;
          }

          .admin-sidebar-header {
            display: none;
          }

          .admin-sidebar-nav {
            flex-direction: row;
            gap: 0.5rem;
            width: auto;
            flex-wrap: nowrap;
          }

          .admin-sidebar-btn {
            padding: 0.6rem 1.1rem;
            font-size: 0.85rem;
            white-space: nowrap;
          }

          .admin-sidebar-btn:hover {
            transform: none;
          }
        }
      `}</style>
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-title">PANEL DE CONTROL</span>
      </div>
      <nav className="admin-sidebar-nav">
        {tabsList.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={`admin-sidebar-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon name={tab.icon} size={18} className="admin-sidebar-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
