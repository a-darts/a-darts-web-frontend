import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import Dropdown, { DropdownItem } from './Dropdown';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const userMenuItems: DropdownItem[] = [
    {
      label: t('common.dropdown.profile'),
      icon: 'User',
      onClick: () => navigate('/profile')
    },
    {
      label: t('common.dropdown.settings'),
      icon: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      label: t('common.dropdown.logout'),
      icon: 'LogOut',
      onClick: logout,
      variant: 'danger'
    },
  ];

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          A-Darts
        </Link>

        <div style={styles.tabs}>
          <Link to="/torneos" style={styles.tabLink}>{t('common.navbar.tournaments')}</Link>
        </div>

        <div style={styles.auth}>
          {user ? (
            <Dropdown
              trigger={(isOpen) => (
                <div style={styles.userProfile}>
                  <div style={styles.avatar}>
                    {user.alias.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userAlias}>
                      {user.alias.length > 16 ? `${user.alias.substring(0, 16)}...` : user.alias}
                    </span>
                  </div>
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={18} style={{ flexShrink: 0 }} />
                </div>
              )}
              items={userMenuItems}
            />
          ) : (
            <Button
              variant="tertiary"
              rightIcon='LogIn'
              onClick={() => navigate('/login')}
            >
              {t('common.navbar.login')}
            </Button>
          )}
        </div>
      </nav>
    </header>
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
  },
  logo: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-color)',
  },
  tabs: {
    display: 'flex',
    gap: '2rem',
  },
  tabLink: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-color)',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '0.25rem 1rem 0.25rem 0.25rem',
    borderRadius: '100px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userAlias: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-color)',
    lineHeight: '1.2',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary-color)',
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
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
  },
};

export default Navbar;
