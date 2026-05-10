import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tournament } from '../services/tournament.service';
import { getStatusLabel, getFederationLabel } from '../utils/tournament.utils';
import Icon from './Icon';
import Button from './Button';
import TournamentStatusTag from './TournamentStatusTag';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
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
    <div
      style={styles.card(isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSeeMore}
    >
      <div style={styles.header}>
        <h3 style={styles.name}>{name}</h3>
        <TournamentStatusTag status={tournament.status} />
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
          <span style={styles.text}>{getFederationLabel(federation)}</span>
        </div>
      </div>

      <div style={styles.footer}>
        <Button
          variant={isHovered ? 'primary' : 'secondary'}
          onClick={(e) => {
            e.stopPropagation();
            handleSeeMore();
          }}
          fullWidth
        >
          Ver más
        </Button>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  card: (isHovered: boolean) => ({
    background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: `1px solid ${isHovered ? '#C4E866' : 'rgba(255, 255, 255, 0.05)'}`,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 10px 30px rgba(196, 232, 102, 0.1)' : 'none',
  }),
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
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
