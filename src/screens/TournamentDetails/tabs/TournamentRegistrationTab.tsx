import React, { useState } from 'react';
import { Tournament, Participant, tournamentService, UnregisteredPlayer } from '../../../services/tournament.service';
import Table, { Column } from '../../../components/Table';
import { getFederationLabel, getFederationFlag, getRegistrationStatusLabel, formatTournamentDateTime } from '../../../utils/tournament.utils';
import { useAuth, UserRoles } from '../../../context/AuthContext';
import InfoCard from '../../../components/InfoCard';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import DatePicker from '../../../components/DatePicker';
import TimePicker from '../../../components/TimePicker';
import Select from '../../../components/Select';
import ErrorMessage from '../../../components/ErrorMessage';

const toUtcDateParts = (isoString: any) => {
  if (!isoString) return { date: '', time: '12:00' };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: '', time: '12:00' };

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');

  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');

  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`
  };
};

interface TournamentRegistrationTabProps {
  tournament: Tournament;
  participants: Participant[];
  loading?: boolean;
  onRefresh?: () => void;
}

const TournamentRegistrationTab: React.FC<TournamentRegistrationTabProps> = ({
  tournament,
  participants,
  loading = false,
  onRefresh
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRoles.ADMIN;
  const { showToast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleRegistration = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      if (registration.status === 'OPEN') {
        await tournamentService.closeRegistration(tournament.id);
        showToast('Inscripciones cerradas correctamente.', 'success');
      } else {
        await tournamentService.openRegistration(tournament.id);
        showToast('Inscripciones abiertas correctamente.', 'success');
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Error toggling registration status:', err);
      showToast(err.message || 'Error al cambiar el estado de las inscripciones.', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStartProgrammed, setIsStartProgrammed] = useState<'SI' | 'NO'>('NO');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [isEndProgrammed, setIsEndProgrammed] = useState<'SI' | 'NO'>('NO');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('12:00');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleOpenScheduleModal = () => {
    const startParts = toUtcDateParts(registration.registrationPeriod.startsAt);
    const endParts = toUtcDateParts(registration.registrationPeriod.endsAt);

    setIsStartProgrammed(registration.registrationPeriod.startsAt ? 'SI' : 'NO');
    setStartDate(startParts.date);
    setStartTime(startParts.time);

    setIsEndProgrammed(registration.registrationPeriod.endsAt ? 'SI' : 'NO');
    setEndDate(endParts.date);
    setEndTime(endParts.time);

    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    try {
      setIsScheduling(true);

      const startsAt = isStartProgrammed === 'SI' && startDate
        ? `${startDate}T${startTime || '12:00'}:00.000Z`
        : null;

      const endsAt = isEndProgrammed === 'SI' && endDate
        ? `${endDate}T${endTime || '12:00'}:00.000Z`
        : null;

      await tournamentService.updateRegistrationSchedule(tournament.id, {
        startsAt,
        endsAt
      });

      showToast('Inscripciones programadas correctamente', 'success');
      setIsScheduleModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Error scheduling registration:', err);
      showToast(err.message || 'Error al programar las inscripciones.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const [isRegisterPlayerModalOpen, setIsRegisterPlayerModalOpen] = useState(false);
  const [unregisteredPlayers, setUnregisteredPlayers] = useState<UnregisteredPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [isLoadingUnregistered, setIsLoadingUnregistered] = useState(false);
  const [isRegisteringPlayer, setIsRegisteringPlayer] = useState(false);

  const handleOpenRegisterPlayerModal = async () => {
    try {
      setIsLoadingUnregistered(true);
      setSelectedPlayerId('');
      setIsRegisterPlayerModalOpen(true);
      const players = await tournamentService.getUnregisteredPlayers(tournament.id);
      setUnregisteredPlayers(players);
    } catch (err: any) {
      console.error('Error fetching unregistered players:', err);
      showToast(err.message || 'Error al obtener los jugadores no inscritos.', 'error');
    } finally {
      setIsLoadingUnregistered(false);
    }
  };

  const handleConfirmRegisterPlayer = async () => {
    if (!selectedPlayerId) return;
    try {
      setIsRegisteringPlayer(true);
      await tournamentService.registerParticipant(tournament.id, selectedPlayerId);
      showToast('Participante inscrito correctamente.', 'success');
      setIsRegisterPlayerModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Error registering participant:', err);
      showToast(err.message || 'Error al inscribir al participante.', 'error');
    } finally {
      setIsRegisteringPlayer(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Participant | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  const handleOpenDeleteModal = (player: Participant) => {
    setPlayerToDelete(player);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;
    try {
      setIsDeletingPlayer(true);
      await tournamentService.unregisterParticipant(tournament.id, playerToDelete.id);
      showToast('Participante desinscrito correctamente.', 'success');
      setIsDeleteModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Error deleting participant:', err);
      showToast(err.message || 'Error al desinscribir al participante.', 'error');
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  const { registration } = tournament;
  const registrationStartsAt = formatTournamentDateTime(registration.registrationPeriod.startsAt);
  const registrationEndsAt = formatTournamentDateTime(registration.registrationPeriod.endsAt);

  const columns: Column<Participant>[] = [
    {
      key: 'id',
      header: '#',
      render: (_, index) => (
        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '700' }}>
          {index + 1}
        </span>
      )
    },
    {
      key: 'alias',
      header: 'Jugador',
      render: (item) => (
        <span style={{ fontWeight: '600', color: '#fff' }}>{item.alias}</span>
      )
    },
    {
      key: 'federation',
      header: 'Federación',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {getFederationFlag(item.federation) && (
            <img
              src={getFederationFlag(item.federation)!}
              alt="Flag"
              style={{ width: '20px', height: 'auto', borderRadius: '2px' }}
            />
          )}
          <span>{getFederationLabel(item.federation)}</span>
        </div>
      )
    },
    ...(isAdmin ? [{
      key: 'actions',
      header: 'Acciones',
      render: (item: Participant) => (
        <Button
          variant="danger"
          onClick={() => handleOpenDeleteModal(item)}
          leftIcon="X"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: '32px' }}
        >
          Desinscribir
        </Button>
      )
    }] : [])
  ];

  return (
    <div style={styles.content}>
      {isAdmin && (
        <section style={styles.section}>
          <div style={styles.infoGrid}>
            <InfoCard
              title="Estado"
              content={getRegistrationStatusLabel(registration.status)}
              icon="Info"
            />
            <InfoCard
              title="Apertura inscripciones"
              content={registrationStartsAt}
              icon="Clock"
            />
            <InfoCard
              title="Cierre inscripciones"
              content={registrationEndsAt}
              icon="Clock"
            />

            <div style={styles.registrationButtonsContainer}>
              <Button
                variant='secondary'
                leftIcon={registration.status === 'OPEN' ? 'ClipboardX' : 'ClipboardCheck'}
                onClick={handleToggleRegistration}
                loading={isToggling}
              >
                {registration.status === 'OPEN' ? 'Cerrar inscripciones' : 'Abrir inscripciones'}
              </Button>
              <Button
                variant="secondary"
                leftIcon="Clock"
                onClick={handleOpenScheduleModal}
              >
                Programar apertura/cierre
              </Button>
            </div>
          </div>
          <div style={{ alignItems: 'flex-start' }}>
            <Button
              variant="primary"
              leftIcon="Plus"
              onClick={handleOpenRegisterPlayerModal}
            >
              INSCRIBIR PARTICIPANTE
            </Button>
          </div>
        </section>
      )}


      <section style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.sectionTitle}>Jugadores inscritos</h2>
          <span style={styles.countBadge}>
            {participants.length} {participants.length === 1 ? 'jugador' : 'jugadores'}
          </span>
        </div>

        <Table
          data={participants}
          columns={columns}
          loading={loading}
          emptyMessage="No hay jugadores inscritos en este torneo"
        />
      </section>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="PROGRAMAR CIERRE/APERTURA DE INSCRIPCIONES"
        description={
          <div style={styles.modalContainer}>
            {/* APERTURA ROW */}
            <div style={styles.modalRow}>
              <h3 style={styles.modalRowTitle}>Apertura</h3>
              <Select
                label="¿Deseas programar la apertura de las inscripciones?"
                value={isStartProgrammed}
                options={{ NO: 'No', SI: 'Sí' }}
                onChange={(val) => setIsStartProgrammed(val as 'SI' | 'NO')}
              />

              {isStartProgrammed === 'SI' && (
                <div style={styles.dateTimeGrid}>
                  <DatePicker
                    label="Fecha de apertura"
                    value={startDate}
                    onChange={setStartDate}
                    required
                  />
                  <TimePicker
                    label="Hora de apertura"
                    value={startTime}
                    onChange={setStartTime}
                    required
                  />
                </div>
              )}
            </div>

            {/* CIERRE ROW */}
            <div style={styles.modalRow}>
              <h3 style={styles.modalRowTitle}>Cierre</h3>
              <Select
                label="¿Deseas programar el cierre de las inscripciones?"
                value={isEndProgrammed}
                options={{ NO: 'No', SI: 'Sí' }}
                onChange={(val) => setIsEndProgrammed(val as 'SI' | 'NO')}
              />

              {isEndProgrammed === 'SI' && (
                <div style={styles.dateTimeGrid}>
                  <DatePicker
                    label="Fecha de cierre"
                    value={endDate}
                    onChange={setEndDate}
                    required
                  />
                  <TimePicker
                    label="Hora de cierre"
                    value={endTime}
                    onChange={setEndTime}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmSchedule}
        loading={isScheduling}
        maxWidth="700px"
      />

      <Modal
        isOpen={isRegisterPlayerModalOpen}
        onClose={() => setIsRegisterPlayerModalOpen(false)}
        title="INSCRIBIR PARTICIPANTE"
        description={
          <div style={styles.modalContainer}>
            {unregisteredPlayers.length === 0 && !isLoadingUnregistered ? (
              <ErrorMessage
                message='No hay jugadores disponibles para inscribir (todos los jugadores con ficha en esta temporada ya están inscritos en este torneo).'
              />
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary-color)', fontSize: '0.9rem', textAlign: 'left' }}>
                  Elige el jugador al que inscribir al torneo <strong>{tournament.name}</strong>.
                </p>
                <Select
                  label="Jugador"
                  value={selectedPlayerId}
                  options={unregisteredPlayers.map(p => ({ value: p.id, label: p.userAlias }))}
                  onChange={(val) => setSelectedPlayerId(val)}
                  icon="User"
                  placeholder="Selecciona un jugador..."
                />
              </>
            )}
          </div>
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRegisterPlayer}
        loading={isRegisteringPlayer || isLoadingUnregistered}
        confirmDisabled={!selectedPlayerId || unregisteredPlayers.length === 0}
        maxWidth='600px'
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DESINSCRIBIR JUGADOR"
        description={
          playerToDelete ? (
            <div style={{ textAlign: 'left' }}>
              ¿Estás seguro de que deseas desinscribir a <strong>{playerToDelete.alias}</strong> de este torneo?
            </div>
          ) : ''
        }
        confirmLabel="Desinscribir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        loading={isDeletingPlayer}
      />
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  countBadge: {
    backgroundColor: 'rgba(196, 232, 102, 0.1)',
    color: '#C4E866',
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  registrationButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    textAlign: 'left',
  },
  modalRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    textAlign: 'left',
  },
  modalRowTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#C4E866',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0,
  },

  modalInput: {
    padding: '0.75rem 1rem',
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  dateTimeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '0.5rem',
  }
};

export default TournamentRegistrationTab;
