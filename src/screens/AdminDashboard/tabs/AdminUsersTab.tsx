import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/auth.service';
import SearchInput from '../../../components/SearchInput';
import Icon from '../../../components/Icon';
import UserRoleTag from '../../../components/UserRoleTag';
import UserStatusTag from '../../../components/UserStatusTag';

interface MockUser {
  id: string;
  alias: string;
  email: string;
  role: string;
  registeredAt: string;
  status: string;
}

const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');

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
    fetchUsers();
  }, []);

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
        <div style={styles.viewHeaderLeft}>
          <h2 style={styles.viewTitle}>Gestión de Usuarios</h2>
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
                      <button
                        style={styles.actionBtn}
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        style={styles.actionBtn}
                      >
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
};

export default AdminUsersTab;
