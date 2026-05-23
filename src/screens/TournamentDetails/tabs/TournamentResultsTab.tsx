import React, { useEffect, useState } from 'react';
import { tournamentService, TournamentResult, ParticipantResult } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import Icon from '../../../components/Icon';
import EmptyState from '../../../components/EmptyState';
import Table, { Column } from '../../../components/Table';
import { getFederationFlag, getFederationLabel } from '../../../utils/tournament.utils';

interface TournamentResultsTabProps {
  tournamentId: string;
}

const getPositionLabel = (pos: number) => {
  if (pos === 1) return '1º';
  if (pos === 2) return '2º';
  if (pos === 3) return '3º - 4º';
  if (pos === 5) return '5º - 8º';
  if (pos === 9) return '9º - 16º';
  if (pos === 17) return '17º - 32º';
  if (pos === 33) return '33º - 64º';
  if (pos === 65) return '65º - 128º';
  if (pos === 129) return '129º - 256º';
  if (pos === 257) return '257º - 512º';
  if (pos === 513) return '513º - 1024º';
  if (pos === 1025) return '1025º - 2048º';
  return `${pos}º`;
};

interface TableResult extends ParticipantResult {
  id: string;
}

const TournamentResultsTab: React.FC<TournamentResultsTabProps> = ({ tournamentId }) => {
  const [results, setResults] = useState<TournamentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentResults(tournamentId);
        setResults(data);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [tournamentId]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Cargando resultados...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!results || results.participantsResults.length === 0) {
    return (
      <EmptyState
        title="Sin resultados"
        description="Aún no hay resultados para este torneo."
      />
    );
  }

  // Sort results by position
  const sortedResults = [...results.participantsResults].sort((a, b) => a.finalPosition - b.finalPosition);
  const tableData: TableResult[] = sortedResults.map(r => ({ ...r, id: r.participantId }));

  const columns: Column<TableResult>[] = [
    {
      key: 'finalPosition',
      header: 'Posición',
      render: (item) => (
        <div style={styles.positionBadge(item.finalPosition)}>
          {getPositionLabel(item.finalPosition)}
        </div>
      )
    },
    {
      key: 'alias',
      header: 'Jugador',
      render: (item) => (
        <div style={styles.playerInfo}>
          {getFederationFlag(item.federation) && (
            <img
              src={getFederationFlag(item.federation)!}
              alt="Flag"
              style={styles.flag}
              title={getFederationLabel(item.federation)}
            />
          )}
          <span style={styles.playerName}>{item.alias}</span>
        </div>
      )
    },
    {
      key: 'matchesWon',
      header: 'Victorias',
      render: (item) => (
        <span>{item.matchesWon}</span>
      )
    },
    {
      key: 'matchesLost',
      header: 'Derrotas',
      render: (item) => (
        <span>{item.matchesLost}</span>
      )
    },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Clasificación Final</h3>
      <Table<TableResult>
        data={tableData}
        columns={columns}
        emptyMessage="No hay resultados disponibles"
      />
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  positionBadge: (pos: number) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '700',
    backgroundColor: pos === 1 ? 'rgba(251, 191, 36, 0.15)' : pos === 2 ? 'rgba(156, 163, 175, 0.15)' : pos === 3 ? 'rgba(180, 83, 9, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    color: pos === 1 ? '#fbbf24' : pos === 2 ? '#9ca3af' : pos === 3 ? '#b45309' : 'rgba(255, 255, 255, 0.7)',
  }),
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  flag: {
    width: '20px',
    height: 'auto',
    borderRadius: '2px',
  },
  playerName: {
    fontWeight: '600',
  },
};

export default TournamentResultsTab;
