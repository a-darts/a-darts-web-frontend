import React, { useState } from 'react';
import { BracketParticipant } from './BracketMatch';
import { getFederationFlag } from '../utils/tournament.utils';

interface BracketMatchEditableProps {
  player1: BracketParticipant;
  player2: BracketParticipant;
  position1: number;
  position2: number;
  onDropPlayer: (positionIndex: number, participantId: string) => void;
  onClearPlayer: (positionIndex: number) => void;
  onMovePlayer: (fromIndex: number, toIndex: number) => void;
  selectedPlayerToPlace: { id: string; alias: string; federation: string } | null;
}

const BracketMatchEditable: React.FC<BracketMatchEditableProps> = ({
  player1,
  player2,
  position1,
  position2,
  onDropPlayer,
  onClearPlayer,
  onMovePlayer,
  selectedPlayerToPlace,
}) => {
  const [dragOver1, setDragOver1] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);

  const idx1 = position1 - 1;
  const idx2 = position2 - 1;

  const hasPlayer1 = !!(player1.alias && player1.alias !== 'Bye' && player1.alias !== 'Por determinar');
  const hasPlayer2 = !!(player2.alias && player2.alias !== 'Bye' && player2.alias !== 'Por determinar');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (slot: 1 | 2) => {
    if (slot === 1) setDragOver1(true);
    else setDragOver2(true);
  };

  const handleDragLeave = (slot: 1 | 2) => {
    if (slot === 1) setDragOver1(false);
    else setDragOver2(false);
  };

  const handleDrop = (e: React.DragEvent, slot: 1 | 2) => {
    e.preventDefault();
    const targetIdx = slot === 1 ? idx1 : idx2;
    setDragOver1(false);
    setDragOver2(false);

    // Check if dragging from the sidebar (participantId)
    const participantId = e.dataTransfer.getData('participantId');
    if (participantId) {
      onDropPlayer(targetIdx, participantId);
      return;
    }

    // Check if dragging from another slot (sourcePositionIndex)
    const sourcePositionIndexStr = e.dataTransfer.getData('sourcePositionIndex');
    if (sourcePositionIndexStr !== '') {
      const sourceIdx = parseInt(sourcePositionIndexStr, 10);
      if (sourceIdx !== targetIdx) {
        onMovePlayer(sourceIdx, targetIdx);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, sourceIdx: number) => {
    e.dataTransfer.setData('sourcePositionIndex', String(sourceIdx));
  };

  const handleSlotClick = (targetIdx: number) => {
    if (selectedPlayerToPlace) {
      onDropPlayer(targetIdx, selectedPlayerToPlace.id);
    }
  };

  const renderSlot = (
    player: BracketParticipant,
    position: number,
    slotNum: 1 | 2,
    hasPlayer: boolean,
    dragOver: boolean,
    setDragOver: (val: boolean) => void
  ) => {
    const targetIdx = position - 1;
    const isFirst = slotNum === 1;

    // Pulse effect if we are selected to place a player and slot is open or we want to overwrite
    const pulseStyle: React.CSSProperties = selectedPlayerToPlace
      ? {
        animation: 'slotPulse 1.5s infinite ease-in-out',
        cursor: 'pointer',
        borderColor: 'rgba(196, 232, 102, 0.4)',
      }
      : {};

    const containerStyle: React.CSSProperties = {
      ...styles.slotRow,
      borderBottom: isFirst ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      ...(dragOver ? styles.slotDragOver : {}),
      ...pulseStyle,
    };

    if (!hasPlayer) {
      return (
        <div
          style={containerStyle}
          onDragOver={handleDragOver}
          onDragEnter={() => handleDragEnter(slotNum)}
          onDragLeave={() => handleDragLeave(slotNum)}
          onDrop={(e) => handleDrop(e, slotNum)}
          onClick={() => handleSlotClick(targetIdx)}
        >
          <div style={styles.emptySlotContent}>
            <span style={styles.positionNumber}>{position}</span>
            <div style={styles.dashedBorder}>
              <span style={styles.plusIcon}>+</span>
              <span style={styles.placeholderText}>
                {selectedPlayerToPlace ? `Colocar a ${selectedPlayerToPlace.alias}` : 'Vacío'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          ...containerStyle,
          cursor: 'grab',
        }}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, targetIdx)}
        onDragOver={handleDragOver}
        onDragEnter={() => handleDragEnter(slotNum)}
        onDragLeave={() => handleDragLeave(slotNum)}
        onDrop={(e) => handleDrop(e, slotNum)}
        onClick={() => handleSlotClick(targetIdx)}
      >
        <div style={styles.playerSlotContent}>
          <div style={styles.playerInfo}>
            <span style={styles.positionNumber}>{position}</span>
            <div style={styles.aliasFederation}>
              {player.federation && player.federation !== 'N/A' && (
                <img
                  src={getFederationFlag(player.federation) || ''}
                  alt={player.federation}
                  style={styles.flag}
                />
              )}
              <span style={styles.alias}>{player.alias}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering slot clicks
              onClearPlayer(targetIdx);
            }}
            style={styles.clearButton}
            title="Quitar jugador"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.matchCard}>
      <style>
        {`
          @keyframes slotPulse {
            0% { background-color: rgba(196, 232, 102, 0); box-shadow: inset 0 0 0 1px rgba(196, 232, 102, 0.1); }
            50% { background-color: rgba(196, 232, 102, 0.05); box-shadow: inset 0 0 10px rgba(196, 232, 102, 0.15), inset 0 0 0 1px rgba(196, 232, 102, 0.4); }
            100% { background-color: rgba(196, 232, 102, 0); box-shadow: inset 0 0 0 1px rgba(196, 232, 102, 0.1); }
          }
        `}
      </style>
      <div style={styles.container}>
        {renderSlot(player1, position1, 1, hasPlayer1, dragOver1, setDragOver1)}
        {renderSlot(player2, position2, 2, hasPlayer2, dragOver2, setDragOver2)}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    width: '280px',
    flexShrink: 0,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  slotRow: {
    padding: '0.6rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    minHeight: '52px',
    transition: 'all 0.2s ease',
  },
  slotDragOver: {
    backgroundColor: 'rgba(196, 232, 102, 0.08) !important',
    borderColor: 'var(--btn-primary-bg) !important',
    borderStyle: 'dashed',
  },
  emptySlotContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
  },
  dashedBorder: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexGrow: 1,
    padding: '0.35rem 0.5rem',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.005)',
  },
  plusIcon: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '500',
  },
  playerSlotContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  positionNumber: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg)',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196, 232, 102, 0.08)',
    borderRadius: '6px',
    flexShrink: 0,
    border: '1px solid rgba(196, 232, 102, 0.15)',
  },
  aliasFederation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  alias: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
  },
  flag: {
    width: '18px',
    height: '12px',
    borderRadius: '2px',
    opacity: 0.85,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: 'rgba(255, 255, 255, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'normal',
    padding: 0,
    lineHeight: '20px',
    transition: 'all 0.15s ease',
  },
};

// Add CSS hover style for close button using standard JS trick
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    button[title="Quitar jugador"]:hover {
      background-color: rgba(239, 68, 68, 0.15) !important;
      color: #ef4444 !important;
      border-color: rgba(239, 68, 68, 0.25) !important;
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);
}

export default BracketMatchEditable;
