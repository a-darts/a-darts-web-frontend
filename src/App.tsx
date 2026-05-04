import React from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>Bienvenido a A-Darts</h1>
          <p style={styles.subtitle}>
            La plataforma definitiva para gestionar tus torneos de dardos.
          </p>
          <div style={styles.cta}>
            <Button variant="primary">Explorar Torneos</Button>
            <Button variant="secondary">Saber más</Button>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2026 A-Darts. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
  },
  hero: {
    maxWidth: '800px',
    padding: '4rem 1rem',
  },
  title: {
    fontSize: '4rem',
    marginBottom: '1rem',
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '2.5rem',
    maxWidth: '600px',
    marginInline: 'auto',
  },
  cta: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  footer: {
    padding: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.875rem',
    textAlign: 'center',
  }
};

export default App;
