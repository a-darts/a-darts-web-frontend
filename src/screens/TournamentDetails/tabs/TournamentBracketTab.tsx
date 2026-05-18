import React, { useEffect, useState } from 'react';
import { Tournament, Bracket, tournamentService, Match } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch, { BracketParticipant } from '../../../components/BracketMatch';
import TournamentMatchStatusTag from '../../../components/TournamentMatchStatusTag';
import { useAuth, UserRoles } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Button from '../../../components/Button';

interface TournamentBracketTabProps {
  tournament: Tournament;
  onStartEditing?: () => void;
  onBracketGenerated?: () => void;
}

const TournamentBracketTab: React.FC<TournamentBracketTabProps> = ({
  tournament,
  onStartEditing,
  onBracketGenerated,
}) => {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotPublished, setIsNotPublished] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === UserRoles.ADMIN;
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBracketAutomatically = async () => {
    try {
      setIsGenerating(true);
      await tournamentService.generateBracketAutomatically(tournament.id);
      showToast('¡Cuadrante generado correctamente!', 'success');

      if (onBracketGenerated) {
        onBracketGenerated();
      } else {
        // Re-fetch data if parent callback is not provided
        const [bracketData, matchesData] = await Promise.all([
          tournamentService.getTournamentBracket(tournament.id),
          tournamentService.getTournamentMatches(tournament.id)
        ]);
        setBracket(bracketData);
        setMatches(matchesData);
        setIsNotPublished(false);
      }
    } catch (err: any) {
      console.error('Error generating bracket:', err);
      showToast(err.message || 'Error al generar el cuadrante.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleGenerateBracketManually = async () => {
    try {
      setIsGenerating(true);
      await tournamentService.generateBracketManually(tournament.id);
      showToast('¡Cuadrante generado correctamente!', 'success');

      if (onBracketGenerated) {
        onBracketGenerated();
      } else {
        // Re-fetch data if parent callback is not provided
        const [bracketData, matchesData] = await Promise.all([
          tournamentService.getTournamentBracket(tournament.id),
          tournamentService.getTournamentMatches(tournament.id)
        ]);
        setBracket(bracketData);
        setMatches(matchesData);
        setIsNotPublished(false);
      }
    } catch (err: any) {
      console.error('Error generating bracket:', err);
      showToast(err.message || 'Error al generar el cuadrante.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bracketData, matchesData] = await Promise.all([
          tournamentService.getTournamentBracket(tournament.id),
          tournamentService.getTournamentMatches(tournament.id)
        ]);
        setBracket(bracketData);
        setMatches(matchesData);
      } catch (err: any) {
        console.error('Error fetching bracket data:', err);
        if (err.message && err.message.toLowerCase().includes('not found')) {
          setIsNotPublished(true);
        } else {
          setError(err.message || 'Error al cargar el cuadrante.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournament.id]);

  if (loading) return <div style={styles.message}>Cargando cuadrante...</div>;
  if (isNotPublished) return (
    <div style={styles.infoContainer}>
      <h3 style={styles.infoTitle}>Cuadrante no disponible</h3>
      <p style={styles.infoText}>
        {isAdmin
          ? 'El cuadrante aún no ha sido generado para este torneo. Como administrador, puedes generarlo automáticamente con los participantes inscritos.'
          : 'Aún no se ha publicado el cuadrante para este torneo. Por favor, vuelve a consultar más tarde.'}
      </p>
      {isAdmin && (
        <>
          <Button
            variant="primary"
            leftIcon="Network"
            onClick={handleGenerateBracketAutomatically}
            loading={isGenerating}
            style={{ marginTop: '1.5rem' }}
          >
            Generar cuadrante automáticamente
          </Button>

          <Button
            variant="primary"
            leftIcon="Network"
            onClick={handleGenerateBracketManually}
            loading={isGenerating}
            style={{ marginTop: '1rem' }}
          >
            Configurar cuadrante manualmente
          </Button>
        </>
      )}
    </div>
  );
  if (error) return <ErrorMessage message={error} />;
  if (!bracket || !bracket.positions) return <div style={styles.message}>No hay datos del cuadrante</div>;

  const assignedCount = bracket.positions.filter(
    (p) => p.participantId && p.participantAlias && p.participantAlias !== 'Por determinar' && p.participantAlias !== 'Bye'
  ).length;
  const totalToAssign = tournament.registration.registeredParticipantsIds.length;
  const progressPercent = totalToAssign > 0 ? Math.round((assignedCount / totalToAssign) * 100) : 0;

  const totalPositions = bracket.totalPositions;
  const numRounds = Math.log2(totalPositions);
  const matchHeight = 110;
  const initialGap = 40;

  // Group matches by round
  const roundsData = [];
  for (let round = 1; round <= numRounds; round++) {
    const roundMatches = matches.filter(m => m.round === round);
    // Sort matches to maintain bracket order if possible
    // (Assuming they are returned in order or we'll need more logic)
    roundMatches.sort((a, b) => a.id.localeCompare(b.id)); // Fallback sort

    const formattedMatches: { player1: BracketParticipant; player2: BracketParticipant; status: string }[] = roundMatches.map(m => ({
      player1: {
        position: 0,
        alias: m.participant1.alias,
        federation: m.participant1.federation,
        score: m.matchScore.participant1.legsWon
      },
      player2: {
        position: 0,
        alias: m.participant2.alias,
        federation: m.participant2.federation,
        score: m.matchScore.participant2.legsWon
      },
      status: m.status
    }));

    // Fill missing matches if the round is not yet fully generated/fetched
    const expectedMatches = totalPositions / Math.pow(2, round);
    while (formattedMatches.length < expectedMatches) {
      formattedMatches.push({
        player1: { position: 0, alias: null, federation: null, score: undefined },
        player2: { position: 0, alias: null, federation: null, score: undefined },
        status: 'PENDING'
      });
    }

    roundsData.push(formattedMatches);
  }

  // Restore positions for Round 1 using bracket data
  if (roundsData[0]) {
    roundsData[0] = roundsData[0].map((m, i) => {
      const pos1 = bracket.positions[i * 2];
      const pos2 = bracket.positions[i * 2 + 1];
      return {
        ...m,
        player1: {
          ...m.player1,
          position: pos1?.position || 0,
          alias: m.player1.alias || pos1?.participantAlias || null,
          federation: m.player1.federation || pos1?.participantFederation || null
        },
        player2: {
          ...m.player2,
          position: pos2?.position || 0,
          alias: m.player2.alias || pos2?.participantAlias || null,
          federation: m.player2.federation || pos2?.participantFederation || null
        }
      };
    });
  }

  return (
    <div style={styles.container}>
      {isAdmin && tournament.status === 'PUBLISHED' && onStartEditing && (
        <div style={styles.editButtonContainer}>
          <div style={styles.progressContainer}>
            <div style={styles.progressMeta}>
              <span style={styles.progressText}>
                Asignados: <strong>{assignedCount}</strong> de <strong>{totalToAssign}</strong>
              </span>
              <span style={styles.progressPercent}>{progressPercent}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
            </div>
          </div>

          <Button
            variant="secondary"
            leftIcon="Edit3"
            onClick={onStartEditing}
          >
            Editar posiciones
          </Button>
        </div>
      )}
      <div style={styles.bracketWrapper}>
        {roundsData.map((round, roundIndex) => {
          const roundMatchContainerHeight = (matchHeight + initialGap) * Math.pow(2, roundIndex);

          return (
            <div key={roundIndex} style={styles.roundColumn}>
              <div style={styles.roundHeader}>
                {roundIndex === numRounds - 1 ? 'Final' : `Ronda ${roundIndex + 1}`}
              </div>
              <div style={styles.matchesContainer}>
                {round.map((match, matchIndex) => (
                  <div key={matchIndex} style={{
                    ...styles.matchWrapper,
                    height: `${roundMatchContainerHeight}px`
                  }}>
                    <div style={styles.matchCentering}>
                      <div style={styles.matchAndStatus}>
                        {match.status && (
                          <div style={styles.statusTagContainer}>
                            <TournamentMatchStatusTag status={match.status} size="small" />
                          </div>
                        )}
                        <BracketMatch
                          player1={match.player1}
                          player2={match.player2}
                          showPositions={roundIndex === 0}
                          status={match.status}
                        />
                      </div>
                    </div>

                    {roundIndex < numRounds - 1 && (
                      <div style={{
                        ...styles.connectorWrapper,
                        height: `${roundMatchContainerHeight}px`
                      }}>
                        <div style={styles.lineHorizontal} />
                        <div style={{
                          ...styles.lineVertical,
                          height: `${roundMatchContainerHeight / 2}px`,
                          top: matchIndex % 2 === 0 ? '50%' : 'auto',
                          bottom: matchIndex % 2 === 1 ? '50%' : 'auto',
                          borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                        }} />
                        {matchIndex % 2 === 0 && (
                          <div style={{
                            ...styles.lineHorizontalNext,
                            top: `${roundMatchContainerHeight}px`
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    overflowX: 'auto',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  bracketWrapper: {
    display: 'flex',
    gap: '0',
    minWidth: 'max-content',
    alignItems: 'flex-start',
  },
  roundColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '320px',
    flexShrink: 0,
  },
  roundHeader: {
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '1rem',
    padding: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  matchesContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  matchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  matchCentering: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 2,
  },
  matchAndStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusTagContainer: {
    alignSelf: 'flex-start',
    marginLeft: '4px',
  },
  connectorWrapper: {
    position: 'absolute',
    right: '-60px',
    width: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  lineHorizontal: {
    position: 'absolute',
    left: '-20px',
    width: '20px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: '50%',
  },
  lineVertical: {
    position: 'absolute',
    width: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lineHorizontalNext: {
    position: 'absolute',
    width: '20px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  message: {
    padding: '4rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1.1rem',
  },
  infoContainer: {
    padding: '5rem 2rem',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
  },
  infoText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '400px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  editButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: '1.5rem',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '0.6rem 1rem',
    minWidth: '240px',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  progressText: {
    fontWeight: '500',
  },
  progressPercent: {
    color: 'var(--btn-primary-bg)',
    fontWeight: '800',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--btn-primary-bg)',
    borderRadius: '100px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 10px rgba(196, 232, 102, 0.3)',
  },
};

export default TournamentBracketTab;
