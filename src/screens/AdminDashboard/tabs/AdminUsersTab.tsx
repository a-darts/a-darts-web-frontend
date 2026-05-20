import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import SearchInput from '../../../components/SearchInput';
import Icon from '../../../components/Icon';
import IconButton from '../../../components/IconButton';
import UserRoleTag from '../../../components/UserRoleTag';
import UserStatusTag from '../../../components/UserStatusTag';
import { UserStatus } from '../../../context/AuthContext';
import Button from '../../../components/Button';
import Table, { Column } from '../../../components/Table';
import Modal from '../../../components/Modal';
import TextInput from '../../../components/TextInput';
import { useToast } from '../../../context/ToastContext';

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
  const { showToast } = useToast();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 16;

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState<React.ReactNode>('');
  const [modalConfirmLabel, setModalConfirmLabel] = useState('Confirmar');
  const [modalVariant, setModalVariant] = useState<'primary' | 'danger'>('primary');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => Promise<void>) | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Restore Modal Specific States
  const [restoreUserObj, setRestoreUserObj] = useState<MockUser | null>(null);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreEmailError, setRestoreEmailError] = useState('');

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

  const handleBlockConfirm = (user: MockUser) => {
    openConfirmModal(
      'Bloquear usuario',
      `¿Estás seguro de que deseas bloquear al usuario ${user.alias || 'este usuario'}?\nEl usuario perderá el acceso a la plataforma de inmediato.`,
      'Bloquear',
      'danger',
      async () => {
        try {
          await authService.blockUser(user.id);
          showToast('¡Usuario bloqueado con éxito!', 'success');
          fetchUsers(currentPage);
        } catch (err: any) {
          console.error('Error blocking user:', err);
          showToast(err.message || 'Error al bloquear el usuario.', 'error');
        }
      }
    );
  };

  const handleUnblockConfirm = (user: MockUser) => {
    openConfirmModal(
      'Desbloquear usuario',
      `¿Estás seguro de que deseas desbloquear al usuario ${user.alias || 'este usuario'}?\nEl usuario recuperará el acceso a la plataforma de inmediato.`,
      'Desbloquear',
      'primary',
      async () => {
        try {
          await authService.unblockUser(user.id);
          showToast('¡Usuario desbloqueado con éxito!', 'success');
          fetchUsers(currentPage);
        } catch (err: any) {
          console.error('Error unblocking user:', err);
          showToast(err.message || 'Error al desbloquear el usuario.', 'error');
        }
      }
    );
  };

  const handleDeleteConfirm = (user: MockUser) => {
    openConfirmModal(
      'Eliminar usuario',
      `¿Estás seguro de que deseas eliminar permanentemente al usuario ${user.alias || 'este usuario'}?`,
      'Eliminar',
      'danger',
      async () => {
        try {
          await authService.deleteUser(user.id);
          showToast('¡Usuario eliminado con éxito!', 'success');
          fetchUsers(currentPage);
        } catch (err: any) {
          console.error('Error deleting user:', err);
          showToast(err.message || 'Error al eliminar el usuario.', 'error');
        }
      }
    );
  };

  const handleRestoreConfirm = (user: MockUser) => {
    setRestoreUserObj(user);
    setRestoreEmail('');
    setRestoreEmailError('');
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

  const columns: Column<MockUser>[] = [
    {
      key: 'alias',
      header: 'Alias',
      render: (u) => <span style={styles.aliasName}>{u.alias || 'Sin alias'}</span>,
    },
    {
      key: 'email',
      header: 'Correo Electrónico',
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => <UserRoleTag role={u.role} />,
    },
    {
      key: 'registeredAt',
      header: 'Fecha Registro',
      render: (u) => formatDate(u.registeredAt),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => <UserStatusTag status={u.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (u) => (
        <div style={styles.actionGroup}>
          {u.status !== UserStatus.DELETED && (
            <IconButton
              name="Edit"
              onClick={() => navigate(`/admin/usuarios/editar/${u.id}`)}
              title="Editar usuario"
            />
          )}
          {(u.status === UserStatus.ACTIVE) && (
            <IconButton
              name="Lock"
              onClick={() => handleBlockConfirm(u)}
              title="Bloquear usuario"
            />
          )}
          {u.status === UserStatus.BLOCKED && (
            <IconButton
              name="Unlock"
              onClick={() => handleUnblockConfirm(u)}
              title="Desbloquear usuario"
            />
          )}
          {u.status !== UserStatus.DELETED && (
            <IconButton
              name="Trash"
              onClick={() => handleDeleteConfirm(u)}
              title="Eliminar usuario"
            />
          )}
          {u.status === UserStatus.DELETED && (
            <IconButton
              name="RefreshCw"
              onClick={() => handleRestoreConfirm(u)}
              title="Restaurar usuario"
            />
          )}
        </div>
      ),
    },
  ];

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
        <Table
          data={filtered}
          columns={columns}
          emptyMessage="No hay usuarios que coincidan con la búsqueda."
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

      <Modal
        isOpen={!!restoreUserObj}
        onClose={() => {
          setRestoreUserObj(null);
          setRestoreEmail('');
          setRestoreEmailError('');
        }}
        title="Restaurar usuario"
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
              Para restaurar al usuario <strong>{restoreUserObj?.alias || 'este usuario'}</strong>, por favor introduce su nuevo correo electrónico para confirmar la acción.
            </span>
            <TextInput
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              type="email"
              icon="Mail"
              value={restoreEmail}
              onChange={(e) => {
                setRestoreEmail(e.target.value);
                setRestoreEmailError('');
              }}
              error={restoreEmailError}
              autoFocus
            />
          </div>
        }
        confirmLabel="Restaurar"
        onConfirm={async () => {
          if (!restoreUserObj) return;
          const trimmedEmail = restoreEmail.trim();
          if (!trimmedEmail) {
            setRestoreEmailError('El correo electrónico es requerido.');
            return;
          }

          setModalLoading(true);
          try {
            await authService.restoreUser(restoreUserObj.id, trimmedEmail);
            showToast('¡Usuario restaurado con éxito!', 'success');
            setRestoreUserObj(null);
            setRestoreEmail('');
            fetchUsers(currentPage);
          } catch (err: any) {
            console.error('Error restoring user:', err);
            showToast(err.message || 'Error al restaurar el usuario.', 'error');
          } finally {
            setModalLoading(false);
          }
        }}
        variant="primary"
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
  viewActionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  aliasName: {
    fontWeight: '600',
    color: '#ffffff',
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
};

export default AdminUsersTab;
