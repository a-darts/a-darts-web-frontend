import React, { useEffect, useState } from 'react';
import { tournamentService, Match } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import Icon from '../../../components/Icon';
import Select from '../../../components/Select';
import MatchCard from '../../../components/MatchCard';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import TextInput from '../../../components/TextInput';
import EmptyState from '../../../components/EmptyState';

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

  // Assign board modal states
  const [isAssignBoardModalOpen, setIsAssignBoardModalOpen] = useState(false);
  const [assigningMatchId, setAssigningMatchId] = useState<string | null>(null);
  const [newBoardValue, setNewBoardValue] = useState('');
  const [assigningBoardLoading, setAssigningBoardLoading] = useState(false);

  // Add result modal states
  const [isAddResultModalOpen, setIsAddResultModalOpen] = useState(false);
  const [addingResultMatchId, setAddingResultMatchId] = useState<string | null>(null);
  const [p1Sets, setP1Sets] = useState<number>(0);
  const [p1Legs, setP1Legs] = useState<number>(0);
  const [p2Sets, setP2Sets] = useState<number>(0);
  const [p2Legs, setP2Legs] = useState<number>(0);
  const [addingResultLoading, setAddingResultLoading] = useState(false);

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev =>
      prev.includes(filterKey)
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

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

  const handleStartMatch = async (matchId: string) => {
    try {
      await tournamentService.startMatch(matchId);
      showToast('Partida iniciada con éxito.', 'success');
      await fetchMatches();
    } catch (err: any) {
      console.error('Error starting match:', err);
      showToast(err.message || 'Error al iniciar la partida.', 'error');
    }
  };

  const handleSuspendMatch = async (matchId: string) => {
    try {
      await tournamentService.suspendMatch(matchId);
      showToast('Partida suspendida con éxito.', 'success');
      await fetchMatches();
    } catch (err: any) {
      console.error('Error suspending match:', err);
      showToast(err.message || 'Error al suspender la partida.', 'error');
    }
  };

  const handleResumeMatch = async (matchId: string) => {
    try {
      await tournamentService.resumeMatch(matchId);
      showToast('Partida reanudada con éxito.', 'success');
      await fetchMatches();
    } catch (err: any) {
      console.error('Error resuming match:', err);
      showToast(err.message || 'Error al reanudar la partida.', 'error');
    }
  };

  const handleAssignBoard = (matchId: string) => {
    setAssigningMatchId(matchId);
    setNewBoardValue('');
    setIsAssignBoardModalOpen(true);
  };

  const handleConfirmAssignBoard = async () => {
    if (!assigningMatchId) return;

    const boardNum = Number(newBoardValue.trim());
    if (!newBoardValue.trim() || isNaN(boardNum) || boardNum <= 0) {
      showToast('Por favor, introduce un número de diana válido mayor que 0.', 'error');
      return;
    }

    const match = matches.find(m => m.id === assigningMatchId);
    if (!match) return;

    try {
      setAssigningBoardLoading(true);
      if (match.boardNumber !== null) {
        await tournamentService.reassignMatchBoard(assigningMatchId, boardNum);
      } else {
        await tournamentService.assignMatchBoard(assigningMatchId, boardNum);
      }
      showToast(`Diana ${boardNum} asignada con éxito.`, 'success');
      setIsAssignBoardModalOpen(false);
      await fetchMatches();
    } catch (err: any) {
      console.error('Error assigning board:', err);
      showToast(err.message || 'Error al asignar la diana.', 'error');
    } finally {
      setAssigningBoardLoading(false);
    }
  };

  const handleAddResult = (matchId: string) => {
    setAddingResultMatchId(matchId);
    setP1Sets(0);
    setP1Legs(0);
    setP2Sets(0);
    setP2Legs(0);
    setIsAddResultModalOpen(true);
  };

  const handleConfirmAddResult = async () => {
    if (!addingResultMatchId) return;

    try {
      setAddingResultLoading(true);
      await tournamentService.addMatchResult(addingResultMatchId, {
        p1Sets,
        p1Legs,
        p2Sets,
        p2Legs
      });
      showToast('Resultado añadido con éxito.', 'success');
      setIsAddResultModalOpen(false);
      await fetchMatches();
    } catch (err: any) {
      console.error('Error adding result:', err);
      showToast(err.message || 'Error al añadir el resultado.', 'error');
    } finally {
      setAddingResultLoading(false);
    }
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
                onStartMatch={handleStartMatch}
                onSuspendMatch={handleSuspendMatch}
                onResumeMatch={handleResumeMatch}
                onAssignBoard={handleAssignBoard}
                onAddResult={handleAddResult}
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

      {/* Modal para asignar diana */}
      <Modal
        isOpen={isAssignBoardModalOpen}
        onClose={() => setIsAssignBoardModalOpen(false)}
        title="Asignar Diana"
        description={
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Introduce el número de la diana donde se disputará este enfrentamiento.
            </p>
            <TextInput
              label="Número de diana"
              placeholder="Ej. 1, 2, 3..."
              type="number"
              min="1"
              value={newBoardValue}
              onChange={(e) => setNewBoardValue(e.target.value)}
              icon="Target"
              autoFocus
            />
          </div>
        }
        confirmLabel="Asignar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmAssignBoard}
        loading={assigningBoardLoading}
        confirmDisabled={!newBoardValue.trim()}
      />

      {/* Modal para añadir resultado */}
      <Modal
        isOpen={isAddResultModalOpen}
        onClose={() => setIsAddResultModalOpen(false)}
        title="Añadir Resultado"
        description={
          <div style={{ marginTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Introduce el número de sets y legs ganados por cada jugador.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--btn-primary-bg, #C4E866)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jugador 1</span>
                <TextInput
                  label="Sets Ganados"
                  type="number"
                  min="0"
                  value={p1Sets.toString()}
                  onChange={(e) => setP1Sets(Number(e.target.value))}
                />
                <TextInput
                  label="Legs Ganados"
                  type="number"
                  min="0"
                  value={p1Legs.toString()}
                  onChange={(e) => setP1Legs(Number(e.target.value))}
                />
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--btn-primary-bg, #C4E866)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jugador 2</span>
                <TextInput
                  label="Sets Ganados"
                  type="number"
                  min="0"
                  value={p2Sets.toString()}
                  onChange={(e) => setP2Sets(Number(e.target.value))}
                />
                <TextInput
                  label="Legs Ganados"
                  type="number"
                  min="0"
                  value={p2Legs.toString()}
                  onChange={(e) => setP2Legs(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        }
        confirmLabel="Guardar Resultado"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmAddResult}
        loading={addingResultLoading}
        maxWidth='600px'
      />
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
