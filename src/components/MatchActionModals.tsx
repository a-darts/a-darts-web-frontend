import React from 'react';
import Modal from './Modal';
import TextInput from './TextInput';

export interface MatchActionModalsProps {
  isAssignBoardModalOpen: boolean;
  setIsAssignBoardModalOpen: (open: boolean) => void;
  newBoardValue: string;
  setNewBoardValue: (val: string) => void;
  handleConfirmAssignBoard: () => void;
  assigningBoardLoading: boolean;

  isAddResultModalOpen: boolean;
  setIsAddResultModalOpen: (open: boolean) => void;
  p1Sets: number;
  setP1Sets: (val: number) => void;
  p1Legs: number;
  setP1Legs: (val: number) => void;
  p2Sets: number;
  setP2Sets: (val: number) => void;
  p2Legs: number;
  setP2Legs: (val: number) => void;
  handleConfirmAddResult: () => void;
  addingResultLoading: boolean;
}

const MatchActionModals: React.FC<MatchActionModalsProps> = ({
  isAssignBoardModalOpen, setIsAssignBoardModalOpen, newBoardValue, setNewBoardValue, handleConfirmAssignBoard, assigningBoardLoading,
  isAddResultModalOpen, setIsAddResultModalOpen, p1Sets, setP1Sets, p1Legs, setP1Legs, p2Sets, setP2Sets, p2Legs, setP2Legs, handleConfirmAddResult, addingResultLoading
}) => {
  return (
    <>
      <Modal
        isOpen={isAssignBoardModalOpen}
        onClose={() => setIsAssignBoardModalOpen(false)}
        title="Asignar Diana"
        description={
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Introduce el número de la diana donde se disputará este enfrentamiento.
            </p>
            <TextInput
              label="Número de diana"
              placeholder="Ej. 1, 2, 3..."
              type="number"
              min="1"
              value={newBoardValue}
              onChange={(e) => setNewBoardValue(e.target.value)}
              icon="Target"
              autoFocus
            />
          </div>
        }
        confirmLabel="Asignar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmAssignBoard}
        loading={assigningBoardLoading}
        confirmDisabled={!newBoardValue.trim()}
      />

      <Modal
        isOpen={isAddResultModalOpen}
        onClose={() => setIsAddResultModalOpen(false)}
        title="Añadir Resultado"
        description={
          <div style={{ marginTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Introduce el número de sets y legs ganados por cada jugador.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--btn-primary-bg, #C4E866)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jugador 1</span>

                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem' }}>
                  <TextInput
                    label="Sets Ganados"
                    type="number"
                    min="0"
                    value={p1Sets.toString()}
                    onChange={(e) => setP1Sets(Number(e.target.value))}
                    style={{ maxWidth: '140px' }}
                  />
                  <TextInput
                    label="Legs Ganados"
                    type="number"
                    min="0"
                    value={p1Legs.toString()}
                    onChange={(e) => setP1Legs(Number(e.target.value))}
                    style={{ maxWidth: '140px' }}
                  />
                </div>
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--btn-primary-bg, #C4E866)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jugador 2</span>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem' }}>
                  <TextInput
                    label="Sets Ganados"
                    type="number"
                    min="0"
                    value={p2Sets.toString()}
                    onChange={(e) => setP2Sets(Number(e.target.value))}
                    style={{ maxWidth: '140px' }}
                  />
                  <TextInput
                    label="Legs Ganados"
                    type="number"
                    min="0"
                    value={p2Legs.toString()}
                    onChange={(e) => setP2Legs(Number(e.target.value))}
                    style={{ maxWidth: '140px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        confirmLabel="Guardar Resultado"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmAddResult}
        loading={addingResultLoading}
        maxWidth='750px'
      />
    </>
  );
};

export default MatchActionModals;
