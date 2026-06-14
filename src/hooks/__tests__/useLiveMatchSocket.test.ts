import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveMatchSocket, LiveMatchStatus, LiveMatch } from '../useLiveMatchSocket';
import { socketClientService } from '../../services/socket.service';

// Mockear el servicio de sockets
vi.mock('../../services/socket.service', () => {
    return {
        socketClientService: {
            connect: vi.fn(),
            disconnect: vi.fn(),
        },
    };
});

describe('useLiveMatchSocket - Unit Tests', () => {
    const defaultProps = {
        boardShortId: 'BOARD-123',
        matchId: 'MATCH-999',
        initialData: null,
        onSuspendedChange: vi.fn(),
        onCancelledChange: vi.fn(),
    };

    // Estructura de datos para simular una partida limpia
    const sampleMatchData: LiveMatch = {
        score: 0,
        status: LiveMatchStatus.PLAYING,
        activePlayerIndex: 0,
        throwerPlayerIndex: 0,
        participant1: { remainingScore: 501, setsWon: 0, legsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
        participant2: { remainingScore: 501, setsWon: 0, legsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
    };

    // Referencia para capturar los callbacks que el hook registra al conectarse
    let capturedCallbacks: any = {};

    beforeEach(() => {
        vi.restoreAllMocks();
        capturedCallbacks = {};

        // Cada vez que el hook llame a connect(), guardamos los callbacks para disparar eventos manualmente
        vi.mocked(socketClientService.connect).mockImplementation((boardId, callbacks) => {
            capturedCallbacks = callbacks;
        });
    });

    // =========================================================================
    // 1. CONTROL DE CICLO DE VIDA Y FLUJOS INICIALES
    // =========================================================================
    it('debe limpiar el estado y desconectar si faltan los identificadores requeridos', () => {
        const { result } = renderHook(() => useLiveMatchSocket({ ...defaultProps, boardShortId: '', matchId: '' }));

        expect(result.current.liveData).toBeNull();
        expect(result.current.historyThrows).toEqual([]);
        expect(result.current.isLiveConnected).toBe(false);
        expect(socketClientService.disconnect).toHaveBeenCalled();
    });

    it('debe sincronizar e inicializar el estado cuando recibe el initialData de la API REST', () => {
        const { result, rerender } = renderHook(
            ({ initialData }) => useLiveMatchSocket({ ...defaultProps, initialData }),
            { initialProps: { initialData: null as LiveMatch | null } }
        );

        expect(result.current.liveData).toBeNull();

        // Rerenderizamos simulando que la petición HTTP finalizó
        rerender({ initialData: sampleMatchData });

        expect(result.current.liveData).toEqual(sampleMatchData);
    });

    it('debe ejecutar la desconexión del servicio cuando el componente se desmonta', () => {
        const { unmount } = renderHook(() => useLiveMatchSocket(defaultProps));
        unmount();
        expect(socketClientService.disconnect).toHaveBeenCalled();
    });

    // =========================================================================
    // 2. PRUEBAS DE EVENTOS DE SOCKET ENTRANTE (CALLBACKS)
    // =========================================================================

    it('debe cambiar isLiveConnected a true cuando se ejecuta el callback onConnect', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        act(() => {
            capturedCallbacks.onConnect();
        });

        expect(result.current.isLiveConnected).toBe(true);
    });

    it('debe procesar y mapear los legIndex correctamente en el evento onMatchRestored', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        const historyInput = [
            {
                score: 60,
                participant1: { remainingScore: 441, legsWon: 0, setsWon: 0, stats: { average: 60, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
                participant2: { remainingScore: 501, legsWon: 0, setsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
            },
            {
                score: 180,
                participant1: { remainingScore: 441, legsWon: 0, setsWon: 0, stats: { average: 50, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
                participant2: { remainingScore: 321, legsWon: 0, setsWon: 0, stats: { average: 180, oneEighties: 1, hundredFortyPlus: 1, hundredPlus: 1 } },
            },
            {
                score: 100,
                participant1: { remainingScore: 341, legsWon: 0, setsWon: 0, stats: { average: 80, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 321, legsWon: 0, setsWon: 0, stats: { average: 180, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
            },
            {
                score: 180,
                participant1: { remainingScore: 341, legsWon: 0, setsWon: 0, stats: { average: 80, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 141, legsWon: 0, setsWon: 0, stats: { average: 180, oneEighties: 2, hundredFortyPlus: 2, hundredPlus: 2 } },
            },
            {
                score: 41,
                participant1: { remainingScore: 300, legsWon: 0, setsWon: 0, stats: { average: 67, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 141, legsWon: 0, setsWon: 0, stats: { average: 180, oneEighties: 2, hundredFortyPlus: 2, hundredPlus: 2 } },
            },
            {
                score: 141,
                participant1: { remainingScore: 300, legsWon: 0, setsWon: 0, stats: { average: 67, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 0, legsWon: 1, setsWon: 0, stats: { average: 167, oneEighties: 2, hundredFortyPlus: 3, hundredPlus: 3 } },
            },
            {
                score: 0,
                participant1: { remainingScore: 501, legsWon: 0, setsWon: 0, stats: { average: 67, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 501, legsWon: 1, setsWon: 0, stats: { average: 167, oneEighties: 2, hundredFortyPlus: 3, hundredPlus: 3 } },
            },
            {
                score: 60,
                participant1: { remainingScore: 501, legsWon: 0, setsWon: 0, stats: { average: 67, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 1 } },
                participant2: { remainingScore: 441, legsWon: 1, setsWon: 0, stats: { average: 140.25, oneEighties: 2, hundredFortyPlus: 3, hundredPlus: 3 } },
            },
        ];

        act(() => {
            capturedCallbacks.onMatchRestored({ matchId: 'MATCH-999', historyThrows: historyInput });
        });

        // Verificamos que se inyectó el índice acumulativo correcto por leg
        expect(result.current.historyThrows[0].legIndex).toBe(0);
        expect(result.current.historyThrows[1].legIndex).toBe(0);
        expect(result.current.historyThrows[2].legIndex).toBe(0);
        expect(result.current.historyThrows[3].legIndex).toBe(0);
        expect(result.current.historyThrows[4].legIndex).toBe(0);
        expect(result.current.historyThrows[5].legIndex).toBe(0);
        expect(result.current.historyThrows[6].legIndex).toBe(0);
        expect(result.current.historyThrows[7].legIndex).toBe(1);
    });

    it('debe acumular lanzamientos y actualizar liveData en el evento onScoreUpdateConfirmed', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        const throwPayload = {
            matchId: 'MATCH-999',
            throwData: { score: 140, activePlayerIndex: 1, participant1: { remainingScore: 361, legsWon: 2 } }
        };

        act(() => {
            capturedCallbacks.onScoreUpdateConfirmed(throwPayload);
        });

        expect(result.current.historyThrows).toHaveLength(1);
        expect(result.current.historyThrows[0].score).toBe(140);
        expect(result.current.liveData?.participant1.remainingScore).toBe(361);
    });

    it('debe resetear a los valores iniciales por defecto en el evento onScoreUndoConfirmed si no quedan tiros', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        act(() => {
            // Pasamos un historial vacío indicando que se deshizo el único tiro existente
            capturedCallbacks.onScoreUndoConfirmed({ matchId: 'MATCH-999', historyThrows: [] });
        });

        expect(result.current.historyThrows).toEqual([]);
        expect(result.current.liveData?.participant1.remainingScore).toBe(501);
        expect(result.current.liveData?.status).toBe(LiveMatchStatus.PLAYING);
    });

    it('debe mutar el activePlayerIndex de forma reflejada al recibir onSwapStartingPlayerConfirmed', () => {
        // Inicializamos con datos previos para que no sea nulo
        const { result } = renderHook(() => useLiveMatchSocket({ ...defaultProps, initialData: sampleMatchData }));

        expect(result.current.liveData?.activePlayerIndex).toBe(0);

        act(() => {
            capturedCallbacks.onSwapStartingPlayerConfirmed({ matchId: 'MATCH-999' });
        });

        expect(result.current.liveData?.activePlayerIndex).toBe(1); // Conmutado de 0 a 1
    });

    // =========================================================================
    // 3. PRUEBAS DE EVENTOS SINDICALES Y NOTIFICACIONES (PROPS)
    // =========================================================================
    it('debe disparar la función onSuspendedChange ante eventos de suspensión y reanudación', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        act(() => {
            capturedCallbacks.onMatchSuspended({ matchId: 'MATCH-999' });
        });
        expect(defaultProps.onSuspendedChange).toHaveBeenCalledWith(true);

        act(() => {
            capturedCallbacks.onMatchResumed({ matchId: 'MATCH-999' });
        });
        expect(defaultProps.onSuspendedChange).toHaveBeenCalledWith(false);
    });

    it('debe disparar la función onCancelledChange si la partida se cancela de forma remota', () => {
        renderHook(() => useLiveMatchSocket(defaultProps));

        act(() => {
            capturedCallbacks.onMatchCancelled({ matchId: 'MATCH-999' });
        });
        expect(defaultProps.onCancelledChange).toHaveBeenCalledWith(true);
    });

    it('debe limpiar todo el estado de juego si el servidor envía onMatchUnassigned', () => {
        const { result } = renderHook(() => useLiveMatchSocket({ ...defaultProps, initialData: sampleMatchData }));

        expect(result.current.liveData).not.toBeNull();

        act(() => {
            capturedCallbacks.onMatchUnassigned();
        });

        expect(result.current.liveData).toBeNull();
        expect(result.current.historyThrows).toEqual([]);
    });

    it('debe cambiar isLiveConnected a false si el socket notifica una desconexión accidental', () => {
        const { result } = renderHook(() => useLiveMatchSocket(defaultProps));

        act(() => {
            capturedCallbacks.onConnect(); // Conectamos primero
            capturedCallbacks.onDisconnect('transport close'); // Desconexión forzada
        });

        expect(result.current.isLiveConnected).toBe(false);
    });
});
