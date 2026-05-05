import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      auth: {
        admin: 'Administrador',
        player: 'Jugador',
        login_title: 'Bienvenido de nuevo',
        login_subtitle: 'Ingresa tus credenciales para acceder',
        register_title: 'Crea tu cuenta',
        register_subtitle: 'Únete a la comunidad de A-Darts',
        email_label: 'Correo electrónico',
        new_email_label: 'Nuevo correo electrónico',
        password_label: 'Contraseña',
        old_password_label: 'Contraseña actual',
        new_password_label: 'Nueva contraseña',
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
        success: {
          // UserController
          'Email updated successfully': 'Correo electrónico actualizado correctamente',
          'Password updated successfully': 'Contraseña actualizada correctamente',
          'Alias updated successfully': 'Alias actualizado correctamente',
          // 

          // AuthController
          'User registered successfully': 'Usuario registrado exitosamente',
          'User logged in successfully': 'Usuario logueado exitosamente',
          'Logout successfull': 'Sesión cerrada exitosamente',
          'User data retrieved successfully': 'Información del usuario obtenida exitosamente',
          //
        },
        errors: {
          // UserExceptions
          'User not found': 'Usuario no encontrado',
          'User deleted': 'Usuario eliminado',
          'User blocked': 'Usuario bloqueado',
          'User not active': 'Usuario no activo',
          'Email already in use': 'Ya existe un usuario con ese correo',
          'Invalid credentials': 'Credenciales inválidas',
          'Invalid password': 'Contraseña inválida',
          'All fields are required': 'Todos los campos son obligatorios',
          //

          // Errores con tokens
          'No token provided': 'Token no proporcionado',
          'User not authenticated': 'Usuario no autenticado',
          'Invalid token': 'Token inválido',
          //

          // estos no deberían ocurrir
          'User has no password set': 'El usuario no tiene contraseña',
          //

          // Generales
          'Internal server error': 'Error interno del servidor. Inténtalo de nuevo más tarde',
          'Default': 'Ha ocurrido un error inesperado',
          //
        }
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
          login: 'Iniciar sesión',
        },
      }
    }
  },
  en: {
    translation: {
      auth: {
        admin: 'Administrator',
        player: 'Player',
        login_title: 'Welcome back',
        login_subtitle: 'Enter your credentials to access',
        register_title: 'Create your account',
        register_subtitle: 'Join the A-Darts community',
        email_label: 'Email address',
        new_email_label: 'New email address',
        password_label: 'Password',
        old_password_label: 'Old password',
        new_password_label: 'New password',
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
        success: {
          // éxito en UserController
          'Email updated successfully': 'Email updated successfully',
          'Password updated successfully': 'Password updated successfully',
          'Alias updated successfully': 'Alias updated successfully',
          //

          // éxito en AuthController
          'User registered successfully': 'User registered successfully',
          'User logged in successfully': 'User logged in successfully',
          'Logout successfull': 'Logged out successfully',
          'User data retrieved successfully': 'User data retrieved successfully',
          //
        },
        errors: {
          // UserExceptions
          'User not found': 'User not found',
          'User deleted': 'User deleted',
          'User blocked': 'User blocked',
          'User not active': 'User not active',
          'Email already in use': 'Email already in use',
          'Invalid credentials': 'Invalid credentials',
          'Invalid password': 'Invalid password',
          'All fields are required': 'All fields are required',
          //

          // Errores con tokens
          'No token provided': 'No token provided',
          'User not authenticated': 'User not authenticated',
          'Invalid token': 'Invalid token',
          //

          // estos no deberían ocurrir
          'User has no password set': 'User has no password set',
          //

          // Generales
          'Internal server error': 'Internal server error. Please try again later',
          'Default': 'An unexpected error occurred',
          //
        }
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
          login: 'Login',
        },
      }
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
