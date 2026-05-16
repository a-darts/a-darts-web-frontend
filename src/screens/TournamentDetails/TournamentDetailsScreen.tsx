import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, Tournament, TournamentStatus, RegistrationStatus, Participant } from '../../services/tournament.service';
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
import TournamentBracketTab from './tabs/TournamentBracketTab';
import TournamentRegistrationStatusTag from '../../components/TournamentRegistrationStatusTag';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { playerService } from '../../services/player.service';


const TournamentDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalMode, setModalMode] = useState<'register' | 'unregister'>('register');
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [tournamentData, participantsData] = await Promise.all([
          tournamentService.getTournamentById(id),
          tournamentService.getParticipantsByTournamentId(id)
        ]);
        setTournament(tournamentData);
        setParticipants(participantsData);

        // Fetch user playerId for the tournament season if logged in
        if (user) {
          const seasonYear = new Date(tournamentData.info.dateTime).getFullYear();
          try {
            const player = await playerService.getPlayerByUserAndSeason(user.id, seasonYear);
            setCurrentPlayerId(player.id);
          } catch (e) {
            console.log('Current user is not registered as a player for this season');
            setCurrentPlayerId(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching tournament details:', err);
        setError(err.message || 'Error al cargar los detalles del torneo');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, user]);

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

  const userParticipant = user && currentPlayerId
    ? participants.find(p => p.playerId === currentPlayerId)
    : null;

  const handleRegisterClick = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setModalMode('register');
      setIsModalOpen(true);
    }
  };

  const handleUnregisterClick = () => {
    setModalMode('unregister');
    setIsModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!user || !tournament) return;

    try {
      setIsRegistering(true);

      if (modalMode === 'register') {
        if (!currentPlayerId) {
          throw new Error('No se ha encontrado tu perfil de jugador para esta temporada. Asegúrate de estar federado.');
        }

        await tournamentService.registerParticipant(tournament.id, currentPlayerId);
        showToast('¡Inscripción realizada con éxito!', 'success');
      } else if (modalMode === 'unregister') {
        // Unregister
        if (userParticipant) {
          await tournamentService.unregisterParticipant(tournament.id, userParticipant.id);
          showToast('Te has desinscrito del torneo correctamente.', 'success');
        }
      }

      // 3. Success cleanup
      setIsModalOpen(false);

      // Refresh data
      const [tournamentData, participantsData] = await Promise.all([
        tournamentService.getTournamentById(tournament.id),
        tournamentService.getParticipantsByTournamentId(tournament.id)
      ]);
      setTournament(tournamentData);
      setParticipants(participantsData);

    } catch (err: any) {
      console.error('Action error:', err);
      showToast(err.message || 'Error al procesar la solicitud.', 'error');
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
  const formattedTime = date.getUTCHours().toString().padStart(2, '0') + ':' +
    date.getUTCMinutes().toString().padStart(2, '0');

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos', path: '/torneos' },
    { label: name },
  ];

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'inscriptions', label: 'Inscripciones' },
    { id: 'bracket', label: 'Cuadrante' },
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
            userParticipant ? (
              <Button
                variant="danger"
                leftIcon="X"
                onClick={handleUnregisterClick}
              >
                DESINSCRIBIRSE
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon="Plus"
                onClick={handleRegisterClick}
              >
                INSCRIBIRSE
              </Button>
            )
          )}
        </div>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'register' ? "INSCRIBIRSE" : "DESINSCRIBIRSE"}
        description={modalMode === 'register'
          ? (
            <>
              Confirma la inscripción al <strong>{name}</strong>
              <br /><br />
              <strong>Fecha:</strong> {formattedDate}<br />
              <strong>Hora:</strong> {formattedTime}<br />
              <strong>Lugar:</strong> {info.place}
            </>
          ) : (
            <>
              ¿Estás seguro de que deseas desinscribirte de <strong>{name}</strong>?
            </>
          )
        }
        confirmLabel={modalMode === 'register' ? "Confirmar" : "Desinscribirse"}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRegistration}
        loading={isRegistering}
      />

      <Tabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'info' &&
        <TournamentInfoTab tournament={tournament} />
      }
      {activeTab === 'inscriptions' && (
        <TournamentInscriptionsTab
          tournament={tournament}
          participants={participants}
        />
      )}
      {activeTab === 'bracket' &&
        <TournamentBracketTab tournament={tournament} />
      }
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
