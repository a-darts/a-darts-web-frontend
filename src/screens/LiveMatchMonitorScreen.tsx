import React, { useEffect, useState } from 'react';
import { Match, tournamentService } from '../services/tournament.service';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveMatchSocket, LiveMatchStatus, LiveMatch } from '../hooks/useLiveMatchSocket';

// Inyección dinámica de las fuentes de Google Fonts para asegurar Manrope y Space Grotesk
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

    const { liveData, isLiveConnected } = useLiveMatchSocket({
        boardId,
        matchId,
        initialData: defaultInitialData
    });

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
                        color: isLiveConnected ? '#BFE55F' : '#FF4C4C'
                    }} />
                    <span>{isLiveConnected ? 'TRANSMISIÓN EN VIVO' : 'DESCONECTADO'}</span>
                </div>
            </div>

            {/* Fila de Marcador principal (Réplica de headerRow móvil 4:2:4) */}
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

            {/* Área Inferior de Control (Réplica visual de controlsArea e inputBox) */}
            <div style={styles.controlsArea}>
                <span style={styles.alertLabel}>ÚLTIMO LANZAMIENTO RECIBIDO</span>
                <div style={styles.inputBox}>
                    <span style={styles.inputText}>
                        {liveData.score > 0 ? `${liveData.score}` : 'ESPERANDO TIRO...'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Mapeo exacto de tu TypeScript Theme a CSS en línea Web
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '24px', // theme.spacing.lg
        backgroundColor: '#0E0E0E', // theme.colors.background
        color: '#FFFFFF', // theme.colors.text
        minHeight: '100vh',
        fontFamily: '"Manrope", sans-serif', // theme.typography.fontFamily.regular
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
        fontSize: '16px' // theme.typography.sizes.md
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px' // theme.spacing.xl
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#B3B3B3', // theme.colors.textSecondary
        cursor: 'pointer',
        fontSize: '16px', // theme.typography.sizes.md
        fontFamily: '"Space Grotesk", sans-serif', // theme.typography.fontFamily.subTitle
        fontWeight: 500,
        letterSpacing: '0.5px'
    },
    liveIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px', // theme.spacing.sm
        fontSize: '12px', // theme.typography.sizes.xs
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        letterSpacing: '1.5px',
        color: '#B3B3B3' // theme.colors.tabInactiveText
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '9999px', // theme.borderRadius.round
        transition: 'all 0.3s ease'
    },

    // Fila del marcador (Ratio 4:2:4)
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '16px', // theme.spacing.md
        alignItems: 'stretch',
        margin: 'auto 0'
    },

    // Tarjeta del Jugador
    playerCard: {
        flex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #4C4C4C', // theme.colors.cardInactiveBorder
        borderRadius: '16px', // theme.borderRadius.xl
        backgroundColor: '#1A1A1A', // theme.colors.cardInactiveBackground
        padding: '40px 24px', // paddingVertical: xxl, paddingHorizontal: lg
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box'
    },
    playerCardActive: {
        borderColor: '#BFE55F', // theme.colors.cardActiveBorder
        backgroundColor: '#1A1A1A', // theme.colors.cardActiveBackground
        boxShadow: '0px 0px 25px rgba(191, 229, 95, 0.25)', // theme.colors.cardActiveShadow
        transform: 'scale(1.02)'
    },
    playerName: {
        color: '#FFFFFF', // theme.colors.text
        fontFamily: '"Space Grotesk", sans-serif', // theme.typography.fontFamily.title
        fontSize: '24px', // theme.typography.sizes.xxl
        fontWeight: 700,
        marginBottom: '16px', // theme.spacing.md
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    scoreLeftText: {
        color: '#B3B3B3', // theme.colors.textSecondary
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 700, // theme.typography.fontFamily.bold
        fontSize: '80px', // Equivale a leftScore escalado para monitores (*2)
        lineHeight: '1',
        transition: 'color 0.2s ease'
    },
    scoreActiveText: {
        color: '#BFE55F', // theme.colors.scoreActiveText -> buttonPrimaryBackground
    },

    // Tarjeta central de estadísticas
    statsCard: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px', // theme.spacing.md
    },
    statsSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statsRowText: {
        fontFamily: '"Space Grotesk", sans-serif', // theme.typography.fontFamily.title
        fontWeight: 700,
        fontSize: '32px', // theme.typography.sizes.h1
        color: '#FFFFFF', // theme.colors.text
        letterSpacing: '1px'
    },
    statsLabel: {
        color: '#B3B3B3', // theme.colors.textSecondary
        fontFamily: '"Manrope", sans-serif',
        fontSize: '12px', // theme.typography.sizes.xs
        fontWeight: 400, // theme.typography.fontFamily.regular
        letterSpacing: '3px',
        marginTop: '4px'
    },

    // Caja inferior (Estilo controles / InputBox)
    controlsArea: {
        backgroundColor: '#1A1A1A', // theme.colors.cardBackground
        borderTopLeftRadius: '16px', // theme.borderRadius.xl
        borderTopRightRadius: '16px',
        borderRadius: '16px', // Cerrado completo perimetral para entorno monitor web
        padding: '24px', // theme.spacing.lg
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginTop: '32px', // theme.spacing.xl
        border: '1px solid #4C4C4C' // theme.colors.line
    },
    alertLabel: {
        fontSize: '12px', // theme.typography.sizes.xs
        color: '#B3B3B3', // theme.colors.textSecondary
        fontFamily: '"Space Grotesk", sans-serif',
        letterSpacing: '2px',
        fontWeight: 500
    },
    inputBox: {
        minWidth: '320px',
        minHeight: '72px',
        backgroundColor: '#242424', // theme.colors.inputBoxBackground
        borderRadius: '8px', // theme.borderRadius.md
        borderBottom: '2px solid #BFE55F', // theme.colors.inputBoxBorder
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 32px',
    },
    inputText: {
        color: '#FFFFFF', // theme.colors.inputBoxText
        fontFamily: '"Manrope", sans-serif',
        fontWeight: 700, // theme.typography.fontFamily.bold
        fontSize: '28px', // theme.typography.sizes.xxxl
        letterSpacing: '1px'
    }
};

export default LiveMatchMonitorScreen;
