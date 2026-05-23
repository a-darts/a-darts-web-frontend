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

const getPositionLabel = (pos: number, results: ParticipantResult[]) => {
  const hasFourth = results.some(r => r.finalPosition === 4);

  if (pos === 1) return '1º';
  if (pos === 2) return '2º';
  if (pos === 3) return hasFourth ? '3º' : '3º - 4º';
  if (pos === 4) return '4º';
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

const getMedalStyle = (pos: number) => {
  switch (pos) {
    case 1: return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)', label: 'Oro', icon: 'Trophy' };
    case 2: return { color: '#e5e7eb', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.4)', label: 'Plata', icon: 'Medal' };
    case 3: return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', border: 'rgba(217, 119, 6, 0.4)', label: 'Bronce', icon: 'Medal' };
    case 4: return { color: '#775948ff', bg: 'rgba(120, 53, 15, 0.2)', border: 'rgba(120, 53, 15, 0.5)', label: 'Chocolate', icon: 'Medal' };
    default: return { color: '#ffffff', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', label: '', icon: 'Medal' };
  }
};

const TopPlayerCard = ({ player, results }: { player: TableResult, results: ParticipantResult[] }) => {
  const medal = getMedalStyle(player.finalPosition);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.25rem',
      backgroundColor: medal.bg,
      border: `1px solid ${medal.border}`,
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: medal.color,
        color: '#000000',
        boxShadow: `0 0 15px ${medal.bg}`,
      }}>
        <Icon name={medal.icon as any} size={24} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {getFederationFlag(player.federation) && (
            <img
              src={getFederationFlag(player.federation)!}
              alt="Flag"
              style={{ width: '22px', borderRadius: '3px' }}
            />
          )}
          <span style={{ fontWeight: '700', fontSize: '1.15rem', color: '#fff', letterSpacing: '0.2px' }}>{player.alias}</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: medal.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {medal.label ? `${medal.label} • ` : ''}{getPositionLabel(player.finalPosition, results)}
        </span>
      </div>
    </div>
  );
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
  const tableData: TableResult[] = sortedResults.map(r => ({ ...r, id: r.participantId }));

  const columns: Column<TableResult>[] = [
    {
      key: 'finalPosition',
      header: 'Posición',
      render: (item) => (
        <span>{getPositionLabel(item.finalPosition, results.participantsResults)}</span>
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

  const topPlayers = tableData.slice(0, 4);

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>Clasificación Final</h3>
      <div style={styles.contentWrapper}>
        {topPlayers.length > 0 && (
          <div style={styles.cardsContainer}>
            {topPlayers.map((player) => (
              <TopPlayerCard key={player.id} player={player} results={results.participantsResults} />
            ))}
          </div>
        )}
        <div style={styles.tableWrapper}>
          <Table<TableResult>
            data={tableData}
            columns={columns}
            emptyMessage="No hay resultados disponibles"
          />
        </div>
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
  contentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: '1 1 300px',
    minWidth: '300px',
  },
  tableWrapper: {
    flex: '2 1 500px',
    minWidth: '0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
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
