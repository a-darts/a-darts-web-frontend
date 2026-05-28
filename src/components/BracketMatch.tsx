import React from 'react';
import { getFederationLabel, getFederationFlag } from '../utils/tournament.utils';
import { MatchStatus } from '../services/tournament.service';

export interface BracketParticipant {
  position: number;
  alias: string | null;
  federation: string | null;
  legsWon?: number;
  setsWon?: number;
}

export interface BracketMatchProps {
  player1: BracketParticipant;
  player2: BracketParticipant;
  showPositions?: boolean;
  status?: string;
}

const BracketMatch: React.FC<BracketMatchProps> = ({
  player1,
  player2,
  showPositions = false,
  status,
}) => {
  const truncateAlias = (alias: string | null) => {
    if (!alias) return '-';
    return alias.length > 21 ? `${alias.substring(0, 21)}...` : alias;
  };

  const isByeMatch = player1.alias === 'Bye' || player2.alias === 'Bye';
  const isFinished = status === MatchStatus.FINISHED;
  const isInProgress = status === MatchStatus.IN_PROGRESS;

  let winnerAlias: string | null = null;
  if (isFinished) {
    const p1Sets = player1.setsWon || 0;
    const p2Sets = player2.setsWon || 0;
    const p1Legs = player1.legsWon || 0;
    const p2Legs = player2.legsWon || 0;

    if (p1Sets > p2Sets) {
      winnerAlias = player1.alias;
    } else if (p2Sets > p1Sets) {
      winnerAlias = player2.alias;
    } else if (p1Legs > p2Legs) {
      winnerAlias = player1.alias;
    } else if (p2Legs > p1Legs) {
      winnerAlias = player2.alias;
    }
  }

  const getScoreColor = (participant: BracketParticipant, isLegsBox: boolean) => {
    if (isInProgress) {
      return '#FFFFFF';
    }
    if (isFinished) {
      return participant.alias === winnerAlias 
        ? '#BFE55F' 
        : 'rgba(255, 255, 255, 0.3)';
    }
    return 'rgba(255, 255, 255, 0.3)';
  };

  const renderParticipant = (pos: BracketParticipant, isFirst: boolean) => (
    <div style={{
      ...styles.participantRow,
      borderBottom: isFirst ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
    }}>
      <div style={styles.participantInfo}>
        {showPositions && (
          <span style={styles.positionNumber}>{pos.position}</span>
        )}
        <div style={styles.aliasFederationContainer}>
          {pos.federation && pos.federation !== 'N/A' && (
            <img
              src={getFederationFlag(pos.federation) || ''}
              alt={pos.federation}
              style={styles.flag}
            />
          )}
          <span style={{
            ...styles.alias,
            color: pos.alias === 'Bye' || pos.alias === 'Por determinar' ? 'rgba(255, 255, 255, 0.3)' : '#fff'
          }}>
            {truncateAlias(pos.alias)}
          </span>
        </div>
      </div>
      {!isByeMatch && (status !== 'PENDING' && status !== 'READY') && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {/* Caja de Sets */}
          <div style={{
            ...styles.scoreBox,
            color: getScoreColor(pos, false),
            fontWeight: isFinished && pos.alias === winnerAlias ? '800' : '700'
          }}>
            {pos.setsWon !== undefined ? pos.setsWon : ''}
          </div>
          {/* Caja de Legs */}
          <div style={{
            ...styles.scoreBox,
            color: getScoreColor(pos, true),
            fontWeight: isFinished && pos.alias === winnerAlias ? '800' : '700'
          }}>
            {pos.legsWon !== undefined ? pos.legsWon : ''}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.matchCard}>
      <div style={styles.participantsContainer}>
        {renderParticipant(player1, true)}
        {renderParticipant(player2, false)}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    width: '280px',
    flexShrink: 0,
  },
  participantsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  participantRow: {
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  participantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  positionNumber: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196, 232, 102, 0.1)',
    borderRadius: '6px',
  },
  aliasFederationContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
  },
  alias: {
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  flag: {
    width: '18px',
    height: '12px',
    borderRadius: '2px',
    opacity: 0.8,
    alignSelf: 'center',
  },
  scoreBox: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontSize: '0.9rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

export default BracketMatch;
