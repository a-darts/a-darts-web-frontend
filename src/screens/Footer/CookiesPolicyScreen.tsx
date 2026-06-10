import React from 'react';

const CookiesPolicyScreen: React.FC = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Privacy Policy Screen</h1>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: 'calc(100vh - 140px)',
    },
    header: {
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2rem',
        textAlign: 'left',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '800',
        margin: 0,
        color: '#ffffff',
        lineHeight: '1.1',
    },
};

export default CookiesPolicyScreen;
