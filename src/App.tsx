import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="/admin/usuarios/crear" element={<AdminCreateUserScreen />} />
        <Route path="/admin/usuarios/editar/:id" element={<AdminEditUserScreen />} />
        <Route path="/admin/jugadores/editar/:id" element={<AdminEditPlayerScreen />} />
        <Route path="/admin/jugadores/registrar" element={<AdminCreatePlayerScreen />} />
        <Route path="/admin/torneos/crear" element={<AdminCreateTournamentScreen />} />
        <Route path="/admin/torneos/:id/editar" element={<AdminEditTournamentScreen />} />
        <Route path="/torneos/partido/:matchId/diana/:boardId/ver" element={<LiveMatchMonitorScreen />} />
      </Routes>

      <footer style={styles.footer}>
        <p>&copy; 2026 A-Darts. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    padding: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.875rem',
    textAlign: 'center',
  }
};

export default App;
