import React from 'react';

const CookiesPolicyScreen: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>POLÍTICA DE COOKIES</h1>
                <p style={styles.subtitle}>Última actualización: 10 de Junio de 2026</p>

                <hr style={styles.divider} />

                <p style={styles.paragraph}>
                    Aún no se ha publicado la política de cookies
                </p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 140px)',
        backgroundColor: '#0f1115',
    },
    card: {
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#1a1d24',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        textAlign: 'left',
    },
    title: {
        fontSize: '2.25rem',
        fontWeight: '800',
        margin: '0 0 0.5rem 0',
        color: '#ffffff',
        lineHeight: '1.2',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#a0aec0',
        margin: '0 0 1.5rem 0',
    },
    divider: {
        border: '0',
        height: '1px',
        backgroundColor: '#2d3748',
        margin: '1.5rem 0',
    },
    sectionTitle: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#ffffff',
        marginTop: '2rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #2d3748',
        paddingBottom: '0.5rem',
    },
    paragraph: {
        fontSize: '1rem',
        color: '#cbd5e0',
        lineHeight: '1.6',
        marginBottom: '1.2rem',
    },
};

export default CookiesPolicyScreen;
