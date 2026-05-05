import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(email, password, alias);
      console.log(t('auth.register_success'));
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al registrarse. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{t('auth.register_title')}</h1>
          <p style={styles.subtitle}>{t('auth.register_subtitle')}</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <Icon name="AlertCircle" size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <TextInput
            label={t('auth.alias_label')}
            placeholder="Ej. PepeDardos"
            type="text"
            icon="User"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            disabled={loading}
            required
          />

          <TextInput
            label={t('auth.email_label')}
            placeholder="tu@email.com"
            type="email"
            icon="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <TextInput
            label={t('auth.password_label')}
            placeholder="••••••••"
            type="password"
            icon="Lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            style={styles.submitBtn}
            rightIcon={loading ? undefined : "UserPlus"}
            disabled={loading}
          >
            {loading ? t('auth.creating_account') : t('auth.register_btn')}
          </Button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>{t('auth.have_account')}</span>
          <Link to="/login" style={styles.linkBold}>{t('auth.login_link')}</Link>
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
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'var(--text-secondary-color)',
    fontSize: '1rem',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    color: '#ff4444',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    height: '52px',
    fontSize: '0.875rem',
    width: '100%',
    marginTop: '2rem',
  },
  linkBold: {
    fontSize: '0.875rem',
    color: 'var(--text-color)',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '0.5rem',
  },
  footer: {
    marginTop: '2.5rem',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
  },
};

export default RegisterScreen;
