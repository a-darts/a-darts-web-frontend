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
            if (!throwData) return;

            setLiveData(prev => ({
                score: throwData.score ?? 0,
                activePlayerIndex: throwData.activePlayerIndex ?? prev?.activePlayerIndex ?? 0,
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
            }));
        };

        // MODIFICADO: Evento de estado inicial del servidor
        socket.on('initial_state', (data: { matchId: string; historyThrows?: any[] }) => {
            console.log('[LiveMonitor Hook] ¡Estado inicial de Redis recibido!', data);

            if (data.matchId === matchId && data.historyThrows) {
                // Seteamos todo el array de tiradas guardadas en este leg
                setHistoryThrows(data.historyThrows);

                // Si hay tiros en el historial, usamos el último para reflejar las puntuaciones actuales
                if (data.historyThrows.length > 0) {
                    const latestThrow = data.historyThrows[data.historyThrows.length - 1];
                    updateLiveDataFromThrow(latestThrow);
                }
            }
        });

        // MODIFICADO: Evento de actualización instantánea de tiro
        socket.on('score_update', (data: { matchId: string; throwData: any; historyThrows?: any[] }) => {
            console.log('[LiveMonitor Hook] ¡Evento score_update recibido!', data);

            if (data.matchId === matchId) {
                // Actualizamos el marcador instantáneo principal
                updateLiveDataFromThrow(data.throwData);

                // Si el backend envió la lista completa actualizada del leg, la machacamos en el estado
                if (data.historyThrows) {
                    setHistoryThrows(data.historyThrows);
                } else {
                    // Fallback seguro: si no viene el array entero, acumulamos de forma reactiva local
                    setHistoryThrows(prev => [...prev, data.throwData]);
                }
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
    }, [boardId, matchId]);

    // Retornamos también el array historyThrows hacia la vista del monitor web
    return { liveData, historyThrows, isLiveConnected };
};
