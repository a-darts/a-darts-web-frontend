import React from 'react';
import { Match, MatchStatus } from '../services/tournament.service';
import { getFederationFlag } from '../utils/tournament.utils';
import TournamentMatchStatusTag from './TournamentMatchStatusTag';
import Button from './Button';

interface MatchCardProps {
  match: Match;
  isAdmin?: boolean;
  onStartMatch?: (matchId: string) => void;
  onSuspendMatch?: (matchId: string) => void;
  onResumeMatch?: (matchId: string) => void;
  onAssignBoard?: (matchId: string) => void;
  onAddResult?: (matchId: string) => void;
  style?: React.CSSProperties;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isAdmin,
  onStartMatch,
  onSuspendMatch,
  onResumeMatch,
  onAssignBoard,
  onAddResult,
  style
}) => {
  const isFinished = match.status === 'FINISHED';
  const isInProgress = match.status === 'IN_PROGRESS';

  return (
    <div style={{ ...styles.matchRowCard, ...style }}>
      {/* Row Header / Title */}
      <div style={styles.rowHeader}>
        <div style={styles.rowHeaderLeft}>
          <span style={styles.roundText}>
            Ronda {match.round}
          </span>
          <span style={styles.bulletSeparator}>•</span>
          <span style={styles.boardTextInline}>
            Diana {match.boardNumber ? match.boardNumber : 'sin asignar'}
          </span>
        </div>
        <TournamentMatchStatusTag status={match.status} />
      </div>

      {/* Symmetrical Competitors Row */}
      <div style={styles.competitorsRow}>
        {/* Participant 1 (Left Aligned) */}
        <div style={styles.participantLeft}>
          <span style={styles.aliasText(match.participant1.alias)}>
            {match.participant1.alias || 'Por determinar'}
          </span>
          {match.participant1.federation && match.participant1.federation !== 'N/A' && (
            <img
              src={getFederationFlag(match.participant1.federation) || ''}
              alt="Flag"
              style={styles.flag}
            />
          )}
        </div>

        {/* Score / VS Center Area */}
        <div style={styles.scoreCenterContainer}>
          {isFinished || isInProgress ? (
            <div style={styles.scoreWrapper}>
              <div style={styles.scoreBoxLeft}>
                <span style={styles.legScoreText}>
                  ({match.matchScore.participant1.setsWon})
                </span>
                <span style={styles.setScoreText}>
                  {match.matchScore.participant1.legsWon}
                </span>
              </div>
              <span style={styles.scoreHyphen}>-</span>
              <div style={styles.scoreBoxRight}>
                <span style={styles.setScoreText}>
                  {match.matchScore.participant2.legsWon}
                </span>
                <span style={styles.legScoreText}>
                  ({match.matchScore.participant2.setsWon})
                </span>
              </div>
            </div>
          ) : (
            <div style={styles.vsBox}>
              <span style={styles.vsText}>VS</span>
            </div>
          )}
        </div>

        {/* Participant 2 (Right Aligned) */}
        <div style={styles.participantRight}>
          {match.participant2.federation && match.participant2.federation !== 'N/A' && (
            <img
              src={getFederationFlag(match.participant2.federation) || ''}
              alt="Flag"
              style={styles.flag}
            />
          )}
          <span style={styles.aliasText(match.participant2.alias)}>
            {match.participant2.alias || 'Por determinar'}
          </span>
        </div>
      </div>

      {/* Admin Quick Action Buttons */}
      {isAdmin && (
        <div style={styles.actionButtonsContainer}>
          {match.status === 'IN_PROGRESS' && (
            <>
              <Button
                variant="primary"
                size="small"
                leftIcon="Plus"
                onClick={() => onAddResult && onAddResult(match.id)}
              >
                Añadir resultado
              </Button>
              <Button
                variant="secondary"
                size="small"
                leftIcon="Pause"
                onClick={() => onSuspendMatch && onSuspendMatch(match.id)}
              >
                Suspender
              </Button>
            </>
          )}
          {(match.status === MatchStatus.PENDING || match.status === MatchStatus.READY || match.status === MatchStatus.IN_PROGRESS) && (
            <Button
              variant="secondary"
              size="small"
              leftIcon={match.boardNumber === null ? 'Plus' : 'Edit'}
              onClick={() => onAssignBoard && onAssignBoard(match.id)}
            >
              {match.boardNumber === null ? 'Asignar diana' : 'Reasignar diana'}
            </Button>
          )}
          {match.status === 'READY' && (
            <Button
              variant="primary"
              size="small"
              leftIcon="Play"
              onClick={() => onStartMatch && onStartMatch(match.id)}
            >
              Iniciar partida
            </Button>
          )}
          {match.status === 'SUSPENDED' && (
            <Button
              variant="primary"
              size="small"
              leftIcon="Play"
              onClick={() => onResumeMatch && onResumeMatch(match.id)}
            >
              Reanudar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  matchRowCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.5rem',
  },
  rowHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  roundText: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg, #C4E866)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bulletSeparator: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: '0.9rem',
    userSelect: 'none',
  },
  boardTextInline: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  competitorsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
  },
  participantLeft: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    textAlign: 'right',
    minWidth: 0,
  },
  participantRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.75rem',
    textAlign: 'left',
    minWidth: 0,
  },
  flag: {
    width: '18px',
    height: '12px',
    borderRadius: '2px',
    opacity: 0.8,
    flexShrink: 0,
  },
  aliasText: (alias: string | null) => {
    const isSpecial = alias === 'Bye' || alias === 'Por determinar' || !alias;
    return {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: isSpecial ? 'rgba(255, 255, 255, 0.35)' : '#fff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  },
  scoreCenterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1.5rem',
    flexShrink: 0,
  },
  scoreWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  scoreBoxLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  scoreBoxRight: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  scoreHyphen: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '700',
  },
  setScoreText: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg, #C4E866)',
  },
  legScoreText: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  vsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '0.4rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: '1px',
  },
  actionButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    paddingTop: '0.75rem',
    marginTop: '0.25rem',
  },
};

export default MatchCard;
