import { useEffect, useState, useRef } from 'react'; // <-- Importamos useRef
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
    boardShortId: string;
    matchId: string;
    initialData: LiveMatch | null;
}

export const useLiveMatchSocket = ({ boardShortId, matchId, initialData }: UseLiveMatchSocketProps) => {
    const [liveData, setLiveData] = useState<LiveMatch | null>(null);
    const [historyThrows, setHistoryThrows] = useState<any[]>([]);
    const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

    // NUEVO: Este Ref guardará de forma síncrona los legs totales para que el socket los lea sin reiniciarse
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
        if (!boardShortId || !matchId) return;

        console.log(`[LiveMonitor Hook] Inicializando conexión única para diana: ${boardShortId}`);
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
            socket.emit('join_board', boardShortId);
        });

        // Modificado: Ahora actualiza de forma segura el estado de React y el Ref al mismo tiempo
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

                // Guardamos los legs calculados en el Ref inmediatamente (operación síncrona y segura)
                totalLegsRef.current = updatedState.participant1.legsWon + updatedState.participant2.legsWon;

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
                // 1. Leemos el índice del leg directamente desde el Ref (evita depender de liveData)
                const currentLegIndex = totalLegsRef.current;

                setHistoryThrows(prevThrows => {
                    const newThrowWithLeg = {
                        ...data.throwData,
                        legIndex: currentLegIndex
                    };
                    return [...prevThrows, newThrowWithLeg];
                });

                // 2. Transicionamos el marcador e internamente se actualizará el Ref para la siguiente tirada
                updateLiveDataFromThrow(data.throwData);
            }
        });

        socket.on('score_undo_confirmed', (data: { matchId: string; historyThrows: any[] }) => {
            console.log('[LiveMonitor Hook] Undo confirmado desde el servidor', data);

            if (data.matchId === matchId) {
                let currentLegsSum = 0;

                // Procesamos el nuevo historial limpio de Redis
                const processedThrows = data.historyThrows.map((t: any) => {
                    const legIndex = currentLegsSum;
                    if (t.participant1?.remainingScore === 501 && t.participant2?.remainingScore === 501) {
                        currentLegsSum = (t.participant1?.legsWon || 0) + (t.participant2?.legsWon || 0);
                    }
                    return { ...t, legIndex };
                });

                // Actualizamos el array visual de tiradas
                setHistoryThrows(processedThrows);

                if (processedThrows.length > 0) {
                    // Si quedan tiradas en el Leg, el estado actual vuelve a ser el de la última tirada viva
                    const latestThrow = processedThrows[processedThrows.length - 1];
                    updateLiveDataFromThrow(latestThrow);
                } else {
                    // Si borramos la única tirada que había, restauramos al valor por defecto (501 inicial)
                    const resetState = {
                        score: 0,
                        activePlayerIndex: 0,
                        throwerPlayerIndex: 0,
                        status: LiveMatchStatus.PLAYING,
                        participant1: { remainingScore: 501, setsWon: 0, legsWon: 0 },
                        participant2: { remainingScore: 501, setsWon: 0, legsWon: 0 }
                    };
                    setLiveData(resetState);
                    totalLegsRef.current = 0;
                }
            }
        });

        socket.on('score_edit_confirmed', (data: { matchId: string, throwData: any, historyThrows: any[] }) => {
            console.log(`[LiveMonitor] Edición detectada remota para match: ${data.matchId}. Actualizando interfaz.`);

            if (data.matchId === matchId && data.historyThrows) {
                let currentLegsSum = 0;

                // 1. Procesamos el nuevo historial reconstruido inyectándole el legIndex correspondiente
                const processedThrows = data.historyThrows.map((t: any) => {
                    const legIndex = currentLegsSum;
                    // Si detectamos que es un reinicio de pierna (ambos en 501), avanzamos el índice de legs
                    if (t.participant1?.remainingScore === 501 && t.participant2?.remainingScore === 501) {
                        currentLegsSum = (t.participant1?.legsWon || 0) + (t.participant2?.legsWon || 0);
                    }
                    return { ...t, legIndex };
                });

                // 2. Seteamos el historial mapeado con sus respectivos legIndex correctos
                setHistoryThrows(processedThrows);

                // 3. Forzamos la actualización de los datos en vivo principales con la última tirada recalculada
                updateLiveDataFromThrow(data.throwData);

                // 4. Sincronizamos el contador de legs del ref por seguridad
                if (data.throwData.participant1 && data.throwData.participant2) {
                    totalLegsRef.current = data.throwData.participant1.legsWon + data.throwData.participant2.legsWon;
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
            socket.off('match_restored');
            socket.off('score_update');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [boardShortId, matchId]); // <--- ESTRICTO: Solo se vuelve a ejecutar si la diana o la partida cambian de ID.

    return { liveData, historyThrows, isLiveConnected };
};
