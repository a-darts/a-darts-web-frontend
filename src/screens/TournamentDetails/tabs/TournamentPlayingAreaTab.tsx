import React, { useEffect, useState } from 'react';
import { tournamentService, PlayingArea } from '../../../services/tournament.service';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import { useToast } from '../../../context/ToastContext';
import TextInput from '../../../components/TextInput';
import InfoCard from '../../../components/InfoCard';

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

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Salón de Juego</h3>
      {/* <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Dianas totales</span>
          <span style={styles.statValue}>{playingArea?.boards?.length || 0}</span>
        </div>
      </div> */}
      <div style={styles.statsContainer}>
        <InfoCard
          title="Dianas en total"
          content={playingArea?.boards?.length || 0}
          icon='Target'
        />
        <InfoCard
          title="Dianas libres"
          content={playingArea?.boards?.length || 0}
          icon='Target'
        />
        <InfoCard
          title="Dianas ocupadas"
          content={playingArea?.boards?.length || 0}
          icon='Target'
        />
        <InfoCard
          title="Dianas inutilizables"
          content={playingArea?.boards?.length || 0}
          icon='Target'
        />
      </div>

      <div style={styles.boardsGrid}>
        {playingArea?.boards?.map((board) => (
          <div key={board.number} style={styles.boardCard}>
            <div style={styles.boardHeader}>
              <span style={styles.boardTitle}>Diana {board.number}</span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: board.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.2)' : (board.status === 'OCCUPIED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
                color: board.status === 'AVAILABLE' ? '#4ade80' : (board.status === 'OCCUPIED' ? '#f87171' : '#fbbf24'),
              }}>
                {board.status === 'AVAILABLE' ? 'Libre' : (board.status === 'OCCUPIED' ? 'Ocupada' : (board.status === 'DISABLED' ? 'Inutilizable' : board.status))}
              </span>
            </div>
            {board.matchId && (
              <div style={styles.matchInfo}>
                Partida en curso
              </div>
            )}
          </div>
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
  },
  boardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: '1.1rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  matchInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  }
};

export default TournamentPlayingAreaTab;
