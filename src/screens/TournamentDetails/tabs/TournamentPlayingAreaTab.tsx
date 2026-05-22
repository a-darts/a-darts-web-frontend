import React, { useEffect, useState } from 'react';
import { tournamentService, PlayingArea } from '../../../services/tournament.service';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import { useToast } from '../../../context/ToastContext';
import TextInput from '../../../components/TextInput';
import BoardCard from '../../../components/BoardCard';
import StatCard from '../../../components/StatCard';

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

  const fetchPlayingArea = async () => {
    try {
      setLoading(true);
      const area = await tournamentService.getPlayingArea(tournamentId);
      setPlayingArea(area);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching playing area:', err);
      setError(err.message || 'Error al cargar el salón de juego');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayingArea();
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

  if (loading) return <div style={styles.message}>Cargando salón de juego...</div>;
  if (error) return <ErrorMessage message={error} />;

  if (!playingArea && !isConfiguring) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No hay salón de juego configurado para este torneo.</p>
          <Button
            variant="primary"
            onClick={() => setIsConfiguring(true)}
            leftIcon='Settings'
          >
            Configurar salón de juego
          </Button>
        </div>
      </div>
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
  const availableBoards = playingArea?.boards?.filter(b => b.status === 'AVAILABLE').length || 0;
  const occupiedBoards = playingArea?.boards?.filter(b => b.status === 'OCCUPIED').length || 0;
  const disabledBoards = playingArea?.boards?.filter(b => b.status === 'DISABLED').length || 0;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Salón de Juego</h3>
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
        {playingArea?.boards?.map((board) => (
          <BoardCard
            key={board.number}
            board={board}
          />
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem 0',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '4rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '1rem',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1.5rem',
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
  }
};

export default TournamentPlayingAreaTab;
