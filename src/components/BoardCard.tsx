import React from 'react';
import { Board, Match } from '../services/tournament.service';
import i18n from '../i18n';
import Button from './Button';
import IconButton from './IconButton';
import TournamentMatchStatusTag from './TournamentMatchStatusTag';

interface BoardCardProps {
  board: Board;
  match?: Match;
  onAssignMatch?: (boardNumber: number) => void;
  onReleaseBoard?: (boardNumber: number) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, match, onAssignMatch, onReleaseBoard }) => {
  const isInProgress = match?.status === 'IN_PROGRESS';
  const isFinished = match?.status === 'FINISHED';

  return (
    <div style={styles.boardCard}>
      <div style={styles.boardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={styles.boardTitle}>Diana {board.number}</span>
        </div>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: board.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.2)' : (board.status === 'OCCUPIED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
          color: board.status === 'AVAILABLE' ? '#4ade80' : (board.status === 'OCCUPIED' ? '#f87171' : '#fbbf24'),
        }}>
          {i18n.t(`playingArea.${board.status}`)}
        </span>
      </div>
      {match && (
        <div style={{
          ...styles.matchInfoContainer,
          borderColor: isFinished ? '#f87171' : (isInProgress ? '#4ade80' : 'rgba(255, 255, 255, 0.05)'),
        }}>
          <div style={styles.matchParticipant}>
            <span style={styles.participantName}>{match.participant1?.alias || '?'}</span>
            <span style={styles.participantScore}>{match.matchScore?.participant1?.legsWon || 0}</span>
          </div>
          <div style={styles.matchParticipant}>
            <span style={styles.participantName}>{match.participant2?.alias || '?'}</span>
            <span style={styles.participantScore}>{match.matchScore?.participant2?.legsWon || 0}</span>
          </div>

          <div style={styles.releaseActionRow}>
            <TournamentMatchStatusTag
              status={match.status}
            />
            {isFinished && onReleaseBoard && (
              <Button
                variant="danger"
                size="small"
                leftIcon="X"
                onClick={() => onReleaseBoard(board.number)}
              >
                Liberar diana
              </Button>
            )}
          </div>
        </div>
      )}
      {!match && board.matchId && (
        <div style={styles.matchInfo}>
          Partida en curso
        </div>
      )}
      {board.status === 'AVAILABLE' && onAssignMatch && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
          <Button
            variant="secondary"
            size="small"
            leftIcon='Plus'
            onClick={() => onAssignMatch(board.number)}
          >
            Asignar partida
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
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: '1.1rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
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
  matchParticipant: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flex: '1 1 120px',
  },
  participantName: {
    color: 'white',
    fontWeight: '500',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
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
  releaseActionRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '0.25rem',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
};

export default BoardCard;
