import React, { useEffect, useState, useRef } from 'react';
import { Match, tournamentService } from '../services/tournament.service';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveMatchSocket, LiveMatchStatus, LiveMatch } from '../hooks/useLiveMatchSocket';

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

    const historyEndRef = useRef<HTMLDivElement>(null);

    const { liveData, historyThrows, isLiveConnected } = useLiveMatchSocket({
        boardId,
        matchId,
        initialData: defaultInitialData
    });

    // Auto-scroll al último tiro dentro del feed inferior si es necesario
    useEffect(() => {
        if (historyEndRef.current) {
            const container = historyEndRef.current.parentElement;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
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
                    throwerPlayerIndex: 0,
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

    if (isLoading) return <div style={styles.centerContainer}>Cargando estado del partido...</div>;
    if (error) return <div style={styles.centerContainer}>Error: {error}</div>;
    if (!match || !liveData) return <div style={styles.centerContainer}>No se encontró el partido.</div>;

    const p1Name = match.participant1?.alias || 'Jugador 1';
    const p2Name = match.participant2?.alias || 'Jugador 2';

    // 1. Aislar únicamente las tiradas pertenecientes al Leg actual en juego
    const currentLegThrows = historyThrows || [];

    // 2. Separar los tiros filtrados del Leg actual por cada jugador para las columnas
    let p1Throws = currentLegThrows.filter(
        t => (t.throwerPlayerIndex !== undefined ? t.throwerPlayerIndex : t.activePlayerIndex) === 0
    );
    let p2Throws = currentLegThrows.filter(
        t => (t.throwerPlayerIndex !== undefined ? t.throwerPlayerIndex : t.activePlayerIndex) === 1
    );

    // 3. Inyección de la primera tirada nula por defecto
    p1Throws = [
        { score: '', participant1: { remainingScore: 501 } },
        ...p1Throws
    ];
    p2Throws = [
        { score: '', participant2: { remainingScore: 501 } },
        ...p2Throws
    ];

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

            {/* Layout Principal Centralizado */}
            <div style={styles.mainContent}>
                <div style={styles.scoreboardSide}>

                    {/* Fila superior: Tarjetas de puntuación restante y Marcador Central */}
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

                        {/* Marcador Central de Stats (LEGS - SETS) */}
                        <div style={styles.statsCard}>
                            <div style={styles.statsSection}>
                                <span style={styles.statsRowText}>
                                    {liveData.participant1.legsWon} - {liveData.participant2.legsWon}
                                </span>
                                <span style={styles.stylesLabel}>LEGS</span>
                            </div>

                            <div style={{ ...styles.statsSection, marginTop: '24px' }}>
                                <span style={styles.statsRowText}>
                                    {liveData.participant1.setsWon} - {liveData.participant2.setsWon}
                                </span>
                                <span style={styles.stylesLabel}>SETS</span>
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

                    {/* Contenedor de la Tabla con scroll */}
                    <div style={styles.tableContainer}>
                        {/* Wrapper interno que crece dinámicamente con el contenido */}
                        <div style={styles.tableScrollWrapper}>
                            {/* Columna Jugador 1 */}
                            <div style={styles.tableColumn}>
                                {p1Throws.map((t: any, idx) => {
                                    const scoreRestante = t.participant1?.remainingScore;
                                    return (
                                        <div key={`p1-${idx}`} style={styles.tableRow}>
                                            <span style={styles.tableScore}>
                                                {t.score}
                                            </span>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={styles.remainingScoreText}>
                                                    {scoreRestante !== undefined ? `${scoreRestante}` : '---'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Columna central separadora estricta flex */}
                            {historyThrows.length > 0 && <div style={styles.tableDivider} />}

                            {/* Columna Jugador 2 */}
                            <div style={styles.tableColumn}>
                                {p2Throws.map((t: any, idx) => {
                                    const scoreRestante = t.participant2?.remainingScore;
                                    return (
                                        <div key={`p2-${idx}`} style={styles.tableRow}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span style={styles.remainingScoreText}>
                                                    {scoreRestante !== undefined ? `${scoreRestante}` : '---'}
                                                </span>
                                            </div>
                                            <span style={styles.tableScore}>
                                                {t.score}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {historyThrows.length === 0 && (
                                <div style={styles.emptyHistory}>No hay lanzamientos registrados en este leg todavía.</div>
                            )}

                            <div ref={historyEndRef} style={{ float: 'left', clear: 'both' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    scoreboardSide: {
        flex: 1,
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
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
        fontSize: '18px',
        fontWeight: 500,
        marginBottom: '12px',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    scoreLeftText: {
        color: '#B3B3B3',
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 700,
        fontSize: '50px',
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
        fontSize: '22px',
        color: '#FFFFFF',
    },
    stylesLabel: {
        color: '#B3B3B3',
        fontFamily: '"Manrope", sans-serif',
        fontSize: '12px',
        letterSpacing: '2px',
        marginTop: '4px'
    },

    tableContainer: {
        backgroundColor: '#1A1A1A',
        border: '1px solid #4C4C4C',
        borderRadius: '16px',
        padding: '16px',
        minHeight: '180px',
        maxHeight: '300px',
        overflowY: 'auto',
    },
    tableScrollWrapper: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '100%',
        position: 'relative',
        gap: '16px'
    },
    tableColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    tableDivider: {
        width: '1px',
        backgroundColor: '#4C4C4C',
        alignSelf: 'stretch', // Al estar en un wrapper flex que se estira con el scroll, esto funcionará perfecto
    },
    tableRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
    },
    tableScore: {
        fontSize: '16px',
        color: '#ffffff',
    },
    remainingScoreText: {
        fontSize: '16px',
        color: '#ffffff',
    },
    emptyHistory: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '40%',
        fontSize: '13px',
        color: '#B3B3B3',
        textAlign: 'center',
        fontStyle: 'italic'
    },
};

export default LiveMatchMonitorScreen;
