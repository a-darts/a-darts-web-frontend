import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

// Reutilizamos las interfaces/enums necesarios
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

        const handleDataUpdate = (data: { matchId: string; throwData: any }) => {
            if (data.matchId === matchId && data.throwData) {
                setLiveData(prev => ({
                    score: data.throwData.score ?? 0,
                    activePlayerIndex: data.throwData.activePlayerIndex ?? prev?.activePlayerIndex ?? 0,
                    status: data.throwData.status ?? LiveMatchStatus.PLAYING,
                    participant1: {
                        remainingScore: data.throwData.participant1?.remainingScore ?? prev?.participant1.remainingScore ?? 501,
                        setsWon: data.throwData.participant1?.setsWon ?? prev?.participant1.setsWon ?? 0,
                        legsWon: data.throwData.participant1?.legsWon ?? prev?.participant1.legsWon ?? 0,
                    },
                    participant2: {
                        remainingScore: data.throwData.participant2?.remainingScore ?? prev?.participant2.remainingScore ?? 501,
                        setsWon: data.throwData.participant2?.setsWon ?? prev?.participant2.setsWon ?? 0,
                        legsWon: data.throwData.participant2?.legsWon ?? prev?.participant2.legsWon ?? 0,
                    }
                }));
            }
        };

        socket.on('initial_state', (data) => {
            console.log('[LiveMonitor Hook] ¡Estado inicial de Redis recibido!', data);
            handleDataUpdate(data);
        });

        socket.on('score_update', (data) => {
            console.log('[LiveMonitor Hook] ¡Evento score_update recibido!', data);
            handleDataUpdate(data);
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

    return { liveData, isLiveConnected };
};
