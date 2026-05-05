import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import InfoCard from '../components/InfoCard';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

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
          <InfoCard
            title={t('auth.email_label')}
            content={user.email}
            icon="Mail"
          />
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
};

export default ProfileScreen;
