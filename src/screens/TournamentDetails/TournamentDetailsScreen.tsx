import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, Tournament, TournamentStatus, RegistrationStatus } from '../../services/tournament.service';
import { getStatusLabel, getFederationLabel, getFederationFlag, getModeLabel, getGameTypeLabel } from '../../utils/tournament.utils';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Breadcrumbs from '../../components/Breadcrumbs';
import Title from '../../components/Title';
import TournamentStatusTag from '../../components/TournamentStatusTag';
import Tabs from '../../components/Tabs';
import InfoCard from '../../components/InfoCard';

import TournamentInfoTab from './tabs/TournamentInfoTab';
import TournamentInscriptionsTab from './tabs/TournamentInscriptionsTab';
import TournamentRegistrationStatusTag from '../../components/TournamentRegistrationStatusTag';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { playerService } from '../../services/player.service';

const TournamentDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

  const { name, status, registration, info } = tournament;

  const handleRegisterClick = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!user || !tournament) return;

    try {
      setIsRegistering(true);

      // 1. Get playerId for current season (assuming tournament year)
      const seasonYear = new Date(info.dateTime).getFullYear();
      const player = await playerService.getPlayerByUserAndSeason(user.id, seasonYear);

      // 2. Register
      await tournamentService.registerParticipant(tournament.id, player.id);

      // 3. Success
      setIsModalOpen(false);

      // Refresh tournament data
      const data = await tournamentService.getTournamentById(tournament.id);
      setTournament(data);

      // We could use a toast here, but for now alert is fine as per project style
      alert('¡Inscripción realizada con éxito!');
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.message || 'Error al realizar la inscripción. Por favor, verifica que estás federado para esta temporada.');
    } finally {
      setIsRegistering(false);
    }
  };

  const date = new Date(info.dateTime);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.getHours().toString().padStart(2, '0') + ':' +
    date.getMinutes().toString().padStart(2, '0');

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos', path: '/torneos' },
    { label: name },
  ];

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'inscriptions', label: 'Inscripciones' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />

        <div style={styles.titleContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <Title>{name}</Title>
            <div style={styles.tagsContainer}>
              <TournamentStatusTag status={status} size="medium" />
              {status === TournamentStatus.PUBLISHED && (
                <TournamentRegistrationStatusTag status={registration.status} size="medium" />
              )}
            </div>
          </div>

          {status === TournamentStatus.PUBLISHED && registration.status === RegistrationStatus.OPEN && (
            <Button
              variant="primary"
              leftIcon="Plus"
              onClick={handleRegisterClick}
            >
              INSCRIBIRSE
            </Button>
          )}
        </div>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="INSCRIBIRSE"
        description={`Confirma la inscripción al ${name}\nFecha: ${formattedDate}\nHora: ${formattedTime}\nLugar: ${info.place}`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRegistration}
        loading={isRegistering}
      />

      <Tabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'info' ? (
        <TournamentInfoTab tournament={tournament} />
      ) : (
        <TournamentInscriptionsTab tournament={tournament} />
      )}
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
  tagsContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
};

export default TournamentDetailsScreen;
