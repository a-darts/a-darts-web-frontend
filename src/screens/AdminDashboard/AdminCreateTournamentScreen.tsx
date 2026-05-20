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

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Panel de Admin', path: '/admin' },
    { label: 'Crear Torneo' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <Title>Crear Torneo</Title>
      </header>

      <form onSubmit={handleCreate} style={styles.formCard}>
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

        <div style={styles.actionsContainer}>
          <Button
            type="button"
            variant="secondary"
            leftIcon="X"
            onClick={() => navigate('/admin', { state: { activeTab: 'torneos' } })}
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
            Crear Torneo
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
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
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
