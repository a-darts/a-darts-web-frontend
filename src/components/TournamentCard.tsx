import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tournament } from '../services/tournament.service';
import Icon from './Icon';
import Button from './Button';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const navigate = useNavigate();
  const { id, name, info } = tournament;
  const { place, dateTime, federation } = info;

  const date = new Date(dateTime);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSeeMore = () => {
    navigate(`/torneos/${id}`);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{name}</h3>
        <span style={styles.statusBadge(tournament.status)}>{tournament.status}</span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <Icon name="MapPin" size={16} style={styles.icon} />
          <span style={styles.text}>{place}</span>
        </div>
        <div style={styles.infoItem}>
          <Icon name="Calendar" size={16} style={styles.icon} />
          <span style={styles.text}>{formattedDate}</span>
        </div>
        <div style={styles.infoItem}>
          <Icon name="Clock" size={16} style={styles.icon} />
          <span style={styles.text}>{formattedTime}</span>
        </div>
        <div style={styles.infoItem}>
          <Icon name="Flag" size={16} style={styles.icon} />
          <span style={styles.text}>{federation}</span>
        </div>
      </div>

      <div style={styles.footer}>
        <Button
          variant="secondary"
          onClick={handleSeeMore}
          fullWidth
        >
          Ver más
        </Button>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    lineHeight: '1.4',
  },
  statusBadge: (status: string) => ({
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '100px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    color: status === 'PUBLISHED' ? '#4ade80' : '#a1a1a1',
    border: `1px solid ${status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
    whiteSpace: 'nowrap',
  }),
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '0.5rem',
  },
};

export default TournamentCard;
