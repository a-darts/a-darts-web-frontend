import React, { useEffect, useState } from 'react';
import { Tournament, Bracket, tournamentService } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch from '../../../components/BracketMatch';

interface TournamentBracketTabProps {
  tournament: Tournament;
}

const TournamentBracketTab: React.FC<TournamentBracketTabProps> = ({ tournament }) => {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotPublished, setIsNotPublished] = useState(false);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentBracket(tournament.id);
        setBracket(data);
      } catch (err: any) {
        console.error('Error fetching bracket:', err);
        if (err.message && err.message.toLowerCase().includes('not found')) {
          setIsNotPublished(true);
        } else {
          setError(err.message || 'Error al cargar el cuadrante.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBracket();
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
  const matchHeight = 110; // Approximate height of a BracketMatch
  const initialGap = 40;   // Initial gap between matches

  // Generate rounds
  const roundsData = [];

  // First round (from API)
  const firstRoundMatches = [];
  for (let i = 0; i < bracket.positions.length; i += 2) {
    firstRoundMatches.push({
      player1: {
        position: bracket.positions[i].position,
        alias: bracket.positions[i].participantAlias,
        federation: bracket.positions[i].participantFederation
      },
      player2: {
        position: bracket.positions[i + 1].position,
        alias: bracket.positions[i + 1].participantAlias,
        federation: bracket.positions[i + 1].participantFederation
      }
    });
  }
  roundsData.push(firstRoundMatches);

  // Subsequent rounds
  for (let r = 1; r < numRounds; r++) {
    const numMatches = roundsData[r - 1].length / 2;
    const roundMatches = [];
    for (let m = 0; m < numMatches; m++) {
      roundMatches.push({
        player1: { position: 0, alias: null, federation: null },
        player2: { position: 0, alias: null, federation: null }
      });
    }
    roundsData.push(roundMatches);
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
                      <BracketMatch
                        player1={match.player1}
                        player2={match.player2}
                        showPositions={roundIndex === 0}
                      />
                    </div>

                    {/* Connector lines to next round */}
                    {roundIndex < numRounds - 1 && (
                      <div style={{
                        ...styles.connectorWrapper,
                        height: `${roundMatchContainerHeight}px`
                      }}>
                        {/* Horizontal line out from match */}
                        <div style={styles.lineHorizontal} />

                        {/* Vertical line connecting pairs */}
                        <div style={{
                          ...styles.lineVertical,
                          height: `${roundMatchContainerHeight / 2}px`,
                          top: matchIndex % 2 === 0 ? '50%' : 'auto',
                          bottom: matchIndex % 2 === 1 ? '50%' : 'auto',
                          borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                        }} />

                        {/* Horizontal line into next round match (only for the first of the pair) */}
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
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
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
