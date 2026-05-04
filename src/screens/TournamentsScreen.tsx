import React from 'react';

const TournamentsScreen: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Torneos</h1>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
};

export default TournamentsScreen;
