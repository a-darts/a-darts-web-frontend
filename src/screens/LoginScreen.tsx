import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Handle login logic here
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Bienvenido de nuevo</h1>
          <p style={styles.subtitle}>Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            type="email"
            icon="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextInput
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            icon="Lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.link}>¿Olvidaste tu contraseña?</Link>
          </div> */}

          <Button
            type="submit"
            variant="primary"
            style={styles.submitBtn}
            rightIcon="ArrowRight"
          >
            Iniciar sesión
          </Button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>¿No tienes una cuenta?</span>
          <Link to="/register" style={styles.linkBold}>Regístrate</Link>
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
