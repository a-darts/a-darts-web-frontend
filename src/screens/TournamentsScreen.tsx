import React, { useEffect, useState } from 'react';
import { tournamentService, Tournament, TournamentStatus } from '../services/tournament.service';
import TournamentCard from '../components/TournamentCard';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Title from '../components/Title';
import Icon from '../components/Icon';

type FilterType = 'all' | 'upcoming' | 'ongoing' | 'finished';

const TournamentsScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['upcoming', 'ongoing']);

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
    setActiveFilters(prev => {
      if (filter === 'all') return ['all'];

      let next = prev.filter(f => f !== 'all');
      const isCurrentlySelected = next.includes(filter);

      if (isCurrentlySelected) {
        // Only remove if it's not the last one, otherwise fallback to 'all'
        if (next.length > 1) {
          return next.filter(f => f !== filter);
        }
        return ['all'];
      } else {
        return [...next, filter];
      }
    });
  };

  const filteredTournaments = tournaments
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const date = new Date(t.info.dateTime);
      const now = new Date();
      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      return activeFilters.some(filter => {
        if (filter === 'all') return true;
        if (filter === 'ongoing') return t.status === TournamentStatus.IN_PROGRESS;
        if (filter === 'finished') return t.status === TournamentStatus.FINISHED;
        if (filter === 'upcoming') return date >= now && t.status !== TournamentStatus.IN_PROGRESS && t.status !== TournamentStatus.FINISHED;
        return false;
      });
    })
    .sort((a, b) => {
      const dateA = new Date(a.info.dateTime).getTime();
      const dateB = new Date(b.info.dateTime).getTime();
      return dateA - dateB; // Ordenar por fecha ascendente
    });

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title>Torneos</Title>
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div style={styles.filtersWrapper}>
            <Button
              variant={activeFilters.includes('all') ? 'primary' : 'secondary'}
              leftIcon={activeFilters.includes('all') ? 'Check' : undefined}
              onClick={() => toggleFilter('all')}
              size="small"
            >
              Todos
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
              variant={activeFilters.includes('upcoming') ? 'primary' : 'secondary'}
              leftIcon={activeFilters.includes('upcoming') ? 'Check' : undefined}
              onClick={() => toggleFilter('upcoming')}
              size="small"
            >
              Próximos
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
      </header >

      {error && <ErrorMessage message={error} />}

      {
        !error && (loading ? (
          <div style={styles.loadingContainer}>
            <Icon
              name="Loader"
              size={32}
              className="btn-icon animate-spin"
            />
            <div style={styles.loadingText}>Cargando torneos...</div>
          </div>
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
        ))
      }
    </div >
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem 2rem',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    margin: '2rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
  message: {
    color: 'var(--text-secondary-color)',
    textAlign: 'center',
    padding: '5rem 2rem',
    fontSize: '1.1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
};

export default TournamentsScreen;
