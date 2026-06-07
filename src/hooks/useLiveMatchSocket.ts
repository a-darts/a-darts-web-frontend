import { useEffect, useState, useRef } from 'react';
import { socketClientService } from '../services/socket.service';

export enum LiveMatchStatus {
    PLAYING,
    FINISHED,
}

export interface LiveMatchParticipant {
    remainingScore: number;
    stats: LiveMatchParticipantStats;
    setsWon: number;
    legsWon: number;
}

export interface LiveMatchParticipantStats {
    average: number;
    oneEighties: number;
    hundredFortyPlus: number;
    hundredPlus: number;
}

export interface LiveMatch {
    score: number;
    participant1: LiveMatchParticipant;
    participant2: LiveMatchParticipant;
    activePlayerIndex: number;
    throwerPlayerIndex: number;
    status: LiveMatchStatus;
}

interface UseLiveMatchSocketProps {
    boardShortId: string;
    matchId: string;
    initialData: LiveMatch | null;
    onSuspendedChange?: (suspended: boolean) => void;
    onCancelledChange?: (cancelled: boolean) => void;
}

export const useLiveMatchSocket = ({
    boardShortId,
    matchId,
    initialData,
    onSuspendedChange,
    onCancelledChange,
}: UseLiveMatchSocketProps) => {
    const [liveData, setLiveData] = useState<LiveMatch | null>(null);
    const [historyThrows, setHistoryThrows] = useState<any[]>([]);
    const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

    // Este Ref guardará de forma síncrona los legs totales para que el socket los lea sin reiniciarse
    const totalLegsRef = useRef<number>(0);

    // Sincronizar el liveData cuando los detalles iniciales de la API REST terminen de cargar
    useEffect(() => {
        if (initialData && !liveData) {
            setLiveData(initialData);
            // Inicializamos el ref con los legs ganados acumulados de la API
            totalLegsRef.current = initialData.participant1.legsWon + initialData.participant2.legsWon;
        }
    }, [initialData]);

    useEffect(() => {
        if (!boardShortId || !matchId) {
            setLiveData(null);
            setHistoryThrows([]);
            setIsLiveConnected(false);
            socketClientService.disconnect();
            return;
        }

        console.log(`[LiveMonitor Hook] Inicializando conexión para diana: ${boardShortId}`);

        // Función auxiliar para actualizar el estado
        const updateLiveDataFromThrow = (throwData: any) => {
            if (!throwData) return null;

            let updatedState: LiveMatch | null = null;

            setLiveData(prev => {
                updatedState = {
                    score: throwData.score ?? 0,
                    activePlayerIndex: throwData.activePlayerIndex ?? prev?.activePlayerIndex ?? 0,
                    throwerPlayerIndex: throwData.throwerPlayerIndex ?? prev?.throwerPlayerIndex ?? 0,
                    status: throwData.status ?? LiveMatchStatus.PLAYING,
                    participant1: {
                        remainingScore: throwData.participant1?.remainingScore ?? prev?.participant1.remainingScore ?? 501,
                        stats: throwData.participant1?.stats ?? prev?.participant1.stats ?? { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 },
                        setsWon: throwData.participant1?.setsWon ?? prev?.participant1.setsWon ?? 0,
                        legsWon: throwData.participant1?.legsWon ?? prev?.participant1.legsWon ?? 0,
                    },
                    participant2: {
                        remainingScore: throwData.participant2?.remainingScore ?? prev?.participant2.remainingScore ?? 501,
                        stats: throwData.participant2?.stats ?? prev?.participant2.stats ?? { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 },
                        setsWon: throwData.participant2?.setsWon ?? prev?.participant2.setsWon ?? 0,
                        legsWon: throwData.participant2?.legsWon ?? prev?.participant2.legsWon ?? 0,
                    }
                };

                totalLegsRef.current = updatedState.participant1.legsWon + updatedState.participant2.legsWon;

                return updatedState;
            });

            return updatedState;
        };

        socketClientService.connect(boardShortId, {
            onConnect: () => {
                setIsLiveConnected(true);
            },
            onMatchRestored: (data) => {
                console.log('[LiveMonitor Hook] Recibido restaurar partida', data);
                if (data.matchId === matchId && data.historyThrows) {
                    let currentLegsSum = 0;
                    const processedThrows = data.historyThrows.map((t: any) => {
                        const legIndex = currentLegsSum;
                        if (t.participant1?.remainingScore === 501 && t.participant2?.remainingScore === 501) {
                            currentLegsSum = (t.participant1?.legsWon || 0) + (t.participant2?.legsWon || 0);
                        }
                        return { ...t, legIndex };
                    });

                    setHistoryThrows(processedThrows);

                    if (processedThrows.length > 0) {
                        const latestThrow = processedThrows[processedThrows.length - 1];
                        updateLiveDataFromThrow(latestThrow);
                    }
                }
            },
            onScoreUpdateConfirmed: (data) => {
                console.log('[LiveMonitor Hook] Recibido score_update_confirmed', data);
                if (data.matchId === matchId) {
                    const currentLegIndex = totalLegsRef.current;
                    setHistoryThrows(prevThrows => {
                        const newThrowWithLeg = {
                            ...data.throwData,
                            legIndex: currentLegIndex
                        };
                        return [...prevThrows, newThrowWithLeg];
                    });
                    updateLiveDataFromThrow(data.throwData);
                }
            },
            onScoreUndoConfirmed: (data) => {
                console.log('[LiveMonitor Hook] Undo confirmado desde el servidor', data);
                if (data.matchId === matchId) {
                    let currentLegsSum = 0;
                    const processedThrows = data.historyThrows.map((t: any) => {
                        const legIndex = currentLegsSum;
                        if (t.participant1?.remainingScore === 501 && t.participant2?.remainingScore === 501) {
                            currentLegsSum = (t.participant1?.legsWon || 0) + (t.participant2?.legsWon || 0);
                        }
                        return { ...t, legIndex };
                    });

                    setHistoryThrows(processedThrows);

                    if (processedThrows.length > 0) {
                        const latestThrow = processedThrows[processedThrows.length - 1];
                        updateLiveDataFromThrow(latestThrow);
                    } else {
                        const resetState = {
                            score: 0,
                            activePlayerIndex: 0,
                            throwerPlayerIndex: 0,
                            status: LiveMatchStatus.PLAYING,
                            participant1: { remainingScore: 501, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 }, setsWon: 0, legsWon: 0 },
                            participant2: { remainingScore: 501, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 }, setsWon: 0, legsWon: 0 }
                        };
                        setLiveData(resetState);
                        totalLegsRef.current = 0;
                    }
                }
            },
            onScoreEditConfirmed: (data) => {
                console.log(`[LiveMonitor] Edición detectada remota para match: ${data.matchId}. Actualizando interfaz.`);
                if (data.matchId === matchId && data.historyThrows) {
                    let currentLegsSum = 0;
                    const processedThrows = data.historyThrows.map((t: any) => {
                        const legIndex = currentLegsSum;
                        if (t.participant1?.remainingScore === 501 && t.participant2?.remainingScore === 501) {
                            currentLegsSum = (t.participant1?.legsWon || 0) + (t.participant2?.legsWon || 0);
                        }
                        return { ...t, legIndex };
                    });

                    setHistoryThrows(processedThrows);
                    updateLiveDataFromThrow(data.throwData);

                    if (data.throwData.participant1 && data.throwData.participant2) {
                        totalLegsRef.current = data.throwData.participant1.legsWon + data.throwData.participant2.legsWon;
                    }
                }
            },
            onSwapStartingPlayerConfirmed: (data) => {
                console.log('[LiveMonitor Hook] Cambio en el jugador inicial:', data);
                if (data.matchId === matchId) {
                    setLiveData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            activePlayerIndex: prev.activePlayerIndex === 0 ? 1 : 0
                        };
                    });
                }
            },
            onMatchSuspended: (data) => {
                console.log('[LiveMonitor Hook] Partido suspendido:', data);
                if (data.matchId === matchId) {
                    onSuspendedChange?.(true);
                }
            },
            onMatchResumed: (data) => {
                console.log('[LiveMonitor Hook] Partido reanudado:', data);
                if (data.matchId === matchId) {
                    onSuspendedChange?.(false);
                }
            },
            onMatchCancelled: (data) => {
                console.log('[LiveMonitor Hook] Partido cancelado:', data);
                if (data.matchId === matchId) {
                    onCancelledChange?.(true);
                }
            },
            onMatchAssigned: (data) => {
                console.log('[LiveMonitor Hook] Partida asignada a esta diana:', data);
                if (data.matchId === matchId) {
                    const defaultState: LiveMatch = {
                        score: 0,
                        activePlayerIndex: 0,
                        throwerPlayerIndex: 0,
                        status: LiveMatchStatus.PLAYING,
                        participant1: { remainingScore: 501, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 }, setsWon: 0, legsWon: 0 },
                        participant2: { remainingScore: 501, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 }, setsWon: 0, legsWon: 0 }
                    };
                    setLiveData(defaultState);
                    setHistoryThrows([]);
                    totalLegsRef.current = 0;
                }
            },
            onMatchUnassigned: () => {
                console.log('[LiveMonitor Hook] Partida desasignada de esta diana.');
                setLiveData(null);
                setHistoryThrows([]);
                totalLegsRef.current = 0;
            },
            onDisconnect: (reason) => {
                console.warn('[LiveMonitor Hook] Socket desconectado:', reason);
                setIsLiveConnected(false);
            },
            onConnectError: (err) => {
                console.error('[LiveMonitor Hook] Error de conexión:', err.message);
            }
        });

        return () => {
            console.log('[LiveMonitor Hook] Limpiando escuchas y cerrando socket...');
            socketClientService.disconnect();
        };
    }, [boardShortId, matchId]);

    return { liveData, historyThrows, isLiveConnected };
};
