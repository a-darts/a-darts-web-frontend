import React from 'react';
import { Tournament } from '../../services/tournament.service';

interface TournamentInscriptionsTabProps {
  tournament: Tournament;
}

const TournamentInscriptionsTab: React.FC<TournamentInscriptionsTabProps> = ({ tournament }) => {
  return (
    <div style={styles.content}>
      <div style={styles.sectionContentContainer}>
        <p style={styles.sectionText}>
          Próximamente: Gestión de inscripciones para el torneo "{tournament.name}"
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  sectionContentContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '4rem 2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontSize: '1.1rem',
  },
};

export default TournamentInscriptionsTab;
