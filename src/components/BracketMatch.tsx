import React from 'react';
import { getFederationLabel, getFederationFlag } from '../utils/tournament.utils';

export interface BracketParticipant {
  position: number;
  alias: string | null;
  federation: string | null;
  score?: number;
}

interface BracketMatchProps {
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
      {!isByeMatch && (
        <div style={{
          ...styles.scoreBox,
          backgroundColor: pos.score !== undefined && pos.score > 0 ? 'rgba(196, 232, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: pos.score !== undefined && pos.score > 0 ? 'var(--btn-primary-bg)' : 'rgba(255, 255, 255, 0.3)',
        }}>
          {status === 'PENDING' || status === 'READY' ? '-' : (pos.score !== undefined ? pos.score : '')}
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
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
};

export default BracketMatch;
