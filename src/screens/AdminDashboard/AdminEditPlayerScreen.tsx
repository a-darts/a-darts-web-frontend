import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Select from '../../components/Select';
import TextInput from '../../components/TextInput';
import { playerService, Player } from '../../services/player.service';
import { Federations } from '../../services/tournament.service';
import { getSeasonEndYear } from '../../utils/tournament.utils';
import i18n from '../../i18n';

const AdminEditPlayerScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [player, setPlayer] = useState<Player | null>(null);
  const [federation, setFederation] = useState('');
  const [initialFederation, setInitialFederation] = useState('');

  const [fetchingPlayer, setFetchingPlayer] = useState(true);
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

  // 2. Fetch player details on mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!id) return;
      try {
        setFetchingPlayer(true);
        const playerData = await playerService.getPlayerById(id);
        if (playerData) {
          setPlayer(playerData);
          setFederation(playerData.federation);
          setInitialFederation(playerData.federation);
        }
      } catch (err: any) {
        console.error('Error al cargar datos del jugador:', err);
        showToast(err.message || 'Error al obtener los datos del jugador.', 'error');
        navigate('/admin');
      } finally {
        setFetchingPlayer(false);
      }
    };

    if (user && user.role === UserRoles.ADMIN && id) {
      fetchPlayerData();
    }
  }, [user, id, navigate, showToast]);

  if (authLoading || !user || user.role !== UserRoles.ADMIN) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Verificando credenciales de administrador...</span>
      </div>
    );
  }

  if (fetchingPlayer) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Cargando datos del jugador...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!federation) {
      showToast('Por favor, selecciona una federación válida.', 'error');
      return;
    }

    if (federation === initialFederation) {
      showToast('No se han detectado cambios para guardar.', 'info');
      navigate('/admin');
      return;
    }

    setSubmitting(true);

    try {
      if (id) {
        await playerService.updatePlayerFederation(id, federation);
        showToast('¡Federación del jugador actualizada con éxito!', 'success');
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Error al actualizar federación del jugador:', err);
      showToast(err.message || 'Error al actualizar el jugador. Por favor, intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const federationOptions = Object.keys(Federations).map((key) => ({
    value: key,
    label: i18n.t(`federations.${key}`, { defaultValue: Federations[key as keyof typeof Federations] }),
  }));

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/admin')} style={styles.backBtn} title="Volver al panel">
            <Icon name="ArrowLeft" size={20} />
            <span>Volver al panel</span>
          </button>
          <h1 style={styles.title}>Editar Jugador</h1>
          <p style={styles.subtitle}>Modifica los datos del jugador federado</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <TextInput
            label="Alias del usuario"
            type="text"
            icon="User"
            value={player?.userAlias || 'Sin alias'}
            readOnly
            disabled
            style={{ cursor: 'not-allowed', opacity: 0.6 }}
          />

          <TextInput
            label="Número de ficha / Registro"
            type="text"
            icon="Hash"
            value={player?.registrationNumber || ''}
            readOnly
            disabled
            style={{ cursor: 'not-allowed', opacity: 0.6 }}
          />

          <TextInput
            label="Temporada de inicio"
            type="text"
            icon="Calendar"
            value={player ? `${player.seasonStartYear} - ${getSeasonEndYear(player.seasonStartYear)}` : ''}
            readOnly
            disabled
            style={{ cursor: 'not-allowed', opacity: 0.6 }}
          />

          <div style={{ marginBottom: '1rem' }}>
            <Select
              label="Federación"
              value={federation}
              options={federationOptions}
              onChange={setFederation}
              icon="Globe"
            />
          </div>

          <div style={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              leftIcon="X"
              onClick={() => navigate('/admin')}
              disabled={submitting}
              style={styles.cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              leftIcon={submitting ? undefined : "Save"}
              style={styles.submitBtn}
            >
              {submitting ? 'Guardando cambios...' : 'Guardar cambios'}
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 140px)',
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

export default AdminEditPlayerScreen;
