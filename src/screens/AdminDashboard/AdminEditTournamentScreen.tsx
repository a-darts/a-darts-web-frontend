import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tournamentService, Tournament, Federations, GameModes, GameTypes, ScheduleTypes } from '../../services/tournament.service';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import ErrorMessage from '../../components/ErrorMessage';
import Breadcrumbs from '../../components/Breadcrumbs';
import Title from '../../components/Title';
import Select from '../../components/Select';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';
import TextArea from '../../components/TextArea';

const AdminEditTournamentScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('');
  const [game, setGame] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<string>('');
  const [gameType, setGameType] = useState('');
  const [numLegs, setNumLegs] = useState<number>(0);
  const [numSets, setNumSets] = useState<number>(0);
  const [rules, setRules] = useState('');
  const [info, setInfo] = useState('');
  const [federation, setFederation] = useState('');

  const toLocalDatetimeString = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return formatter.format(date).replace(' ', 'T');
  };

  useEffect(() => {
    // Redirect non-admins once auth completes loading
    if (!authLoading && (!user || user.role !== UserRoles.ADMIN)) {
      showToast('No tienes permisos de administrador para realizar esta acción', 'error');
      navigate('/');
      return;
    }

    const fetchTournament = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await tournamentService.getTournamentById(id);
        setTournament(data);

        // Initialize Form State
        setName(data.name);
        setPlace(data.info.place);
        const localDt = toLocalDatetimeString(data.info.dateTime);
        const [d, t] = localDt.split('T');
        setDate(d || '');
        setTime(t || '');
        setMode(data.info.mode);
        setGame(data.info.game);
        setSchedule(data.info.schedule);
        setMaxPlayers(data.info.maxPlayers !== null ? data.info.maxPlayers.toString() : '');
        setGameType(data.info.gameType);
        setNumLegs(data.info.numLegs);
        setNumSets(data.info.numSets);
        setRules(data.info.rules || '');
        setInfo(data.info.info || '');
        setFederation(data.info.federation);
      } catch (err: any) {
        console.error('Error fetching tournament details:', err);
        setError(err.message || 'Error al cargar los detalles del torneo');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && user.role === UserRoles.ADMIN) {
      fetchTournament();
    }
  }, [id, user, authLoading, navigate, showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !tournament) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Check if name has changed
      let nameChanged = false;
      if (name !== tournament.name) {
        await tournamentService.updateTournamentName(id, name);
        nameChanged = true;
      }

      // Check if any info fields have changed
      const originalInfo = tournament.info;
      const formattedMaxPlayers = maxPlayers === '' ? null : Number(maxPlayers);
      const isoDateTimeString = new Date(`${date}T${time}:00`).toISOString();

      const newInfo = {
        place,
        dateTime: isoDateTimeString,
        mode,
        game,
        schedule,
        maxPlayers: formattedMaxPlayers,
        gameType,
        numLegs: Number(numLegs),
        numSets: Number(numSets),
        rules,
        info,
        federation,
      };

      const infoChanged = !originalInfo ||
        originalInfo.place !== newInfo.place ||
        new Date(originalInfo.dateTime).getTime() !== new Date(newInfo.dateTime).getTime() ||
        originalInfo.mode !== newInfo.mode ||
        originalInfo.game !== newInfo.game ||
        originalInfo.schedule !== newInfo.schedule ||
        originalInfo.maxPlayers !== newInfo.maxPlayers ||
        originalInfo.gameType !== newInfo.gameType ||
        originalInfo.numLegs !== newInfo.numLegs ||
        originalInfo.numSets !== newInfo.numSets ||
        originalInfo.rules !== newInfo.rules ||
        originalInfo.info !== newInfo.info ||
        originalInfo.federation !== newInfo.federation;

      if (infoChanged) {
        await tournamentService.updateTournamentInfo(id, newInfo);
      }

      if (nameChanged || infoChanged) {
        showToast('Torneo actualizado correctamente', 'success');
      } else {
        showToast('No se realizaron cambios', 'info');
      }

      const fromPath = (location.state as any)?.from;
      if (fromPath === '/admin') {
        navigate('/admin', { state: { activeTab: 'torneos' } });
      } else {
        navigate(`/torneos/${id}`);
      }
    } catch (err: any) {
      console.error('Error saving tournament:', err);
      setSaveError(err.message || 'Error al guardar los cambios del torneo');
      showToast(err.message || 'Error al guardar los cambios', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div style={styles.message}>Cargando información del torneo...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <ErrorMessage message={error} />
        <Button
          variant="primary"
          leftIcon="ArrowLeft"
          onClick={() => {
            const fromPath = (location.state as any)?.from;
            if (fromPath === '/admin') {
              navigate('/admin', { state: { activeTab: 'torneos' } });
            } else {
              navigate('/torneos');
            }
          }}
        >
          Volver
        </Button>
      </div>
    );
  }

  const fromPath = (location.state as any)?.from;
  const breadcrumbItems = fromPath === '/admin'
    ? [
      { label: 'Inicio', path: '/' },
      { label: 'Panel de Admin', path: '/admin' },
      { label: tournament?.name || 'Detalles', path: `/torneos/${id}` },
      { label: 'Editar' },
    ]
    : [
      { label: 'Inicio', path: '/' },
      { label: 'Torneos', path: '/torneos' },
      { label: tournament?.name || 'Detalles', path: `/torneos/${id}` },
      { label: 'Editar' },
    ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title>Editar Torneo</Title>
      </header>

      <form onSubmit={handleSave} style={styles.formCard}>
        {saveError && <ErrorMessage message={saveError} />}

        <TextInput
          label="Nombre del Torneo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon="Type"
          required
        />

        <TextInput
          label="Lugar / Ubicación"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          icon="MapPin"
          required
        />

        <div style={styles.grid2Col}>
          <DatePicker
            label="Fecha"
            value={date}
            onChange={setDate}
            required
          />
          <TimePicker
            label="Hora"
            value={time}
            onChange={setTime}
            required
          />
        </div>

        <Select
          label="Federación"
          value={federation}
          options={Federations}
          onChange={setFederation}
          icon="Flag"
        />

        <div style={styles.grid2Col}>
          <Select
            label="Modalidad de Juego"
            value={mode}
            options={GameModes}
            onChange={setMode}
            icon="Users"
          />

          <TextInput
            label="Máx. Jugadores"
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            placeholder="Sin límite"
            icon="UserPlus"
          />
        </div>

        <div style={styles.grid2Col}>
          <TextInput
            label="Juego (ej. 501, 301, Cricket)"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            icon="Target"
            required
          />

          <Select
            label="Tipo de cuadrante"
            value={schedule}
            options={ScheduleTypes}
            onChange={setSchedule}
            icon="Network"
          />
        </div>

        <div style={styles.grid3Col}>
          <Select
            label="Formato del Juego"
            value={gameType}
            options={GameTypes}
            onChange={setGameType}
            icon="Layers"
          />

          <TextInput
            label="Número de Legs"
            type="number"
            value={numLegs}
            onChange={(e) => setNumLegs(Number(e.target.value))}
            icon="Hash"
            required
            min={1}
          />

          <TextInput
            label="Número de Sets"
            type="number"
            value={numSets}
            onChange={(e) => setNumSets(Number(e.target.value))}
            icon="Hash"
            required
            min={1}
          />
        </div>

        <TextArea
          label="Reglas específicas"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Escribe aquí las reglas del torneo..."
          rows={4}
        />

        <TextArea
          label="Más información / Notas"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          placeholder="Detalles adicionales, enlaces, premios..."
          rows={4}
        />

        <div style={styles.actionsContainer}>
          <Button
            type="button"
            variant="secondary"
            leftIcon="X"
            onClick={() => {
              const fromPath = (location.state as any)?.from;
              if (fromPath === '/admin') {
                navigate('/admin', { state: { activeTab: 'torneos' } });
              } else {
                navigate(`/torneos/${id}`);
              }
            }}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon="Save"
            loading={isSaving}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    margin: '0 auto',
    width: '100%',
    minHeight: '80vh',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '10rem 2rem',
    fontSize: '1.2rem',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: '2.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '900px'
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  grid3Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  grid4Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
  },


  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
  },
};

export default AdminEditTournamentScreen;
