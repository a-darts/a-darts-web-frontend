import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import InfoCard from '../components/InfoCard';
import Table, { Column } from '../components/Table';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { formatTournamentDate, getFederationFlag } from '../utils/tournament.utils';
import i18n from '../i18n';

interface PositionObject {
  id: string;
  position: number;
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentFederation: string;
}

interface UserStats {
  totalTournaments: number;
  totalMatchesPlayed: number;
  totalMatchesWon: number;
  totalSetsWon: number;
  totalLegsWon: number;
  bestPositions: PositionObject[];
  allPositions: PositionObject[];
}

const StatsScreen: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoStats, setHasNoStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await userService.getStats(user.id);

        if (Array.isArray(data) && data.length === 0) {
          setHasNoStats(true);
          setStats(null);
        } else if (data && !Array.isArray(data)) {
          if (data.bestPositions) {
            data.bestPositions = data.bestPositions.map((bp: any) => ({
              ...bp,
              id: bp.tournamentId
            }));
          }
          setStats(data);
          setHasNoStats(false);
        } else {
          setStats(null);
        }
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        showToast(error.message || 'Error al obtener las estadísticas', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, showToast]);

  const columnsBestPositions: Column<PositionObject>[] = [
    {
      key: 'position',
      header: 'Posición',
      render: (item) => (
        <span style={{
          fontWeight: '700',
          color: item.position === 1 ? '#FFD700' : item.position === 2 ? '#C0C0C0' : item.position === 3 ? '#CD7F32' : 'var(--text-color)',
          fontSize: '1.1rem'
        }}>
          {item.position}º
        </span>
      )
    },
    {
      key: 'tournamentName',
      header: 'Torneo',
      render: (item) => (
        <span
          style={{ fontWeight: '500', color: 'var(--text-color)', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate(`/torneos/${item.tournamentId}`)}
        >
          {item.tournamentName}
        </span>
      )
    }
  ];

  const columnsAllPositions: Column<PositionObject>[] = [
    {
      key: 'position',
      header: 'Posición',
      render: (item) => (
        <span style={{
          fontWeight: '700',
          color: item.position === 1 ? '#FFD700' : item.position === 2 ? '#C0C0C0' : item.position === 3 ? '#CD7F32' : 'var(--text-color)',
          fontSize: '1rem'
        }}>
          {item.position}º
        </span>
      )
    },
    {
      key: 'tournamentName',
      header: 'Torneo',
      render: (item) => (
        <span
          style={{ fontWeight: '500', color: 'var(--text-color)', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate(`/torneos/${item.tournamentId}`)}
        >
          {item.tournamentName}
        </span>
      )
    },
    {
      key: 'tournamentDate',
      header: 'Fecha',
      render: (item) => (
        <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>
          {formatTournamentDate(item.tournamentDate)}
        </span>
      )
    },
    {
      key: 'tournamentFederation',
      header: 'Federación',
      render: (item) => (
        <div style={styles.federationContainer}>
          <img
            src={getFederationFlag(item.tournamentFederation) || ''}
            alt="Flag"
            style={styles.federationFlag}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-color)' }}>{i18n.t(`federations.${item.tournamentFederation}`)}</span>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Cargando estadísticas...</span>
      </div>
    );
  }

  if (hasNoStats) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Mis Estadísticas</h1>
        <EmptyState
          title="Aún no tienes estadísticas"
          description="Tus estadísticas aparecerán aquí una vez que participes en algún torneo. ¡Apúntate a un torneo y empieza a competir!"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Mis Estadísticas</h1>
        <p style={{ color: 'var(--text-secondary-color)' }}>No se pudieron cargar las estadísticas.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Estadísticas</h1>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Resumen General</h2>
        <div style={styles.statsGrid}>
          <InfoCard
            title="Torneos Jugados"
            content={stats.totalTournaments.toString()}
            icon="Trophy"
          />
          <InfoCard
            title="Partidos Jugados"
            content={stats.totalMatchesPlayed.toString()}
            icon="MonitorPlay"
          />
          <InfoCard
            title="Partidos Ganados"
            content={stats.totalMatchesWon.toString()}
            icon="CheckCircle"
          />
          <InfoCard
            title="Sets Ganados"
            content={stats.totalSetsWon.toString()}
            icon="CheckCircle"
          />
          <InfoCard
            title="Legs Ganados"
            content={stats.totalLegsWon.toString()}
            icon="CheckCircle"
          />
          <InfoCard
            title="% Victorias"
            content={stats.totalMatchesPlayed > 0 ? `${Math.round((stats.totalMatchesWon / stats.totalMatchesPlayed) * 100)}%` : '0%'}
            icon="Percent"
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Mejores posiciones (Top 3)</h2>
        <Table
          data={stats.bestPositions}
          columns={columnsBestPositions}
          emptyMessage="Aún no tienes clasificaciones en ningún torneo."
        />
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Todas las posiciones</h2>
        <Table
          data={stats.bestPositions}
          columns={columnsAllPositions}
          emptyMessage="Aún no tienes clasificaciones en ningún torneo."
        />
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    fontFamily: 'var(--font-title)',
    letterSpacing: '-0.5px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '1rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(196, 232, 102, 0.1)',
    borderTop: '3px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  federationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  federationFlag: {
    width: '18px',
    height: '12px',
    objectFit: 'cover',
    borderRadius: '2px',
  },
};

export default StatsScreen;
