import React from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoCard from '../components/InfoCard';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>
          {user ? `¡Bienvenid@, ${user.alias}!` : 'Bienvenido a A-Darts'}
        </h1>
        <p style={styles.subtitle}>
          {user
            ? 'Es un gusto tenerte de vuelta'
            : 'La plataforma de gestión de torneos de dardos de punta de acero.'}
        </p>
        <div style={styles.cta}>
          <Button
            variant='primary'
            size='medium'
            rightIcon='ArrowRight'
            onClick={() => navigate('/torneos')}
          >
            Explorar Torneos
          </Button>
        </div>

        {user && (
          <div style={styles.cardsContainer}>
            <InfoCard
              title='Estadísticas'
              content='Ver tu historial'
              icon='ChartColumnBig'
              onClick={() => navigate('/stats')}
            />
          </div>
        )}
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
  cardsContainer: {
    marginTop: '4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    justifyContent: 'center',
  },
};

export default HomeScreen;
