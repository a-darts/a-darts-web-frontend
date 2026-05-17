import React, { useState } from 'react';
import { Tournament, Participant, tournamentService } from '../../../services/tournament.service';
import Table, { Column } from '../../../components/Table';
import { getFederationLabel, getFederationFlag, getRegistrationStatusLabel } from '../../../utils/tournament.utils';
import { useAuth, UserRoles } from '../../../context/AuthContext';
import InfoCard from '../../../components/InfoCard';
import Button from '../../../components/Button';
import { useToast } from '../../../context/ToastContext';

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

  const formatDateTime = (dateVal: any): string => {
    if (!dateVal) return 'Sin programar';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return 'Sin programar';
    const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedTime = date.getUTCHours().toString().padStart(2, '0') + ':' +
      date.getUTCMinutes().toString().padStart(2, '0');
    return `${formattedDate} a las ${formattedTime}`;
  };

  const { registration } = tournament;
  const registrationStartsAt = formatDateTime(registration.registrationPeriod.startsAt);
  const registrationEndsAt = formatDateTime(registration.registrationPeriod.endsAt);

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
    }
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
              // onClick={() => navigate(`/torneos/${tournament.id}/edit`)}
              >
                Programar apertura/cierre
              </Button>
            </div>
          </div>
          <div style={{ alignItems: 'flex-start' }}>
            <Button
              variant="primary"
              leftIcon="Plus"
            // onClick={() => navigate(`/torneos/${tournament.id}/edit`)}
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
  }
};

export default TournamentRegistrationTab;
