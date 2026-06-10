import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/auth.service';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      console.log(t('auth.login_success'));

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'User inactive') {
        setTempPassword(password);
        setIsActivating(true);
        showToast(t('auth.account_inactive_change_password') || 'Debes activar tu cuenta cambiando tu contraseña', 'info');
      } else {
        showToast(err.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyAccepted) {
      showToast('Debes aceptar la Política de Privacidad y los Términos y Condiciones para activar tu cuenta.', 'error');
      return;
    }

    setLoading(true);

    try {
      await authService.activateAccount(email, tempPassword, newPassword);
      await login(email, newPassword);
      showToast('Contraseña cambiada y sesión iniciada exitosamente.', 'success');

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/');
    } catch (err: any) {
      console.error('Activation error:', err);
      showToast(err.message || 'Error al activar cuenta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      showToast('Se ha enviado una contraseña temporal a tu correo.', 'success');
      setIsForgotPassword(false);
      setIsActivating(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      showToast(err.message || 'Error al solicitar nueva contraseña.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
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
              <h1 style={styles.title}>{'Recuperar Contraseña'}</h1>
              <p style={styles.subtitle}>{'Introduce tu correo para recibir una contraseña temporal'}</p>
            </div>

            <form onSubmit={handleForgotPassword} style={styles.form}>
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

              <Button
                type="submit"
                variant="primary"
                style={styles.submitBtn}
                rightIcon={loading ? undefined : "ArrowRight"}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Contraseña Temporal'}
              </Button>
            </form>

            <div style={{ ...styles.footer, marginTop: '1.5rem' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary-color)', cursor: 'pointer', fontSize: '0.875rem' }}
                onClick={() => setIsForgotPassword(false)}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (isActivating) {
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
              <h1 style={styles.title}>{'Activar Cuenta'}</h1>
              <p style={styles.subtitle}>{'Por favor, añade tu nueva contraseña para activar tu cuenta'}</p>
            </div>

            <form onSubmit={handleActivate} style={styles.form}>
              <TextInput
                label={t('auth.email_label')}
                placeholder="tu@email.com"
                type="email"
                icon="Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={true}
                required
              />

              <TextInput
                label={t('auth.temp_password_label')}
                placeholder="••••••••"
                type="password"
                icon="Lock"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                disabled={loading}
                required
              />

              <TextInput
                label={t('auth.new_password_label') || 'Nueva Contraseña'}
                placeholder="••••••••"
                type="password"
                icon="Lock"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />

              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="privacyCheckbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  style={styles.checkboxInput}
                  required
                />
                <label htmlFor="privacyCheckbox" style={styles.checkboxLabel}>
                  He leído y acepto la{' '}
                  <Link to="/privacy-policy" target="_blank" style={styles.inlineLink}>
                    Política de Privacidad
                  </Link>{' '}
                  y los{' '}
                  <Link to="/terms" target="_blank" style={styles.inlineLink}>
                    Términos y Condiciones
                  </Link>{' '}
                  de A-Darts.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={styles.submitBtn}
                rightIcon={loading ? undefined : "ArrowRight"}
                disabled={loading}
              >
                {loading ? 'Activando...' : 'Activar Cuenta'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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

            <div style={styles.forgotPassword}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary-color)', cursor: 'pointer', fontSize: '0.875rem' }}
                onClick={() => setIsForgotPassword(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

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
            <Link
              to={window.location.search.includes('redirect=') ? `/register${window.location.search}` : "/register"}
              style={styles.linkBold}
            >
              {t('auth.signup_link')}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '1rem',
  },
  submitBtn: {
    height: '52px',
    fontSize: '0.875rem',
    width: '100%',
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  checkboxInput: {
    marginTop: '0.25rem',
    cursor: 'pointer',
    accentColor: '#C4E866',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  inlineLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default LoginScreen;
