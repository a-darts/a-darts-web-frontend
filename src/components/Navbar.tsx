import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Navbar: React.FC = () => {
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
          <Button
            variant="primary"
            rightIcon="LogIn"
          >
            Iniciar sesión
          </Button>
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
};

export default Navbar;
