import React, { useEffect, useState } from 'react';
import { Tournament, Bracket, tournamentService, Match } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch, { BracketParticipant } from '../../../components/BracketMatch';
import TournamentMatchStatusTag from '../../../components/TournamentMatchStatusTag';

interface TournamentBracketTabProps {
  tournament: Tournament;
}

const TournamentBracketTab: React.FC<TournamentBracketTabProps> = ({ tournament }) => {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotPublished, setIsNotPublished] = useState(false);

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
      <p style={styles.infoText}>Aún no se ha publicado el cuadrante para este torneo. Por favor, vuelve a consultar más tarde.</p>
    </div>
  );
  if (error) return <ErrorMessage message={error} />;
  if (!bracket || !bracket.positions) return <div style={styles.message}>No hay datos del cuadrante</div>;

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
        player1: { ...m.player1, position: pos1?.position || 0 },
        player2: { ...m.player2, position: pos2?.position || 0 }
      };
    });
  }

  return (
    <div style={styles.container}>
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
    padding: '2rem 0',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  bracketWrapper: {
    display: 'flex',
    gap: '0',
    minWidth: 'max-content',
    padding: '0 2rem',
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
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '2rem',
    padding: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
};

export default TournamentBracketTab;
