import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import TournamentDetailsScreen from './screens/TournamentDetails/TournamentDetailsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminEditTournamentScreen from './screens/AdminDashboard/AdminEditTournamentScreen';
import AdminDashboardScreen from './screens/AdminDashboard/AdminDashboardScreen';
import AdminCreateUserScreen from './screens/AdminDashboard/AdminCreateUserScreen';
import AdminEditUserScreen from './screens/AdminDashboard/AdminEditUserScreen';
import AdminEditPlayerScreen from './screens/AdminDashboard/AdminEditPlayerScreen';
import AdminCreatePlayerScreen from './screens/AdminDashboard/AdminCreatePlayerScreen';
import AdminCreateTournamentScreen from './screens/AdminDashboard/AdminCreateTournamentScreen';
import LiveMatchMonitorScreen from './screens/LiveMatchMonitorScreen';
import StatsScreen from './screens/StatsScreen';
import PrivacyPolicyScreen from './screens/Footer/PrivacyPolicyScreen';
import TermsAndConditionsScreen from './screens/Footer/TermsAndConditionsScreen';
import CookiesPolicyScreen from './screens/Footer/CookiesPolicyScreen';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/torneos" element={<TournamentsScreen />} />
        <Route path="/torneos/:id" element={<TournamentDetailsScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/stats" element={<StatsScreen />} />

        <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsScreen />} />
        <Route path="/cookies-policy" element={<CookiesPolicyScreen />} />

        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="/admin/usuarios/crear" element={<AdminCreateUserScreen />} />
        <Route path="/admin/usuarios/editar/:id" element={<AdminEditUserScreen />} />
        <Route path="/admin/jugadores/editar/:id" element={<AdminEditPlayerScreen />} />
        <Route path="/admin/jugadores/registrar" element={<AdminCreatePlayerScreen />} />
        <Route path="/admin/torneos/crear" element={<AdminCreateTournamentScreen />} />
        <Route path="/admin/torneos/:id/editar" element={<AdminEditTournamentScreen />} />
        <Route path="/torneos/partido/:matchId/diana/:boardShortId/ver" element={<LiveMatchMonitorScreen />} />
      </Routes>

      <footer style={styles.footer}>
        <div style={styles.columnsContainer}>
          <div style={styles.footerSection}>
            <h4 style={styles.sectionTitle}>Contacto</h4>
            <div style={styles.linksContainer}>
              <a href="mailto:a.darts.dev@gmail.com" style={styles.link} className="footer-link">
                a.darts.dev@gmail.com
              </a>
            </div>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.sectionTitle}>Privacidad</h4>
            <div style={styles.linksContainer}>
              <Link to="/privacy-policy" style={styles.link} className="footer-link">
                Política de Privacidad
              </Link>
              <Link to="/terms-and-conditions" style={styles.link} className="footer-link">
                Términos y Condiciones
              </Link>
              <Link to="/cookies-policy" style={styles.link} className="footer-link">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
        <div style={styles.copyrightContainer}>
          <p style={styles.copyright}>&copy; 2026 A-Darts. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    padding: '3rem 2rem 1.5rem 2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.875rem',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  columnsContainer: {
    display: 'flex',
    maxWidth: '1000px',
    margin: '0 auto',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: '200px',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: 600,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: '0.85rem',
    fontWeight: 400,
  },
  copyrightContainer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    textAlign: 'center',
  },
  copyright: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.3)',
  },
};

export default App;
