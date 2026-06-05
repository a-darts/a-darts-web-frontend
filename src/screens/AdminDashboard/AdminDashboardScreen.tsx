import React, { useState, useEffect } from 'react';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Icon from '../../components/Icon';
import { useToast } from '../../context/ToastContext';

// Import modular tab components
import AdminUsersTab from './tabs/AdminUsersTab';
import AdminPlayersTab from './tabs/AdminPlayersTab';
import AdminTournamentsTab from './tabs/AdminTournamentsTab';
import AdminSettingsTab from './tabs/AdminSettingsTab';

const AdminDashboardScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(() => {
    return (location.state as any)?.activeTab || 'usuarios';
  });

  // Access check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRoles.ADMIN) {
        showToast('No tienes permisos de administrador para acceder al panel.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, showToast]);

  if (authLoading || !user || user.role !== UserRoles.ADMIN) {
    return (
      <div style={styles.loadingContainer}>
        <Icon
          name="Loader"
          size={32}
          className="btn-icon animate-spin"
        />
        <div style={styles.loadingText}>Verificando credenciales de administrador...</div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'usuarios':
        return <AdminUsersTab />;
      case 'jugadores':
        return <AdminPlayersTab />;
      case 'torneos':
        return <AdminTournamentsTab />;
      case 'configuracion':
        return <AdminSettingsTab />;
      default:
        return <AdminUsersTab />;
    }
  };

  return (
    <div style={styles.adminDashboardLayout}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={styles.mainContainer}>
        {renderActiveTab()}
      </main>
    </div>
  );
};

const styles: { [key: string]: any } = {
  adminDashboardLayout: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#0E0E0E',
    flexWrap: 'wrap',
  },
  mainContainer: {
    flex: 1,
    padding: '2.5rem',
    minWidth: '320px',
    maxWidth: '100%',
    overflowX: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
};

export default AdminDashboardScreen;
