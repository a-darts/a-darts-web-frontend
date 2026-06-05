import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tournamentService, Tournament, Federations, GameModes, GameTypes, ScheduleTypes } from '../../services/tournament.service';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import ErrorMessage from '../../components/ErrorMessage';
import Select from '../../components/Select';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';
import TextArea from '../../components/TextArea';
import Icon from '../../components/Icon';

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
    <div style={styles.loadingContainer}>
      <Icon
        name="Loader"
        size={32}
        className="btn-icon animate-spin"
      />
      <div style={styles.loadingText}>Cargando información del torneo...</div>
    </div>
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.card}>
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
      </div>
    );
  }

  const fromPath = (location.state as any)?.from;

  const handleBackClick = () => {
    if (fromPath === '/admin') {
      navigate('/admin', { state: { activeTab: 'torneos' } });
    } else {
      navigate(`/torneos/${id}`);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button
            type="button"
            onClick={handleBackClick}
            style={styles.backBtn}
            title={fromPath === '/admin' ? "Volver al panel" : "Volver"}
          >
            <Icon name="ArrowLeft" size={20} />
            <span>{fromPath === '/admin' ? 'Volver al panel' : 'Volver'}</span>
          </button>
          <h1 style={styles.title}>Editar Torneo</h1>
          <p style={styles.subtitle}>Modifica la configuración y los detalles del torneo.</p>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
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

          <div style={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              leftIcon="X"
              onClick={handleBackClick}
              disabled={isSaving}
              style={styles.cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              leftIcon={isSaving ? undefined : "Save"}
              style={styles.submitBtn}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#0E0E0E',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '900px', // Adjusted for tournament
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    padding: 0,
    marginBottom: '0.5rem',
    transition: 'color 0.2s ease',
    outline: 'none',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1a1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'var(--font-title)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
    margin: 0,
    lineHeight: '1.5',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: '10rem 2rem',
    fontSize: '1.2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  submitBtn: {
    flex: 1,
    height: '48px',
  },
  cancelBtn: {
    flex: 1,
    height: '48px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    margin: '2rem',
  },
  loadingText: {
    color: 'var(--text-secondary-color)',
  },
};

export default AdminEditTournamentScreen;
