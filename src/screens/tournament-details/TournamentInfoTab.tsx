import React from 'react';
import { Tournament } from '../../services/tournament.service';
import { 
  getFederationLabel, 
  getFederationFlag, 
  getModeLabel, 
  getGameTypeLabel 
} from '../../utils/tournament.utils';
import InfoCard from '../../components/InfoCard';

interface TournamentInfoTabProps {
  tournament: Tournament;
}

const TournamentInfoTab: React.FC<TournamentInfoTabProps> = ({ tournament }) => {
  const { info } = tournament;
  const date = new Date(info.dateTime);
  const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.content}>
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Información General</h2>
        <div style={styles.infoGrid}>
          <InfoCard title="Lugar" content={info.place} icon="MapPin" />
          <InfoCard title="Fecha" content={formattedDate} icon="Calendar" />
          <InfoCard title="Hora" content={formattedTime} icon="Clock" />
          <InfoCard title="Modalidad" content={getModeLabel(info.mode)} icon="Users" />
          <InfoCard
            title="Federación"
            content={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getFederationFlag(info.federation) && (
                  <img
                    src={getFederationFlag(info.federation)!}
                    alt="Flag"
                    style={{ width: '20px', height: 'auto', borderRadius: '2px' }}
                  />
                )}
                <span>{getFederationLabel(info.federation)}</span>
              </div>
            }
            icon="Flag"
          />
        </div>
        <div style={styles.infoGrid}>
          <InfoCard title="Juego" content={info.game} icon="Target" />
          <InfoCard title="Máx. Jugadores" content={info.maxPlayers ? info.maxPlayers.toString() : 'Sin máximo'} icon="UserPlus" />
          <InfoCard title="Legs" content={`${getGameTypeLabel(info.gameType)} ${info.numLegs} legs`} icon="Layers" />
          <InfoCard title="Sets" content={`${getGameTypeLabel(info.gameType)} ${info.numSets} sets`} icon="Layers" />
        </div>
      </section>

      {info.rules && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Reglas</h2>
          <div style={styles.sectionContentContainer}>
            <p style={styles.sectionText}>{info.rules}</p>
          </div>
        </section>
      )}

      {info.info && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Más información</h2>
          <div style={styles.sectionContentContainer}>
            <p style={styles.sectionText}>{info.info}</p>
          </div>
        </section>
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  sectionContentContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionText: {
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default TournamentInfoTab;
