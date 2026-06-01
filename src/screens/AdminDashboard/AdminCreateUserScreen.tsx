import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { userService } from '../../services/user.service';

const AdminCreateUserScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PLAYER');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRoles.ADMIN) {
        showToast('No tienes permisos de administrador para acceder a esta pantalla.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, showToast]);

  if (authLoading || !user || user.role !== UserRoles.ADMIN) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Verificando credenciales de administrador...</span>
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

    setErrors({});
    setSubmitting(true);

    try {
      await userService.registerByAdmin(email, alias, role);
      showToast('¡Usuario creado con éxito!', 'success');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      showToast(err.message || 'Error al crear el usuario. Por favor, intenta de nuevo.', 'error');
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
          <h1 style={styles.title}>Crear Nuevo Usuario</h1>
          <p style={styles.subtitle}>Registra un nuevo usuario en la plataforma con privilegios de Administrador o Jugador. El sistema generará automáticamente una contraseña temporal, la cual se le enviará al correo electrónico proporcionado.</p>
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

          <Select
            label="Rol del usuario"
            value={role}
            options={UserRoles}
            onChange={(val) => setRole(val)}
            icon="Shield"
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
              {submitting ? 'Creando usuario...' : 'Crear usuario'}
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

export default AdminCreateUserScreen;
