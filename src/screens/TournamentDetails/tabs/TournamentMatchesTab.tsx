import React, { useEffect, useState } from 'react';
import { tournamentService, Match } from '../../../services/tournament.service';
import { getFederationFlag, getFederationLabel } from '../../../utils/tournament.utils';
import TournamentMatchStatusTag from '../../../components/TournamentMatchStatusTag';
import ErrorMessage from '../../../components/ErrorMessage';
import Icon from '../../../components/Icon';
import Select from '../../../components/Select';

interface TournamentMatchesTabProps {
  tournamentId: string;
}

const TournamentMatchesTab: React.FC<TournamentMatchesTabProps> = ({ tournamentId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentMatches(tournamentId);
        setMatches(data);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Error al cargar los partidos');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [tournamentId]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Cargando partidos...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (matches.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Icon name="CalendarX" size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1.5rem' }} />
        <h3 style={styles.emptyTitle}>Sin partidos generados</h3>
        <p style={styles.emptyText}>
          Aún no se han generado los partidos para este torneo. Asegúrate de configurar e iniciar el cuadrante primero.
        </p>
      </div>
    );
  }

  // Get unique rounds list and sort them
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  // Filtered matches
  const filteredMatches = selectedRound === 'all'
    ? matches
    : matches.filter(m => m.round === selectedRound);

  // Statistics
  const totalMatches = matches.length;
  const finishedMatches = matches.filter(m => m.status === 'FINISHED').length;
  const inProgressMatches = matches.filter(m => m.status === 'IN_PROGRESS').length;
  const readyMatches = matches.filter(m => m.status === 'READY').length;

  return (
    <div style={styles.container}>
      {/* Metrics Section */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIconContainer('primary')}>
            <Icon name="Target" size={20} />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricValue}>{totalMatches}</span>
            <span style={styles.metricLabel}>Total Partidos</span>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIconContainer('success')}>
            <Icon name="CheckCircle2" size={20} />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricValue}>{finishedMatches}</span>
            <span style={styles.metricLabel}>Finalizados</span>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIconContainer('warning')}>
            <Icon name="PlayCircle" size={20} />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricValue}>{inProgressMatches}</span>
            <span style={styles.metricLabel}>En Curso</span>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIconContainer('info')}>
            <Icon name="Hourglass" size={20} />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricValue}>{readyMatches}</span>
            <span style={styles.metricLabel}>Listos / Pendientes</span>
          </div>
        </div>
      </div>

      {/* Round Selector Dropdown */}
      <div style={styles.filterContainer}>
        <Select
          label="Filtrar por ronda"
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
          icon="Filter"
          style={{ maxWidth: '240px' }}
        />
      </div>

      {/* Matches List */}
      <div style={styles.list}>
        {filteredMatches.map(match => {
          const isFinished = match.status === 'FINISHED';
          const isInProgress = match.status === 'IN_PROGRESS';

          return (
            <div key={match.id} style={styles.matchRowCard}>
              {/* Row Header / Title */}
              <div style={styles.rowHeader}>
                <div style={styles.rowHeaderLeft}>
                  <span style={styles.roundText}>Ronda {match.round}</span>
                  {match.boardNumber !== null && (
                    <>
                      <span style={styles.bulletSeparator}>•</span>
                      <span style={styles.boardTextInline}>Diana {match.boardNumber}</span>
                    </>
                  )}
                </div>
                <TournamentMatchStatusTag status={match.status} />
              </div>

              {/* Symmetrical Competitors Row */}
              <div style={styles.competitorsRow}>
                {/* Participant 1 (Left Aligned) */}
                <div style={styles.participantLeft}>
                  <span style={styles.aliasText(match.participant1.alias)}>
                    {match.participant1.alias || 'Por determinar'}
                  </span>
                  {match.participant1.federation && match.participant1.federation !== 'N/A' && (
                    <img
                      src={getFederationFlag(match.participant1.federation) || ''}
                      alt="Flag"
                      style={styles.flag}
                    />
                  )}
                </div>

                {/* Score / VS Center Area */}
                <div style={styles.scoreCenterContainer}>
                  {isFinished || isInProgress ? (
                    <div style={styles.scoreWrapper}>
                      <div style={styles.scoreBoxLeft}>
                        <span style={styles.legScoreText}>
                          ({match.matchScore.participant1.setsWon})
                        </span>
                        <span style={styles.setScoreText}>
                          {match.matchScore.participant1.legsWon}
                        </span>
                      </div>
                      <span style={styles.scoreHyphen}>-</span>
                      <div style={styles.scoreBoxRight}>
                        <span style={styles.setScoreText}>
                          {match.matchScore.participant2.legsWon}
                        </span>
                        <span style={styles.legScoreText}>
                          ({match.matchScore.participant2.setsWon})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.vsBox}>
                      <span style={styles.vsText}>VS</span>
                    </div>
                  )}
                </div>

                {/* Participant 2 (Right Aligned) */}
                <div style={styles.participantRight}>
                  {match.participant2.federation && match.participant2.federation !== 'N/A' && (
                    <img
                      src={getFederationFlag(match.participant2.federation) || ''}
                      alt="Flag"
                      style={styles.flag}
                    />
                  )}
                  <span style={styles.aliasText(match.participant2.alias)}>
                    {match.participant2.alias || 'Por determinar'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 0.5rem 0',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.4)',
    maxWidth: '400px',
    lineHeight: '1.5',
    margin: 0,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  metricIconContainer: (type: 'primary' | 'success' | 'warning' | 'info') => {
    let color = '#fff';
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    if (type === 'primary') {
      color = 'var(--btn-primary-bg, #C4E866)';
      bgColor = 'rgba(196, 232, 102, 0.1)';
    } else if (type === 'success') {
      color = '#10b981';
      bgColor = 'rgba(16, 185, 129, 0.1)';
    } else if (type === 'warning') {
      color = '#fbbf24';
      bgColor = 'rgba(251, 191, 36, 0.1)';
    } else if (type === 'info') {
      color = '#3b82f6';
      bgColor = 'rgba(59, 130, 246, 0.1)';
    }
    return {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color,
      backgroundColor: bgColor,
    };
  },
  metricInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  matchRowCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.5rem',
  },
  rowHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  roundText: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg, #C4E866)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bulletSeparator: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: '0.9rem',
    userSelect: 'none',
  },
  boardTextInline: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  competitorsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
  },
  participantLeft: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    textAlign: 'right',
    minWidth: 0,
  },
  participantRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.75rem',
    textAlign: 'left',
    minWidth: 0,
  },
  flag: {
    width: '18px',
    height: '12px',
    borderRadius: '2px',
    opacity: 0.8,
    flexShrink: 0,
  },
  aliasText: (alias: string | null) => {
    const isSpecial = alias === 'Bye' || alias === 'Por determinar' || !alias;
    return {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: isSpecial ? 'rgba(255, 255, 255, 0.35)' : '#fff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  },
  scoreCenterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1.5rem',
    flexShrink: 0,
  },
  scoreWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  scoreBoxLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  scoreBoxRight: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  scoreHyphen: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '700',
  },
  setScoreText: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg, #C4E866)',
  },
  legScoreText: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  vsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '0.4rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: '1px',
  },
};

export default TournamentMatchesTab;
