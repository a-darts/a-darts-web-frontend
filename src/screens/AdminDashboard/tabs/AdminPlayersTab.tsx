import React, { useState, useEffect } from 'react';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import IconButton from '../../../components/IconButton';
import { useToast } from '../../../context/ToastContext';
import { getFederationFlag, getSeasonEndYear } from '../../../utils/tournament.utils';
import Table, { Column } from '../../../components/Table';
import { playerService, Player } from '../../../services/player.service';
import i18n from '../../../i18n';
import { useNavigate } from 'react-router-dom';

const AdminPlayersTab: React.FC = () => {
  const navigate = useNavigate();
  const [playerQuery, setPlayerQuery] = useState('');

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 16;

  const fetchPlayers = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await playerService.getPlayers(page, limit);
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          setPlayers(res.data);
          setTotalPages(1);
        } else if (res.data.players && Array.isArray(res.data.players)) {
          setPlayers(res.data.players);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page || 1);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(err.message || 'Error al cargar los jugadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPlayers(page);
  };

  const columns: Column<Player>[] = [
    {
      key: 'userAlias',
      header: 'Alias',
      render: (p) => <span style={styles.playerAlias}>{p.userAlias || 'Sin alias'}</span>,
    },
    {
      key: 'registrationNumber',
      header: 'Número de ficha',
      render: (p) => <span>{p.registrationNumber}</span>,
    },
    {
      key: 'federation',
      header: 'Federación',
      render: (p) => (
        <div style={styles.playerFederationVal}>
          {getFederationFlag(p.federation) && (
            <img src={getFederationFlag(p.federation) || ''} alt="Flag" style={styles.flagIcon} />
          )}
          <span>{i18n.t(`federations.${p.federation}`)}</span>
        </div>
      ),
    },
    {
      key: 'seasonStartYear',
      header: 'Temporada',
      render: (p) => (
        <span>{p.seasonStartYear} - {getSeasonEndYear(p.seasonStartYear)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (p) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IconButton
            name="Edit"
            onClick={() => navigate(`/admin/jugadores/editar/${p.id}`)}
            title="Editar jugador"
          />
        </div>
      ),
    },
  ];

  const filtered = players.filter(p =>
    (p.userAlias || '').toLowerCase().includes(playerQuery.toLowerCase())
  );

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}>Panel de Jugadores Federados</h2>
        <div style={styles.viewActionsContainer}>
          <div style={styles.searchWrapper}>
            <SearchInput value={playerQuery} onChange={setPlayerQuery} placeholder="Buscar por alias..." />
          </div>
          <Button
            leftIcon='Plus'
            variant='primary'
            onClick={() => navigate('/admin/jugadores/registrar')}
          >
            Registrar jugador
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <Icon name="Loader" className="animate-spin" size={24} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
          <span>Cargando jugadores...</span>
        </div>
      ) : error ? (
        <div style={{ ...styles.loadingContainer, color: '#FD605D' }}>
          <Icon name="AlertCircle" size={24} style={{ marginBottom: '1rem' }} />
          <span>{error}</span>
        </div>
      ) : (
        <Table
          data={filtered}
          columns={columns}
          emptyMessage="No hay jugadores registrados que coincidan con el criterio."
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange
          }}
        />
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
  viewActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  viewHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
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
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '18px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'all 0.25s ease',
  },
  playerCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  playerCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  playerAlias: {
    fontWeight: '600',
    color: '#ffffff',
  },
  playerFullName: {
    fontSize: '0.8rem',
    color: 'rgba(100, 74, 74, 0.4)',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--btn-primary-bg)',
    background: 'rgba(196, 232, 102, 0.1)',
    border: '1px solid rgba(196, 232, 102, 0.2)',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
  },
  playerCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
  },
  playerStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  playerStatLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  playerStatVal: {
    color: '#ffffff',
    fontWeight: '600',
  },
  playerStatValHighlight: {
    color: 'var(--btn-primary-bg)',
    fontWeight: '700',
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
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default AdminPlayersTab;
