import React, { useEffect, useState } from 'react';
import { Tournament, Bracket, tournamentService, Match, Participant, BracketPosition } from '../../../services/tournament.service';
import { getFederationFlag, getFederationLabel } from '../../../utils/tournament.utils';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch, { BracketParticipant } from '../../../components/BracketMatch';
import BracketMatchEditable from '../../../components/BracketMatchEditable';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';
import { applyStandardSeeding } from '../../../utils/tournament.seeding.utils';

interface TournamentCreateBracketTabProps {
  tournament: Tournament;
  participants: Participant[];
  onSave: () => void;
  onCancel: () => void;
}

const TournamentCreateBracketTab: React.FC<TournamentCreateBracketTabProps> = ({
  tournament,
  participants,
  onSave,
  onCancel,
}) => {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Temporary positions for the editor
  const [temporaryPositions, setTemporaryPositions] = useState<BracketPosition[]>([]);
  const [selectedPlayerToPlace, setSelectedPlayerToPlace] = useState<Participant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch bracket structure
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bracketData, matchesData] = await Promise.all([
          tournamentService.getTournamentBracket(tournament.id),
          tournamentService.getTournamentMatches(tournament.id),
        ]);
        setBracket(bracketData);
        setMatches(matchesData);
      } catch (err: any) {
        console.error('Error fetching bracket data in editor:', err);
        setError(err.message || 'Error al cargar los datos para editar el cuadrante.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournament.id, tournament.status]);

  // Initialize temporary positions once bracket is loaded
  useEffect(() => {
    if (bracket && bracket.positions) {
      const total = bracket.totalPositions;
      const initial = Array.from({ length: total }, (_, idx) => {
        const existing = bracket.positions.find((p) => p.position === idx + 1);
        return (
          existing || {
            position: idx + 1,
            participantId: null,
            participantAlias: null,
            participantFederation: null,
          }
        );
      });
      setTemporaryPositions(initial);
    }
  }, [bracket]);

  if (loading) return <div style={styles.message}>Cargando editor del cuadrante...</div>;
  if (error) return <ErrorMessage message={error} />;
  if (!bracket || !bracket.positions) return <div style={styles.message}>No hay datos del cuadrante para editar</div>;

  // Derive unassigned players
  const unassignedPlayers = participants.filter(
    (player) => !temporaryPositions.some((pos) => pos.participantId === player.id)
  );

  const assignedCount = temporaryPositions.filter(
    (p) => p.participantId && p.participantAlias && p.participantAlias !== 'Por determinar' && p.participantAlias !== 'Bye'
  ).length;
  // Progress depends on total registered participants since that is the maximum we can place
  const totalToAssign = participants.length;
  const progressPercent = totalToAssign > 0 ? Math.round((assignedCount / totalToAssign) * 100) : 0;

  // Interaction handlers
  const handleDropPlayer = (targetIdx: number, participantId: string) => {
    const player = participants.find((p) => p.id === participantId);
    if (!player) return;

    setTemporaryPositions((prev) => {
      const updated = [...prev];

      // 1. Remove player from their old slot if they were already placed somewhere else
      const existingIdx = updated.findIndex((p) => p.participantId === participantId);
      if (existingIdx !== -1) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          participantId: null,
          participantAlias: null,
          participantFederation: null,
        };
      }

      // 2. Put the new player in the target slot
      updated[targetIdx] = {
        ...updated[targetIdx],
        participantId: player.id,
        participantAlias: player.alias,
        participantFederation: player.federation,
      };

      return updated;
    });

    // Clear selection if it was click-to-place
    setSelectedPlayerToPlace(null);
  };

  const handleClearPlayer = (targetIdx: number) => {
    setTemporaryPositions((prev) => {
      const updated = [...prev];
      updated[targetIdx] = {
        ...updated[targetIdx],
        participantId: null,
        participantAlias: null,
        participantFederation: null,
      };
      return updated;
    });
  };

  const handleMovePlayer = (fromIdx: number, toIdx: number) => {
    setTemporaryPositions((prev) => {
      const updated = [...prev];
      const tempFrom = { ...updated[fromIdx] };
      const tempTo = { ...updated[toIdx] };

      updated[fromIdx] = {
        ...tempFrom,
        participantId: tempTo.participantId,
        participantAlias: tempTo.participantAlias,
        participantFederation: tempTo.participantFederation,
      };

      updated[toIdx] = {
        ...tempTo,
        participantId: tempFrom.participantId,
        participantAlias: tempFrom.participantAlias,
        participantFederation: tempFrom.participantFederation,
      };

      return updated;
    });
  };

  const handleSelectPlayerClick = (player: Participant) => {
    if (selectedPlayerToPlace?.id === player.id) {
      setSelectedPlayerToPlace(null);
    } else {
      setSelectedPlayerToPlace(player);
    }
  };

  const handleReset = () => {
    if (bracket && bracket.positions) {
      const total = bracket.totalPositions;
      const initial = Array.from({ length: total }, (_, idx) => {
        const existing = bracket.positions.find((p) => p.position === idx + 1);
        return (
          existing || {
            position: idx + 1,
            participantId: null,
            participantAlias: null,
            participantFederation: null,
          }
        );
      });
      setTemporaryPositions(initial);
      setSelectedPlayerToPlace(null);
      showToast('Se ha restablecido el cuadrante al estado original.', 'info');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await tournamentService.saveBracketPositions(bracket.id, temporaryPositions);
      showToast('¡Posiciones del cuadrante guardadas correctamente!', 'success');
      onSave();
    } catch (err: any) {
      console.error('Error saving bracket positions:', err);
      showToast(err.message || 'Error al guardar las posiciones del cuadrante.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /** Re-sorts only the currently-placed participants (all assigned state). */
  const handleReshuffle = () => {
    const placed = participants.filter((p) =>
      temporaryPositions.some(
        (pos) =>
          pos.participantId === p.id &&
          pos.participantAlias !== 'Bye' &&
          pos.participantAlias !== 'Por determinar'
      )
    );
    const newPositions = applyStandardSeeding(bracket.totalPositions, placed, temporaryPositions);
    setTemporaryPositions(newPositions);
    setSelectedPlayerToPlace(null);
    showToast('¡Cuadrante re-sorteado con el sistema estándar de cabezas de serie!', 'success');
  };

  /** Auto-assigns ALL registered participants from scratch (first draw / partial state). */
  const handleAutoAssign = () => {
    const newPositions = applyStandardSeeding(bracket.totalPositions, participants, temporaryPositions);
    setTemporaryPositions(newPositions);
    setSelectedPlayerToPlace(null);
    showToast('¡Sorteo automático completado con el sistema estándar de cabezas de serie!', 'success');
  };

  // Re-build matches rounded structure for rendering using local temporary positions
  const totalPositions = bracket.totalPositions;
  const numRounds = Math.log2(totalPositions);
  const matchHeight = 110;
  const initialGap = 40;

  const roundsData = [];
  for (let round = 1; round <= numRounds; round++) {
    const roundMatches = matches.filter((m) => m.round === round);
    roundMatches.sort((a, b) => a.matchIndex - b.matchIndex);

    const formattedMatches: { player1: BracketParticipant; player2: BracketParticipant; status: string }[] = roundMatches.map((m) => ({
      player1: {
        position: 0,
        alias: m.participant1.alias,
        federation: m.participant1.federation,
        legsWon: m.matchScore.participant1.legsWon,
        setsWon: m.matchScore.participant1.setsWon,
      },
      player2: {
        position: 0,
        alias: m.participant2.alias,
        federation: m.participant2.federation,
        legsWon: m.matchScore.participant2.legsWon,
        setsWon: m.matchScore.participant2.setsWon,
      },
      status: m.status,
    }));

    const expectedMatches = totalPositions / Math.pow(2, round);
    while (formattedMatches.length < expectedMatches) {
      formattedMatches.push({
        player1: { position: 0, alias: null, federation: null, legsWon: 0, setsWon: 0 },
        player2: { position: 0, alias: null, federation: null, legsWon: 0, setsWon: 0 },
        status: 'PENDING',
      });
    }

    roundsData.push(formattedMatches);
  }

  // Inject temporary positions for Round 1
  if (roundsData[0] && temporaryPositions.length > 0) {
    roundsData[0] = roundsData[0].map((m, i) => {
      const pos1 = temporaryPositions[i * 2];
      const pos2 = temporaryPositions[i * 2 + 1];
      return {
        ...m,
        player1: {
          position: i * 2 + 1,
          alias: pos1 ? pos1.participantAlias : null,
          federation: pos1 ? pos1.participantFederation : null,
        },
        player2: {
          position: i * 2 + 2,
          alias: pos2 ? pos2.participantAlias : null,
          federation: pos2 ? pos2.participantFederation : null,
        },
      };
    });
  }

  return (
    <div style={styles.editorLayout}>
      {/* Sticky Sidebar on the Left */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Asignar Jugadores</h3>
          <span style={styles.sidebarSubtitle}>Arrastra o haz clic para colocar</span>
        </div>

        {/* Progress Tracker */}
        <div style={styles.progressContainer}>
          <div style={styles.progressMeta}>
            <span style={styles.progressText}>
              Colocados: <strong>{assignedCount}</strong> de <strong>{totalToAssign}</strong>
            </span>
            <span style={styles.progressPercent}>{progressPercent}%</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Draggable & Clickable Player Cards List */}
        <div style={styles.playersList}>
          {unassignedPlayers.length === 0 ? (
            <div style={styles.emptyPlayersMessage}>
              ¡Todos los jugadores inscritos han sido colocados en el cuadrante!
            </div>
          ) : (
            unassignedPlayers.map((player) => {
              const isSelected = selectedPlayerToPlace?.id === player.id;
              return (
                <div
                  key={player.id}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('participantId', player.id);
                  }}
                  onClick={() => handleSelectPlayerClick(player)}
                  style={{
                    ...styles.playerCard,
                    ...(isSelected ? styles.playerCardSelected : {}),
                  }}
                  title="Arrastra esta tarjeta o haz clic en ella para colocarla"
                >
                  <div style={styles.playerCardContent}>
                    {player.federation && player.federation !== 'N/A' && (
                      <img
                        src={getFederationFlag(player.federation) || ''}
                        alt={player.federation}
                        style={styles.flag}
                      />
                    )}
                    <span style={styles.playerAlias}>{player.alias}</span>
                  </div>
                  <span style={styles.dragIcon}>☰</span>
                </div>
              );
            })
          )}
        </div>

        {/* Helper instruction */}
        {selectedPlayerToPlace && (
          <div style={styles.selectionTip}>
            Haz clic en una ranura <strong>+</strong> en el cuadrante para colocar a{' '}
            <strong>{selectedPlayerToPlace.alias}</strong>.
          </div>
        )}

        {/* Action Buttons Panel */}
        <div style={styles.actionsPanel}>
          <Button
            variant="primary"
            leftIcon="Save"
            onClick={handleSave}
            loading={isSaving}
            fullWidth
          >
            Guardar cuadrante
          </Button>
          {unassignedPlayers.length > 0 ? (
            <Button
              variant="secondary"
              leftIcon="Shuffle"
              onClick={handleAutoAssign}
              disabled={isSaving}
              fullWidth
              style={styles.reshuffleButton}
            >
              Sortear aleatoriamente
            </Button>
          ) : (
            <Button
              variant="secondary"
              leftIcon="Shuffle"
              onClick={handleReshuffle}
              disabled={isSaving}
              fullWidth
              style={styles.reshuffleButton}
            >
              Re-sortear aleatoriamente
            </Button>
          )}
          <div style={styles.secondaryActions}>
            <Button
              variant="secondary"
              leftIcon="RefreshCw"
              onClick={handleReset}
              disabled={isSaving}
              style={{ flexGrow: 1 }}
            >
              Restablecer
            </Button>
            <Button
              variant="secondary"
              leftIcon="X"
              onClick={onCancel}
              disabled={isSaving}
              style={{ flexGrow: 1 }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Bracket Editor Panel (Horizontally Scrollable) */}
      <main style={styles.bracketContainer}>
        <div style={styles.bracketWrapper}>
          {roundsData.map((round, roundIndex) => {
            const isFirstRound = roundIndex === 0;
            const roundMatchContainerHeight = (matchHeight + initialGap) * Math.pow(2, roundIndex);

            return (
              <div key={roundIndex} style={styles.roundColumn}>
                <div style={styles.roundHeader}>
                  {roundIndex === numRounds - 1 ? 'Final' : `Ronda ${roundIndex + 1}`}
                  {isFirstRound && <span style={styles.roundHeaderSubtitle}> (Editable)</span>}
                </div>
                <div style={styles.matchesContainer}>
                  {round.map((match, matchIndex) => (
                    <div
                      key={matchIndex}
                      style={{
                        ...styles.matchWrapper,
                        height: `${roundMatchContainerHeight}px`,
                      }}
                    >
                      <div style={styles.matchCentering}>
                        <div style={styles.matchAndStatus}>
                          {isFirstRound ? (
                            <BracketMatchEditable
                              player1={match.player1}
                              player2={match.player2}
                              position1={match.player1.position}
                              position2={match.player2.position}
                              onDropPlayer={handleDropPlayer}
                              onClearPlayer={handleClearPlayer}
                              onMovePlayer={handleMovePlayer}
                              selectedPlayerToPlace={selectedPlayerToPlace}
                            />
                          ) : (
                            <BracketMatch
                              player1={match.player1}
                              player2={match.player2}
                              showPositions={false}
                              status={match.status}
                            />
                          )}
                        </div>
                      </div>

                      {roundIndex < numRounds - 1 && (
                        <div
                          style={{
                            ...styles.connectorWrapper,
                            height: `${roundMatchContainerHeight}px`,
                          }}
                        >
                          <div style={styles.lineHorizontal} />
                          <div
                            style={{
                              ...styles.lineVertical,
                              height: `${roundMatchContainerHeight / 2}px`,
                              top: matchIndex % 2 === 0 ? '50%' : 'auto',
                              bottom: matchIndex % 2 === 1 ? '50%' : 'auto',
                              borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                            }}
                          />
                          {matchIndex % 2 === 0 && (
                            <div
                              style={{
                                ...styles.lineHorizontalNext,
                                top: `${roundMatchContainerHeight}px`,
                              }}
                            />
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
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  editorLayout: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2.5rem',
    width: '100%',
    minHeight: '70vh',
    position: 'relative',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'sticky',
    top: '90px',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  sidebarHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  sidebarTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  sidebarSubtitle: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '0.75rem',
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
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  emptyPlayersMessage: {
    fontSize: '0.8rem',
    color: '#C4E866',
    textAlign: 'center',
    padding: '2rem 1rem',
    border: '1px dashed rgba(196, 232, 102, 0.2)',
    borderRadius: '10px',
    backgroundColor: 'rgba(196, 232, 102, 0.02)',
    lineHeight: '1.5',
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.85rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    cursor: 'grab',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
  },
  playerCardSelected: {
    borderColor: '#C4E866',
    backgroundColor: 'rgba(196, 232, 102, 0.08)',
    boxShadow: '0 0 12px rgba(196, 232, 102, 0.2)',
    transform: 'scale(1.02) translateY(-1px)',
  },
  playerCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  playerAlias: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
  },
  flag: {
    width: '18px',
    height: '12px',
    borderRadius: '2px',
    opacity: 0.8,
  },
  dragIcon: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.2)',
    cursor: 'grab',
  },
  selectionTip: {
    fontSize: '0.75rem',
    color: 'rgba(196, 232, 102, 0.85)',
    backgroundColor: 'rgba(196, 232, 102, 0.05)',
    border: '1px solid rgba(196, 232, 102, 0.15)',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    textAlign: 'left',
    lineHeight: '1.4',
    animation: 'slotPulse 1.5s infinite ease-in-out',
  },
  actionsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
  secondaryActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  reshuffleButton: {
    borderColor: 'rgba(196, 232, 102, 0.3)',
    color: '#C4E866',
  },
  bracketContainer: {
    flexGrow: 1,
    overflowX: 'auto',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    paddingBottom: '2rem',
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
  roundHeaderSubtitle: {
    color: '#C4E866',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'none',
    letterSpacing: 'normal',
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
};

// Add standard webkit scrollbar custom styling for the sidebar list using javascript trick
if (typeof document !== 'undefined') {
  const scrollStyle = document.createElement('style');
  scrollStyle.innerHTML = `
    div[class^="playersList"]::-webkit-scrollbar,
    aside::-webkit-scrollbar {
      width: 5px;
    }
    div[class^="playersList"]::-webkit-scrollbar-track,
    aside::-webkit-scrollbar-track {
      background: transparent;
    }
    div[class^="playersList"]::-webkit-scrollbar-thumb,
    aside::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
    }
    div[class^="playersList"]::-webkit-scrollbar-thumb:hover,
    aside::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `;
  document.head.appendChild(scrollStyle);
}

export default TournamentCreateBracketTab;
