import React, { useEffect, useState } from 'react';
import { tournamentService, Match } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import Icon from '../../../components/Icon';
import Select from '../../../components/Select';
import MatchCard from '../../../components/MatchCard';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';
import MatchActionModals from '../../../components/MatchActionModals';
import EmptyState from '../../../components/EmptyState';
import { useMatchActions } from '../../../hooks/useMatchActions';

interface TournamentMatchesTabProps {
  tournamentId: string;
  isAdmin?: boolean;
}

const TournamentMatchesTab: React.FC<TournamentMatchesTabProps> = ({ tournamentId, isAdmin }) => {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [activeFilters, setActiveFilters] = useState<string[]>(['in_progress', 'pending', 'finished']);

  const fetchMatches = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await tournamentService.getTournamentMatches(tournamentId);
      setMatches(data);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError(err.message || 'Error al cargar las partidas');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(true);
  }, [tournamentId]);

  const matchActions = useMatchActions({ matches, onSuccess: fetchMatches });

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev =>
      prev.includes(filterKey)
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Cargando partidas...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        title="Sin partidas generadas"
        description={
          <>
            <span>Aún no se han generado las partidas para este torneo.</span>
            {isAdmin && <span>Asegúrate de configurar el cuadrante e iniciar el torneo primero.</span>}
          </>
        }
      />
    );
  }

  // Get unique rounds list and sort them
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  // Filtered matches
  const filteredMatches = selectedRound === 'all'
    ? matches
    : matches.filter(m => m.round === selectedRound);

  const inProgressList = filteredMatches.filter(m => m.status === 'IN_PROGRESS');
  const pendingList = filteredMatches
    .filter(m => m.status === 'PENDING' || m.status === 'READY')
    .sort((a, b) => {
      if (a.status === 'READY' && b.status !== 'READY') return -1;
      if (a.status !== 'READY' && b.status === 'READY') return 1;
      return 0;
    });
  const finishedList = filteredMatches
    .filter(m => m.status === 'FINISHED')
    .sort((a, b) => {
      if (a.round !== b.round) return b.round - a.round;
      return a.matchIndex - b.matchIndex;
    });
  const othersList = filteredMatches.filter(m => m.status === 'CANCELLED' || m.status === 'SUSPENDED');

  const renderSection = (title: string, list: Match[], icon: string, iconColor: string) => {
    if (title === 'Otras partidas' && list.length === 0) return null;

    return (
      <div style={styles.sectionContainer}>
        <h3 style={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Icon name={icon as any} size={18} style={{ color: iconColor }} />
            <span>{title}</span>
          </div>
          <span style={styles.sectionCountBadge}>{list.length}</span>
        </h3>
        {list.length > 0 ? (
          <div style={styles.list}>
            {list.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                isAdmin={isAdmin}
                onStartMatch={matchActions.handleStartMatch}
                onSuspendMatch={matchActions.handleSuspendMatch}
                onResumeMatch={matchActions.handleResumeMatch}
                onAssignBoard={matchActions.handleAssignBoard}
                onAddResult={matchActions.handleAddResult}
              />
            ))}
          </div>
        ) : (
          <div style={styles.sectionEmptyBox}>
            <span style={styles.sectionEmptyText}>
              No hay {title.toLowerCase()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Round Selector Dropdown & Toggle Filters */}
      <div style={styles.filterContainer}>
        <Select
          label="Ronda"
          value={String(selectedRound)}
          options={[
            { value: 'all', label: 'Todas las rondas' },
            ...rounds.map(r => ({
              value: String(r),
              label: `Ronda ${r}`
            }))
          ]}
          onChange={(val) => {
            setSelectedRound(val === 'all' ? 'all' : Number(val));
          }}
          // icon="Filter"
          style={{ maxWidth: '200px' }}
        />

        <div style={styles.toggleButtonsGroup}>
          <Button
            variant={activeFilters.includes('in_progress') ? 'primary' : 'secondary'}
            leftIcon={activeFilters.includes('in_progress') ? 'Check' : undefined}
            onClick={() => toggleFilter('in_progress')}
            size="medium"
          >
            En curso
          </Button>
          <Button
            variant={activeFilters.includes('pending') ? 'primary' : 'secondary'}
            leftIcon={activeFilters.includes('pending') ? 'Check' : undefined}
            onClick={() => toggleFilter('pending')}
            size="medium"
          >
            Pendientes
          </Button>
          <Button
            variant={activeFilters.includes('finished') ? 'primary' : 'secondary'}
            leftIcon={activeFilters.includes('finished') ? 'Check' : undefined}
            onClick={() => toggleFilter('finished')}
            size="medium"
          >
            Finalizadas
          </Button>
        </div>
      </div>

      {/* Categorized Matches Lists */}
      <div style={styles.sectionsWrapper}>
        {activeFilters.includes('in_progress') && renderSection('Partidas en curso', inProgressList, 'Play', '#4ade80')}
        {activeFilters.includes('pending') && renderSection('Partidas pendientes', pendingList, 'Clock', '#fbbf24')}
        {activeFilters.includes('finished') && renderSection('Partidas finalizadas', finishedList, 'CheckCircle2', '#f87171')}
        {renderSection('Otras partidas', othersList, 'AlertTriangle', '#60a5fa')}
      </div>

      <MatchActionModals {...matchActions} />
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  sectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    width: '100%',
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  sectionCountBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg, #C4E866)',
    backgroundColor: 'rgba(196, 232, 102, 0.1)',
    padding: '0.2rem 0.6rem',
    borderRadius: '99px',
  },
  sectionEmptyBox: {
    display: 'flex',
    marginLeft: '1rem',
  },
  sectionEmptyText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: '1.25rem',
    flexWrap: 'wrap',
    marginBottom: '0.5rem',
  },
  toggleButtonsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    height: '48px', // Matches dropdown height
    boxSizing: 'border-box',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
};

export default TournamentMatchesTab;
