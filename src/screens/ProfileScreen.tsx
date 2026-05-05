import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import InfoCard from '../components/InfoCard';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { useState, useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage';

const ProfileScreen: React.FC = () => {
  const { user, updateEmail, updatePassword, updateAlias } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Alias state
  const [alias, setAlias] = useState(user?.alias || '');
  const [isSavingAlias, setIsSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [aliasSuccess, setAliasSuccess] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setAlias(user.alias);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>{t('common.loading')}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveEmail = async () => {
    if (email === user.email) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateEmail(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el correo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAlias = async () => {
    if (alias === user.alias) return;

    setIsSavingAlias(true);
    setAliasError(null);
    setAliasSuccess(false);

    try {
      await updateAlias(alias);
      setAliasSuccess(true);
    } catch (err: any) {
      setAliasError(err.message || 'Error al actualizar el alias');
    } finally {
      setIsSavingAlias(false);
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPassError('Todos los campos son obligatorios');
      return;
    }

    setIsSavingPass(true);
    setPassError(null);
    setPassSuccess(false);

    try {
      await updatePassword(oldPassword, newPassword);
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setIsSavingPass(false);
    }
  };

  const hasEmailChanged = email !== user.email;
  const hasAliasChanged = alias !== user.alias;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatarLarge}>
            {user.alias.charAt(0).toUpperCase()}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{user.alias}</h1>
            <p style={styles.roleBadge}>{t(`auth.${user.role}`)}</p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.sameRow}>
            <InfoCard
              title="Miembro desde"
              content={formatDate(user.registratedAt)}
              icon="Calendar"
            />
            <InfoCard
              title="Rol"
              content={t(`auth.${user.role}`)}
              icon="Shield"
            />
          </div>

          <div style={styles.inputGroup}>
            <h3 style={styles.sectionTitle}>Cambiar alias</h3>
            <TextInput
              label={t('auth.alias_label')}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              icon="User"
              maxLength={48}
              error={aliasError || undefined}
            />
            <Button
              onClick={handleSaveAlias}
              loading={isSavingAlias}
              size="small"
              leftIcon='Save'
              disabled={!hasAliasChanged}
            >
              Actualizar alias
            </Button>
          </div>

          {aliasSuccess && (
            <Toast
              message={t('auth.success.Alias updated successfully')}
              type="success"
              onClose={() => setAliasSuccess(false)}
            />
          )}

          <div style={styles.inputGroup}>
            <h3 style={styles.sectionTitle}>Cambiar correo electrónico</h3>
            <TextInput
              label={t('auth.email_label')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="Mail"
              error={error || undefined}
            />
            <Button
              onClick={handleSaveEmail}
              loading={isSaving}
              size="small"
              leftIcon='Save'
              disabled={!hasEmailChanged}
            >
              Actualizar correo
            </Button>
          </div>

          {success && (
            <Toast
              message="¡Correo actualizado correctamente!"
              type="success"
              onClose={() => setSuccess(false)}
            />
          )}

          <div style={styles.inputGroup}>
            <h3 style={styles.sectionTitle}>Cambiar contraseña</h3>
            <TextInput
              label={t('auth.old_password_label')}
              placeholder="••••••••"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              icon="Lock"
            />
            <TextInput
              label={t('auth.new_password_label')}
              placeholder="••••••••"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon="Lock"
            />
            {passError && <ErrorMessage message={passError} />}
            <Button
              onClick={handleSavePassword}
              loading={isSavingPass}
              size="small"
              leftIcon='Save'
              variant="primary"
              disabled={!oldPassword && !newPassword}
            >
              Actualizar contraseña
            </Button>
          </div>

          {passSuccess && (
            <Toast
              message="¡Contraseña actualizada correctamente!"
              type="success"
              onClose={() => setPassSuccess(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    minHeight: 'calc(100vh - 140px)',
  },
  sameRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    flexWrap: 'wrap',
    width: '100%',
  },
  card: {
    // padding: '3rem',
    width: '100%',
    maxWidth: '1600px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2rem',
    textAlign: 'left',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '800',
    boxShadow: '0 10px 30px rgba(196, 232, 102, 0.2)',
    flexShrink: 0,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
    color: '#ffffff',
    lineHeight: '1.1',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.4rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--btn-primary-bg)',
    letterSpacing: '1px',
    border: '1px solid rgba(196, 232, 102, 0.2)',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    textAlign: 'left',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
  },
};

export default ProfileScreen;
