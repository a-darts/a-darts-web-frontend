import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          A-Darts
        </Link>

        <div style={styles.tabs}>
          <Link to="/torneos" style={styles.tabLink}>Torneos</Link>
        </div>

        <div style={styles.auth}>
          {user ? (
            <div style={styles.userProfile}>
              <div style={styles.userInfo}>
                <span style={styles.userAlias}>{user.alias}</span>
                <span style={styles.userEmail}>{user.email}</span>
              </div>
              <div style={styles.avatar}>
                {user.alias.charAt(0).toUpperCase()}
              </div>
              <button onClick={logout} className="logout-btn" style={styles.logoutBtn} title="Cerrar sesión">
                <Icon name="LogOut" size={18} />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              rightIcon="LogIn"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
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
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  nav: {
    width: '100%',
    maxWidth: '1200px',
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
    padding: '0.5rem 0.5rem 0.5rem 1rem',
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
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary-color)',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, transform 0.2s',
  },
};

export default Navbar;
