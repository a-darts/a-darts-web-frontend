import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Match, MatchStatus, tournamentService } from '../services/tournament.service';
import { SOCKET_URL } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

interface LiveMatchMonitorScreenProps {
    matchId?: string;
    boardId?: string;
    onBack?: () => void;
}


interface LiveMatch {
    score: number;
    participant1: LiveMatchParticipant;
    participant2: LiveMatchParticipant;
    activePlayerIndex: number;
    status: LiveMatchStatus;
}

interface LiveMatchParticipant {
    remainingScore: number;
    setsWon: number;
    legsWon: number;
}

enum LiveMatchStatus {
    PLAYING,
    FINISHED,
}



const LiveMatchMonitorScreen: React.FC<LiveMatchMonitorScreenProps> = ({
    matchId: propsMatchId,
    boardId: propsBoardId,
    onBack,
}) => {
    const { matchId: urlMatchId, boardId: urlBoardId } = useParams<{ matchId: string; boardId: string }>();
    const navigate = useNavigate();

    const matchId = propsMatchId || urlMatchId || '';
    const boardId = propsBoardId || urlBoardId || 'default_room';

    // Manejador por si se entra por URL directa y no existe el callback 'onBack'
    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1); // Regresa a la página anterior en el historial del navegador
        }
    };

    const [match, setMatch] = useState<Match | null>(null); // Datos estáticos del partido
    const [liveData, setLiveData] = useState<LiveMatch | null>(null); // Datos recibidos del socket

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

    // 1. Cargar datos iniciales del partido
    useEffect(() => {
        const fetchMatchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await tournamentService.getMatchById(matchId);
                setMatch(data);
                setLiveData({
                    score: 0,
                    activePlayerIndex: 0,
                    status: LiveMatchStatus.PLAYING,
                    participant1: {
                        remainingScore: 501, // MIRAR: cambiar
                        setsWon: data.matchScore?.participant1?.setsWon || 0,
                        legsWon: data.matchScore?.participant1?.legsWon || 0,
                    },
                    participant2: {
                        remainingScore: 501, // MIRAR: cambiar
                        setsWon: data.matchScore?.participant2?.setsWon || 0,
                        legsWon: data.matchScore?.participant2?.legsWon || 0,
                    }
                });
                setError(null);
            } catch (err: any) {
                console.error('Error fetching match via service:', err);
                setError(err.message || 'Error al cargar los datos del partido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatchDetails();
    }, [matchId]);

    // 2. Conexión en tiempo real al Socket del Servidor
    useEffect(() => {
        console.log(`[LiveMonitor] Inicializando conexión para diana: ${boardId}`);

        // Inicializar socket con reconexión automática y forzando WebSockets si es necesario
        const socket: Socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true
        });

        socket.on('connect', () => {
            console.log(`[LiveMonitor] ¡Conectado con éxito! ID: ${socket.id}`);
            setIsLiveConnected(true);
            // Unirse a la sala lógica
            socket.emit('join_board', boardId);
        });

        // Escuchar actualizaciones de puntuación en directo
        socket.on('score_update', (data: { matchId: string; throwData: any }) => {
            console.log('[LiveMonitor] ¡Evento score_update recibido en Web!', data);

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
        });

        socket.on('connect_error', (err) => {
            console.error('[LiveMonitor] Error de conexión Socket:', err.message);
        });

        socket.on('disconnect', (reason) => {
            console.warn('[LiveMonitor] Socket desconectado por el motivo:', reason);
            setIsLiveConnected(false);
        });

        // Limpieza al desmontar la pantalla REALMENTE
        return () => {
            console.log('[LiveMonitor] Desmontando hook. Cerrando socket...');
            socket.off('connect');
            socket.off('score_update');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [boardId, matchId]);

    if (isLoading) return <div style={styles.centerContainer}>Cargando estado del partido...</div>;
    if (error) return <div style={styles.centerContainer}>Error: {error}</div>;
    if (!match || !liveData) return <div style={styles.centerContainer}>No se encontró el partido.</div>;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={handleBackClick} style={styles.backButton}>← Volver</button>
                <div style={styles.liveIndicator}>
                    <div style={{ ...styles.dot, backgroundColor: isLiveConnected ? '#4ade80' : '#f87171' }} />
                    <span>{isLiveConnected ? 'EN VIVO' : 'DESCONECTADO'}</span>
                </div>
            </div>

            <h2 style={styles.title}>Marcador en Tiempo Real</h2>

            {/* Marcador Principal */}
            <div style={styles.scoreboard}>
                {/* JUGADOR 1 */}
                <div style={{
                    ...styles.playerSection,
                    border: liveData.activePlayerIndex === 0 ? '2px solid #fbbf24' : '2px solid transparent',
                    borderRadius: '0.5rem', padding: '1rem'
                }}>
                    <span style={styles.playerName}>{match.participant1?.alias || 'Jugador 1'}</span>
                    <span style={styles.x01Score}>{liveData.participant1.remainingScore} pts</span>
                    <span style={styles.legs}>{liveData.participant1.legsWon} Legs</span>
                </div>

                <div style={styles.vsContainer}>VS</div>

                {/* JUGADOR 2 */}
                <div style={{
                    ...styles.playerSection,
                    border: liveData.activePlayerIndex === 1 ? '2px solid #fbbf24' : '2px solid transparent',
                    borderRadius: '0.5rem', padding: '1rem'
                }}>
                    <span style={styles.playerName}>{match.participant2?.alias || 'Jugador 2'}</span>
                    <span style={styles.x01Score}>{liveData.participant2.remainingScore} pts</span>
                    <span style={styles.legs}>{liveData.participant2.legsWon} Legs</span>
                </div>
            </div>

            {/* Alerta de último tiro */}
            <div style={styles.liveAlertContainer}>
                <span style={styles.alertLabel}>ÚLTIMA PUNTUACIÓN RECIBIDA:</span>
                <div style={styles.scoreDisplay}>
                    {liveData.score > 0 ? `${liveData.score} Puntos` : 'Esperando tiro...'}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '2rem', backgroundColor: '#121212', color: 'white', minHeight: '100vh' },
    centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#121212' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    backButton: { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '1rem' },
    liveIndicator: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' },
    dot: { width: '10px', height: '10px', borderRadius: '50%' },
    title: { textAlign: 'center', marginBottom: '2rem', fontWeight: '500' },
    scoreboard: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' },
    playerSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
    playerName: { fontSize: '1.5rem', fontWeight: 'bold' },
    legs: { backgroundColor: '#2c2c2c', padding: '0.25rem 1rem', borderRadius: '0.5rem', fontSize: '1.1rem', color: '#4ade80' },
    vsContainer: { fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' },
    liveAlertContainer: { marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
    alertLabel: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' },
    scoreDisplay: { fontSize: '3.5rem', fontWeight: 'bold', color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.3)' },
    x01Score: { fontSize: '2.5rem', color: '#60a5fa', fontWeight: 'bold' },
};

export default LiveMatchMonitorScreen;
