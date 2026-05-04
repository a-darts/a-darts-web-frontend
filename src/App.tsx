import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import TournamentsScreen from './screens/TournamentsScreen';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/torneos" element={<TournamentsScreen />} />
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
