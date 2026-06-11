import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Title: React.FC<TitleProps> = ({ children, style }) => {
  return (
    <div style={{ ...styles.container, ...style }}>
      <h1 style={styles.title}>
        {children}
      </h1>
      <div style={styles.underline} />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: 0,
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.5px',
    lineHeight: '1.2',
  },
  underline: {
    width: '64px',
    height: '4px',
    background: '#C4E866',
    boxShadow: '0 0 10px rgba(196, 232, 102, 0.3)',
  },
};

export default Title;
