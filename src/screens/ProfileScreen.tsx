import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import InfoCard from '../components/InfoCard';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { useState, useEffect } from 'react';

const ProfileScreen: React.FC = () => {
  const { user, updateEmail } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
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

  const hasEmailChanged = email !== user.email;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatarLarge}>
            {user.alias.charAt(0).toUpperCase()}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{user.alias}</h1>
            <p style={styles.roleBadge}>{user.role.toUpperCase()}</p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.inputGroup}>
            <TextInput
              label={t('auth.email_label')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="Mail"
              error={error || undefined}
            />
            {hasEmailChanged && (
              <Button
                onClick={handleSaveEmail}
                loading={isSaving}
                size="small"
                leftIcon='Save'
              >
                Guardar cambios
              </Button>
            )}
          </div>

          {success && (
            <Toast
              message="¡Correo actualizado correctamente!"
              type="success"
              onClose={() => setSuccess(false)}
            />
          )}

          <InfoCard
            title="Miembro desde"
            content={formatDate(user.registratedAt)}
            icon="Calendar"
          />
          <InfoCard
            title="Rol del sistema"
            content={user.role}
            icon="Shield"
          />
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
  card: {
    // padding: '3rem',
    width: '100%',
    maxWidth: '1600px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '3rem',
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
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
};

export default ProfileScreen;
