import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRoles } from '../../../context/AuthContext';
import { Tournament } from '../../../services/tournament.service';
import {
  getFederationLabel,
  getFederationFlag,
  getModeLabel,
  getGameTypeLabel,
  getScheduleTypeLabel,
  formatTournamentDate,
  formatTournamentTime
} from '../../../utils/tournament.utils';
import InfoCard from '../../../components/InfoCard';
import Button from '../../../components/Button';

interface TournamentInfoTabProps {
  tournament: Tournament;
}

const TournamentInfoTab: React.FC<TournamentInfoTabProps> = ({ tournament }) => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const isAdmin = user?.role === UserRoles.ADMIN;

  const { info } = tournament;
  const isTournamentDraftOrPublished =
    tournament.status === 'DRAFT' || tournament.status === 'PUBLISHED';
  const formattedDate = formatTournamentDate(info.dateTime);
  const formattedTime = formatTournamentTime(info.dateTime);

  return (
    <div style={styles.content}>
      {isAdmin && isTournamentDraftOrPublished && (
        <div style={styles.adminActionContainer}>
          <Button
            variant="primary"
            leftIcon="Edit"
            onClick={() => navigate(`/torneos/${tournament.id}/edit`)}
          >
            Editar información
          </Button>
        </div>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Información General</h2>
        <div style={styles.infoGrid}>
          <InfoCard title="Lugar" content={info.place} icon="MapPin" />
          <InfoCard title="Fecha" content={formattedDate} icon="Calendar" />
          <InfoCard title="Hora" content={formattedTime} icon="Clock" />
          <InfoCard title="Modalidad" content={getModeLabel(info.mode)} icon="Users" />
          <InfoCard title="Máx. Jugadores" content={info.maxPlayers ? info.maxPlayers.toString() : 'Sin máximo'} icon="UserPlus" />
        </div>
        <div style={styles.infoGrid}>
          <InfoCard title="Juego" content={info.game} icon="Target" />
          <InfoCard title="Tipo de cuadrante" content={getScheduleTypeLabel(info.schedule)} icon="Network" />
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
    gap: '2rem',
  },
  adminActionContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
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
