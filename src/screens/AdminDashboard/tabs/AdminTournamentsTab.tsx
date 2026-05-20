import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import IconButton from '../../../components/IconButton';
import { tournamentService, Tournament, Federations, GameModes } from '../../../services/tournament.service';
import { getModeLabel, getScheduleTypeLabel, formatTournamentDate, getSeasonEndYear, getFederationFlag } from '../../../utils/tournament.utils';
import TournamentStatusTag from '../../../components/TournamentStatusTag';
import Select from '../../../components/Select';
import i18n from '../../../i18n';

const AdminTournamentsTab: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentQuery, setTournamentQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [federationFilter, setFederationFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournaments();
        setTournaments(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tournaments:', err);
        setError(err.message || 'Error al cargar la lista de torneos.');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filtered = tournaments.filter(t => {
    const matchesQuery = t.name.toLowerCase().includes(tournamentQuery.toLowerCase()) ||
      (t.info?.mode && getModeLabel(t.info.mode).toLowerCase().includes(tournamentQuery.toLowerCase())) ||
      (t.info?.schedule && getScheduleTypeLabel(t.info.schedule).toLowerCase().includes(tournamentQuery.toLowerCase()));

    const matchesFed = federationFilter === '' || t.info?.federation === federationFilter;
    const matchesMode = modeFilter === '' || t.info?.mode === modeFilter;

    return matchesQuery && matchesFed && matchesMode;
  });

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <div style={styles.viewHeaderRow}>
          <h2 style={styles.viewTitle}>Panel de Torneos</h2>
          <Button
            variant="primary"
            size="medium"
            leftIcon="Plus"
            onClick={() => navigate('/admin/torneos/crear')}
          >
            Crear torneo
          </Button>
          {/* </div> */}
        </div>
        <div style={styles.viewActionsContainer}>
          <div style={styles.searchWrapper}>
            <SearchInput value={tournamentQuery} onChange={setTournamentQuery} placeholder="Buscar por nombre, formato o modalidad..." />
          </div>
          <div style={styles.filtersWrapper}>
            <div style={styles.filterItem}>
              <Select
                label='Federación'
                value={federationFilter}
                onChange={setFederationFilter}
                options={[
                  { value: '', label: 'Todas' },
                  ...Object.entries(Federations).map(([k, v]) => ({ value: k, label: v }))
                ]}
                icon="Flag"
              />
            </div>
            <div style={styles.filterItem}>
              <Select
                label='Modalidad'
                value={modeFilter}
                onChange={setModeFilter}
                options={[
                  { value: '', label: 'Todas' },
                  ...Object.entries(GameModes).map(([k, v]) => ({ value: k, label: v }))
                ]}
                icon="Users"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <Icon name="Loader" className="animate-spin" size={24} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
          <span>Cargando torneos...</span>
        </div>
      ) : error ? (
        <div style={{ ...styles.loadingContainer, color: '#FD605D' }}>
          <Icon name="AlertCircle" size={24} style={{ marginBottom: '1rem' }} />
          <span>{error}</span>
        </div>
      ) : (
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th style={styles.th}>Torneo</th>
                <th style={styles.th}>Fecha Inicio</th>
                <th style={styles.th}>Modalidad</th>
                <th style={styles.th}>Federación</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={styles.trBody}>
                  <td style={styles.td}>
                    <span style={styles.tournamentNameLink} onClick={() => navigate(`/torneos/${t.id}`)}>
                      {t.name}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {t.info?.dateTime ? formatTournamentDate(t.info.dateTime) : 'Sin programar'}
                  </td>
                  <td style={styles.td}>
                    {t.info ? `${getModeLabel(t.info.mode)}` : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {/* <span style={{ fontWeight: '600' }}>
                      {t.registration?.registeredParticipantsIds?.length || 0}
                    </span>
                    {t.info?.maxPlayers ? ` / ${t.info.maxPlayers}` : ''} */}
                    <div style={styles.playerFederationVal}>
                      {getFederationFlag(t.info.federation) && (
                        <img
                          src={getFederationFlag(t.info.federation) || ''}
                          alt="Flag"
                          style={styles.flagIcon}
                        />
                      )}
                      <span>{i18n.t(`federations.${t.info.federation}`)}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <TournamentStatusTag
                      status={t.status}
                      size="small"
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <IconButton
                        name="Info"
                        onClick={() => navigate(`/torneos/${t.id}`)}
                        title="Administrar torneo"
                      />
                      <IconButton
                        name="Edit"
                        onClick={() => navigate(`/admin/torneos/${t.id}/editar`, { state: { from: '/admin' } })}
                        title="Editar torneo"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={styles.emptyTableTd}>
                    No hay torneos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  viewHeader: {

  },
  viewHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  viewActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  viewTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-title)',
    marginBottom: '0.5rem',
  },
  viewSub: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    lineHeight: '1.5',
  },
  searchWrapper: {
    width: '100%',
    maxWidth: '420px',
    minWidth: '240px',
  },
  filtersWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterItem: {
    minWidth: '200px',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  th: {
    padding: '1.2rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '700',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.01)',
    },
  },
  td: {
    padding: '1.2rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.8)',
    verticalAlign: 'middle',
  },
  emptyTableTd: {
    padding: '3rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.95rem',
  },
  tournamentNameLink: {
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    ':hover': {
      color: 'var(--btn-primary-bg)',
    },
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  playerFederationVal: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  flagIcon: {
    width: '18px',
    height: '12px',
    objectFit: 'cover',
    borderRadius: '2px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

export default AdminTournamentsTab;
