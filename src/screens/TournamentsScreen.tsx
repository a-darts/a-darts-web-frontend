import React, { useEffect, useState } from 'react';
import { tournamentService, Tournament } from '../services/tournament.service';
import TournamentCard from '../components/TournamentCard';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';

const TournamentsScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournaments();
        setTournaments(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tournaments:', err);
        setError(err.message || 'Error al cargar los torneos');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos' },
  ];

  return (
    <div style={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <h1 style={styles.title}>Torneos</h1>
      
      {error && <ErrorMessage message={error} />}
      
      {loading ? (
        <div style={styles.message}>Cargando torneos...</div>
      ) : tournaments.length === 0 ? (
        <div style={styles.message}>No hay torneos disponibles en este momento.</div>
      ) : (
        <div style={styles.grid}>
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    minHeight: '80vh',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '5rem 2rem',
    fontSize: '1.1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
};

export default TournamentsScreen;
