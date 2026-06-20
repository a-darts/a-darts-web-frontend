import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      auth: {
        // UserRoles
        ADMIN: 'Administrador',
        PLAYER: 'Jugador',
        //
        // UserStatus
        ACTIVE: 'Activo',
        INACTIVE: 'Inactivo',
        BLOCKED: 'Bloqueado',
        DELETED: 'Eliminado',
        //
        login_title: 'Bienvenido de nuevo',
        login_subtitle: 'Ingresa tus credenciales para acceder',
        register_title: 'Registrarse',
        register_subtitle: 'Únete a la comunidad de A-Darts',
        email_label: 'Correo electrónico',
        new_email_label: 'Nuevo correo electrónico',
        password_label: 'Contraseña',
        old_password_label: 'Contraseña actual',
        new_password_label: 'Nueva contraseña',
        temp_password_label: 'Contraseña temporal',
        alias_label: 'Alias',
        login_btn: 'Iniciar sesión',
        register_btn: 'Registrarse',
        logging_in: 'Iniciando sesión...',
        creating_account: 'Creando cuenta...',
        no_account: '¿No tienes una cuenta?',
        have_account: '¿Ya tienes una cuenta?',
        signup_link: 'Regístrate',
        login_link: 'Inicia sesión',
        login_success: 'Inicio de sesión exitoso',
        register_success: 'Registro exitoso',
        logout_success: 'Sesión cerrada correctamente',
      },
      common: {
        loading: 'Cargando...',
        error: 'Error',
        dropdown: {
          profile: 'Perfil',
          settings: 'Configuración',
          logout: 'Cerrar sesión'
        },
        navbar: {
          tournaments: 'Torneos',
          admin_panel: 'Panel de administración',
          login: 'Iniciar sesión',
        },
      },
      federations: {
        'ESPAÑA': 'España',
        'ANDALUCIA': 'Andalucía',
        'ARAGON': 'Aragón',
        'ASTURIAS': 'Asturias',
        'BALEARES': 'Baleares',
        'CANARIAS': 'Canarias',
        'CANTABRIA': 'Cantabria',
        'CASTILLA_LA_MANCHA': 'Castilla-La Mancha',
        'CASTILLA_Y_LEON': 'Castilla y León',
        'CATALUÑA': 'Cataluña',
        'EXTREMADURA': 'Extremadura',
        'GALICIA': 'Galicia',
        'LA_RIOJA': 'La Rioja',
        'MADRID': 'Madrid',
        'MURCIA': 'Murcia',
        'NAVARRA': 'Navarra',
        'PAIS_VASCO': 'País Vasco',
        'COMUNIDAD_VALENCIANA': 'Comunidad Valenciana',
        'CEUTA': 'Ceuta',
        'MELILLA': 'Melilla',
      },
      playingArea: {
        'AVAILABLE': 'Libre',
        'OCCUPIED': 'Ocupada',
        'DISABLED': 'Inutilizable',
      },
      exceptions: {
        // UserExceptions
        'User not found': 'Usuario no encontrado',
        'User already active': 'El usuario ya está activo',
        'User not inactive': 'El usuario no está inactivo',
        'User inactive': 'El usuario está inactivo',
        'User deleted': 'El usuario está eliminado',
        'User already deleted': 'El usuario ya está eliminado',
        'User not deleted': 'El usuario no está eliminado',
        'User blocked': 'El usuario está bloqueado',
        'User already blocked': 'El usuario ya está bloqueado',
        'User not blocked': 'El usuario no está bloqueado',
        'User not active': 'El usuario no está activo',
        'Email already in use': 'El correo ya está en uso',
        'Invalid credentials': 'Credenciales inválidas',
        'Invalid password': 'Contraseña inválida',
        'All fields are required': 'Todos los campos son obligatorios',
        'Invalid user fields': 'Campos inválidos',
        //
        // PlayerExceptions
        'Player not found': 'Jugador no encontrado',
        'Player already exists in that season': 'El jugador ya existe en esa temporada',
        'Player is already deleted': 'El jugador ya está eliminado',
        'Player is not deleted': 'El jugador no está eliminado',
        'Player is not registered in the same season as the tournament': 'El jugador no está registrado en la misma temporada que el torneo',
        'Invalid year. It must be between 1900 and 2200': 'Año inválido. Debe estar entre 1900 y 2200',
        'Invalid season. It must span exactly one year': 'Temporada inválida. Debe abarcar exactamente un año',
        //
        // TournamentExceptions
        'Tournament is not in draft': 'El torneo no está en borrador',
        'Tournament registration is not closed': 'Las inscripciones no están cerradas',
        'Tournament is not in progress': 'El torneo no está en curso',
        'Tournament is not published': 'El torneo no está publicado',
        'Tournament is not in draft or published': 'El torneo no está en borrador ni publicado',
        'Tournament is already finished': 'El torneo ya está finalizado',
        'Tournament registration is not open': 'Las inscripciones no están abiertas',
        'Tournament not found': 'Torneo no encontrado',
        'Tournament not deleted': 'El torneo no está eliminado',
        'Tournament max players exceeded': 'El torneo alcanzó el máximo de jugadores',
        'Invalid season start year': 'Año de inicio de la temporada inválido',
        'Tournament already has a bracket': 'El torneo ya tiene un cuadrante',
        //
        // RegistrationExceptions
        'Registration period is invalid': 'El periodo de inscripción es inválido',
        'Registration is not closed': 'Las inscripciones no están cerradas',
        'Registration is already open': 'Las inscripciones ya están abiertas',
        'Registration is already closed': 'Las inscripciones ya están cerradas',
        'Registration opening date in past': 'La fecha de inicio de las inscripciones ha pasado. Elige una fecha posterior a la actual.',
        'Registration closing date must be before the tournament start date': 'La fecha de cierre de las inscripciones debe ser anterior a la fecha de inicio del torneo',
        'Registration closing date in past': 'La fecha de cierre de las inscripciones ha pasado. Elige una fecha posterior a la actual.',
        'Check-in is already enabled': 'El check-in ya está habilitado',
        'Check-in is already disabled': 'El check-in ya está deshabilitado',
        //
        // BracketExceptions
        'Bracket not found': 'Cuadrante no encontrado',
        'Bracket already exists': 'El cuadrante ya existe',
        'Bracket not in draft or published': 'El cuadrante no está en borrador ni publicado',
        'Bracket not in draft': 'El cuadrante no está en borrador',
        'Bracket not in progress': 'El cuadrante no está en curso',
        'Bracket in progress': 'El cuadrante está en curso',
        'Bracket not published': 'El cuadrante no está publicado',
        'Bracket already finished': 'El cuadrante ya está finalizado',
        'Invalid positions': 'Posiciones inválidas',
        'Duplicate participants in bracket': 'Participantes duplicados en el cuadrante',
        'Bracket is not completely finished or filled': 'El cuadrante no está completamente finalizado ni completo',
        //
        // MatchExceptions
        'Match is not ready': 'El partido no está listo',
        'Match is not pending': 'El partido no está pendiente',
        'Match is not in progress': 'El partido no está en curso',
        'Match is not suspended': 'El partido no está suspendido',
        'Match is already finished': 'El partido ya está finalizado',
        'Match board number is required': 'El número de diana del partido es obligatorio',
        'Match is not assigned to a board': 'El partido no está asignado a ninguna diana',
        'Participant not found in this match': 'Participante no encontrado en este partido',
        'Participant {{index}} not registered in this tournament': 'El participante {{index}} no está inscrito en este torneo',
        'Match already exists': 'El partido ya existe',
        'Match not found': 'Partido no encontrado',
        //
        // ParticipantExceptions
        'Participant already checked in': 'El participante ya realizó el check-in',
        'Participant not checked in': 'El participante no realizó el check-in',
        'Participant is already registered in this tournament': 'El participante ya está inscrito en este torneo',
        'Participant is not registered in this tournament': 'El participante no está inscrito en este torneo',
        'Registered participant not found': 'Participante inscrito no encontrado',
        'No participants registered': 'No hay participantes inscritos',
        'Not enough participants registered (minimum 2 required)': 'No hay suficientes participantes inscritos en el torneo (mínimo 2)',
        'Registered participants types unhandled': 'Tipo de participante no admitido',
        //
        // PlayingAreaExceptions
        'Playing area not found': 'Salón de juego no encontrado',
        'Playing area already exists': 'El salón de juego ya existe',
        'Playing area has no boards': 'El salón de juego no tiene dianas',
        'Board is occupied': 'La diana está ocupada',
        'Board not found': 'Diana no encontrada',
        'Board is already occupied': 'La diana ya está ocupada',
        'Board is disabled': 'La diana está deshabilitada',
        'Board is not occupied': 'La diana no está ocupada',
        'Board is not available': 'La diana no está libre',
        'Board is not disabled': 'La diana no está deshabilitada',
        'Match is already assigned to a board': 'El partido ya está asignado a una diana',
        'Board is already paired with a tablet': 'La diana ya está emparejada con una tablet',
        //
        // TournamentResultExceptions
        'Tournament result not found': 'Resultados del torneo no encontrados',
        //
        // MailerExceptions
        'Error while sending the email': 'Error al mandar el correo',
        //

        // Errores con tokens
        'No token provided': 'Error de autenticación',
        'User not authenticated': 'Usuario no autenticado',
        'Invalid token': 'Error de autenticación',
        //
        // Generales
        'Internal server error': 'Error interno del servidor. Inténtalo de nuevo más tarde',
        'network_error': 'Error de conexión. Inténtalo de nuevo más tarde',
        'Default': 'Ha ocurrido un error inesperado',
        //
      },
      success: {
        // AuthController
        'User registered successfully': 'Usuario registrado correctamente',
        'User logged in successfully': 'Usuario logueado correctamente',
        'Logout successfull': 'Sesión cerrada correctamente',
        'User data retrieved successfully': 'Información del usuario obtenida correctamente',
        'Account activated successfully': 'Cuenta activada correctamente',
        'Temporary password sent successfully': 'Contraseña temporal enviada correctamente',
        //
        // UserController
        'Users fetched successfully': 'Usuarios obtenidos correctamente',
        'User created successfully': 'Usuario creado correctamente',
        'Email updated successfully': 'Correo actualizado correctamente',
        'Password updated successfully': 'Contraseña actualizada correctamente',
        'Alias updated successfully': 'Alias actualizado correctamente',
        'User blocked successfully': 'Usuario bloqueado correctamente',
        'User unblocked successfully': 'Usuario desbloqueado correctamente',
        'User deleted successfully': 'Usuario eliminado correctamente',
        'User restored successfully': 'Usuario restaurado correctamente',
        'User stats fetched successfully': 'Estadísticas del usuario obtenidas correctamente',
        // 
        // PlayerController
        'Players fetched successfully': 'Jugadores obtenidos correctamente',
        'Player fetched successfully': 'Jugador obtenido correctamente',
        'Player data retrieved successfully': 'Información del jugador obtenida correctamente',
        'Player created successfully': 'Jugador creado correctamente',
        'Federation updated successfully': 'Federación actualizada correctamente',
        'Unregistered players fetched successfully': 'Jugadores no registrados obtenidos correctamente',
        'Player deleted successfully': 'Jugador eliminado correctamente',
        'Player restored successfully': 'Jugador restaurado correctamente',
        //
        // TournamentController
        'Tournaments fetched successfully': 'Torneos obtenidos correctamente',
        'Tournament fetched successfully': 'Torneo obtenido correctamente',
        'Tournament created successfully': 'Torneo creado correctamente',
        'Tournament deleted successfully': 'Torneo eliminado correctamente',
        'Tournament restored successfully': 'Torneo restaurado correctamente',
        'Tournament unpublished successfully': 'Torneo ocultado correctamente',
        'Tournament published successfully': 'Torneo publicado correctamente',
        'Tournament cancelled successfully': 'Torneo cancelado correctamente',
        'Tournament started successfully': 'Torneo iniciado correctamente',
        'Info updated successfully': 'Información actualizada correctamente',
        'Tournament updated successfully': 'Nombre actualizado correctamente',
        'Registration opened successfully': 'Inscripciones abiertas correctamente',
        'Registration closed successfully': 'Incripciones cerradas correctamente',
        'Registration period updated successfully': 'Periodo de inscripción actualizado correctamente',
        'Check-in enabled successfully': 'Check-in habilitado correctamente',
        'Check-in disabled successfully': 'Check-in deshabilitado correctamente',
        //
        // BracketController
        'Bracket automatically created successfully': 'Cuadrante generado automáticamente',
        'Bracket manually created successfully': 'Cuadrante generado manualmente',
        'Bracket fetched successfully': 'Cuadrante obtenido correctamente',
        'Participants assigned to positions successfully': 'Participantes asignados a sus posiciones correctamente',
        'Bracket reshuffled successfully': 'Cuadrante re-sorteado correctamente',
        'Bracket published successfully': 'Cuadrante publicado correctamente',
        'Bracket unpublished successfully': 'Cuadrante ocultado correctamente',
        'Bracket deleted successfully': 'Cuadrante eliminado correctamente',
        //
        // MatchController
        'Matches fetched successfully': 'Partidas obtenidas correctamente',
        'Match fetched successfully': 'Partida obtenida correctamente',
        'Match started successfully': 'Partida iniciada correctamente',
        'Match finished successfully': 'Partida finalizada correctamente',
        'Match cancelled successfully': 'Partida cancelada correctamente',
        'Match suspended successfully': 'Partida suspendida correctamente',
        'Match resumed successfully': 'Partida reanudada correctamente',
        'Board number set successfully': 'Número de diana asignado a la partida correctamente',
        'Match score updated successfully': 'Puntuación de la partida asignada correctamente',
        'Match result set successfully': 'Resultado de la partida asignado correctamente',
        // 
        // PlayingAreaController
        'Playing area fetched successfully': 'Salón de juego obtenido correctamente',
        'Playing area created successfully': 'Salón de juego creado correctamente',
        'Board released successfully': 'Diana liberada correctamente',
        'Board disabled successfully': 'Diana deshabilitada correctamente',
        'Board enabled successfully': 'Diana habilitada correctamente',
        'Board added successfully': 'Diana añadida correctamente',
        'Board removed successfully': 'Diana eliminada correctamente',
        //
        // RegisteredParticipantController
        'Participant registered successfully': 'Participante inscrito correctamente',
        'Participant unregistered successfully': 'Participante desinscrito correctamente',
        'Participant checked in successfully': 'Check-in del participante hecho correctamente',
        'Participant undo check in successfully': 'Check-in del participante deshecho correctamente',
        'Participants fetched successfully': 'Participantes obtenidos correctamente',
        //
        // TournamentResultController
        'Tournament results fetched successfully': 'Resultados del torneo obtenidos correctamente',
        //
      },
    }
  },
  en: {
    translation: {
      auth: {
        // UserRoles
        ADMIN: 'Administrator',
        PLAYER: 'Player',
        //
        // UserStatus
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        BLOCKED: 'Blocked',
        DELETED: 'Deleted',
        //
        login_title: 'Welcome back',
        login_subtitle: 'Enter your credentials to access',
        register_title: 'Sign up',
        register_subtitle: 'Join the A-Darts community',
        email_label: 'Email address',
        new_email_label: 'New email address',
        password_label: 'Password',
        old_password_label: 'Old password',
        new_password_label: 'New password',
        temp_password_label: 'Temporary password',
        alias_label: 'Alias',
        login_btn: 'Log In',
        register_btn: 'Sign Up',
        logging_in: 'Logging in...',
        creating_account: 'Creating account...',
        no_account: "Don't have an account?",
        have_account: 'Already have an account?',
        signup_link: 'Sign Up',
        login_link: 'Log In',
        login_success: 'Login successful',
        register_success: 'Registration successful',
        logout_success: 'Logged out successfully',
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        dropdown: {
          profile: 'Profile',
          settings: 'Settings',
          logout: 'Logout'
        },
        navbar: {
          tournaments: 'Tournaments',
          admin_panel: 'Admin panel',
          login: 'Login',
        },
      },
      federations: {
        'ESPAÑA': 'Spain',
        'ANDALUCIA': 'Andalusia',
        'ARAGON': 'Aragon',
        'ASTURIAS': 'Asturias',
        'BALEARES': 'Balearic Islands',
        'CANARIAS': 'Canary Islands',
        'CANTABRIA': 'Cantabria',
        'CASTILLA_LA_MANCHA': 'Castile-La Mancha',
        'CASTILLA_Y_LEON': 'Castile and Leon',
        'CATALUÑA': 'Catalonia',
        'EXTREMADURA': 'Extremadura',
        'GALICIA': 'Galicia',
        'LA_RIOJA': 'La Rioja',
        'MADRID': 'Madrid',
        'MURCIA': 'Murcia',
        'NAVARRA': 'Navarre',
        'PAIS_VASCO': 'Basque Country',
        'COMUNIDAD_VALENCIANA': 'Valencian Community',
        'CEUTA': 'Ceuta',
        'MELILLA': 'Melilla',
      },
      playingArea: {
        'AVAILABLE': 'Available',
        'OCCUPIED': 'Occupied',
        'DISABLED': 'Disabled',
      },
      exceptions: {
        // UserExceptions
        'User not found': 'User not found',
        'User already active': 'User already active',
        'User not inactive': 'User not inactive',
        'User inactive': 'User inactive',
        'User deleted': 'User deleted',
        'User already deleted': 'User already deleted',
        'User not deleted': 'User not deleted',
        'User blocked': 'User blocked',
        'User already blocked': 'User already blocked',
        'User not blocked': 'User not blocked',
        'User not active': 'User not active',
        'Email already in use': 'Email already in use',
        'Invalid credentials': 'Invalid credentials',
        'Invalid password': 'Invalid password',
        'All fields are required': 'All fields are required',
        'Invalid user fields': 'Invalid user fields',
        //
        // PlayerExceptions
        'Player not found': 'Player not found',
        'Player already exists in that season': 'Player already exists in that season',
        'Player is already deleted': 'Player is already deleted',
        'Player is not deleted': 'Player is not deleted',
        'Player is not registered in the same season as the tournament': 'Player is not registered in the same season as the tournament',
        'Invalid year. It must be between 1900 and 2200': 'Invalid year. It must be between 1900 and 2200',
        'Invalid season. It must span exactly one year': 'Invalid season. It must span exactly one year',
        //
        // TournamentExceptions
        'Tournament is not in draft': 'Tournament is not in draft',
        'Tournament registration is not closed': 'Tournament registration is not closed',
        'Tournament is not in progress': 'Tournament is not in progress',
        'Tournament is not published': 'Tournament is not published',
        'Tournament is not in draft or published': 'Tournament is not in draft or published',
        'Tournament is already finished': 'Tournament is already finished',
        'Tournament registration is not open': 'Tournament registration is not open',
        'Tournament not found': 'Tournament not found',
        'Tournament not deleted': 'Tournament not deleted',
        'Tournament max players exceeded': 'Tournament max players exceeded',
        'Invalid season start year': 'Invalid season start year',
        'Tournament already has a bracket': 'Tournament already has a bracket',
        //
        // RegistrationExceptions
        'Registration period is invalid': 'Registration period is invalid',
        'Registration is not closed': 'Registration is not closed',
        'Registration is already open': 'Registration is already open',
        'Registration is already closed': 'Registration is already closed',
        'Registration opening date in past': 'Registration opening date in past',
        'Registration closing date must be before the tournament start date': 'Registration closing date must be before the tournament start date',
        'Registration closing date in past': 'Registration closing date in past',
        'Check-in is already enabled': 'Check-in is already enabled',
        'Check-in is already disabled': 'Check-in is already disabled',
        //
        // BracketExceptions
        'Bracket not found': 'Bracket not found',
        'Bracket already exists': 'Bracket already exists',
        'Bracket not in draft or published': 'Bracket not in draft or published',
        'Bracket not in draft': 'Bracket not in draft',
        'Bracket not in progress': 'Bracket not in progress',
        'Bracket in progress': 'Bracket in progress',
        'Bracket not published': 'Bracket not published',
        'Bracket already finished': 'Bracket already finished',
        'Invalid positions': 'Invalid positions',
        'Duplicate participants in bracket': 'Duplicate participants in bracket',
        'Bracket is not completely finished or filled': 'Bracket is not completely finished or filled',
        //
        // MatchExceptions
        'Match is not ready': 'Match is not ready',
        'Match is not pending': 'Match is not pending',
        'Match is not in progress': 'Match is not in progress',
        'Match is not suspended': 'Match is not suspended',
        'Match is already finished': 'Match is already finished',
        'Match board number is required': 'Match board number is required',
        'Match is not assigned to a board': 'Match is not assigned to a board',
        'Participant not found in this match': 'Participant not found in this match',
        'Participant {{index}} not registered in this tournament': 'Participant {{index}} not registered in this tournament',
        'Match already exists': 'Match already exists',
        'Match not found': 'Match not found',
        //
        // ParticipantExceptions
        'Participant already checked in': 'Participant already checked in',
        'Participant not checked in': 'Participant not checked in',
        'Participant is already registered in this tournament': 'Participant is already registered in this tournament',
        'Participant is not registered in this tournament': 'Participant is not registered in this tournament',
        'Registered participant not found': 'Registered participant not found',
        'No participants registered': 'No participants registered',
        'Not enough participants registered (minimum 2 required)': 'Not enough participants registered (minimum 2 required)',
        'Registered participants types unhandled': 'Registered participants types unhandled',
        //
        // PlayingAreaExceptions
        'Playing area not found': 'Playing area not found',
        'Playing area already exists': 'Playing area already exists',
        'Playing area has no boards': 'Playing area has no boards',
        'Board is occupied': 'Board is occupied',
        'Board not found': 'Board not found',
        'Board is already occupied': 'Board is already occupied',
        'Board is disabled': 'Board is disabled',
        'Board is not occupied': 'Board is not occupied',
        'Board is not available': 'Board is not available',
        'Board is not disabled': 'Board is not disabled',
        'Match is already assigned to a board': 'Match is already assigned to a board',
        'Board is already paired with a tablet': 'Board is already paired with a tablet',
        //
        // TournamentResultExceptions
        'Tournament result not found': 'Tournament results not found',
        //
        // MailerExceptions
        'Error while sending the email': 'Error while sending the email',
        //

        // Errores con tokens
        'No token provided': 'Authentication error',
        'User not authenticated': 'User not authenticated',
        'Invalid token': 'Authentication error',
        //
        // Generales
        'Internal server error': 'Internal server error. Please try again later',
        'network_error': 'Network error. Please try again later',
        'Default': 'An unexpected error occurred',
      },
      success: {
        // AuthController
        'User registered successfully': 'User registered successfully',
        'User logged in successfully': 'User logged in successfully',
        'Logout successfull': 'Logout successfull',
        'User data retrieved successfully': 'User data retrieved successfully',
        'Account activated successfully': 'Account activated successfully',
        'Temporary password sent successfully': 'Temporary password sent successfully',
        //
        // UserController
        'Users fetched successfully': 'Users fetched successfully',
        'User created successfully': 'User created successfully',
        'Email updated successfully': 'Email updated successfully',
        'Password updated successfully': 'Password updated successfully',
        'Alias updated successfully': 'Alias updated successfully',
        'User blocked successfully': 'User blocked successfully',
        'User unblocked successfully': 'User unblocked successfully',
        'User deleted successfully': 'User deleted successfully',
        'User restored successfully': 'User restored successfully',
        'User stats fetched successfully': 'User stats fetched successfully',
        // 
        // PlayerController
        'Players fetched successfully': 'Players fetched successfully',
        'Player fetched successfully': 'Player fetched successfully',
        'Player data retrieved successfully': 'Player data retrieved successfully',
        'Player created successfully': 'Player created successfully',
        'Federation updated successfully': 'Federation updated successfully',
        'Unregistered players fetched successfully': 'Unregistered players fetched successfully',
        'Player deleted successfully': 'Player deleted successfully',
        'Player restored successfully': 'Player restored successfully',
        //
        // TournamentController
        'Tournaments fetched successfully': 'Tournaments fetched successfully',
        'Tournament fetched successfully': 'Tournament fetched successfully',
        'Tournament created successfully': 'Tournament created successfully',
        'Tournament deleted successfully': 'Tournament deleted successfully',
        'Tournament restored successfully': 'Tournament restored successfully',
        'Tournament unpublished successfully': 'Tournament unpublished successfully',
        'Tournament published successfully': 'Tournament published successfully',
        'Tournament cancelled successfully': 'Tournament cancelled successfully',
        'Tournament started successfully': 'Tournament started successfully',
        'Info updated successfully': 'Info updated successfully',
        'Tournament updated successfully': 'Tournament updated successfully',
        'Registration opened successfully': 'Registration opened successfully',
        'Registration closed successfully': 'Registration closed successfully',
        'Registration period updated successfully': 'Registration period updated successfully',
        'Check-in enabled successfully': 'Check-in enabled successfully',
        'Check-in disabled successfully': 'Check-in disabled successfully',
        //
        // BracketController
        'Bracket automatically created successfully': 'Bracket automatically created successfully',
        'Bracket manually created successfully': 'Bracket manually created successfully',
        'Bracket fetched successfully': 'Bracket fetched successfully',
        'Participants assigned to positions successfully': 'Participants assigned to positions successfully',
        'Bracket reshuffled successfully': 'Bracket reshuffled successfully',
        'Bracket published successfully': 'Bracket published successfully',
        'Bracket unpublished successfully': 'Bracket unpublished successfully',
        'Bracket deleted successfully': 'Bracket deleted successfully',
        //
        // MatchController
        'Matches fetched successfully': 'Matches fetched successfully',
        'Match fetched successfully': 'Match fetched successfully',
        'Match started successfully': 'Match started successfully',
        'Match finished successfully': 'Match finished successfully',
        'Match cancelled successfully': 'Match cancelled successfully',
        'Match suspended successfully': 'Match suspended successfully',
        'Match resumed successfully': 'Match resumed successfully',
        'Board number set successfully': 'Board number set successfully',
        'Match score updated successfully': 'Match score updated successfully',
        'Match result set successfully': 'Match result set successfully',
        // 
        // PlayingAreaController
        'Playing area fetched successfully': 'Playing area fetched successfully',
        'Playing area created successfully': 'Playing area created successfully',
        'Board released successfully': 'Board released successfully',
        'Board disabled successfully': 'Board disabled successfully',
        'Board enabled successfully': 'Board enabled successfully',
        'Board added successfully': 'Board added successfully',
        'Board removed successfully': 'Board removed successfully',
        //
        // RegisteredParticipantController
        'Participant registered successfully': 'Participant registered successfully',
        'Participant unregistered successfully': 'Participant unregistered successfully',
        'Participant checked in successfully': 'Participant checked in successfully',
        'Participant undo check in successfully': 'Participant undo check in successfully',
        'Participants fetched successfully': 'Participants fetched successfully',
        //
        // TournamentResultController
        'Tournament results fetched successfully': 'Tournament results fetched successfully',
        //
      },
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Force Spanish
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
