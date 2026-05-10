import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, Tournament } from '../services/tournament.service';
import { getStatusLabel, getFederationLabel, getFederationFlag } from '../utils/tournament.utils';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';
import Title from '../components/Title';
import TournamentStatusTag from '../components/TournamentStatusTag';
import InfoCard from '../components/InfoCard';

const TournamentDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentById(id);
        setTournament(data);
      } catch (err: any) {
        console.error('Error fetching tournament details:', err);
        setError(err.message || 'Error al cargar los detalles del torneo');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) return <div style={styles.message}>Cargando detalles...</div>;

  if (error) return (
    <div style={styles.container}>
      <ErrorMessage message={error} />
      <Button
        variant="primary"
        leftIcon="ArrowLeft"
        onClick={() => navigate('/torneos')}
      >
        Volver a torneos
      </Button>
    </div>
  );

  if (!tournament) return <div style={styles.message}>Torneo no encontrado</div>;

  const { name, info, registration, status } = tournament;
  const date = new Date(info.dateTime);
  const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos', path: '/torneos' },
    { label: name },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <div style={styles.titleContainer}>
          <Title>{name}</Title>
          <TournamentStatusTag status={status} size="medium" />
        </div>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Información General</h2>
          <div style={styles.infoGrid}>
            <InfoCard title="Lugar" content={info.place} icon="MapPin" />
            <InfoCard title="Fecha" content={formattedDate} icon="Calendar" />
            <InfoCard title="Hora" content={formattedTime} icon="Clock" />
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
            <InfoCard title="Modo" content={info.mode} icon="Users" />
            <InfoCard title="Juego" content={info.game} icon="Target" />
            <InfoCard title="Máx. Jugadores" content={info.maxPlayers.toString()} icon="UserPlus" />
            <InfoCard title="Tipo" content={`${info.gameType} ${info.numLegs} legs / ${info.numSets} sets`} icon="Layers" />
          </div>
        </section>

        {info.rules && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Reglas</h2>
            <div style={styles.rulesContainer}>
              <p style={styles.rulesText}>{info.rules}</p>
            </div>
          </section>
        )}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Registro</h2>
          <div style={styles.infoGrid}>
            <InfoCard
              title="Check-in requerido"
              content={registration.hasCheckIn ? 'Sí' : 'No'}
              icon={registration.hasCheckIn ? 'CheckCircle' : 'XCircle'}
            />
            <InfoCard
              title="Participantes"
              content={`${registration.registeredParticipantsIds.length} registrados`}
              icon="UserCheck"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    padding: '2rem 2rem',
    margin: '0 auto',
    width: '100%',
    minHeight: '80vh',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '10rem 2rem',
    fontSize: '1.2rem',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap',
  },
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  rulesContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  rulesText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
};

export default TournamentDetailsScreen;
