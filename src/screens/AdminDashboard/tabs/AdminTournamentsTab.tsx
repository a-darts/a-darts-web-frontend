import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import IconButton from '../../../components/IconButton';
import { tournamentService, Tournament, Federations, GameModes, TournamentStatus } from '../../../services/tournament.service';
import { getModeLabel, getStatusLabel, formatTournamentDate, getSeasonEndYear, getFederationFlag } from '../../../utils/tournament.utils';
import TournamentStatusTag from '../../../components/TournamentStatusTag';
import Select from '../../../components/Select';
import i18n from '../../../i18n';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import Table, { Column } from '../../../components/Table';

const AdminTournamentsTab: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentQuery, setTournamentQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [federationFilter, setFederationFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [statusFilters, setStatusFilters] = useState<TournamentStatus[]>(
    Object.values(TournamentStatus).filter(
      (status) => status !== TournamentStatus.DELETED && status !== TournamentStatus.CANCELLED
    )
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState<React.ReactNode>('');
  const [modalConfirmLabel, setModalConfirmLabel] = useState('Confirmar');
  const [modalVariant, setModalVariant] = useState<'primary' | 'danger'>('primary');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => Promise<void>) | null>(null);
  const [modalLoading, setModalLoading] = useState(false);


  const fetchTournaments = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const res = await tournamentService.getTournaments(
        page,
        limit,
        statusFilters,
        federationFilter || undefined,
        modeFilter || undefined,
      );

      if (res && res.data) {
        if (Array.isArray(res.data)) {
          setTournaments(res.data);
          setTotalPages(1);
        } else if (res.data.tournaments && Array.isArray(res.data.tournaments)) {
          setTournaments(res.data.tournaments);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page || 1);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching tournaments:', err);
      setError(err.message || 'Error al cargar la lista de torneos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments(currentPage);
  }, [currentPage, statusFilters, federationFilter, modeFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const toggleStatusFilter = (status: TournamentStatus) => {
    setCurrentPage(1);
    setStatusFilters((prev) => {
      const isCurrentlySelected = prev.includes(status);
      if (isCurrentlySelected) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const filtered = tournaments.filter(t => {
    return t.name.toLowerCase().includes(tournamentQuery.toLowerCase()) ||
      (t.info?.mode && getModeLabel(t.info.mode).toLowerCase().includes(tournamentQuery.toLowerCase()));
  });

  const openConfirmModal = (
    title: string,
    description: React.ReactNode,
    confirmLabel: string,
    variant: 'primary' | 'danger',
    onConfirm: () => Promise<void>
  ) => {
    setModalTitle(title);
    setModalDescription(description);
    setModalConfirmLabel(confirmLabel);
    setModalVariant(variant);
    setModalOnConfirm(() => onConfirm);
    setModalOpen(true);
  };

  const handleDeleteConfirm = (tournament: Tournament) => {
    openConfirmModal(
      'Eliminar torneo',
      <>
        ¿Estás seguro de que deseas eliminar permanentemente el torneo <strong>{tournament.name || ''}</strong>?
        <br />
        <br />
        Si el torneo no tiene ningún jugador inscrito ni ningún partido, cuadrante o resultados, se eliminará permanentemente. En caso contrario, se mantendrá su registro en el sistema.
      </>,
      'Eliminar',
      'danger',
      async () => {
        try {
          await tournamentService.deleteTournament(tournament.id);
          showToast('Torneo eliminado con éxito!', 'success');
          fetchTournaments();
        } catch (err: any) {
          console.error('Error deleting tournament:', err);
          showToast(err.message || 'Error al eliminar el torneo.', 'error');
        }
      }
    );
  };


  const handleRestoreConfirm = (tournament: Tournament) => {
    openConfirmModal(
      'Restaurar torneo',
      <>
        ¿Estás seguro de que deseas restaurar el torneo <strong>{tournament.name || ''}</strong>?
        <br />
        <br />
        El torneo se restaurará con estado BORRADOR y podrás editarlo nuevamente.
      </>,
      'Restaurar',
      'primary',
      async () => {
        try {
          await tournamentService.restoreTournament(tournament.id);
          showToast('Torneo restaurado con éxito!', 'success');
          fetchTournaments();
        } catch (err: any) {
          console.error('Error restoring tournament:', err);
          showToast(err.message || 'Error al restaurar el torneo.', 'error');
        }
      }
    );
  };

  const columns: Column<Tournament>[] = [
    {
      key: 'name',
      header: 'Torneo',
      render: (t) => (
        <span style={styles.tournamentNameLink} onClick={() => navigate(`/tournaments/${t.id}`)}>
          {t.name}
        </span>
      ),
    },
    {
      key: 'dateTime',
      header: 'Fecha Inicio',
      render: (t) => t.info?.dateTime ? formatTournamentDate(t.info.dateTime) : 'Sin programar',
    },
    {
      key: 'mode',
      header: 'Modalidad',
      render: (t) => t.info ? `${getModeLabel(t.info.mode)}` : 'N/A',
    },
    {
      key: 'federation',
      header: 'Federación',
      render: (t) => (
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
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (t) => (
        <TournamentStatusTag
          status={t.status}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (t) => (
        <div style={styles.actionGroup}>
          <IconButton
            name="Info"
            onClick={() => navigate(`/tournaments/${t.id}`)}
            title="Ver más información"
          />
          {t.status !== TournamentStatus.FINISHED && t.status !== TournamentStatus.CANCELLED && t.status !== TournamentStatus.DELETED && (
            <IconButton
              name="Edit"
              onClick={() => navigate(`/admin/tournaments/${t.id}/editar`, { state: { from: '/admin' } })}
              title="Editar torneo"
            />
          )}
          {(t.status === TournamentStatus.DRAFT || t.status === TournamentStatus.PUBLISHED) && (
            <IconButton
              name="Trash"
              onClick={() => handleDeleteConfirm(t)}
              title="Eliminar torneo"
              className='icon-btn-danger'
            />
          )}
          {t.status === TournamentStatus.DELETED && (
            <IconButton
              name="RefreshCw"
              onClick={() => handleRestoreConfirm(t)}
              title="Restaurar torneo"
              className='icon-btn'
            />
          )}
        </div>
      ),
    },
  ];


  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <div style={styles.viewHeaderRow}>
          <h2 style={styles.viewTitle}>Panel de Torneos</h2>
          <Button
            variant="primary"
            size="medium"
            leftIcon="Plus"
            onClick={() => navigate('/admin/tournaments/crear')}
          >
            Crear torneo
          </Button>
          {/* </div> */}
        </div>
        <div style={styles.viewActionsContainer}>
          <div style={styles.searchWrapper}>
            <SearchInput value={tournamentQuery} onChange={setTournamentQuery} placeholder="Buscar por nombre o modalidad..." />
          </div>
          <div style={styles.filtersWrapper}>
            <div style={styles.filterItem}>
              <Select
                label='Federación'
                value={federationFilter}
                onChange={(val) => {
                  setCurrentPage(1);
                  setFederationFilter(val);
                }}
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
                onChange={(val) => {
                  setCurrentPage(1);
                  setModeFilter(val);
                }}
                options={[
                  { value: '', label: 'Todas' },
                  ...Object.entries(GameModes).map(([k, v]) => ({ value: k, label: v }))
                ]}
                icon="Users"
              />
            </div>
          </div>
        </div>

        <div style={styles.statusToggleContainer}>
          <span style={styles.toggleLabel}>Estados de los torneos</span>
          <div style={styles.toggleButtonsWrapper}>
            {Object.values(TournamentStatus).map((status) => {
              const isSelected = statusFilters.includes(status);
              return (
                <Button
                  key={status}
                  variant={isSelected ? 'primary' : 'secondary'}
                  leftIcon={isSelected ? 'Check' : undefined}
                  onClick={() => toggleStatusFilter(status)}
                  size="small"
                >
                  {getStatusLabel(status)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <Icon
            name="Loader"
            size={32}
            className="btn-icon animate-spin"
          />
          <div style={styles.loadingText}>Cargando torneos...</div>
        </div>
      ) : error ? (
        <div style={{ ...styles.loadingContainer, color: '#FF7070' }}>
          <Icon name="AlertCircle" size={24} style={{ marginBottom: '1rem' }} />
          <span>{error}</span>
        </div>
      ) : (
        <Table
          data={filtered}
          columns={columns}
          emptyMessage="No hay torneos que coincidan con la búsqueda."
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange
          }}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        description={modalDescription}
        confirmLabel={modalConfirmLabel}
        onConfirm={async () => {
          if (modalOnConfirm) {
            setModalLoading(true);
            try {
              await modalOnConfirm();
              setModalOpen(false);
            } finally {
              setModalLoading(false);
            }
          }
        }}
        variant={modalVariant}
        loading={modalLoading}
      />
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
  statusToggleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  toggleLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  toggleButtonsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
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
    gap: '1rem',
    alignItems: 'center',
    margin: '2rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
};

export default AdminTournamentsTab;
