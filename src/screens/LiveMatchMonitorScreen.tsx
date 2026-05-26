import React, { useEffect, useState, useRef } from 'react';
import { Match, tournamentService } from '../services/tournament.service';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveMatchSocket, LiveMatchStatus, LiveMatch } from '../hooks/useLiveMatchSocket';
import { io } from 'socket.io-client'; // Importante para capturar el nuevo payload extendido si tu hook está cerrado

// Inyección de fuentes
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

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

    const [match, setMatch] = useState<Match | null>(null);
    const [defaultInitialData, setDefaultInitialData] = useState<LiveMatch | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Estado local para almacenar la lista completa de tiradas del leg actual
    const historyEndRef = useRef<HTMLDivElement>(null);

    const { liveData, historyThrows, isLiveConnected } = useLiveMatchSocket({
        boardId,
        matchId,
        initialData: defaultInitialData
    });

    // Auto-scroll al último tiro recibido en la lista
    useEffect(() => {
        if (historyEndRef.current) {
            historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [historyThrows]);

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    useEffect(() => {
        const fetchMatchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await tournamentService.getMatchById(matchId);
                setMatch(data);

                setDefaultInitialData({
                    score: 0,
                    activePlayerIndex: 0,
                    status: LiveMatchStatus.PLAYING,
                    participant1: {
                        remainingScore: 501,
                        setsWon: data.matchScore?.participant1?.setsWon || 0,
                        legsWon: data.matchScore?.participant1?.legsWon || 0,
                    },
                    participant2: {
                        remainingScore: 501,
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

    // useEffect(() => {
    //     const fetchMatchDetails = async () => {
    //         try {
    //             setIsLoading(true);
    //             const data = await tournamentService.getMatchById(matchId);
    //             setMatch(data);

    //             setDefaultInitialData({
    //                 score: 0,
    //                 activePlayerIndex: 0,
    //                 status: LiveMatchStatus.PLAYING,
    //                 participant1: {
    //                     remainingScore: 501,
    //                     setsWon: data.matchScore?.participant1?.setsWon || 0,
    //                     legsWon: data.matchScore?.participant1?.legsWon || 0,
    //                 },
    //                 participant2: {
    //                     remainingScore: 501,
    //                     setsWon: data.matchScore?.participant2?.setsWon || 0,
    //                     legsWon: data.matchScore?.participant2?.legsWon || 0,
    //                 }
    //             });
    //             setError(null);
    //         } catch (err: any) {
    //             console.error('Error fetching match via service:', err);
    //             setError(err.message || 'Error al cargar los datos del partido');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchMatchDetails();
    // }, [matchId]);

    if (isLoading) return <div style={styles.centerContainer}>Cargando estado del partido...</div>;
    if (error) return <div style={styles.centerContainer}>Error: {error}</div>;
    if (!match || !liveData) return <div style={styles.centerContainer}>No se encontró el partido.</div>;

    const p1Name = match.participant1?.alias || 'Jugador 1';
    const p2Name = match.participant2?.alias || 'Jugador 2';

    return (
        <div style={styles.container}>
            {/* Header superior */}
            <div style={styles.header}>
                <button onClick={handleBackClick} style={styles.backButton}>← Volver</button>
                <div style={styles.liveIndicator}>
                    <div style={{
                        ...styles.dot,
                        backgroundColor: isLiveConnected ? '#BFE55F' : '#FF4C4C',
                    }} />
                    <span>{isLiveConnected ? 'TRANSMISIÓN EN VIVO' : 'DESCONECTADO'}</span>
                </div>
            </div>

            {/* Layout Principal Dividido en Marcador e Historial */}
            <div style={styles.mainContent}>

                {/* LADO IZQUIERDO: Marcadores Principales */}
                <div style={styles.scoreboardSide}>
                    <div style={styles.headerRow}>
                        {/* Jugador 1 Card */}
                        <div style={{
                            ...styles.playerCard,
                            ...(liveData.activePlayerIndex === 0 ? styles.playerCardActive : {})
                        }}>
                            <span style={styles.playerName}>{p1Name}</span>
                            <span style={{
                                ...styles.scoreLeftText,
                                ...(liveData.activePlayerIndex === 0 ? styles.scoreActiveText : {})
                            }}>
                                {liveData.participant1.remainingScore}
                            </span>
                        </div>

                        {/* Marcador Central de Stats */}
                        <div style={styles.statsCard}>
                            <div style={styles.statsSection}>
                                <span style={styles.statsRowText}>
                                    {liveData.participant1.legsWon} - {liveData.participant2.legsWon}
                                </span>
                                <span style={styles.statsLabel}>LEGS</span>
                            </div>

                            <div style={{ ...styles.statsSection, marginTop: '24px' }}>
                                <span style={styles.statsRowText}>
                                    {liveData.participant1.setsWon} - {liveData.participant2.setsWon}
                                </span>
                                <span style={styles.statsLabel}>SETS</span>
                            </div>
                        </div>

                        {/* Jugador 2 Card */}
                        <div style={{
                            ...styles.playerCard,
                            ...(liveData.activePlayerIndex === 1 ? styles.playerCardActive : {})
                        }}>
                            <span style={styles.playerName}>{p2Name}</span>
                            <span style={{
                                ...styles.scoreLeftText,
                                ...(liveData.activePlayerIndex === 1 ? styles.scoreActiveText : {})
                            }}>
                                {liveData.participant2.remainingScore}
                            </span>
                        </div>
                    </div>

                    {/* Último Lanzamiento Recibido */}
                    <div style={styles.controlsArea}>
                        <span style={styles.alertLabel}>ÚLTIMO LANZAMIENTO RECIBIDO</span>
                        <div style={styles.inputBox}>
                            <span style={styles.inputText}>
                                {liveData.score > 0 ? `+${liveData.score}` : 'ESPERANDO TIRO...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO: Historial de Tiradas de este Leg */}
                <div style={styles.historySide}>
                    <div style={styles.historyHeader}>
                        <span style={styles.historyTitle}>HISTORIAL DEL LEG</span>
                        <span style={styles.historyCounter}>{historyThrows.length} tiros</span>
                    </div>

                    <div style={styles.historyFeed}>
                        {historyThrows.length === 0 ? (
                            <div style={styles.emptyHistory}>No hay lanzamientos registrados en este leg todavía.</div>
                        ) : (
                            historyThrows.map((t, index) => {
                                // Determinamos quién tiró en base a la rotación o índice guardado
                                const esP1 = t.activePlayerIndex === 0;
                                return (
                                    <div key={index} style={styles.historyRow}>
                                        <span style={{ ...styles.historyPlayerName, color: esP1 ? '#FFFFFF' : '#B3B3B3' }}>
                                            {esP1 ? p1Name : p2Name}:
                                        </span>
                                        <span style={{
                                            ...styles.historyScoreBadge,
                                            color: t.score >= 100 ? '#BFE55F' : '#FFFFFF',
                                            fontWeight: t.score >= 100 ? '700' : '500'
                                        }}>
                                            {t.score} pts
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={historyEndRef} />
                    </div>
                </div>

            </div>
        </div>
    );
};

// Estilos web actualizados usando tu paleta móvil exacta
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '24px',
        backgroundColor: '#0E0E0E',
        color: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: '"Manrope", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    },
    centerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#FFFFFF',
        backgroundColor: '#0E0E0E',
        fontFamily: '"Manrope", sans-serif',
        fontSize: '16px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#B3B3B3',
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 500
    },
    liveIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        color: '#B3B3B3'
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '9999px',
        transition: 'all 0.3s ease'
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        flex: 1,
        alignItems: 'stretch'
    },
    scoreboardSide: {
        flex: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '24px'
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '16px',
        alignItems: 'stretch'
    },
    playerCard: {
        flex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #4C4C4C',
        borderRadius: '16px',
        backgroundColor: '#1A1A1A',
        padding: '32px 16px',
        boxSizing: 'border-box'
    },
    playerCardActive: {
        borderColor: '#BFE55F',
        backgroundColor: '#1A1A1A',
        boxShadow: '0px 0px 25px rgba(191, 229, 95, 0.25)',
    },
    playerName: {
        color: '#FFFFFF',
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '12px',
        textTransform: 'uppercase'
    },
    scoreLeftText: {
        color: '#B3B3B3',
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 700,
        fontSize: '76px',
        lineHeight: '1',
    },
    scoreActiveText: {
        color: '#BFE55F',
    },
    statsCard: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statsRowText: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        fontSize: '32px',
        color: '#FFFFFF',
    },
    statsLabel: {
        color: '#B3B3B3',
        fontFamily: '"Manrope", sans-serif',
        fontSize: '12px',
        letterSpacing: '2px',
        marginTop: '4px'
    },
    controlsArea: {
        backgroundColor: '#1A1A1A',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #4C4C4C'
    },
    alertLabel: {
        fontSize: '11px',
        color: '#B3B3B3',
        fontFamily: '"Space Grotesk", sans-serif',
        letterSpacing: '2px',
    },
    inputBox: {
        minWidth: '280px',
        minHeight: '64px',
        backgroundColor: '#242424',
        borderRadius: '8px',
        borderBottom: '2px solid #BFE55F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputText: {
        color: '#FFFFFF',
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 700,
        fontSize: '24px',
    },

    // ESTILOS NUEVOS: Panel Lateral de Historial del Leg
    historySide: {
        flex: 1,
        minWidth: '280px',
        backgroundColor: '#1A1A1A', // theme.colors.cardBackground
        border: '1px solid #4C4C4C', // theme.colors.line
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        maxHeight: 'calc(100vh - 120px)'
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #4C4C4C', // theme.colors.avatarDropdownDivider
        paddingBottom: '12px',
        marginBottom: '12px'
    },
    historyTitle: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        fontSize: '14px',
        color: '#FFFFFF',
        letterSpacing: '1px'
    },
    historyCounter: {
        fontFamily: '"Manrope", sans-serif',
        fontSize: '12px',
        color: '#B3B3B3' // textSecondary
    },
    historyFeed: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '4px'
    },
    emptyHistory: {
        fontSize: '13px',
        color: '#B3B3B3',
        textAlign: 'center',
        marginTop: '32px',
        fontStyle: 'italic'
    },
    historyRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#242424', // theme.colors.keyBackground
        padding: '10px 14px',
        borderRadius: '8px', // theme.borderRadius.md
        border: '1px solid #2C2C2C',
    },
    historyPlayerName: {
        fontFamily: '"Manrope", sans-serif',
        fontSize: '13px',
        fontWeight: 500,
    },
    historyScoreBadge: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '14px',
    }
};

export default LiveMatchMonitorScreen;
