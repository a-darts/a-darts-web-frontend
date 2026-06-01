import React, { useEffect, useState } from 'react';
import { playingAreaService, PlayingArea } from '../../../services/playingArea.service';
import { matchService, Match } from '../../../services/match.service';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import { useToast } from '../../../context/ToastContext';
import TextInput from '../../../components/TextInput';
import BoardCard from '../../../components/BoardCard';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import MatchActionModals from '../../../components/MatchActionModals';
import Select from '../../../components/Select';
import EmptyState from '../../../components/EmptyState';
import { useMatchActions } from '../../../hooks/useMatchActions';
import { useNavigate } from 'react-router-dom';


interface TournamentPlayingAreaTabProps {
  tournamentId: string;
}

const TournamentPlayingAreaTab: React.FC<TournamentPlayingAreaTabProps> = ({ tournamentId }) => {
  const navigate = useNavigate();

  const [playingArea, setPlayingArea] = useState<PlayingArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [numBoards, setNumBoards] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isModifyingBoards, setIsModifyingBoards] = useState(false);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [area, fetchedMatches] = await Promise.all([
        playingAreaService.getPlayingArea(tournamentId),
        matchService.getTournamentMatches(tournamentId)
      ]);
      setPlayingArea(area);
      setMatches(fetchedMatches);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 15000); // Refrescar cada 15 segundos

    return () => clearInterval(intervalId);
  }, [tournamentId]);

  const matchActions = useMatchActions({ matches, onSuccess: () => fetchData(false) });

  const handleCreatePlayingArea = async () => {
    try {
      setIsCreating(true);
      const area = await playingAreaService.createPlayingArea(tournamentId, numBoards);
      setPlayingArea(area);
      setIsConfiguring(false);
      showToast('Salón de juego configurado correctamente', 'success');
    } catch (err: any) {
      console.error('Error creating playing area:', err);
      showToast(err.message || 'Error al crear el salón de juego', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenAssignModal = (boardNumber: number) => {
    setSelectedBoard(boardNumber);
    setSelectedMatchId('');
    setIsAssignModalOpen(true);
  };

  const handleAssignMatch = async () => {
    if (!playingArea || !selectedBoard || !selectedMatchId) return;
    try {
      setIsAssigning(true);
      await matchService.assignMatchBoard(selectedMatchId, selectedBoard);
      showToast('Partida asignada correctamente', 'success');
      setIsAssignModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error assigning match:', err);
      showToast(err.message || 'Error al asignar la partida', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReleaseBoard = async (boardId: string) => {
    if (!playingArea) return;
    try {
      setLoading(true);
      await playingAreaService.releasePlayingAreaBoard(playingArea.id, boardId);
      showToast('Diana liberada correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Error releasing board:', err);
      showToast(err.message || 'Error al liberar la diana', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoard = async () => {
    if (!playingArea) return;
    try {
      setIsModifyingBoards(true);
      await playingAreaService.addBoardToPlayingArea(playingArea.id);
      showToast('Nueva diana añadida correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Error adding board:', err);
      showToast(err.message || 'Error al añadir la diana', 'error');
    } finally {
      setIsModifyingBoards(false);
    }
  };

  const handleRemoveLastBoard = async () => {
    if (!playingArea) return;
    if (playingArea.boards.length === 0) return;
    try {
      setIsModifyingBoards(true);
      await playingAreaService.removeLastBoardFromPlayingArea(playingArea.id);
      showToast('Última diana eliminada correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Error removing last board:', err);
      showToast(err.message || 'Error al eliminar la última diana', 'error');
    } finally {
      setIsModifyingBoards(false);
    }
  };

  const handleDisableBoard = async (boardId: string) => {
    if (!playingArea) return;
    try {
      await playingAreaService.disableBoard(playingArea.id, boardId);
      showToast('Diana inutilizada correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error al inutilizar la diana', 'error');
    }
  };

  const handleEnableBoard = async (boardId: string) => {
    if (!playingArea) return;
    try {
      await playingAreaService.enableBoard(playingArea.id, boardId);
      showToast('Diana habilitada correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error al habilitar la diana', 'error');
    }
  };

  const handleViewMatchLive = (matchId: string, boardShortId: string) => {
    navigate(`/torneos/partido/${matchId}/diana/${boardShortId}/ver`);
  };

  if (loading) {
    return (
      <div style={styles.message}>
        Cargando salón de juego...
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error} />
    );
  }

  if (!playingArea && !isConfiguring) {
    return (
      <EmptyState
        title="Salón de juego sin configurar"
        description="No hay salón de juego configurado para este torneo."
      >
        <Button
          variant="primary"
          onClick={() => setIsConfiguring(true)}
          leftIcon='Settings'
        >
          Configurar salón de juego
        </Button>
      </EmptyState>
    );
  }

  if (isConfiguring) {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <h3 style={styles.title}>Configurar Salón de Juego</h3>
          <div style={styles.inputGroup}>
            <TextInput
              label="Número de dianas"
              type="number"
              min={1}
              value={numBoards}
              onChange={(e) => setNumBoards(parseInt(e.target.value) || 1)}
            />
          </div>
          <div style={styles.actions}>
            <Button
              variant="secondary"
              leftIcon='X'
              onClick={() => setIsConfiguring(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              leftIcon='Save'
              onClick={handleCreatePlayingArea}
              loading={isCreating}
            >
              Guardar configuración
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalBoards = playingArea?.boards?.length || 0;
  const availableBoards = playingArea?.boards?.filter((b) => b.status === 'AVAILABLE').length || 0;
  const occupiedBoards = playingArea?.boards?.filter((b) => b.status === 'OCCUPIED').length || 0;
  const disabledBoards = playingArea?.boards?.filter((b) => b.status === 'DISABLED').length || 0;

  const assignableMatches = matches.filter(
    (m) => (m.status === 'PENDING' || m.status === 'READY') && !playingArea?.boards?.some((b) => b.matchId === m.id)
  );

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={styles.titleContainer}>
          <h2 style={styles.title}>Salón de Juego</h2>
          <span style={styles.playingAreaShortId}>(ID: {playingArea?.shortId})</span>
        </div>
        {playingArea && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              leftIcon="Trash2"
              onClick={handleRemoveLastBoard}
              disabled={isModifyingBoards || playingArea.boards.length === 0}
            >
              Eliminar última diana
            </Button>
            <Button
              variant="primary"
              leftIcon="Plus"
              onClick={handleAddBoard}
              disabled={isModifyingBoards}
            >
              Añadir nueva diana
            </Button>
          </div>
        )}
      </div>
      <div style={styles.statsContainer}>
        <StatCard
          title="Dianas en total"
          value={totalBoards}
        />
        <StatCard
          title="Dianas libres"
          value={availableBoards}
          color="#4ade80"
        />
        <StatCard
          title="Dianas ocupadas"
          value={occupiedBoards}
          color="#fbbf24"
        />
        <StatCard
          title="Dianas inutilizables"
          value={disabledBoards}
          color="#f87171"
        />
      </div>

      <div style={styles.boardsGrid}>
        {playingArea?.boards?.map((board) => {
          const boardMatch = matches.find((m) => m.id === board.matchId);
          return (
            <BoardCard
              key={board.number}
              board={board}
              match={boardMatch}
              onAssignMatch={handleOpenAssignModal}
              onAssignBoard={matchActions.handleAssignBoard}
              onReleaseBoard={handleReleaseBoard}
              onSuspendMatch={matchActions.handleSuspendMatch}
              onResumeMatch={matchActions.handleResumeMatch}
              onAddResult={matchActions.handleAddResult}
              onViewMatchLive={handleViewMatchLive}
              onDisableBoard={handleDisableBoard}
              onEnableBoard={handleEnableBoard}
            />
          );
        })}
      </div>

      <MatchActionModals {...matchActions} />

      <Modal
        description='Selecciona una partida para asignar a la diana.'
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Asignar partida a la Diana ${selectedBoard}`}
        confirmLabel="Asignar"
        cancelLabel="Cancelar"
        onConfirm={handleAssignMatch}
        loading={isAssigning}
        confirmDisabled={!selectedMatchId}
      >
        <div style={{ padding: '1rem 0' }}>
          {assignableMatches.length > 0 ? (
            <Select
              label="Selecciona una partida"
              value={selectedMatchId}
              onChange={setSelectedMatchId}
              options={[
                { value: '', label: 'Seleccionar partida...' },
                ...assignableMatches.map((m) => ({
                  value: m.id,
                  label: `Ronda ${m.round} - Partida ${m.matchIndex} (${m.participant1?.alias || '?'} vs ${m.participant2?.alias || '?'})`,
                })),
              ]}
            />
          ) : (
            <div style={styles.noMatchesTextContainer}>
              <p style={styles.noMatchesText}>No hay partidas pendientes disponibles para asignar en este momento</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '4rem',
  },
  formContainer: {
    maxWidth: '420px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '2rem',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    alignItems: 'baseline',
    margin: 0,
  },
  title: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  playingAreaShortId: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1rem',
  },
  inputGroup: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  statsContainer: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  boardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  noMatchesTextContainer: {
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '0.5rem',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '1rem',
  },
  noMatchesText: {
    margin: 0,
    fontSize: '0.875rem',
  }
};

export default TournamentPlayingAreaTab;
