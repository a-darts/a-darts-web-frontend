import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

export enum LiveMatchStatus {
    PLAYING,
    FINISHED,
}

export interface LiveMatchParticipant {
    remainingScore: number;
    setsWon: number;
    legsWon: number;
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
    boardId: string;
    matchId: string;
    initialData: LiveMatch | null;
}

export const useLiveMatchSocket = ({ boardId, matchId, initialData }: UseLiveMatchSocketProps) => {
    const [liveData, setLiveData] = useState<LiveMatch | null>(null);
    const [historyThrows, setHistoryThrows] = useState<any[]>([]); // <-- NUEVO: Estado para el historial del Leg
    const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

    // Sincronizar el liveData cuando los detalles iniciales de la API REST terminen de cargar
    useEffect(() => {
        if (initialData && !liveData) {
            setLiveData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        if (!boardId || !matchId) return;

        console.log(`[LiveMonitor Hook] Inicializando conexión para diana: ${boardId}`);
        const socketUrl = new URL(SOCKET_URL).origin;

        const socket: Socket = io(socketUrl, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            forceNew: true
        });

        socket.on('connect', () => {
            console.log(`[LiveMonitor Hook] ¡Conectado con éxito! ID: ${socket.id}`);
            setIsLiveConnected(true);
            socket.emit('join_board', boardId);
        });

        // Función auxiliar para actualizar el estado del partido en base a un throwData (tirada única)
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
                        setsWon: throwData.participant1?.setsWon ?? prev?.participant1.setsWon ?? 0,
                        legsWon: throwData.participant1?.legsWon ?? prev?.participant1.legsWon ?? 0,
                    },
                    participant2: {
                        remainingScore: throwData.participant2?.remainingScore ?? prev?.participant2.remainingScore ?? 501,
                        setsWon: throwData.participant2?.setsWon ?? prev?.participant2.setsWon ?? 0,
                        legsWon: throwData.participant2?.legsWon ?? prev?.participant2.legsWon ?? 0,
                    }
                };
                return updatedState;
            });

            return updatedState;
        };

        socket.on('match_restored', (data: { matchId: string; historyThrows?: any[] }) => {
            console.log('[LiveMonitor Hook] Recibido restaurar partida', data);

            if (data.matchId === matchId && data.historyThrows) {
                let currentLegsSum = 0;
                const processedThrows = data.historyThrows.map((t: any) => {
                    const legIndex = currentLegsSum;
                    // Si este tiro cerró un Leg, el próximo tiro pertenecerá al siguiente index
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
        });

        socket.on('score_update', (data: { matchId: string; throwData: any; }) => {
            console.log('[LiveMonitor Hook] Recibido score_update', data);

            if (data.matchId === matchId) {
                // 1. Conseguimos el estado actual del juego antes del impacto del tiro para saber en qué leg estamos
                setHistoryThrows(prevThrows => {
                    // Calculamos cuál es el legIndex actual del marcador real en pantalla
                    const currentLegIndex = liveData
                        ? (liveData.participant1.legsWon + liveData.participant2.legsWon)
                        : 0;

                    // Adjuntamos la propiedad legIndex al tiro entrante
                    const newThrowWithLeg = {
                        ...data.throwData,
                        legIndex: currentLegIndex
                    };

                    return [...prevThrows, newThrowWithLeg];
                });

                // 2. Transicionamos el marcador de la UI (Si este tiro da un leg, los contadores suben a 501)
                updateLiveDataFromThrow(data.throwData);
            }
        });

        socket.on('connect_error', (err) => {
            console.error('[LiveMonitor Hook] Error de conexión:', err.message);
        });

        socket.on('disconnect', (reason) => {
            console.warn('[LiveMonitor Hook] Socket desconectado:', reason);
            setIsLiveConnected(false);
        });

        return () => {
            console.log('[LiveMonitor Hook] Limpiando escuchas y cerrando socket...');
            socket.off('connect');
            socket.off('initial_state');
            socket.off('score_update');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [boardId, matchId, liveData]);

    // Retornamos también el array historyThrows hacia la vista del monitor web
    return { liveData, historyThrows, isLiveConnected };
};
