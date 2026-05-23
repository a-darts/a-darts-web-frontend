import React, { useEffect, useState } from 'react';
import { tournamentService, TournamentResult } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import Icon from '../../../components/Icon';
import EmptyState from '../../../components/EmptyState';
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

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Clasificación Final</h3>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Posición</th>
              <th style={styles.th}>Jugador</th>
              <th style={styles.th}>Victorias</th>
              <th style={styles.th}>Derrotas</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result) => (
              <tr key={result.participantId} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.positionBadge(result.finalPosition)}>
                    {getPositionLabel(result.finalPosition)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.playerInfo}>
                    {getFederationFlag(result.federation) && (
                      <img
                        src={getFederationFlag(result.federation)!}
                        alt="Flag"
                        style={styles.flag}
                        title={getFederationLabel(result.federation)}
                      />
                    )}
                    <span style={styles.playerName}>{result.alias}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.statG}>{result.matchesWon}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.statP}>{result.matchesLost}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.8)',
    verticalAlign: 'middle',
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
  statG: {
    color: '#4ade80',
    fontWeight: '600',
  },
  statP: {
    color: '#f87171',
    fontWeight: '600',
  },
};

export default TournamentResultsTab;
