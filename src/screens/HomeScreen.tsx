import React from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Bienvenido a A-Darts</h1>
        <p style={styles.subtitle}>
          La plataforma definitiva para gestionar tus torneos de dardos.
        </p>
        <div style={styles.cta}>
          <Button 
            variant="primary" 
            leftIcon="Target"
            onClick={() => navigate('/torneos')}
          >
            Explorar Torneos
          </Button>
          <Button 
            variant="secondary" 
            rightIcon="ArrowRight"
          >
            Saber más
          </Button>
        </div>
      </section>
    </main>
  );
};

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
    lineHeight: 1.1,
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
};

export default HomeScreen;
