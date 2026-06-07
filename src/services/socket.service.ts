import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './api';

export interface SocketMatchEvents {
    onMatchRestored?: (data: { matchId: string; historyThrows?: any[] }) => void;
    onScoreUpdateConfirmed?: (data: { matchId: string; throwData: any; }) => void;
    onScoreUndoConfirmed?: (data: { matchId: string; historyThrows: any[] }) => void;
    onScoreEditConfirmed?: (data: { matchId: string, throwData: any, historyThrows: any[] }) => void;
    onSwapStartingPlayerConfirmed?: (data: { matchId: string }) => void;
    onMatchSuspended?: (data: { matchId: string }) => void;
    onMatchResumed?: (data: { matchId: string }) => void;
    onMatchCancelled?: (data: { matchId: string }) => void;
    onMatchAssigned?: (data: { matchId: string; status: string }) => void;
    onMatchUnassigned?: (data: { matchId?: string }) => void;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onConnectError?: (err: Error) => void;
}

class SocketClientService {
    private socket: Socket | null = null;

    connect(boardShortId: string, events: SocketMatchEvents): void {
        if (this.socket) {
            this.disconnect();
        }

        const socketUrl = new URL(SOCKET_URL).origin;

        this.socket = io(socketUrl, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            forceNew: true
        });

        this.socket.on('connect', () => {
            console.log(`[SocketClientService] ¡Conectado con éxito! ID: ${this.socket?.id}`);
            this.socket?.emit('join_board', boardShortId);
            events.onConnect?.();
        });

        this.socket.on('match_restored', (data) => events.onMatchRestored?.(data));
        this.socket.on('score_update_confirmed', (data) => events.onScoreUpdateConfirmed?.(data));
        this.socket.on('score_undo_confirmed', (data) => events.onScoreUndoConfirmed?.(data));
        this.socket.on('score_edit_confirmed', (data) => events.onScoreEditConfirmed?.(data));
        this.socket.on('swap_starting_player_confirmed', (data) => events.onSwapStartingPlayerConfirmed?.(data));
        this.socket.on('match_suspended', (data) => events.onMatchSuspended?.(data));
        this.socket.on('match_resumed', (data) => events.onMatchResumed?.(data));
        this.socket.on('match_cancelled', (data) => events.onMatchCancelled?.(data));
        this.socket.on('match_assigned', (data) => events.onMatchAssigned?.(data));
        this.socket.on('match_unassigned', (data) => events.onMatchUnassigned?.(data));

        this.socket.on('connect_error', (err) => events.onConnectError?.(err));
        this.socket.on('disconnect', (reason) => events.onDisconnect?.(reason));
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('match_restored');
            this.socket.off('score_update_confirmed');
            this.socket.off('score_undo_confirmed');
            this.socket.off('score_edit_confirmed');
            this.socket.off('swap_starting_player_confirmed');
            this.socket.off('match_suspended');
            this.socket.off('match_resumed');
            this.socket.off('match_cancelled');
            this.socket.off('match_assigned');
            this.socket.off('match_unassigned');
            this.socket.off('connect_error');
            this.socket.off('disconnect');

            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketClientService = new SocketClientService();
