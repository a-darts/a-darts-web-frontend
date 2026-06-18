import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRoles, UserStatus } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Select from '../../components/Select';
import TextInput from '../../components/TextInput';
import { userService } from '../../services/user.service';
import { playerService } from '../../services/player.service';
import { Federations } from '../../services/tournament.service';
import { getSeasonEndYear } from '../../utils/shared.utils';
import i18n from '../../i18n';

interface UserItem {
  id: string;
  alias: string;
  email: string;
  status: UserStatus;
}

const AdminCreatePlayerScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [federation, setFederation] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [hoverUp, setHoverUp] = useState(false);
  const [hoverDown, setHoverDown] = useState(false);

  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Authorization Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRoles.ADMIN) {
        showToast('No tienes permisos de administrador para acceder a esta pantalla.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, showToast]);

  // 2. Fetch all system users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        // Fetch up to 1000 users to populate the select dropdown in back-office
        const res = await userService.getUsers(1, 1000);
        if (res && res.data) {
          let userList: UserItem[] = [];
          if (Array.isArray(res.data)) {
            userList = res.data;
          } else if (res.data.users && Array.isArray(res.data.users)) {
            userList = res.data.users;
          }
          const activeUsers = userList.filter(u => u.status !== UserStatus.DELETED);
          setUsers(activeUsers);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        showToast(err.message || 'Error al obtener la lista de usuarios.', 'error');
      } finally {
        setFetchingUsers(false);
      }
    };

    if (user && user.role === UserRoles.ADMIN) {
      fetchUsers();
    }
  }, [user, showToast]);

  if (authLoading || !user || user.role !== UserRoles.ADMIN) {
    return (
      <div style={styles.loadingContainer}>
        <Icon
          name="Loader"
          size={32}
          className="btn-icon animate-spin"
        />
        <div style={styles.loadingText}>Verificando credenciales de administrador...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      showToast('Por favor, selecciona un usuario del sistema.', 'error');
      return;
    }

    if (!registrationNumber.trim()) {
      showToast('Por favor, ingresa el número de ficha.', 'error');
      return;
    }

    if (!federation) {
      showToast('Por favor, selecciona una federación válida.', 'error');
      return;
    }

    if (startYear < 1900 || startYear > 2100) {
      showToast('Por favor, selecciona una temporada válida.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      await playerService.createPlayer({
        userId: selectedUserId,
        registrationNumber: registrationNumber.trim(),
        federation,
        startYear: startYear,
      });
      showToast('¡Jugador federado registrado con éxito!', 'success');
      navigate('/admin', { state: { activeTab: 'jugadores' } });
    } catch (err: any) {
      console.error('Error al registrar el jugador:', err);
      showToast(err.message || 'Error al registrar el jugador. Por favor, intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.alias || 'Sin alias'} (${u.email})`,
    icon: 'User' as const,
  }));

  const federationOptions = Object.keys(Federations).map((key) => ({
    value: key,
    label: i18n.t(`federations.${key}`, { defaultValue: Federations[key as keyof typeof Federations] }),
  }));

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/admin', { state: { activeTab: 'jugadores' } })} style={styles.backBtn} title="Volver al panel">
            <Icon name="ArrowLeft" size={20} />
            <span>Volver al panel</span>
          </button>
          <h1 style={styles.title}>Registrar Jugador</h1>
          <p style={styles.subtitle}>Crea la ficha de un jugador, asociando un usuario existente con una federación y una temporada</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Select
              label="Usuario del sistema"
              value={selectedUserId}
              options={userOptions}
              onChange={setSelectedUserId}
              icon="User"
              placeholder={fetchingUsers ? "Cargando usuarios..." : "Selecciona un usuario..."}
            />
          </div>

          <TextInput
            label="Número de ficha"
            type="text"
            icon="Hash"
            placeholder="Ej. 5441068146"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            disabled={submitting}
          />

          <div style={{ marginBottom: '0.5rem' }}>
            <Select
              label="Federación"
              value={federation}
              options={federationOptions}
              onChange={setFederation}
              icon="Globe"
              placeholder="Selecciona una federación..."
            />
          </div>

          <div style={{ position: 'relative' }}>
            <TextInput
              label="Temporada"
              type="text"
              icon="Calendar"
              value={`${startYear} - ${getSeasonEndYear(startYear)}`}
              readOnly
              disabled={submitting}
            />
            {!submitting && (
              <div style={styles.spinnerArrows}>
                <button
                  type="button"
                  onClick={() => setStartYear((prev) => prev + 1)}
                  onMouseEnter={() => setHoverUp(true)}
                  onMouseLeave={() => setHoverUp(false)}
                  style={{
                    ...styles.spinnerArrowBtn,
                    color: hoverUp ? '#C4E866' : 'rgba(255, 255, 255, 0.4)'
                  }}
                  title="Incrementar año"
                >
                  <Icon name="ChevronUp" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setStartYear((prev) => prev - 1)}
                  onMouseEnter={() => setHoverDown(true)}
                  onMouseLeave={() => setHoverDown(false)}
                  style={{
                    ...styles.spinnerArrowBtn,
                    color: hoverDown ? '#C4E866' : 'rgba(255, 255, 255, 0.4)'
                  }}
                  title="Decrementar año"
                >
                  <Icon name="ChevronDown" size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              leftIcon="X"
              onClick={() => navigate('/admin', { state: { activeTab: 'jugadores' } })}
              disabled={submitting}
              style={styles.cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || fetchingUsers}
              leftIcon={submitting ? undefined : "Save"}
              style={styles.submitBtn}
            >
              {submitting ? 'Registrando...' : 'Registrar Jugador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#0E0E0E',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '540px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    padding: 0,
    marginBottom: '0.5rem',
    transition: 'color 0.2s ease',
    outline: 'none',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'var(--font-title)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
    margin: 0,
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  submitBtn: {
    flex: 1,
    height: '48px',
  },
  cancelBtn: {
    flex: 1,
    height: '48px',
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
  spinnerArrows: {
    position: 'absolute',
    right: '16px',
    top: '38px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    justifyContent: 'center',
    height: '32px',
    zIndex: 10,
  },
  spinnerArrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    outline: 'none',
    height: '14px',
    width: '24px',
  },
};

export default AdminCreatePlayerScreen;
