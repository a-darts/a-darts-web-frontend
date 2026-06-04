import React, { useEffect, useState } from 'react';
import { Tournament, TournamentStatus } from '../../../services/tournament.service';
import { bracketService, Bracket, BracketStatus } from '../../../services/bracket.service';
import { matchService, Match, MatchStatus } from '../../../services/match.service';
import { registeredParticipantService } from '../../../services/registeredParticipant.service';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch, { BracketParticipant } from '../../../components/BracketMatch';
import TournamentMatchStatusTag from '../../../components/TournamentMatchStatusTag';
import { useAuth, UserRoles } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Button from '../../../components/Button';
import TournamentBracketStatusTag from '../../../components/TournamentBracketStatusTag';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';

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
      await bracketService.generateBracketAutomatically(tournament.id);
      showToast('¡Cuadrante generado correctamente!', 'success');

      if (onBracketGenerated) {
        onBracketGenerated();
      } else {
        // Re-fetch data if parent callback is not provided
        const [bracketData, matchesData] = await Promise.all([
          bracketService.getTournamentBracket(tournament.id),
          matchService.getTournamentMatches(tournament.id)
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
      await bracketService.generateBracketManually(tournament.id);
      showToast('¡Cuadrante generado correctamente!', 'success');

      if (onBracketGenerated) {
        onBracketGenerated();
      } else {
        // Re-fetch data if parent callback is not provided
        const [bracketData, matchesData] = await Promise.all([
          bracketService.getTournamentBracket(tournament.id),
          matchService.getTournamentMatches(tournament.id)
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

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishBracket = async () => {
    if (!bracket) return;
    try {
      setIsPublishing(true);
      await bracketService.publishBracket(bracket.id);
      showToast('¡Cuadrante publicado correctamente!', 'success');

      // Re-fetch bracket data to reflect the new status
      const bracketData = await bracketService.getTournamentBracket(tournament.id);
      setBracket(bracketData);
    } catch (err: any) {
      console.error('Error publishing bracket:', err);
      showToast(err.message || 'Error al publicar el cuadrante.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishBracket = async () => {
    if (!bracket) return;
    try {
      setIsPublishing(true);
      await bracketService.unpublishBracket(bracket.id);
      showToast('¡Cuadrante ocultado correctamente!', 'success');

      // Re-fetch bracket data to reflect the new status
      const [bracketData, matchesData] = await Promise.all([
        bracketService.getTournamentBracket(tournament.id),
        matchService.getTournamentMatches(tournament.id)
      ]);
      setBracket(bracketData);
      setMatches(matchesData);
    } catch (err: any) {
      console.error('Error unpublishing bracket:', err);
      showToast(err.message || 'Error al ocultar el cuadrante.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDeleteBracket = async () => {
    if (!bracket) return;
    try {
      setIsDeleting(true);
      await bracketService.deleteBracket(bracket.id);
      showToast('¡Cuadrante eliminado correctamente!', 'success');

      setBracket(null);
      setMatches([]);
      setIsNotPublished(true);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Error deleting bracket:', err);
      showToast(err.message || 'Error al eliminar el cuadrante.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [bracketData, matchesData, participantsData] = await Promise.all([
          bracketService.getTournamentBracket(tournament.id),
          matchService.getTournamentMatches(tournament.id),
          registeredParticipantService.getParticipantsByTournamentId(tournament.id).catch(() => [])
        ]);
        setBracket(bracketData);
        setMatches(matchesData);
        setParticipantsCount(participantsData.length);
      } catch (err: any) {
        console.error('Error fetching bracket data:', err);
        if (err.message && err.message.toLowerCase().includes('not found')) {
          setIsNotPublished(true);
        } else {
          setError(err.message || 'Error al cargar el cuadrante.');
        }
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchData(true);

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 15000); // Refrescar cada 15 segundos

    return () => clearInterval(intervalId);
  }, [tournament.id, tournament.status]);

  if (loading) {
    return <div style={styles.message}>Cargando cuadrante...</div>;
  }

  if (tournament.status === TournamentStatus.DELETED) {
    return (
      <EmptyState
        title={"Torneo Eliminado"}
        description={"Este torneo ha sido eliminado. No se pueden generar ni configurar cuadrantes."}
      />
    );
  }

  if (isNotPublished) {
    return (
      <EmptyState
        title="Cuadrante no disponible"
        description={
          <span>
            {isAdmin
              ? 'El cuadrante aún no ha sido generado para este torneo. Como administrador, puedes generarlo automáticamente con los participantes inscritos.'
              : 'Aún no se ha publicado el cuadrante para este torneo. Por favor, vuelve a consultar más tarde.'}
          </span>
        }
      >
        {isAdmin && (
          <>
            <Button
              variant="primary"
              leftIcon="Network"
              onClick={handleGenerateBracketAutomatically}
              loading={isGenerating}
            >
              Generar cuadrante automáticamente
            </Button>

            <Button
              variant="primary"
              leftIcon="Settings"
              onClick={handleGenerateBracketManually}
              loading={isGenerating}
            >
              Configurar cuadrante manualmente
            </Button>
          </>
        )}
      </EmptyState>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!bracket || !bracket.positions) {
    return <div style={styles.message}>No hay datos del cuadrante</div>;
  }

  const assignedCount = bracket.positions.filter(
    (p) => p.participantId && p.participantAlias && p.participantAlias !== 'Por determinar' && p.participantAlias !== 'Bye'
  ).length;
  const totalToAssign = participantsCount;
  const progressPercent = totalToAssign > 0 ? Math.round((assignedCount / totalToAssign) * 100) : 0;

  const totalPositions = bracket.totalPositions;
  const numRounds = Math.log2(totalPositions);
  const matchHeight = 110;
  const initialGap = 40;

  // Group matches by round
  const roundsData = [];
  for (let round = 1; round <= numRounds; round++) {
    const roundMatches = matches.filter(m => m.round === round);
    // Sort matches by matchIndex to maintain bracket order
    roundMatches.sort((a, b) => a.matchIndex - b.matchIndex);

    const formattedMatches: {
      player1: BracketParticipant;
      player2: BracketParticipant;
      status: string;
      boardNumber: number | null;
    }[] = roundMatches.map(m => ({
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
      boardNumber: m.boardNumber,
    }));

    // Fill missing matches if the round is not yet fully generated/fetched
    const expectedMatches = totalPositions / Math.pow(2, round);
    while (formattedMatches.length < expectedMatches) {
      formattedMatches.push({
        player1: { position: 0, alias: null, federation: null, legsWon: undefined, setsWon: undefined },
        player2: { position: 0, alias: null, federation: null, legsWon: undefined, setsWon: undefined },
        status: 'PENDING',
        boardNumber: null,
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
      {isAdmin && bracket.status === BracketStatus.DRAFT && (
        <div style={styles.bracketStatusActionsContainer}>
          <TournamentBracketStatusTag
            status={bracket.status}
            size="medium"
          />
          {tournament.status === TournamentStatus.PUBLISHED && (
            <Button
              variant="secondary"
              leftIcon="Megaphone"
              onClick={handlePublishBracket}
              loading={isPublishing}
            >
              Publicar cuadrante
            </Button>
          )}
        </div>
      )}

      {isAdmin && bracket.status === BracketStatus.PUBLISHED && (
        <div style={styles.bracketStatusActionsContainer}>
          <TournamentBracketStatusTag
            status={bracket.status}
            size="medium"
          />
          <Button
            variant="secondary"
            leftIcon="EyeOff"
            onClick={handleUnpublishBracket}
            loading={isPublishing}
          >
            Ocultar cuadrante
          </Button>
        </div>
      )}

      {isAdmin && (tournament.status === TournamentStatus.DRAFT || tournament.status === TournamentStatus.PUBLISHED) && onStartEditing && (
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
            variant="primary"
            leftIcon="Edit3"
            onClick={onStartEditing}
          >
            Editar cuadrante
          </Button>
          <Button
            variant="danger-primary"
            leftIcon="Trash2"
            onClick={() => setIsDeleteModalOpen(true)}
            loading={isDeleting}
          >
            Eliminar cuadrante
          </Button>
        </div>
      )
      }

      <div style={styles.bracketWrapper}>
        {roundsData.map((round, roundIndex) => {
          const roundMatchContainerHeight = (matchHeight + initialGap) * Math.pow(2, roundIndex);

          return (
            <div key={roundIndex} style={styles.roundColumn}>
              <div style={styles.roundHeader}>
                {roundIndex === numRounds - 1 ? 'Final' : `Ronda ${roundIndex + 1}`}
              </div>
              <div style={styles.matchesContainer}>
                {round.map((match, matchIndex) => {
                  const isByeMatch = match.player1.alias === 'Bye' || match.player2.alias === 'Bye';

                  return (
                    <div key={matchIndex} style={{
                      ...styles.matchWrapper,
                      height: `${roundMatchContainerHeight}px`
                    }}>
                      <div style={styles.matchCentering}>
                        <div style={styles.matchAndStatus}>
                          {match.status && (
                            <div style={styles.statusTagContainer}>
                              <TournamentMatchStatusTag status={match.status} size="small" />
                              {match.status === MatchStatus.IN_PROGRESS && (
                                <>
                                  {!isByeMatch && (match.boardNumber ? (
                                    <span style={styles.boardNumberText}>Diana {match.boardNumber}</span>
                                  ) : (
                                    <span style={styles.boardNumberText}>Diana sin asignar</span>
                                  ))}
                                </>
                              )}
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Eliminar cuadrante"
        description="¿Estás seguro de que deseas eliminar este cuadrante? Esta acción no se puede deshacer y se perderán todos los datos de los enfrentamientos."
        confirmLabel="Sí, eliminar cuadrante"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteBracket}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  )
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
  boardNumberText: {
    fontSize: '0.75rem',
    fontWeight: '400',
    color: '#a1a1a1',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    padding: '0.15rem 0.5rem',
    marginLeft: '0.5rem',
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
  bracketStatusActionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: '1rem',
    gap: '2rem',
    flexWrap: 'wrap',
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
