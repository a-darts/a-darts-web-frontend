import React, { useState, useEffect } from 'react';
import { useAuth, UserRoles } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import AdminSidebar from '../components/AdminSidebar';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';
import { getFederationFlag } from '../utils/tournament.utils';
import { getRoleLabel } from '../utils/auth.utils';
import i18n from '../i18n';

// Interfaces for mock data
interface MockUser {
  id: string;
  alias: string;
  email: string;
  role: string;
  registeredAt: string;
  status: string;
}

interface MockPlayer {
  id: string;
  alias: string;
  fullName: string;
  federation: string;
  federationYear: number;
  ppd: number;
  category: 'A' | 'B' | 'C' | 'Pro';
}

interface MockTournament {
  id: string;
  name: string;
  format: 'K.O. DIRECTO' | 'DOBLE ELIMINACIÓN' | 'LIGA';
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'FINISHED';
  participantsCount: number;
  maxParticipants: number;
  startDate: string;
}

const mockUsersData: MockUser[] = [
  { id: '1', alias: 'AdminPro', email: 'admin@adarts.com', role: UserRoles.ADMIN, registeredAt: '2025-10-12', status: 'ACTIVE' },
  { id: '2', alias: 'DardoVeloz', email: 'dardo.veloz@gmail.com', role: UserRoles.USER, registeredAt: '2026-01-15', status: 'ACTIVE' },
  { id: '3', alias: 'DianaMaster', email: 'diana.master@hotmail.com', role: UserRoles.USER, registeredAt: '2026-02-20', status: 'ACTIVE' },
  { id: '4', alias: 'BullseyeKing', email: 'bullseye@gmail.com', role: UserRoles.USER, registeredAt: '2026-03-01', status: 'SUSPENDED' },
  { id: '5', alias: 'Triple20', email: 'triple20@yahoo.com', role: UserRoles.USER, registeredAt: '2026-04-10', status: 'ACTIVE' },
  { id: '6', alias: 'DartsQueen', email: 'darts.queen@gmail.com', role: UserRoles.USER, registeredAt: '2026-05-02', status: 'ACTIVE' }
];

const mockPlayersData: MockPlayer[] = [
  { id: 'p1', alias: 'DardoVeloz', fullName: 'Carlos Gómez Ruíz', federation: 'Madrid', federationYear: 2024, ppd: 24.5, category: 'A' },
  { id: 'p2', alias: 'DianaMaster', fullName: 'Elena Martínez Vega', federation: 'Cataluña', federationYear: 2023, ppd: 28.2, category: 'Pro' },
  { id: 'p3', alias: 'BullseyeKing', fullName: 'Javier López Soler', federation: 'Andalucía', federationYear: 2025, ppd: 21.0, category: 'B' },
  { id: 'p4', alias: 'Triple20', fullName: 'Marcos Alonso Sanz', federation: 'Valencia', federationYear: 2024, ppd: 26.8, category: 'A' },
  { id: 'p5', alias: 'DartsQueen', fullName: 'Sofia Castro Ortiz', federation: 'Galicia', federationYear: 2025, ppd: 19.5, category: 'C' }
];

const mockTournamentsData: MockTournament[] = [
  { id: 't1', name: 'I Open Nacional A-Darts', format: 'K.O. DIRECTO', status: 'PUBLISHED', participantsCount: 16, maxParticipants: 32, startDate: '2026-06-15' },
  { id: 't2', name: 'Liga de Invierno 501', format: 'LIGA', status: 'IN_PROGRESS', participantsCount: 12, maxParticipants: 12, startDate: '2026-01-10' },
  { id: 't3', name: 'Torneo Benéfico de Darts', format: 'K.O. DIRECTO', status: 'DRAFT', participantsCount: 4, maxParticipants: 16, startDate: '2026-07-22' },
  { id: 't4', name: 'Masters Absoluto 2026', format: 'DOBLE ELIMINACIÓN', status: 'FINISHED', participantsCount: 8, maxParticipants: 8, startDate: '2026-05-01' }
];

const AdminDashboardScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('usuarios');

  // Real users states from backend
  const [users, setUsers] = useState<MockUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Search filter states
  const [userQuery, setUserQuery] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');
  const [tournamentQuery, setTournamentQuery] = useState('');

  // Local settings states
  const [settings, setSettings] = useState({
    openRegistration: true,
    allowExternalPlayers: false,
    systemEmail: 'admin@adarts.com',
    defaultSetsFormat: 'Best of 3',
    maintenanceMode: false
  });

  // Access check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRoles.ADMIN) {
        showToast('No tienes permisos de administrador para acceder al panel.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, showToast]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await authService.getUsers();
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === UserRoles.ADMIN) {
      fetchUsers();
    }
  }, [user]);

  if (authLoading || !user || user.role !== UserRoles.ADMIN) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Verificando credenciales de administrador...</span>
      </div>
    );
  }

  // Handle action toasts for mock actions
  const triggerDemoToast = (action: string) => {
    showToast(`Acción "${action}" no disponible en modo demostración.`, 'info');
  };

  const handleSaveSettings = () => {
    showToast('Configuración del sistema guardada con éxito.', 'success');
  };

  // Views rendering
  const renderUsersView = () => {
    const filtered = users.filter(u =>
      (u.alias || '').toLowerCase().includes(userQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userQuery.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return styles.activeBadge;
        case 'BLOCKED':
          return styles.suspendedBadge; // Suspended colors
        case 'INACTIVE':
          return styles.inactiveBadgeStyle;
        case 'DELETED':
          return styles.deletedBadgeStyle;
        default:
          return styles.suspendedBadge;
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'ACTIVE':
          return 'Activo';
        case 'BLOCKED':
          return 'Bloqueado';
        case 'INACTIVE':
          return 'Inactivo';
        case 'DELETED':
          return 'Eliminado';
        default:
          return status;
      }
    };

    const formatDate = (dateStr: string) => {
      try {
        return new Date(dateStr).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return dateStr;
      }
    };

    return (
      <div style={styles.contentCard}>
        <div style={styles.viewHeader}>
          <div style={styles.viewHeaderLeft}>
            <h2 style={styles.viewTitle}>Gestión de Usuarios</h2>
            <p style={styles.viewSub}>Visualiza, administra roles y gestiona las cuentas de los usuarios del sistema.</p>
          </div>
          <div style={styles.searchWrapper}>
            <SearchInput value={userQuery} onChange={setUserQuery} placeholder="Buscar por alias o correo..." />
          </div>
        </div>

        {usersLoading ? (
          <div style={styles.loadingContainer}>
            <Icon name="Loader" className="animate-spin" size={24} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
            <span>Cargando usuarios...</span>
          </div>
        ) : usersError ? (
          <div style={{ ...styles.loadingContainer, color: '#FD605D' }}>
            <Icon name="AlertCircle" size={24} style={{ marginBottom: '1rem' }} />
            <span>{usersError}</span>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={styles.th}>Alias</th>
                  <th style={styles.th}>Correo Electrónico</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Fecha Registro</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={styles.trBody}>
                    <td style={styles.td}>
                      <span style={styles.aliasName}>{u.alias || 'Sin alias'}</span>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={u.role === 'ADMIN' ? styles.adminBadge : styles.playerBadge}>
                        {i18n.t(`auth.${getRoleLabel(u.role)}`)}
                      </span>
                    </td>
                    <td style={styles.td}>{formatDate(u.registeredAt)}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(u.status)}>
                        {getStatusLabel(u.status)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button onClick={() => triggerDemoToast('Editar Rol')} style={styles.actionBtn} title="Editar Rol">
                          <Icon name="ShieldAlert" size={16} />
                        </button>
                        <button onClick={() => triggerDemoToast(u.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear')} style={styles.actionBtn} title={u.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}>
                          <Icon name={u.status === 'ACTIVE' ? 'Lock' : 'Unlock'} size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={styles.emptyTableTd}>
                      No hay usuarios que coincidan con la búsqueda.
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

  const renderPlayersView = () => {
    const filtered = mockPlayersData.filter(p =>
      p.alias.toLowerCase().includes(playerQuery.toLowerCase()) ||
      p.fullName.toLowerCase().includes(playerQuery.toLowerCase()) ||
      p.federation.toLowerCase().includes(playerQuery.toLowerCase())
    );

    return (
      <div style={styles.contentCard}>
        <div style={styles.viewHeader}>
          <div style={styles.viewHeaderLeft}>
            <h2 style={styles.viewTitle}>Jugadores Federados</h2>
            <p style={styles.viewSub}>Control de estadísticas, federaciones y categorías de los jugadores oficiales.</p>
          </div>
          <div style={styles.searchWrapper}>
            <SearchInput value={playerQuery} onChange={setPlayerQuery} placeholder="Buscar por alias, nombre o federación..." />
          </div>
        </div>

        <div style={styles.playersGrid}>
          {filtered.map(p => (
            <div key={p.id} style={styles.playerCard}>
              <div style={styles.playerCardHeader}>
                <div style={styles.playerCardInfo}>
                  <h3 style={styles.playerAlias}>{p.alias}</h3>
                  <span style={styles.playerFullName}>{p.fullName}</span>
                </div>
                <span style={styles.categoryBadge}>{p.category}</span>
              </div>

              <div style={styles.playerCardBody}>
                <div style={styles.playerStatRow}>
                  <span style={styles.playerStatLabel}>Federación</span>
                  <div style={styles.playerFederationVal}>
                    {getFederationFlag(p.federation) && (
                      <img src={getFederationFlag(p.federation) || ''} alt="Flag" style={styles.flagIcon} />
                    )}
                    <span>{p.federation}</span>
                  </div>
                </div>
                <div style={styles.playerStatRow}>
                  <span style={styles.playerStatLabel}>Año de Alta</span>
                  <span style={styles.playerStatVal}>{p.federationYear}</span>
                </div>
                <div style={styles.playerStatRow}>
                  <span style={styles.playerStatLabel}>Media PPD</span>
                  <span style={styles.playerStatValHighlight}>{p.ppd} pts</span>
                </div>
              </div>

              <div style={styles.playerCardFooter}>
                <Button variant="secondary" size="small" onClick={() => triggerDemoToast('Ver ficha')} style={{ flex: 1 }}>
                  Ver ficha
                </Button>
                <Button variant="secondary" size="small" onClick={() => triggerDemoToast('Editar estadísticas')} style={{ flex: 1 }}>
                  Editar estad.
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={styles.emptyGridBox}>
              <Icon name="UserMinus" size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }} />
              <p>No hay jugadores registrados que coincidan con el criterio.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTournamentsView = () => {
    const filtered = mockTournamentsData.filter(t =>
      t.name.toLowerCase().includes(tournamentQuery.toLowerCase()) ||
      t.format.toLowerCase().includes(tournamentQuery.toLowerCase())
    );

    return (
      <div style={styles.contentCard}>
        <div style={styles.viewHeader}>
          <div style={styles.viewHeaderLeft}>
            <h2 style={styles.viewTitle}>Panel de Torneos</h2>
            <p style={styles.viewSub}>Configura cuadrantes, cambia estados de torneos y accede a la gestión de las partidas.</p>
          </div>
          <div style={styles.viewHeaderRight}>
            <Button variant="primary" size="medium" leftIcon="Plus" onClick={() => navigate('/torneos')}>
              Nuevo torneo
            </Button>
          </div>
        </div>

        <div style={styles.tournamentsFilterRow}>
          <div style={styles.searchWrapper}>
            <SearchInput value={tournamentQuery} onChange={setTournamentQuery} placeholder="Buscar por nombre de torneo..." />
          </div>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th style={styles.th}>Torneo</th>
                <th style={styles.th}>Formato</th>
                <th style={styles.th}>Participantes</th>
                <th style={styles.th}>Fecha Inicio</th>
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
                  <td style={styles.td}>{t.format}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600' }}>{t.participantsCount}</span> / {t.maxParticipants}
                  </td>
                  <td style={styles.td}>{t.startDate}</td>
                  <td style={styles.td}>
                    <span style={
                      t.status === 'IN_PROGRESS' ? styles.activeBadge :
                        t.status === 'PUBLISHED' ? styles.publishedBadge :
                          t.status === 'FINISHED' ? styles.finishedBadge : styles.suspendedBadge
                    }>
                      {t.status === 'IN_PROGRESS' ? 'En Juego' :
                        t.status === 'PUBLISHED' ? 'Publicado' :
                          t.status === 'FINISHED' ? 'Finalizado' : 'Borrador'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <button onClick={() => navigate(`/torneos/${t.id}`)} style={styles.actionBtn} title="Administrar torneo">
                        <Icon name="ExternalLink" size={16} />
                      </button>
                      <button onClick={() => navigate(`/torneos/${t.id}/edit`)} style={styles.actionBtn} title="Editar torneo">
                        <Icon name="Edit3" size={16} />
                      </button>
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
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div style={styles.contentCard}>
        <div style={styles.viewHeader}>
          <div style={styles.viewHeaderLeft}>
            <h2 style={styles.viewTitle}>Configuración del Sistema</h2>
            <p style={styles.viewSub}>Establece parámetros globales para inscripciones, notificaciones y mantenimiento.</p>
          </div>
        </div>

        <div style={styles.settingsForm}>
          {/* Setting Row 1 */}
          <div style={styles.settingsRow}>
            <div style={styles.settingsLabelCol}>
              <h4 style={styles.settingHeading}>Registro Público</h4>
              <p style={styles.settingDesc}>Permite que cualquier persona pueda registrarse como usuario ordinario.</p>
            </div>
            <div style={styles.settingsFieldCol}>
              <label style={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={settings.openRegistration}
                  onChange={(e) => setSettings({ ...settings, openRegistration: e.target.checked })}
                  style={styles.switchInput}
                />
                <div style={styles.switchTrack(settings.openRegistration)}>
                  <div style={styles.switchThumb(settings.openRegistration)} />
                </div>
              </label>
            </div>
          </div>

          {/* Setting Row 2 */}
          <div style={styles.settingsRow}>
            <div style={styles.settingsLabelCol}>
              <h4 style={styles.settingHeading}>Inscripción de Externos</h4>
              <p style={styles.settingDesc}>Permite la inscripción de jugadores no federados en torneos públicos.</p>
            </div>
            <div style={styles.settingsFieldCol}>
              <label style={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={settings.allowExternalPlayers}
                  onChange={(e) => setSettings({ ...settings, allowExternalPlayers: e.target.checked })}
                  style={styles.switchInput}
                />
                <div style={styles.switchTrack(settings.allowExternalPlayers)}>
                  <div style={styles.switchThumb(settings.allowExternalPlayers)} />
                </div>
              </label>
            </div>
          </div>

          {/* Setting Row 3 */}
          <div style={styles.settingsRow}>
            <div style={styles.settingsLabelCol}>
              <h4 style={styles.settingHeading}>Correo de Soporte</h4>
              <p style={styles.settingDesc}>Cuenta de correo oficial para la resolución de dudas de los jugadores.</p>
            </div>
            <div style={styles.settingsFieldCol}>
              <input
                type="email"
                value={settings.systemEmail}
                onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
                style={styles.settingsInputText}
              />
            </div>
          </div>

          {/* Setting Row 4 */}
          <div style={styles.settingsRow}>
            <div style={styles.settingsLabelCol}>
              <h4 style={styles.settingHeading}>Formato por Defecto</h4>
              <p style={styles.settingDesc}>Formato de sets y piernas estándar para nuevas partidas.</p>
            </div>
            <div style={styles.settingsFieldCol}>
              <select
                value={settings.defaultSetsFormat}
                onChange={(e) => setSettings({ ...settings, defaultSetsFormat: e.target.value })}
                style={styles.settingsSelect}
              >
                <option value="Best of 3">Al mejor de 3 (Best of 3)</option>
                <option value="Best of 5">Al mejor de 5 (Best of 5)</option>
                <option value="Best of 7">Al mejor de 7 (Best of 7)</option>
              </select>
            </div>
          </div>

          {/* Setting Row 5 */}
          <div style={styles.settingsRow}>
            <div style={styles.settingsLabelCol}>
              <h4 style={styles.settingHeading}>Modo Mantenimiento</h4>
              <p style={styles.settingDesc}>Bloquea temporalmente el acceso general de usuarios y pausa las partidas en directo.</p>
            </div>
            <div style={styles.settingsFieldCol}>
              <label style={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  style={styles.switchInput}
                />
                <div style={styles.switchTrack(settings.maintenanceMode)}>
                  <div style={styles.switchThumb(settings.maintenanceMode)} />
                </div>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div style={styles.settingsActionsRow}>
            <Button variant="primary" size="large" leftIcon="Save" onClick={handleSaveSettings}>
              Guardar Configuración
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'usuarios': return renderUsersView();
      case 'jugadores': return renderPlayersView();
      case 'torneos': return renderTournamentsView();
      case 'configuracion': return renderSettingsView();
      default: return renderUsersView();
    }
  };

  return (
    <div style={styles.adminDashboardLayout}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={styles.mainContainer}>
        {renderActiveTab()}
      </main>
    </div>
  );
};

const styles: { [key: string]: any } = {
  adminDashboardLayout: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: '#0E0E0E',
    flexWrap: 'wrap',
  },
  mainContainer: {
    flex: 1,
    padding: '2.5rem',
    minWidth: '320px',
    maxWidth: '100%',
    overflowX: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 140px)',
    color: 'rgba(255, 255, 255, 0.6)',
  },
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  viewHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  viewHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  viewTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-title)',
  },
  viewSub: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    lineHeight: '1.5',
  },
  searchWrapper: {
    width: '100%',
    maxWidth: '360px',
    minWidth: '240px',
  },
  tournamentsFilterRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
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
  aliasCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  aliasName: {
    fontWeight: '600',
    color: '#ffffff',
  },
  adminBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(253, 96, 93, 0.1)',
    border: '1px solid rgba(253, 96, 93, 0.2)',
    color: '#FD605D',
    letterSpacing: '0.5px',
  },
  playerBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '0.5px',
  },
  activeBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(196, 232, 102, 0.1)',
    border: '1px solid rgba(196, 232, 102, 0.2)',
    color: '#C4E866',
    letterSpacing: '0.5px',
  },
  publishedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    letterSpacing: '0.5px',
  },
  finishedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    color: '#f87171',
    letterSpacing: '0.5px',
  },
  suspendedBadge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.5px',
  },
  inactiveBadgeStyle: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: '0.5px',
  },
  deletedBadgeStyle: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    letterSpacing: '0.5px',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
    outline: 'none',
    ':hover': {
      color: '#ffffff',
      background: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    },
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
    ':hover': {
      transform: 'translateY(-2px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    },
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
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  playerFullName: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.4)',
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
    color: '#ffffff',
    fontWeight: '600',
  },
  flagIcon: {
    width: '18px',
    height: '12px',
    objectFit: 'cover',
    borderRadius: '2px',
  },
  playerCardFooter: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  emptyGridBox: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.95rem',
    border: '1px dashed rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
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
  settingsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '750px',
    width: '100%',
  },
  settingsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  settingsLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    flex: '1',
    minWidth: '280px',
  },
  settingHeading: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  settingDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.4)',
    margin: 0,
    lineHeight: '1.5',
  },
  settingsFieldCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: '200px',
  },
  switchLabel: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
  },
  switchTrack: (checked: boolean) => ({
    width: '46px',
    height: '24px',
    borderRadius: '100px',
    backgroundColor: checked ? 'rgba(196, 232, 102, 0.2)' : 'rgba(255, 255, 255, 0.06)',
    border: `1px solid ${checked ? 'rgba(196, 232, 102, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  }),
  switchThumb: (checked: boolean) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: checked ? '#C4E866' : 'rgba(255, 255, 255, 0.4)',
    position: 'absolute',
    top: '3px',
    left: checked ? '25px' : '3px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: checked ? '0 0 10px rgba(196, 232, 102, 0.5)' : 'none',
  }),
  settingsInputText: {
    width: '100%',
    height: '42px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '0 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.25s ease',
    ':focus': {
      border: '1px solid rgba(196, 232, 102, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  settingsSelect: {
    width: '100%',
    height: '42px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '0 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    ':focus': {
      border: '1px solid rgba(196, 232, 102, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  settingsActionsRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '1rem',
  },
};

export default AdminDashboardScreen;
