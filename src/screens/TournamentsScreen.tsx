import React, { useEffect, useState } from 'react';
import { tournamentService, Tournament } from '../services/tournament.service';
import TournamentCard from '../components/TournamentCard';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';

type FilterType = 'upcoming' | 'ongoing' | 'finished';

const TournamentsScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['upcoming']);

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

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // If no filters are selected, show all tournaments
    if (activeFilters.length === 0) return true;

    const date = new Date(t.info.dateTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return activeFilters.some(filter => {
      if (filter === 'upcoming') return date > now && !isToday;
      if (filter === 'ongoing') return isToday;
      if (filter === 'finished') return date < now && !isToday;
      return false;
    });
  });

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos' },
  ];

  return (
    <div style={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div style={styles.header}>
        <h1 style={styles.title}>Torneos</h1>
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div style={styles.filtersWrapper}>
            <Button
              variant={activeFilters.includes('upcoming') ? 'primary' : 'secondary'}
              leftIcon={activeFilters.includes('upcoming') ? 'Check' : undefined}
              onClick={() => toggleFilter('upcoming')}
              size="small"
            >
              Próximos
            </Button>
            <Button
              variant={activeFilters.includes('ongoing') ? 'primary' : 'secondary'}
              leftIcon={activeFilters.includes('ongoing') ? 'Check' : undefined}
              onClick={() => toggleFilter('ongoing')}
              size="small"
            >
              En curso
            </Button>
            <Button
              variant={activeFilters.includes('finished') ? 'primary' : 'secondary'}
              leftIcon={activeFilters.includes('finished') ? 'Check' : undefined}
              onClick={() => toggleFilter('finished')}
              size="small"
            >
              Finalizados
            </Button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div style={styles.message}>Cargando torneos...</div>
      ) : filteredTournaments.length === 0 ? (
        <div style={styles.message}>
          {searchTerm || activeFilters.length > 0
            ? 'No se encontraron torneos con los filtros aplicados.'
            : 'No hay torneos disponibles en este momento.'}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredTournaments.map((tournament) => (
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  controls: {

  },
  searchWrapper: {
    flex: 1,
    minWidth: '300px',
    marginBottom: '1rem',
  },
  filtersWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
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
