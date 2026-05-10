import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, Tournament } from '../services/tournament.service';
import { getStatusLabel, getFederationLabel, getFederationFlag, getModeLabel, getGameTypeLabel } from '../utils/tournament.utils';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';
import Title from '../components/Title';
import TournamentStatusTag from '../components/TournamentStatusTag';
import Tabs from '../components/Tabs';
import InfoCard from '../components/InfoCard';

import TournamentInfoTab from './tournament-details/TournamentInfoTab';
import TournamentInscriptionsTab from './tournament-details/TournamentInscriptionsTab';

const TournamentDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentById(id);
        setTournament(data);
      } catch (err: any) {
        console.error('Error fetching tournament details:', err);
        setError(err.message || 'Error al cargar los detalles del torneo');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) return <div style={styles.message}>Cargando detalles...</div>;

  if (error) return (
    <div style={styles.container}>
      <ErrorMessage message={error} />
      <Button
        variant="primary"
        leftIcon="ArrowLeft"
        onClick={() => navigate('/torneos')}
      >
        Volver a torneos
      </Button>
    </div>
  );

  if (!tournament) return <div style={styles.message}>Torneo no encontrado</div>;

  const { name, status } = tournament;

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Torneos', path: '/torneos' },
    { label: name },
  ];

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'inscriptions', label: 'Inscripciones' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <div style={styles.titleContainer}>
          <Title>{name}</Title>
          <TournamentStatusTag status={status} size="medium" />
        </div>
      </header>

      <Tabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'info' ? (
        <TournamentInfoTab tournament={tournament} />
      ) : (
        <TournamentInscriptionsTab tournament={tournament} />
      )}
    </div>
  );
};

const styles: { [key: string]: any } = {
  container: {
    padding: '2rem 2rem',
    margin: '0 auto',
    width: '100%',
    minHeight: '80vh',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '10rem 2rem',
    fontSize: '1.2rem',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap',
  },
};

export default TournamentDetailsScreen;
