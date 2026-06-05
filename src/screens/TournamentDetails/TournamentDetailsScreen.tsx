import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, Tournament, TournamentStatus, RegistrationStatus } from '../../services/tournament.service';
import { registeredParticipantService, Participant } from '../../services/registeredParticipant.service';
import { formatTournamentDate, formatTournamentTime, getSeasonEndYear, getFederationFlag, getFederationLabel } from '../../utils/tournament.utils';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Breadcrumbs from '../../components/Breadcrumbs';
import Title from '../../components/Title';
import TournamentStatusTag from '../../components/TournamentStatusTag';
import Tabs from '../../components/Tabs';

import TournamentInfoTab from './tabs/TournamentInfoTab';
import TournamentRegistrationTab from './tabs/TournamentRegistrationTab';
import TournamentBracketTab from './tabs/TournamentBracketTab';
import TournamentCreateBracketTab from './tabs/TournamentCreateBracketTab';
import TournamentMatchesTab from './tabs/TournamentMatchesTab';
import TournamentPlayingAreaTab from './tabs/TournamentPlayingAreaTab';
import TournamentResultsTab from './tabs/TournamentResultsTab';
import TournamentRegistrationStatusTag from '../../components/TournamentRegistrationStatusTag';
import Modal from '../../components/Modal';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { playerService } from '../../services/player.service';
import Icon from '../../components/Icon';


const TournamentDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRoles.ADMIN;
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
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEditingBracket, setIsEditingBracket] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleBracketGenerated = () => {
    setIsEditingBracket(true);
    setActiveTab('create-bracket');
  };

  const handleBracketSaved = () => {
    setIsEditingBracket(false);
    setActiveTab('bracket');
    refreshData();
  };

  const handleBracketCanceled = () => {
    setIsEditingBracket(false);
    setActiveTab('bracket');
  };

  const handleStartEditing = () => {
    setIsEditingBracket(true);
    setActiveTab('create-bracket');
  };


  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [tournamentData, participantsData] = await Promise.all([
          tournamentService.getTournamentById(id),
          registeredParticipantService.getParticipantsByTournamentId(id)
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon
          name="Loader"
          size={32}
          className="btn-icon animate-spin"
        />
        <div style={styles.loadingText}>Cargando detalles del torneo...</div>
      </div>
    );
  }

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

  const refreshData = async () => {
    if (!id) return;
    try {
      const [tournamentData, participantsData] = await Promise.all([
        tournamentService.getTournamentById(id),
        registeredParticipantService.getParticipantsByTournamentId(id)
      ]);
      setTournament(tournamentData);
      setParticipants(participantsData);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!user || !tournament) return;

    try {
      setIsRegistering(true);

      if (modalMode === 'register') {
        if (!currentPlayerId) {
          throw new Error('No se ha encontrado tu perfil de jugador para esta temporada. Asegúrate de estar federado.');
        }

        await registeredParticipantService.registerParticipant(tournament.id, currentPlayerId);
        showToast('¡Inscripción realizada con éxito!', 'success');
      } else if (modalMode === 'unregister') {
        // Unregister
        if (userParticipant) {
          await registeredParticipantService.unregisterParticipant(tournament.id, userParticipant.id);
          showToast('Te has desinscrito del torneo correctamente.', 'success');
        }
      }

      // 3. Success cleanup
      setIsModalOpen(false);

      // Refresh data
      await refreshData();

    } catch (err: any) {
      console.error('Action error:', err);
      showToast(err.message || 'Error al procesar la solicitud.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInitTournament = () => {
    setIsStartModalOpen(true);
  };

  const handleConfirmStartTournament = async () => {
    if (!tournament) return;
    try {
      setIsStarting(true);
      await tournamentService.startTournament(tournament.id);
      showToast('¡Torneo iniciado correctamente!', 'success');
      setIsStartModalOpen(false);
      await refreshData();
    } catch (err: any) {
      console.error('Error starting tournament:', err);
      showToast(err.message || 'Error al iniciar el torneo.', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handlePublishTournament = async () => {
    if (!tournament) return;
    try {
      setIsPublishing(true);
      await tournamentService.publishTournament(tournament.id);
      showToast('¡Torneo publicado correctamente!', 'success');
      await refreshData();
    } catch (err: any) {
      console.error('Error publishing tournament:', err);
      showToast(err.message || 'Error al publicar el torneo.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishTournament = async () => {
    if (!tournament) return;
    try {
      setIsUnpublishing(true);
      await tournamentService.unpublishTournament(tournament.id);
      showToast('¡Torneo ocultado correctamente!', 'success');
      await refreshData();
    } catch (err: any) {
      console.error('Error unpublishing tournament:', err);
      showToast(err.message || 'Error al ocultar el torneo.', 'error');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCancelTournament = async () => {
    if (!tournament) return;
    try {
      setIsUnpublishing(true);
      await tournamentService.cancelTournament(tournament.id);
      showToast('¡Torneo cancelado correctamente!', 'success');
      await refreshData();
    } catch (err: any) {
      console.error('Error cancelling tournament:', err);
      showToast(err.message || 'Error al cancelar el torneo.', 'error');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const formattedDate = formatTournamentDate(info.dateTime);
  const formattedTime = formatTournamentTime(info.dateTime);

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos', path: '/torneos' },
    { label: name },
  ];

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'registration', label: 'Inscripciones' },
    { id: 'bracket', label: 'Cuadrante' },
    ...(isAdmin && isEditingBracket ? [{ id: 'create-bracket', label: 'Configurar cuadrante' }] : []),
    ...(isAdmin && (status !== TournamentStatus.FINISHED && status !== TournamentStatus.CANCELLED) ? [{ id: 'playing-area', label: 'Salón de juego' }] : []),
    { id: 'matches', label: 'Partidas' },
    ...(status === TournamentStatus.FINISHED ? [{ id: 'results', label: 'Resultados' }] : []),
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />

        <div style={styles.titleContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Title>{name}</Title>
              <div style={styles.tagsContainer}>
                <TournamentStatusTag status={status} size="medium" />
                {status === TournamentStatus.PUBLISHED && (
                  <TournamentRegistrationStatusTag status={registration.status} size="medium" />
                )}
                {tournament.isDelayed && (
                  <TournamentStatusTag status='DELAYED' size="medium" />
                )}
              </div>
            </div>
            <div style={styles.subtitleMetadata}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getFederationFlag(info.federation) && (
                  <img
                    src={getFederationFlag(info.federation)!}
                    alt="Flag"
                    style={{ width: '16px', height: 'auto', borderRadius: '2px', opacity: 0.8 }}
                  />
                )}
                <span>{getFederationLabel(info.federation)}</span>
              </div>
              <span style={styles.separator}>•</span>
              <span>Temporada {tournament.seasonStartYear}/{getSeasonEndYear(tournament.seasonStartYear)}</span>
            </div>
          </div>

          {!isAdmin && status === TournamentStatus.PUBLISHED && registration.status === RegistrationStatus.OPEN && (
            userParticipant ? (
              <Button
                variant="danger-primary"
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

          {isAdmin && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {status !== TournamentStatus.FINISHED && status !== TournamentStatus.CANCELLED && status !== TournamentStatus.DELETED && (
                <Button
                  variant="secondary"
                  leftIcon="Ban"
                  onClick={handleCancelTournament}
                  loading={isCancelling}
                >
                  CANCELAR TORNEO
                </Button>
              )}
              {status === TournamentStatus.DRAFT && (
                <Button
                  variant="primary"
                  leftIcon="Megaphone"
                  onClick={handlePublishTournament}
                  loading={isPublishing}
                >
                  PUBLICAR TORNEO
                </Button>
              )}
              {status === TournamentStatus.PUBLISHED && (
                <>
                  <Button
                    variant="secondary"
                    leftIcon="EyeOff"
                    onClick={handleUnpublishTournament}
                    loading={isUnpublishing}
                  >
                    OCULTAR TORNEO
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon="Play"
                    onClick={handleInitTournament}
                  >
                    INICIAR TORNEO
                  </Button>
                </>
              )}
            </div>
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
              Confirma la inscripción al torneo <strong>{name}</strong>
              <br /><br />
              <strong>Fecha:</strong> {formattedDate}<br />
              <strong>Hora:</strong> {formattedTime}<br />
              <strong>Lugar:</strong> {info.place}
            </>
          ) : (
            <>
              ¿Estás seguro de que deseas desinscribirte del torneo <strong>{name}</strong>?
            </>
          )
        }
        confirmLabel={modalMode === 'register' ? "Confirmar" : "Desinscribirse"}
        cancelLabel="Cancelar"
        variant='danger'
        onConfirm={handleConfirmRegistration}
        loading={isRegistering}
      />

      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="INICIAR TORNEO"
        description={
          <div style={{ textAlign: 'left' }}>
            ¿Estás seguro de que deseas iniciar el torneo <strong>{name}</strong>?
            <br /><br />
            Una vez iniciado, las inscripciones no podrán volver a abrirse y el cuadrante no podrá modificarse.
          </div>
        }
        confirmLabel="Iniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmStartTournament}
        loading={isStarting}
      />

      <Tabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'info' &&
        <TournamentInfoTab tournament={tournament} />
      }
      {activeTab === 'registration' && (
        <TournamentRegistrationTab
          tournament={tournament}
          participants={participants}
          onRefresh={refreshData}
        />
      )}
      {activeTab === 'create-bracket' && (
        <TournamentCreateBracketTab
          tournament={tournament}
          participants={participants}
          onSave={handleBracketSaved}
          onCancel={handleBracketCanceled}
        />
      )}
      {activeTab === 'bracket' && (
        <TournamentBracketTab
          tournament={tournament}
          onStartEditing={handleStartEditing}
          onBracketGenerated={handleBracketGenerated}
        />
      )}
      {activeTab === 'matches' && (
        <TournamentMatchesTab tournamentId={tournament.id} isAdmin={isAdmin} />
      )}
      {activeTab === 'playing-area' && (
        <TournamentPlayingAreaTab tournamentId={tournament.id} />
      )}
      {activeTab === 'results' && (
        <TournamentResultsTab tournamentId={tournament.id} />
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    padding: '2rem',
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
    marginBottom: '1rem',
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
  subtitleMetadata: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    margin: '2rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
};

export default TournamentDetailsScreen;
