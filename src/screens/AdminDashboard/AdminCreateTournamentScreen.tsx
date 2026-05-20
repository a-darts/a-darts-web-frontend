import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRoles } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { tournamentService, Federations, GameModes, GameTypes, ScheduleTypes } from '../../services/tournament.service';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import ErrorMessage from '../../components/ErrorMessage';
import Breadcrumbs from '../../components/Breadcrumbs';
import Title from '../../components/Title';
import Select from '../../components/Select';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';
import TextArea from '../../components/TextArea';
import Icon from '../../components/Icon';
import { getSeasonEndYear } from '../../utils/tournament.utils';

const AdminCreateTournamentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [seasonStartYear, setSeasonStartYear] = useState(() => new Date().getFullYear());
  const [hoverUp, setHoverUp] = useState(false);
  const [hoverDown, setHoverDown] = useState(false);

  // Set default date to today in YYYY-MM-DD format (Madrid timezone)
  const [date, setDate] = useState(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(today);
  });

  const [time, setTime] = useState('12:00');
  const [mode, setMode] = useState('MEN_SINGLES');
  const [game, setGame] = useState('501');
  const [schedule, setSchedule] = useState('KO');
  const [maxPlayers, setMaxPlayers] = useState<string>('');
  const [gameType, setGameType] = useState('BEST_OF');
  const [numLegs, setNumLegs] = useState<number>(5);
  const [numSets, setNumSets] = useState<number>(1);
  const [rules, setRules] = useState('');
  const [info, setInfo] = useState('');
  const [federation, setFederation] = useState('ESPAÑA');

  useEffect(() => {
    // Redirect non-admins once auth completes loading
    if (!authLoading && (!user || user.role !== UserRoles.ADMIN)) {
      showToast('No tienes permisos de administrador para realizar esta acción', 'error');
      navigate('/');
    }
  }, [user, authLoading, navigate, showToast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveError(null);

    try {
      const formattedMaxPlayers = maxPlayers === '' ? null : Number(maxPlayers);
      const isoDateTimeString = new Date(`${date}T${time}:00`).toISOString();

      const tournamentInfo = {
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

      await tournamentService.createTournament(name, seasonStartYear, tournamentInfo);
      showToast('Torneo creado con éxito', 'success');
      navigate('/admin', { state: { activeTab: 'torneos' } });
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      setSaveError(err.message || 'Error al registrar el torneo');
      showToast(err.message || 'Error al registrar el torneo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <Icon name="Loader" className="animate-spin" size={32} style={{ color: 'var(--btn-primary-bg)', marginBottom: '1rem' }} />
        <span>Verificando credenciales de administrador...</span>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button
            type="button"
            onClick={() => navigate('/admin', { state: { activeTab: 'torneos' } })}
            style={styles.backBtn}
            title="Volver al panel"
          >
            <Icon name="ArrowLeft" size={20} />
            <span>Volver al panel</span>
          </button>
          <h1 style={styles.title}>Crear Nuevo Torneo</h1>
          <p style={styles.subtitle}>Configura y registra un nuevo torneo en el sistema. Todos los detalles podrán ser editados más adelante.</p>
        </div>

        <form onSubmit={handleCreate} style={styles.form}>
          {saveError && <ErrorMessage message={saveError} />}

          <TextInput
            label="Nombre del Torneo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon="Type"
            required
            placeholder="Ej. Torneo Nacional de Primavera"
          />

          <div style={{ position: 'relative' }}>
            <TextInput
              label="Temporada"
              type="text"
              icon="Calendar"
              value={`${seasonStartYear} - ${getSeasonEndYear(seasonStartYear)}`}
              readOnly
              disabled={isSaving}
            />
            {!isSaving && (
              <div style={styles.spinnerArrows}>
                <button
                  type="button"
                  onClick={() => setSeasonStartYear((prev) => prev + 1)}
                  onMouseEnter={() => setHoverUp(true)}
                  onMouseLeave={() => setHoverUp(false)}
                  style={{
                    ...styles.spinnerArrowBtn,
                    color: hoverUp ? '#C4E866' : 'rgba(255, 255, 255, 0.4)'
                  }}
                  title="Incrementar año"
                >
                  <Icon name="ChevronUp" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSeasonStartYear((prev) => prev - 1)}
                  onMouseEnter={() => setHoverDown(true)}
                  onMouseLeave={() => setHoverDown(false)}
                  style={{
                    ...styles.spinnerArrowBtn,
                    color: hoverDown ? '#C4E866' : 'rgba(255, 255, 255, 0.4)'
                  }}
                  title="Decrementar año"
                >
                  <Icon name="ChevronDown" size={14} />
                </button>
              </div>
            )}
          </div>

          <TextInput
            label="Lugar / Ubicación"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            icon="MapPin"
            required
            placeholder="Ej. Pabellón Municipal"
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
              onClick={() => navigate('/admin', { state: { activeTab: 'torneos' } })}
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
              {isSaving ? 'Creando torneo...' : 'Crear torneo'}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10rem 2rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  spinnerArrows: {
    position: 'absolute',
    right: '16px',
    top: '38px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    justifyContent: 'center',
    height: '32px',
    zIndex: 10,
  },
  spinnerArrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    outline: 'none',
    height: '14px',
    width: '24px',
  },
};

export default AdminCreateTournamentScreen;
