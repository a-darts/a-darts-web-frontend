import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { useAuth, UserRoles } from '../context/AuthContext';
import Icon from './Icon';
import Dropdown, { DropdownItem } from './Dropdown';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkBreakpoints = () => {
      setIsMobile(window.innerWidth < 640);
      setIsCompact(window.innerWidth < 900);
    };
    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  // Cierra el menú al navegar
  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const userMenuItems: DropdownItem[] = [
    ...(user?.role === UserRoles.ADMIN ? [{
      label: 'Administración',
      icon: 'Shield' as any,
      onClick: () => navigate('/admin')
    }] : []),
    {
      label: t('common.dropdown.profile'),
      icon: 'User',
      onClick: () => navigate('/profile')
    },
    ...(user?.role === UserRoles.PLAYER ? [{
      label: 'Estadísticas',
      icon: 'ChartColumnBig' as any,
      onClick: () => navigate('/stats')
    }] : []),
    {
      label: t('common.dropdown.settings'),
      icon: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      label: t('common.dropdown.logout'),
      icon: 'LogOut',
      onClick: logout,
      variant: 'danger' as const
    },
  ];

  const tabs = [
    { label: t('common.navbar.tournaments'), path: '/torneos' },
    ...(user?.role === UserRoles.ADMIN ? [{ label: t('common.navbar.admin_panel'), path: '/admin' }] : []),
  ];

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.nav}>
          {/* Hamburguesa — solo visible en móvil */}
          {isMobile && (
            <button
              style={styles.hamburger}
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Abrir menú"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={22} />
            </button>
          )}

          <Link to="/" style={styles.logo}>
            A-Darts
          </Link>

          {/* Tabs — ocultos en móvil, visibles en escritorio */}
          {!isMobile && (
            <div style={styles.tabs}>
              {tabs.map(tab => (
                <Link key={tab.path} to={tab.path} style={styles.tabLink}>
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth */}
          <div style={styles.auth}>
            {user ? (
              <Dropdown
                trigger={(isOpen) => (
                  <div style={styles.userProfile}>
                    <div style={styles.avatar}>
                      {user.alias.charAt(0).toUpperCase()}
                    </div>
                    {/* Alias solo visible cuando hay espacio */}
                    {!isCompact && (
                      <div style={styles.userInfo}>
                        <span style={styles.userAlias}>
                          {user.alias.length > 16 ? `${user.alias.substring(0, 16)}...` : user.alias}
                        </span>
                      </div>
                    )}
                    <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={18} style={{ flexShrink: 0 }} />
                  </div>
                )}
                items={userMenuItems}
              />
            ) : (
              <Button
                variant="tertiary"
                rightIcon="LogIn"
                onClick={() => navigate('/login')}
              >
                {!isCompact ? t('common.navbar.login') : ''}
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Menú móvil desplegable */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {tabs.map(tab => (
            <button
              key={tab.path}
              style={styles.mobileMenuItem}
              onClick={() => handleNavigation(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: 'var(--header-bg)',
    width: '100%',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  nav: {
    width: '100%',
    maxWidth: '1500px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-color)',
    flexShrink: 0,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: 'var(--text-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    justifyContent: 'center',
  },
  tabLink: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '0.25rem 0.75rem 0.25rem 0.25rem',
    borderRadius: '100px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userAlias: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-color)',
    lineHeight: '1.2',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  mobileMenu: {
    position: 'sticky',
    top: '64px',
    zIndex: 999,
    backgroundColor: 'var(--header-bg)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileMenuItem: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: 'var(--text-color)',
    fontSize: '0.9375rem',
    fontWeight: '500',
    padding: '1rem 2rem',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  },
};

export default Navbar;
