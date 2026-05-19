import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import SearchInput from '../../../components/SearchInput';
import Icon from '../../../components/Icon';
import UserRoleTag from '../../../components/UserRoleTag';
import UserStatusTag from '../../../components/UserStatusTag';
import { UserStatus } from '../../../context/AuthContext';
import Button from '../../../components/Button';

interface MockUser {
  id: string;
  alias: string;
  email: string;
  role: string;
  registeredAt: string;
  status: string;
}

const AdminUsersTab: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchUsers = async (page: number = currentPage) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await authService.getUsers(page, limit);
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
          setTotalPages(1);
        } else if (res.data.users && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page || 1);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(newPage);
  };

  const filtered = users.filter(u =>
    (u.alias || '').toLowerCase().includes(userQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={styles.contentCard}>
      <div style={styles.viewHeader}>
        <h2 style={styles.viewTitle}>Gestión de Usuarios</h2>
        <div style={styles.viewActionsContainer}>
          <div style={styles.searchWrapper}>
            <SearchInput value={userQuery} onChange={setUserQuery} placeholder="Buscar por alias o correo..." />
          </div>
          <Button
            leftIcon='Plus'
            variant='primary'
            onClick={() => navigate('/admin/usuarios/crear')}
          >
            Crear usuario
          </Button>
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
                    <UserRoleTag
                      role={u.role}
                    />
                  </td>
                  <td style={styles.td}>{formatDate(u.registeredAt)}</td>
                  <td style={styles.td}>
                    <UserStatusTag
                      status={u.status}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      {u.status !== UserStatus.DELETED && (
                        <button
                          style={styles.actionBtn}
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                      )}
                      {(u.status === UserStatus.ACTIVE || u.status === UserStatus.INACTIVE) && (
                        <button
                          style={styles.actionBtn}
                        >
                          <Icon name={u.status === 'ACTIVE' ? 'Lock' : 'Unlock'} size={16} />
                        </button>
                      )}
                      {u.status === UserStatus.BLOCKED && (
                        <button
                          style={styles.actionBtn}
                        >
                          <Icon name={'Unlock'} size={16} />
                        </button>
                      )}
                      {u.status !== UserStatus.DELETED && (
                        <button
                          style={styles.actionBtn}
                        >
                          <Icon name={'Trash'} size={16} />
                        </button>
                      )}

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
      {totalPages > 1 && (
        <div style={styles.paginationRow}>
          <span style={styles.paginationText}>
            Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          <div style={styles.paginationButtons}>
            <Button
              variant="secondary"
              size="small"
              leftIcon="ChevronLeft"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="small"
              rightIcon="ChevronRight"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
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
  viewActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    flexWrap: 'wrap',
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
    maxWidth: '420px',
    minWidth: '240px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.6)',
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
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  paginationText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
};

export default AdminUsersTab;
