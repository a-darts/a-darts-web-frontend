import React from 'react';
import { Board } from '../services/tournament.service';
import i18n from '../i18n';

interface BoardCardProps {
  board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  return (
    <div style={styles.boardCard}>
      <div style={styles.boardHeader}>
        <span style={styles.boardTitle}>Diana {board.number}</span>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: board.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.2)' : (board.status === 'OCCUPIED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
          color: board.status === 'AVAILABLE' ? '#4ade80' : (board.status === 'OCCUPIED' ? '#f87171' : '#fbbf24'),
        }}>
          {i18n.t(`playingArea.${board.status}`)}
        </span>
      </div>
      {board.matchId && (
        <div style={styles.matchInfo}>
          Partida en curso
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
  }
};

export default BoardCard;
