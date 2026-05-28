import React from 'react';
import { Board, Match, MatchStatus } from '../services/tournament.service';
import i18n from '../i18n';
import Button from './Button';
import TournamentMatchStatusTag from './TournamentMatchStatusTag';
import BoardCardStatusTag from './BoardStatusTag';

interface BoardCardProps {
  board: Board;
  match?: Match;
  onAssignMatch?: (boardNumber: number) => void;
  onAssignBoard?: (matchId: string) => void;
  onReleaseBoard?: (boardNumber: number) => void;
  onSuspendMatch?: (matchId: string) => void;
  onResumeMatch?: (matchId: string) => void;
  onAddResult?: (matchId: string) => void;
  onViewMatchLive?: (matchId: string, boardShortId: string) => void;
  onDisableBoard?: (boardNumber: number) => void;
  onEnableBoard?: (boardNumber: number) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  match,
  onAssignMatch,
  onAssignBoard,
  onReleaseBoard,
  onSuspendMatch,
  onResumeMatch,
  onAddResult,
  onViewMatchLive,
  onDisableBoard,
  onEnableBoard,
}) => {
  const isPending = match?.status === MatchStatus.PENDING;
  const isReady = match?.status === MatchStatus.READY;
  const isInProgress = match?.status === MatchStatus.IN_PROGRESS;
  const isFinished = match?.status === MatchStatus.FINISHED;
  const isSuspended = match?.status === MatchStatus.SUSPENDED;

  return (
    <div style={styles.boardCard}>
      <div style={styles.boardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={styles.boardTitleContainer}>
            <span style={styles.boardTitle}>Diana {board.number} </span>
            <span style={styles.boardTitleShortId}>({board.shortId})</span>
          </div>
        </div>
        <BoardCardStatusTag
          status={board.status}
          size="small"
          showIcon={false}
        />
      </div>
      {match && (
        <div style={{
          ...styles.matchInfoContainer,
          borderColor: isFinished ? '#f87171' : (isInProgress ? '#4ade80' : 'rgba(255, 255, 255, 0.05)'),
        }}>
          <div style={styles.matchParticipantsContainer}>
            <div style={styles.matchParticipant}>
              <span style={styles.participantName}>{match.participant1?.alias || '?'}</span>
              <div style={styles.matchParticipantScore}>
                <span style={styles.participantScore}>{match.matchScore?.participant1?.setsWon || 0}</span>
                <span style={styles.participantScore}>{match.matchScore?.participant1?.legsWon || 0}</span>
              </div>
            </div>
            <div style={styles.matchParticipant}>
              <span style={styles.participantName}>{match.participant2?.alias || '?'}</span>
              <div style={styles.matchParticipantScore}>
                <span style={styles.participantScore}>{match.matchScore?.participant2?.setsWon || 0}</span>
                <span style={styles.participantScore}>{match.matchScore?.participant2?.legsWon || 0}</span>
              </div>
            </div>
          </div>

          <div style={styles.releaseActionsSection}>
            <TournamentMatchStatusTag
              status={match.status}
            />
            <div style={styles.releaseActionsRow}>
              {isFinished && onReleaseBoard && (
                <Button
                  variant="danger-primary"
                  size="small"
                  leftIcon="X"
                  onClick={() => onReleaseBoard(board.number)}
                >
                  Liberar diana
                </Button>
              )}
              {isPending && onAssignBoard && (
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon="Edit"
                  onClick={() => onAssignBoard(match.id)}
                >
                  Reasignar diana
                </Button>
              )}
              {isReady && (
                <>
                  {onAssignBoard && (
                    <Button
                      variant="secondary"
                      size="small"
                      leftIcon="Edit"
                      onClick={() => onAssignBoard(match.id)}
                    >
                      Reasignar diana
                    </Button>
                  )}
                </>
              )}
              {isSuspended && (
                <>
                  {onResumeMatch && (
                    <Button
                      variant="primary"
                      size="small"
                      leftIcon="Play"
                      onClick={() => onResumeMatch(match.id)}
                    >
                      Reanudar
                    </Button>
                  )}
                  {onViewMatchLive && (
                    <Button
                      variant="primary"
                      size="small"
                      leftIcon="Play"
                      onClick={() => onViewMatchLive(match.id, board.shortId)}
                    >
                      Ver
                    </Button>
                  )}
                </>
              )}
              {isInProgress && (
                <>
                  {onAddResult && (
                    <Button
                      variant="secondary"
                      size="small"
                      leftIcon="Plus"
                      onClick={() => onAddResult(match.id)}
                    >
                      Añadir resultado
                    </Button>
                  )}
                  {onSuspendMatch && (
                    <Button
                      variant="secondary"
                      size="small"
                      leftIcon="Pause"
                      onClick={() => onSuspendMatch(match.id)}
                    >
                      Suspender
                    </Button>
                  )}
                  {/* Cannot reasing board while match is in progress */}
                  {onAssignBoard && (
                    <Button
                      variant="secondary"
                      size="small"
                      leftIcon="Edit"
                      onClick={() => onAssignBoard(match.id)}
                    >
                      Reasignar diana
                    </Button>
                  )}
                  {onViewMatchLive && (
                    <Button
                      variant="primary"
                      size="small"
                      leftIcon="Play"
                      onClick={() => onViewMatchLive(match.id, board.shortId)}
                    >
                      Ver
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {!match && board.matchId && (
        <div style={styles.matchInfo}>
          Partida en curso
        </div>
      )}
      {board.status === 'AVAILABLE' && (
        <div style={styles.actionFooterRow}>
          {onAssignMatch && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
              <Button
                variant="primary"
                size="small"
                leftIcon='Plus'
                onClick={() => onAssignMatch(board.number)}
              >
                Asignar partida
              </Button>
            </div>
          )}
          {onDisableBoard && (
            <Button
              variant="danger-secondary"
              size="small"
              leftIcon="Lock"
              onClick={() => onDisableBoard(board.number)}
            >
              Deshabilitar diana
            </Button>
          )}
        </div>
      )}
      {board.status === 'DISABLED' && onEnableBoard && (
        <div style={styles.actionFooterRow}>
          <Button
            variant="secondary"
            size="small"
            leftIcon="Unlock"
            onClick={() => onEnableBoard(board.number)}
          >
            Habilitar diana
          </Button>
        </div>
      )}
      
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  boardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'baseline',
  },
  boardTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
  },
  boardTitleShortId: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    fontSize: '0.7rem',
  },
  matchInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  matchInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  matchParticipantsContainer: {
    flex: '1 1 120px',
    minWidth: 0,
  },
  matchParticipant: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
    width: '100%',
    gap: '0.5rem',
    minWidth: 0,
  },
  matchParticipantScore: {
    display: 'flex',
    gap: '0.5rem',
  },
  participantName: {
    color: 'white',
    fontWeight: '500',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  },
  participantScore: {
    backgroundColor: '#2c2c2c',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.875rem',
    padding: '0.15rem 0.65rem',
    borderRadius: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.75rem',
  },
  releaseActionsSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '0.25rem',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  releaseActionsRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  actionFooterRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
};

export default BoardCard;
