import React, { useEffect, useState } from 'react';
import { tournamentService, PlayingArea } from '../../../services/tournament.service';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import { useToast } from '../../../context/ToastContext';
import TextInput from '../../../components/TextInput';
import BoardCard from '../../../components/BoardCard';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import Select from '../../../components/Select';
import { Match } from '../../../services/tournament.service';
import EmptyState from '../../../components/EmptyState';

interface TournamentPlayingAreaTabProps {
  tournamentId: string;
}

const TournamentPlayingAreaTab: React.FC<TournamentPlayingAreaTabProps> = ({ tournamentId }) => {
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [area, fetchedMatches] = await Promise.all([
        tournamentService.getPlayingArea(tournamentId),
        tournamentService.getTournamentMatches(tournamentId)
      ]);
      setPlayingArea(area);
      setMatches(fetchedMatches);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const handleCreatePlayingArea = async () => {
    try {
      setIsCreating(true);
      const area = await tournamentService.createPlayingArea(tournamentId, numBoards);
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
      await tournamentService.occupyPlayingAreaBoard(playingArea.id, selectedBoard, selectedMatchId);
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

  const handleReleaseBoard = async (boardNumber: number) => {
    if (!playingArea) return;
    try {
      setLoading(true);
      await tournamentService.releasePlayingAreaBoard(playingArea.id, boardNumber);
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
      await tournamentService.addBoardToPlayingArea(playingArea.id);
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
      await tournamentService.removeLastBoardFromPlayingArea(playingArea.id);
      showToast('Última diana eliminada correctamente', 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Error removing last board:', err);
      showToast(err.message || 'Error al eliminar la última diana', 'error');
    } finally {
      setIsModifyingBoards(false);
    }
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
              onClick={() => setIsConfiguring(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
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
        <h2 style={{ ...styles.title, marginBottom: 0 }}>Salón de Juego</h2>
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
          color="#f87171"
        />
        <StatCard
          title="Dianas inutilizables"
          value={disabledBoards}
          color="#fbbf24"
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
              onReleaseBoard={handleReleaseBoard}
            // onAssignBoard={}
            />
          );
        })}
      </div>

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
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '2rem',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    marginTop: 0,
  },
  inputGroup: {
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
