import React, { useEffect, useState } from 'react';
import { Tournament, Bracket, tournamentService } from '../../../services/tournament.service';
import ErrorMessage from '../../../components/ErrorMessage';
import BracketMatch from '../../../components/BracketMatch';

interface TournamentBracketTabProps {
  tournament: Tournament;
}

const TournamentBracketTab: React.FC<TournamentBracketTabProps> = ({ tournament }) => {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotPublished, setIsNotPublished] = useState(false);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentBracket(tournament.id);
        setBracket(data);
      } catch (err: any) {
        console.error('Error fetching bracket:', err);
        if (err.message && err.message.toLowerCase().includes('not found')) {
          setIsNotPublished(true);
        } else {
          setError(err.message || 'Error al cargar el cuadrante.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBracket();
  }, [tournament.id]);

  if (loading) {
    return <div style={styles.message}>Cargando cuadrante...</div>;
  }

  if (isNotPublished) {
    return (
      <div style={styles.infoContainer}>
        <h3 style={styles.infoTitle}>Cuadrante no disponible</h3>
        <p style={styles.infoText}>Aún no se ha publicado el cuadrante para este torneo</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!bracket || !bracket.positions) {
    return <div style={styles.message}>No hay datos del cuadrante</div>;
  }

  // Group positions into pairs (matches)
  const matches = [];
  for (let i = 0; i < bracket.positions.length; i += 2) {
    matches.push({
      player1: {
        position: bracket.positions[i].position,
        alias: bracket.positions[i].participantAlias,
        federation: bracket.positions[i].participantFederation
      },
      player2: {
        position: bracket.positions[i + 1].position,
        alias: bracket.positions[i + 1].participantAlias,
        federation: bracket.positions[i + 1].participantFederation
      }
    });
  }

  return (
    <div style={styles.content}>
      <div style={styles.matchList}>
        {matches.map((match, index) => (
          <BracketMatch
            key={index}
            matchNumber={index + 1}
            player1={match.player1}
            player2={match.player2}
          />
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  content: {
    padding: '2rem 0',
  },
  message: {
    padding: '4rem',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1.1rem',
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '240px',
    margin: '0',
  },
  infoContainer: {
    padding: '5rem 2rem',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '24px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    marginTop: '2rem',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
  },
  infoText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '400px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
};

export default TournamentBracketTab;
