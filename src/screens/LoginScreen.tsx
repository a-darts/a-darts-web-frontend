import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '../components/ErrorMessage';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      console.log(t('auth.login_success'));
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
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
            <h1 style={styles.title}>{t('auth.login_title')}</h1>
            <p style={styles.subtitle}>{t('auth.login_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <ErrorMessage message={error} />}
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
              rightIcon={loading ? undefined : "ArrowRight"}
              disabled={loading}
            >
              {loading ? t('auth.logging_in') : t('auth.login_btn')}
            </Button>
          </form>

          <div style={styles.footer}>
            <span style={styles.footerText}>{t('auth.no_account')}</span>
            <Link to="/register" style={styles.linkBold}>{t('auth.signup_link')}</Link>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '2rem',
  },
  submitBtn: {
    height: '52px',
    fontSize: '0.875rem',
    width: '100%',
    marginTop: '2rem',
  },
  link: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    textDecoration: 'none',
    transition: 'color 0.2s',
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

export default LoginScreen;
