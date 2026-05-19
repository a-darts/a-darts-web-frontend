import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { authService } from '../../services/auth.service';

const AdminEditUserScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [initialAlias, setInitialAlias] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');

  const [fetchingUser, setFetchingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 1. Authorization Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRoles.ADMIN) {
        showToast('No tienes permisos de administrador para acceder a esta pantalla.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, showToast]);

  // 2. Fetch user details on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      try {
        setFetchingUser(true);
        const userData = await authService.getUserById(id);
        if (userData) {
          setInitialAlias(userData.alias || '');
          setInitialEmail(userData.email || '');
          setAlias(userData.alias || '');
          setEmail(userData.email || '');
        }
      } catch (err: any) {
        console.error('Error al cargar datos del usuario:', err);
        showToast(err.message || 'Error al obtener los datos del usuario.', 'error');
        navigate('/admin');
      } finally {
        setFetchingUser(false);
      }
    };

    if (user && user.role === UserRoles.ADMIN && id) {
      fetchUserData();
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

  if (fetchingUser) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Cargando datos del usuario...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!alias.trim()) newErrors.alias = 'El alias es obligatorio';
    if (!email.trim()) newErrors.email = 'El correo electrónico es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El correo electrónico no es válido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Por favor, corrige los errores del formulario.', 'error');
      return;
    }

    const emailChanged = email.trim() !== initialEmail;
    const aliasChanged = alias.trim() !== initialAlias;

    if (!emailChanged && !aliasChanged) {
      showToast('No se han detectado cambios para guardar.', 'info');
      navigate('/admin');
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      if (emailChanged && id) {
        await authService.updateUserEmailByAdmin(id, email.trim());
      }
      if (aliasChanged && id) {
        await authService.updateUserAliasByAdmin(id, alias.trim());
      }

      showToast('¡Usuario actualizado con éxito!', 'success');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      showToast(err.message || 'Error al actualizar el usuario. Por favor, intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/admin')} style={styles.backBtn} title="Volver al panel">
            <Icon name="ArrowLeft" size={20} />
            <span>Volver al panel</span>
          </button>
          <h1 style={styles.title}>Editar Usuario</h1>
          <p style={styles.subtitle}>Modifica los datos del usuario</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <TextInput
            label="Alias del usuario"
            placeholder="Ej. PepeDardos"
            type="text"
            icon="User"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            disabled={submitting}
            error={errors.alias}
          />

          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            type="email"
            icon="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            error={errors.email}
          />

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

export default AdminEditUserScreen;
