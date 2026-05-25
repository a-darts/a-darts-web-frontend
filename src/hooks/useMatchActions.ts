import { useState } from 'react';
import { tournamentService, Match } from '../services/tournament.service'; // Ajusta la ruta si es necesario
import { useToast } from '../context/ToastContext';

interface UseMatchActionsProps {
    matches: Match[];
    onSuccess: () => Promise<void> | void;
}

export const useMatchActions = ({ matches, onSuccess }: UseMatchActionsProps) => {
    const { showToast } = useToast();

    // Assign board modal states
    const [isAssignBoardModalOpen, setIsAssignBoardModalOpen] = useState(false);
    const [assigningMatchId, setAssigningMatchId] = useState<string | null>(null);
    const [newBoardValue, setNewBoardValue] = useState('');
    const [assigningBoardLoading, setAssigningBoardLoading] = useState(false);

    // Add result modal states
    const [isAddResultModalOpen, setIsAddResultModalOpen] = useState(false);
    const [addingResultMatchId, setAddingResultMatchId] = useState<string | null>(null);
    const [p1Sets, setP1Sets] = useState<number>(0);
    const [p1Legs, setP1Legs] = useState<number>(0);
    const [p2Sets, setP2Sets] = useState<number>(0);
    const [p2Legs, setP2Legs] = useState<number>(0);
    const [addingResultLoading, setAddingResultLoading] = useState(false);

    const handleStartMatch = async (matchId: string) => {
        try {
            await tournamentService.startMatch(matchId);
            showToast('Partida iniciada con éxito.', 'success');
            await onSuccess();
        } catch (err: any) {
            console.error('Error starting match:', err);
            showToast(err.message || 'Error al iniciar la partida.', 'error');
        }
    };

    const handleSuspendMatch = async (matchId: string) => {
        try {
            await tournamentService.suspendMatch(matchId);
            showToast('Partida suspendida con éxito.', 'success');
            await onSuccess();
        } catch (err: any) {
            console.error('Error suspending match:', err);
            showToast(err.message || 'Error al suspender la partida.', 'error');
        }
    };

    const handleResumeMatch = async (matchId: string) => {
        try {
            await tournamentService.resumeMatch(matchId);
            showToast('Partida reanudada con éxito.', 'success');
            await onSuccess();
        } catch (err: any) {
            console.error('Error resuming match:', err);
            showToast(err.message || 'Error al reanudar la partida.', 'error');
        }
    };

    const handleAssignBoard = (matchId: string) => {
        setAssigningMatchId(matchId);
        setNewBoardValue('');
        setIsAssignBoardModalOpen(true);
    };

    const handleConfirmAssignBoard = async () => {
        if (!assigningMatchId) return;

        const boardNum = Number(newBoardValue.trim());
        if (!newBoardValue.trim() || isNaN(boardNum) || boardNum <= 0) {
            showToast('Por favor, introduce un número de diana válido mayor que 0.', 'error');
            return;
        }

        const match = matches.find(m => m.id === assigningMatchId);
        if (!match) return;

        try {
            setAssigningBoardLoading(true);
            if (match.boardNumber !== null) {
                await tournamentService.reassignMatchBoard(assigningMatchId, boardNum);
            } else {
                await tournamentService.assignMatchBoard(assigningMatchId, boardNum);
            }
            showToast(`Diana ${boardNum} asignada con éxito.`, 'success');
            setIsAssignBoardModalOpen(false);
            await onSuccess();
        } catch (err: any) {
            console.error('Error assigning board:', err);
            showToast(err.message || 'Error al asignar la diana.', 'error');
        } finally {
            setAssigningBoardLoading(false);
        }
    };

    const handleAddResult = (matchId: string) => {
        setAddingResultMatchId(matchId);
        setP1Sets(0);
        setP1Legs(0);
        setP2Sets(0);
        setP2Legs(0);
        setIsAddResultModalOpen(true);
    };

    const handleConfirmAddResult = async () => {
        if (!addingResultMatchId) return;

        try {
            setAddingResultLoading(true);
            await tournamentService.addMatchResult(addingResultMatchId, {
                p1Sets,
                p1Legs,
                p2Sets,
                p2Legs
            });
            showToast('Resultado añadido con éxito.', 'success');
            setIsAddResultModalOpen(false);
            await onSuccess();
        } catch (err: any) {
            console.error('Error adding result:', err);
            showToast(err.message || 'Error al añadir el resultado.', 'error');
        } finally {
            setAddingResultLoading(false);
        }
    };

    return {
        // Handlers directos
        handleStartMatch,
        handleSuspendMatch,
        handleResumeMatch,
        handleAssignBoard,
        handleConfirmAssignBoard,
        handleAddResult,
        handleConfirmAddResult,
        // Estados y setters para Diana
        isAssignBoardModalOpen,
        setIsAssignBoardModalOpen,
        newBoardValue,
        setNewBoardValue,
        assigningBoardLoading,
        // Estados y setters para Resultados
        isAddResultModalOpen,
        setIsAddResultModalOpen,
        p1Sets,
        setP1Sets,
        p1Legs,
        setP1Legs,
        p2Sets,
        setP2Sets,
        p2Legs,
        setP2Legs,
        addingResultLoading
    };
};
