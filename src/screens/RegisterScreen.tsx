import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyAccepted) {
      showToast('Debes aceptar la Política de Privacidad y los Términos de Servicio para registrarte.', 'error');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, alias);
      console.log(t('auth.register_success'));

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/');
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(err.message || 'Error al registrarse. Por favor, intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-logo-side">
        <img
          src="/logo_white.png"
          alt="A-Darts Logo"
          className="auth-logo-image"
        />
      </div>

      <div className="auth-form-side">
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>{t('auth.register_title')}</h1>
            <p style={styles.subtitle}>{t('auth.register_subtitle')}</p>
          </div>

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

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="registerPrivacyCheckbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                style={styles.checkboxInput}
              />
              <label htmlFor="registerPrivacyCheckbox" style={styles.checkboxLabel}>
                He leído y acepto la{' '}
                <Link to="/privacy-policy" target="_blank" style={styles.inlineLink}>
                  Política de Privacidad
                </Link>{' '}
                y los{' '}
                <Link to="/terms" target="_blank" style={styles.inlineLink}>
                  Términos y Condiciones
                </Link>{' '}
                de la plataforma A-Darts.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              style={styles.submitBtn}
              rightIcon={loading ? undefined : "LogIn"}
              disabled={loading}
            >
              {loading ? t('auth.creating_account') : t('auth.register_btn')}
            </Button>
          </form>

          <div style={styles.footer}>
            <span style={styles.footerText}>{t('auth.have_account')}</span>
            <Link
              to={window.location.search.includes('redirect=') ? `/login${window.location.search}` : "/login"}
              style={styles.linkBold}
            >
              {t('auth.login_link')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '1.25rem',
    gap: '0.6rem',
    textAlign: 'left',
  },
  checkboxInput: {
    marginTop: '0.2rem',
    cursor: 'pointer',
    accentColor: '#C4E866',
    width: '16px',
    height: '16px',
  },
  checkboxLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary-color)',
    lineHeight: '1.4',
    cursor: 'pointer',
    userSelect: 'none',
  },
  inlineLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default RegisterScreen;
