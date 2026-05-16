import React from 'react';
import { Tournament, Participant } from '../../../services/tournament.service';
import Table, { Column } from '../../../components/Table';
import { getFederationLabel, getFederationFlag } from '../../../utils/tournament.utils';

interface TournamentInscriptionsTabProps {
  tournament: Tournament;
  participants: Participant[];
  loading?: boolean;
}

const TournamentInscriptionsTab: React.FC<TournamentInscriptionsTabProps> = ({
  tournament,
  participants,
  loading = false
}) => {
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
};

export default TournamentInscriptionsTab;
