import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Match, tournamentService } from '../services/tournament.service';
import { API_BASE_URL } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

interface LiveMatchMonitorScreenProps {
    matchId?: string;
    boardId?: string;
    onBack?: () => void;
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

    const [match, setMatch] = useState<Match | null>(null);
    const [lastThrowScore, setLastThrowScore] = useState<number | null>(null);
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
        // Inicializar socket dedicado a esta vista
        const socket: Socket = io(API_BASE_URL);

        socket.on('connect', () => {
            console.log(`[LiveMonitor] Conectado con ID: ${socket.id}. Uniéndose a diana: ${boardId}`);
            setIsLiveConnected(true);
            // Unirse a la sala para empezar a recibir eventos
            socket.emit('join_board', boardId);
        });

        // Escuchar actualizaciones de puntuación en directo
        socket.on('score_update', (data: { matchId: string; throwData: any }) => {
            console.log('[LiveMonitor] Evento score_update recibido:', data);

            // Validamos que pertenezca al partido que estamos vigilando
            if (data.matchId === matchId && data.throwData) {
                // Almacenamos el score recibido para pintarlo
                setLastThrowScore(data.throwData.score);

                // OPCIONAL: Si tu backend devuelve las puntuaciones acumuladas en el throwData, 
                // puedes actualizar el estado visual del match aquí mismo de forma reactiva sin re-fetch:
                /*
                setMatch(prev => {
                   if (!prev) return prev;
                   return { ...prev, matchScore: data.throwData.currentMatchScore };
                });
                */
            }
        });

        socket.on('disconnect', () => {
            setIsLiveConnected(false);
        });

        // Limpieza al desmontar la pantalla (Cierra la conexión por completo)
        return () => {
            console.log('[LiveMonitor] Desconectando monitor en vivo.');
            socket.disconnect();
        };
    }, [boardId, matchId]);

    if (isLoading) return <div style={styles.centerContainer}>Cargando estado del partido...</div>;
    if (error) return <div style={styles.centerContainer}>Error: {error}</div>;
    if (!match) return <div style={styles.centerContainer}>No se encontró el partido.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={handleBackClick} style={styles.backButton}>← Volver</button>
                <div style={styles.liveIndicator}>
                    <div style={{ ...styles.dot, backgroundColor: isLiveConnected ? '#4ade80' : '#f87171' }} />
                    <span>{isLiveConnected ? 'EN VIVO' : 'DESCONECTADO'}</span>
                </div>
            </div>

            <h2 style={styles.title}>Marcador en Tiempo Real</h2>

            {/* Tarjeta de Enfrentamiento */}
            <div style={styles.scoreboard}>
                <div style={styles.playerSection}>
                    <span style={styles.playerName}>{match.participant1?.alias || 'Jugador 1'}</span>
                    <span style={styles.legs}>{match.matchScore?.participant1?.legsWon || 0} Legs</span>
                </div>

                <div style={styles.vsContainer}>VS</div>

                <div style={styles.playerSection}>
                    <span style={styles.playerName}>{match.participant2?.alias || 'Jugador 2'}</span>
                    <span style={styles.legs}>{match.matchScore?.participant2?.legsWon || 0} Legs</span>
                </div>
            </div>

            {/* Sección Dinámica: Muestra la puntuación de score_update instantáneamente */}
            <div style={styles.liveAlertContainer}>
                <span style={styles.alertLabel}>ÚLTIMA PUNTUACIÓN RECIBIDA:</span>
                <div style={styles.scoreDisplay}>
                    {lastThrowScore !== null ? `${lastThrowScore} Puntos` : 'Esperando tiro...'}
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
    scoreDisplay: { fontSize: '3.5rem', fontWeight: 'bold', color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.3)' }
};

export default LiveMatchMonitorScreen;
